// / <reference path="nodom.ts" />

namespace nodom {
	/**
	 * 路由配置
	 */
	export interface IRouteCfg{
		/**
		 * 路由路径，可以带通配符*，可以带参数 /:
		 */
		path:string;
		/**
		 * 路由模块名或模块
		 */
		module?:string|Module;
		/**
		 * 子路由数组
		 */
		routes?:Array<IRouteCfg>;

		/**
		 * 进入路由事件方法
		 */
		onEnter?:Function;
		/**
		 * 离开路由方法
		 */
		onLeave?:Function;
		/**
		 * 是否使用父路由路径
		 */
		useParentPath?:boolean;
		/**
		 * 不添加到路由树
		 */
		notAdd?:boolean;
		/**
		 * 父路由
		 */
		parent?:Route;
	}
	
	/**
     * 路由，主要用于模块间跳转，一个应用中存在一个router，多个route
     * 采用修改页面hash方式进行路由历史控制，每个route 可设置onEnter事件(钩子) 和 onLeave事件(钩子)
     * 回调调用的几个问题
     * onLeave事件在路由切换时响应，如果存在多级路由切换，则从底一直到相同祖先路由，都会进行onLeave事件响应
     *  如：从/r1/r2/r3  到 /r1/r4/r5，则onLeave响应顺序为r3、r2
     *  onEnter事件则从上往下执行
	 * @author 		yanglei
     * @since 		1.0.0
     * @date		2017-01-21
     */
    export class Router {
		/**
		 * 加载中标志
		 */
		static loading:boolean = false;
		/**
		 * 路由map
		 */
		static routes:Map<number,Route> = new Map();
		/**
		 * 当前路径
		 */
		static currentPath:string = '';
		/**
		 * 显示路径（useParentPath时，实际路由路径与显示路径不一致）
		 */
		static showPath:string = '';
		/**
		 * path等待链表
		 */
		static waitList:Array<string> = []; 
		/**
		 * 当前路由在路由链中的index
		 */
		static currentIndex:number = 0;
		/**
		 * 默认路由进入事件方法
		 */
		static onDefaultEnter:Function;
		/**
		 * 默认路由离开事件
		 */
		static onDefaultLeave:Function; 
		/**
		 * module 和 route映射关系 {moduleName:routeId,...}
		 */
		static moduleRouteMap:Map<string,number> = new Map();

		/**
		 * 启动方式 0:直接启动 1:由element active改变启动 2:popstate 启动
		 */
		static startStyle:number = 0;
    
        /**
         * 激活Dom map，格式为{moduleName:[]}
         */
        static activeDomMap:Map<string,Array<string>> = new Map();
        /**
         * 往路由管理器中添加路径
         * @param path 	路径 
         */
        static async addPath(path:string) {
            for (let i = 0; i < this.waitList.length; i++) {
                let li:string = this.waitList[i];
                //相等，则不加入队列
                if (li === path) {
                    return;
                }
                //父路径，不加入
                if (li.indexOf(path) === 0 && li.substr(path.length + 1,1) === '/') {
                    return;
                }
            }
            this.waitList.push(path);
            this.load();
        }

        /**
         * 启动加载
         */
        static async load() {
            //在加载，或无等待列表，则返回
            if (this.loading || this.waitList.length === 0) {
                return;
            }
            let path:string = this.waitList.shift();
            this.loading = true;
            await this.start(path);
            this.loading = false;
            this.load();
        }

        /**
         * 切换路由
         * @param path 	路径
         */
        static async start(path:string) {
            let diff = this.compare(this.currentPath, path);
            //获得当前模块，用于寻找router view
            let parentModule = diff[0] === null ? ModuleFactory.getMain() : ModuleFactory.get(diff[0].module);
            //onleave事件，从末往前执行
            for (let i = diff[1].length - 1; i >= 0; i--) {
                const r = diff[1][i];
                if (!r.module) {
                    continue;
                }
                let module:Module = ModuleFactory.get(r.module);
                if (Util.isFunction(this.onDefaultLeave)) {
                    this.onDefaultLeave(module.model);
                }
                if (Util.isFunction(r.onLeave)) {
                    r.onLeave(module.model);
                }
                //module置为不激活
                module.unactive();
            }

            let showPath:string; 				//实际要显示的路径

            if (diff[2].length === 0) { //路由相同，参数不同
                let route:Route = diff[0];
                let proute:Route = diff[3];
                if (route !== null) {
                    //如果useparentpath，则使用父路由的路径，否则使用自己的路径
                    showPath = route.useParentPath && proute?proute.fullPath:route.fullPath;
                    route.setLinkActive(true);
                    //给模块设置路由参数
                    setRouteParamToModel(route);
                }
            } else { //路由不同
                //加载模块
                for (let i = 0; i < diff[2].length; i++) {
                    let route = diff[2][i];
                    //路由不存在或路由没有模块（空路由？）
                    if (!route || !route.module) {
                        continue;
                    }

                    if (!route.useParentPath) {
                        showPath = route.fullPath;
                    }

                    if (!parentModule.routerKey) {
                        throw new NodomError('notexist', TipWords.routeView);
                    }

                    let module = ModuleFactory.get(route.module);
                    if(!module){
                        throw new NodomError('notexist1',TipWords.module,route.module);
                    }
                    //保留container参数
                    module.containerParam = {
                        module: parentModule.name,
                        selector: "[key='" + parentModule.routerKey + "']"
                    }
                    
                    module.addBeforeFirstRenderOperation(function () {
                        //清空模块容器
                        Util.empty(module.container);
                    });
                    //设置route active
                    route.setLinkActive(true);
                    //清除container
                    delete module.container;
                    //设置首次渲染
                    module.firstRender = true;
                    //激活模块
                    await module.active();
                    //设置路由参数
                    setRouteParamToModel(route);
                    //默认全局路由enter事件
                    if (Util.isFunction(this.onDefaultEnter)) {
                        this.onDefaultEnter(module.model);
                    }
                    //当前路由进入事件
                    if (Util.isFunction(route.onEnter)) {
                        route.onEnter(module.model);
                    }
                    parentModule = module;
                }
            }
            
            //如果是history popstate，则不加入history
            if (this.startStyle !== 2 && showPath) {
                //子路由，替换state
                if (this.showPath && showPath.indexOf(this.showPath) === 0) {
                    history.replaceState(path, '', Application.routerPrePath + showPath);
                } else { //路径push进history
                    history.pushState(path, '', Application.routerPrePath + showPath);
                }
                //设置显示路径
                this.showPath = showPath;
            }
            //修改currentPath
            this.currentPath = path;
            //设置start类型为正常start
            this.startStyle = 0;
            
            /**
             * 将路由参数放入module的model中
             * @param route 	路由
             */
            function setRouteParamToModel(route:Route){
                if (!route) {
                    return;
                }
                const module:Module = ModuleFactory.get(route.module);
                let o = {
                    path: route.path
                };
                if (!Util.isEmpty(route.data)) {
                    o['data'] = route.data;
                }
                if (!module.model) {
                    module.model = new Model({}, module);
                }
                module.model.set('$route',o);
            }
        }

        /*
         * 重定向
         * @param path 	路径
         */
        static redirect(path:string) {
            this.addPath(path);
        }

        /**
         * 添加路由
         * @param route 	路由配置 
         * @param parent 	父路由 
         */
        static addRoute(route:Route, parent:Route) {
            //加入router tree
            if (RouterTree.add(route, parent) === false) {
                throw new NodomError("exist1", TipWords.route, route.path);
            }

            //加入map
            this.routes.set(route.id, route);
        }

        /**
         * 获取路由
         * @param path 	路径
         * @param last 	是否获取最后一个路由,默认false
         */
        static getRoute(path:string, last?:boolean):Array<Route> {
            if (!path) {
                return null;
            }
            
            let routes:Array<Route> = RouterTree.get(path);
            if (routes === null || routes.length === 0) {
                return null;
            }
            //routeid 转route
            if (last) { //获取最后一个
                return [routes.pop()];
            } else { //获取所有
                return routes;
            }
        }

        /**
         * 比较两个路径对应的路由链
         * @param path1 	第一个路径
         * @param path2 	第二个路径
         * @returns 		[不同路由的父路由，第一个需要销毁的路由数组，第二个需要增加的路由数组，第二个路由]
         */
        static compare(path1:string, path2:string):Array<any> {
            
            // 获取路由id数组
            let arr1:Array<Route> = null;
            let arr2:Array<Route> = null;

            if (path1) {
                arr1 = this.getRoute(path1);
            }
            if (path2) {
                arr2 = this.getRoute(path2);
            }

            let len = 0;
            if (arr1 !== null) {
                len = arr1.length;
            }

            if (arr2 !== null) {
                if (arr2.length < len) {
                    len = arr2.length;
                }
            } else {
                len = 0;
            }
            //需要销毁的旧路由数组
            let retArr1 = [];
            //需要加入的新路由数组
            let retArr2 = [];
            let i = 0;

            for (i = 0; i < len; i++) {
                //找到不同路由开始位置
                if (arr1[i].id === arr2[i].id) {
                    //比较参数
                    if (JSON.stringify(arr1[i].data) !== JSON.stringify(arr2[i].data)) {
                        //从后面开始更新，所以需要i+1
                        i++;
                        break;
                    }
                } else {
                    break;
                }
            }
            //旧路由改变数组
            if (arr1 !== null) {
                for (let j = i; j < arr1.length; j++) {
                    retArr1.push(arr1[j]);
                }
            }

            //新路由改变数组（相对于旧路由）
            if (arr2 !== null) {
                for (let j = i; j < arr2.length; j++) {
                    retArr2.push(arr2[j]);
                }
            }

            //上一级路由和上二级路由
            let p1:Route = null;
            let p2:Route = null;
            if (arr1 !== null && i > 0) {
                for (let j = i - 1; j >= 0 && (p1 === null || p2 === null); j--) {
                    if (arr1[j].module !== undefined) {
                        if (p1 === null) {
                            p1 = arr1[j];
                        } else if (p2 === null) {
                            p2 = arr1[j];
                        }
                    }
                }
            }
            return [p1, retArr1, retArr2, p2];
        }

        /**
         * 修改模块active view（如果为view active为true，则需要路由跳转）
         * @param module 	模块
         * @param path 		view对应的route路径
         */
        static changeActive(module, path) {
            if (!module || !path || path === '') {
                return;
            }
            let domArr:string[] = Router.activeDomMap.get(module.name);
            if(!domArr){
                return;
            }
            //遍历router active view，设置或取消active class
            domArr.forEach((item) => {
                let dom = module.renderTree.query(item);
                if (!dom) {
                    return;
                }
                // dom route 路径
                let domPath:string = dom.props['path'];
                if (dom.exprProps.hasOwnProperty('active')) { // active属性为表达式，修改字段值
                    let model = module.modelFactory.get(dom.modelId);
                    if (!model) {
                        return;
                    }

                    let expr = module.expressionFactory.get(dom.exprProps['active'][0]);
                    if (!expr) {
                        return;
                    }
                    let field = expr.fields[0];
                        
                    //路径相同或参数路由路径前部分相同则设置active 为true，否则为false
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        model.data[field] = true;
                    } else {
                        model.data[field] = false;
                    }
                } else if (dom.props.hasOwnProperty('active')) { //active值属性
                    //路径相同或参数路由路径前部分相同则设置active 为true，否则为false
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        dom.props['active'] = true;
                    } else {
                        dom.props['active'] = false;
                    }
                }
            });
        }
    }

	/**
	 * 路由类
	 */
    export class Route {
		/**
		 * 路由id
		 */
		id:number;
		/**
		 * 路由参数名数组
		 */
		params:Array<string> = [];
		/**
		 * 路由参数数据
		 */
		data:any = {};
		/**
		 * 子路由
		 */
		children:Array<Route> = [];
		/**
		 * 进入路由事件方法
		 */
		onEnter:Function;
		/**
		 * 离开路由方法
		 */
		onLeave:Function;
		/**
		 * 是否使用父路由路径
		 */
		useParentPath:boolean;
		/**
		 * 路由路径
		 */
		path:string;
		/**
		 * 完整路径
		 */
		fullPath:string;
		/**
		 * 路由对应模块
		 */
		module:string;
		/**
		 * 父路由
		 */
		parent:Route;
		/**
		 * 
		 * @param config 路由配置项
		 */
        constructor(config:IRouteCfg) {
            this.onEnter = config.onEnter;
            this.onLeave = config.onLeave;
            this.useParentPath = config.useParentPath;
            this.path = config.path;
            this.module = config.module instanceof Module ? config.module.name : config.module;

            if (config.path === '') {
                return;
            }

            this.id = Util.genId();

            if (!config.notAdd) {
                Router.addRoute(this, config.parent);
            }

            //子路由
            if (Util.isArray(config.routes)) {
                config.routes.forEach((item) => {
                    item.parent = this;
                    new Route(item);
                });
            }
        }
        /**
         * 设置关联标签激活状态
         * @param ancestor 		是否激活祖先路由 true/false
         */
        setLinkActive(ancestor:boolean) {
            let path = this.fullPath;
            let module = ModuleFactory.get(this.module);
            if (module && module.containerParam) {
                let pm = ModuleFactory.get(module.containerParam['module']);
                if (pm) {
                    Router.changeActive(pm, path);
                }
            }
            if (ancestor && this.parent) {
                this.parent.setLinkActive(true);
            }
        }
    }

    /**
     * 路由树类
     */
    class RouterTree {
		static root:Route;
        /**
         * 添加route到路由树
         *
         * @param route 路由
         * @return 添加是否成功 type Boolean
         */
        static add(route:Route, parent:Route) {
            
            //创建根节点
            if (!this.root) {
                this.root = new Route({ path: "", notAdd: true });
            }
            let pathArr:Array<string> = route.path.split('/');
            let node:Route = parent || this.root;
            let param:Array<string> = [];
            let paramIndex:number = -1; //最后一个参数开始
            let prePath:string = ''; //前置路径
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    pathArr.splice(i--, 1);
                    continue;
                }

                if (v.startsWith(':')) { //参数
                    if (param.length === 0) {
                        paramIndex = i;
                    }
                    param.push(v.substr(1));
                } else {
                    paramIndex = -1;
                    param = []; //上级路由的参数清空
                    route.path = v; //暂存path
                    let j = 0;
                    for (; j < node.children.length; j++) {
                        let r = node.children[j];
                        if (r.path === v) {
                            node = r;
                            break;
                        }
                    }

                    //没找到，创建新节点
                    if (j === node.children.length) {
                        if (prePath !== '') {
                            node.children.push(new Route({ path: prePath, notAdd: true }));
                            node = node.children[node.children.length - 1];
                        }
                        prePath = v;
                    }
                }

                //不存在参数
                if (paramIndex === -1) {
                    route.params = [];
                } else {
                    route.params = param;
                }
            }

            //添加到树
            if (node !== undefined && node !== route) {
                route.path = prePath;
                node.children.push(route);
            }
            return true;
        }

        /**
         * 从路由树中获取路由节点
         * @param path  	路径
         */
        static get(path:string):Array<Route> {
            if (!this.root) {
                throw new NodomError("notexist", TipWords.root);
            }
            let pathArr:string[] = path.split('/');
            let node:Route = this.root;
            
            let paramIndex:number = 0;      //参数索引
            let retArr:Array<Route> = [];
            let fullPath:string = '';       //完整路径
            let showPath:string = '';       //显示路径
            let preNode:Route = this.root;  //前一个节点

            for (let i = 0; i < pathArr.length; i++) {
                let v:string = pathArr[i].trim();
                if (v === '') {
                    continue;
                }
                let find:boolean = false;
                for (let j=0; j<node.children.length; j++) {
                    if (node.children[j].path === v) {
                        //设置完整路径
                        if (preNode !== this.root) {
                            preNode.fullPath = fullPath;
                            preNode.data = node.data;
                            retArr.push(preNode);
                        }

                        //设置新的查找节点
                        node = node.children[j];
                        //参数清空
                        node.data = {};
                        preNode = node;
                        find = true;
                        break;
                    }
                }
                //路径叠加
                fullPath += '/' + v;
                //不是孩子节点,作为参数
                if (!find) {
                    if (paramIndex < node.params.length) { //超出参数长度的废弃
                        node.data[node.params[paramIndex++]] = v;
                    }
                }
            }

            //最后一个节点
            if (node !== this.root) {
                node.fullPath = fullPath;
                retArr.push(node);
            }
            return retArr;
        }
    }


    //处理popstate事件
    window.addEventListener('popstate', function (e) {
        //根据state切换module
        const state = history.state;
        if (!state) {
            return;
        }
        Router.startStyle = 2;
        Router.addPath(state);
    });


    /**
     * 增加route指令
     */
    DirectiveManager.addType('route', {
        init: (directive:Directive, dom:Element, module:Module) => {
            let value = directive.value;
            if (Util.isEmpty(value)) {
                return;
            }

            //a标签需要设置href
            if (dom.tagName === 'A') {
                dom.setProp('href','javascript:void(0)');
            }
            // 表达式处理
            if (typeof value === 'string' && value.substr(0, 2) === '{{' && value.substr(value.length - 2, 2) === '}}') {
                value = new Expression(value.substring(2, value.length - 2));
            } 
            //表达式，则需要设置为exprProp
            if(value instanceof Expression){
                dom.setProp('path',value,true);
                directive.value = value;
            }else{
                dom.setProp('path',value);
            }
            
            //添加click事件
            dom.addEvent(new NodomEvent('click', '', 
                async (dom,model,module,e) => {
                    let path:string = dom.props['path'];
                    if (Util.isEmpty(path)) {
                        return;
                    }
                    Router.addPath(path);
                }
            ));
        },

        handle: (directive:Directive, dom:Element, module:Module, parent:Element) => {
            if (dom.props.hasOwnProperty('active')) {
                //添加到router的activeDomMap
                let domArr:string[] = Router.activeDomMap.get(module.name);
                if(!domArr){
                    Router.activeDomMap.set(module.name,[dom.key]);
                }else{
                    if(!domArr.includes(dom.key)){
                        domArr.push(dom.key);
                    }
                }
                
                // let route:Array<Route> = Router.getRoute(dom.props['path'], true);
                // if (route === null) {
                //     return;
                // }
            }

            let path:string = dom.props['path'];
            if (path === Router.currentPath) {
                return;
            }
            
            //active需要跳转路由（当前路由为该路径对应的父路由）
            if (dom.props.hasOwnProperty('active') && dom.props['active'] !== 'false' && (!Router.currentPath || path.indexOf(Router.currentPath) === 0)) {
                Router.addPath(path);
            }
            
        }
    });

    /**
     * 增加router指令
     */
    DirectiveManager.addType('router', {
        init: (directive, dom, module) => {
            module.routerKey = dom.key;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
}