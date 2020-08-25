// / <reference path="nodom.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var nodom;
(function (nodom) {
    /**
     * 路由，主要用于模块间跳转，一个应用中存在一个router，多个route
     * 采用修改页面hash方式进行路由历史控制，每个route 可设置onEnter事件(钩子) 和 onLeave事件(钩子)
     * 回调调用的几个问题
     * onLeave事件在路由切换时响应，如果存在多级路由切换，则从底一直到相同祖先路由，都会进行onLeave事件响应
     *  如：从/r1/r2/r3  到 /r1/r4/r5，则onLeave响应顺序为r3、r2
     *  onEnter事件则从上往下执行
     * @author 		yanglei
     * @since 		1.0
     */
    class Router {
        /**
         * 往路由管理器中添加路径
         * @param path 	路径
         */
        static addPath(path) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let i = 0; i < this.waitList.length; i++) {
                    let li = this.waitList[i];
                    //相等，则不加入队列
                    if (li === path) {
                        return;
                    }
                    //父路径，不加入
                    if (li.indexOf(path) === 0 && li.substr(path.length + 1, 1) === '/') {
                        return;
                    }
                }
                this.waitList.push(path);
                this.load();
            });
        }
        /**
         * 启动加载
         */
        static load() {
            return __awaiter(this, void 0, void 0, function* () {
                //在加载，或无等待列表，则返回
                if (this.loading || this.waitList.length === 0) {
                    return;
                }
                let path = this.waitList.shift();
                this.loading = true;
                yield this.start(path);
                this.loading = false;
                this.load();
            });
        }
        /**
         * 切换路由
         * @param path 	路径
         */
        static start(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let diff = this.compare(this.currentPath, path);
                //获得当前模块，用于寻找router view
                let parentModule;
                if (diff[0] === null) {
                    parentModule = findParentModule();
                }
                else {
                    if (typeof diff[0].module === 'string') {
                        parentModule = yield nodom.ModuleFactory.getInstance(diff[0].module, diff[0].moduleName);
                    }
                    else {
                        parentModule = nodom.ModuleFactory.get(diff[0].module);
                    }
                }
                //父模块不存在，不继续处理
                if (!parentModule) {
                    return;
                }
                //onleave事件，从末往前执行
                for (let i = diff[1].length - 1; i >= 0; i--) {
                    const r = diff[1][i];
                    if (!r.module) {
                        continue;
                    }
                    let module = nodom.ModuleFactory.get(r.module);
                    if (nodom.Util.isFunction(this.onDefaultLeave)) {
                        this.onDefaultLeave(module.model);
                    }
                    if (nodom.Util.isFunction(r.onLeave)) {
                        r.onLeave(module.model);
                    }
                    //module置为不激活
                    module.unactive();
                }
                let showPath; //实际要显示的路径
                if (diff[2].length === 0) { //路由相同，参数不同
                    let route = diff[0];
                    let proute = diff[3];
                    if (route !== null) {
                        //如果useparentpath，则使用父路由的路径，否则使用自己的路径
                        showPath = route.useParentPath && proute ? proute.fullPath : route.fullPath;
                        //给模块设置路由参数
                        let module = nodom.ModuleFactory.get(route.module);
                        setRouteParamToModel(route, module);
                        route.setLinkActive();
                        //设置首次渲染
                        module.firstRender = true;
                        module.active();
                    }
                }
                else { //路由不同
                    //加载模块
                    for (let ii = 0, index = 0, len = diff[2].length; ii < len; ii++) {
                        let route = diff[2][ii];
                        //路由不存在或路由没有模块（空路由）
                        if (!route || !route.module) {
                            continue;
                        }
                        if (!route.useParentPath) {
                            showPath = route.fullPath;
                        }
                        let module;
                        //尚未获取module，进行初始化
                        if (typeof route.module === 'string') {
                            module = yield nodom.ModuleFactory.getInstance(route.module, route.moduleName);
                            if (!module) {
                                throw new nodom.NodomError('notexist1', nodom.TipMsg.TipWords['module'], route.module);
                            }
                            route.module = module.id;
                        }
                        else {
                            module = nodom.ModuleFactory.get(route.module);
                        }
                        //设置首次渲染
                        module.firstRender = true;
                        let routerKey = Router.routerKeyMap.get(parentModule.id);
                        //从父模块子节点中删除以此routerKey为containerKey的模块
                        for (let i = 0; i < parentModule.children.length; i++) {
                            let m = nodom.ModuleFactory.get(parentModule.children[i]);
                            if (m && m.containerKey === routerKey) {
                                parentModule.children.splice(i, 1);
                                break;
                            }
                        }
                        //把此模块添加到父模块
                        parentModule.addChild(module.id);
                        if (index++ === 0) { //第一个的父模块为已渲染或根模块
                            module.setContainerKey(routerKey);
                            //激活模块
                            yield module.active();
                            route.setLinkActive();
                        }
                        else { //非第一个需要等待父模块渲染结束
                            //添加父模块渲染后操作
                            parentModule.addFirstRenderOperation(function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    //this指向parentModule
                                    let routerKey = Router.routerKeyMap.get(this.id);
                                    if (routerKey) {
                                        module.setContainerKey(routerKey);
                                        yield module.active();
                                    }
                                    route.setLinkActive();
                                });
                            });
                        }
                        //设置路由参数
                        setRouteParamToModel(route);
                        //默认全局路由enter事件
                        if (nodom.Util.isFunction(this.onDefaultEnter)) {
                            this.onDefaultEnter(module.model);
                        }
                        //当前路由进入事件
                        if (nodom.Util.isFunction(route.onEnter)) {
                            route.onEnter(module.model);
                        }
                        parentModule = module;
                    }
                }
                //如果是history popstate，则不加入history
                if (this.startStyle !== 2 && showPath) {
                    let p = nodom.Util.mergePath([nodom.Application.getPath('route'), showPath]);
                    //子路由，替换state
                    if (this.showPath && showPath.indexOf(this.showPath) === 0) {
                        history.replaceState(path, '', p);
                    }
                    else { //路径push进history
                        history.pushState(path, '', p);
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
                 * @param module    模块
                 */
                function setRouteParamToModel(route, module) {
                    if (!route) {
                        return;
                    }
                    if (!module) {
                        module = nodom.ModuleFactory.get(route.module);
                    }
                    let o = {
                        path: route.path
                    };
                    if (!nodom.Util.isEmpty(route.data)) {
                        o['data'] = route.data;
                    }
                    if (!module.model) {
                        module.model = new nodom.Model({}, module);
                    }
                    module.model.set('$route', o);
                }
                /**
                 * 找到第一个带router的父模块
                 * @param pm    父模块
                 */
                function findParentModule(pm) {
                    if (!pm) {
                        pm = nodom.ModuleFactory.getMain();
                    }
                    if (Router.routerKeyMap.has(pm.id)) {
                        return pm;
                    }
                    for (let c of pm.children) {
                        let m = nodom.ModuleFactory.get(c);
                        return findParentModule(m);
                    }
                }
            });
        }
        /*
         * 重定向
         * @param path 	路径
         */
        static redirect(path) {
            this.addPath(path);
        }
        /**
         * 添加路由
         * @param route 	路由配置
         * @param parent 	父路由
         */
        static addRoute(route, parent) {
            //加入router tree
            if (RouterTree.add(route, parent) === false) {
                throw new nodom.NodomError("exist1", nodom.TipMsg.TipWords['route'], route.path);
            }
            //加入map
            this.routes.set(route.id, route);
        }
        /**
         * 获取路由
         * @param path 	路径
         * @param last 	是否获取最后一个路由,默认false
         */
        static getRoute(path, last) {
            if (!path) {
                return null;
            }
            let routes = RouterTree.get(path);
            if (routes === null || routes.length === 0) {
                return null;
            }
            //routeid 转route
            if (last) { //获取最后一个
                return [routes.pop()];
            }
            else { //获取所有
                return routes;
            }
        }
        /**
         * 比较两个路径对应的路由链
         * @param path1 	第一个路径
         * @param path2 	第二个路径
         * @returns 		[不同路由的父路由，第一个需要销毁的路由数组，第二个需要增加的路由数组，上2级路由]
         */
        static compare(path1, path2) {
            // 获取路由id数组
            let arr1 = null;
            let arr2 = null;
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
            }
            else {
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
                }
                else {
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
            let p1 = null;
            let p2 = null;
            if (arr1 !== null && i > 0) {
                for (let j = i - 1; j >= 0 && (p1 === null || p2 === null); j--) {
                    if (arr1[j].module !== undefined) {
                        if (p1 === null) {
                            p1 = arr1[j];
                        }
                        else if (p2 === null) {
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
            let domArr = Router.activeDomMap.get(module.id);
            if (!domArr) {
                return;
            }
            //遍历router active view，设置或取消active class
            domArr.forEach((item) => {
                let dom = module.renderTree.query(item);
                if (!dom) {
                    return;
                }
                // dom route 路径
                let domPath = dom.getProp('path');
                if (dom.hasProp('active', true)) { // active属性为表达式，修改字段值
                    let model = module.modelFactory.get(dom.modelId);
                    if (!model) {
                        return;
                    }
                    let expr = dom.getProp('active', true)[0];
                    if (!expr) {
                        return;
                    }
                    let field = expr.fields[0];
                    //路径相同或参数路由路径前部分相同则设置active 为true，否则为false
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        model.data[field] = true;
                    }
                    else {
                        model.data[field] = false;
                    }
                }
                else if (dom.hasProp('active')) { //active值属性
                    //路径相同或参数路由路径前部分相同则设置active 为true，否则为false
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        dom.setProp('active', true);
                    }
                    else {
                        dom.set('active', false);
                    }
                }
            });
        }
    }
    /**
     * 加载中标志
     */
    Router.loading = false;
    /**
     * 路由map
     */
    Router.routes = new Map();
    /**
     * 当前路径
     */
    Router.currentPath = '';
    /**
     * 显示路径（useParentPath时，实际路由路径与显示路径不一致）
     */
    Router.showPath = '';
    /**
     * path等待链表
     */
    Router.waitList = [];
    /**
     * 当前路由在路由链中的index
     */
    Router.currentIndex = 0;
    /**
     * 启动方式 0:直接启动 1:由element active改变启动 2:popstate 启动
     */
    Router.startStyle = 0;
    /**
     * 激活Dom map，格式为{moduleId:[]}
     */
    Router.activeDomMap = new Map();
    /**
     * 绑定到module的router指令对应的key，即router容器对应的key，格式为 {moduleId:routerKey,...}
     */
    Router.routerKeyMap = new Map();
    nodom.Router = Router;
    /**
     * 路由类
     */
    class Route {
        /**
         *
         * @param config 路由配置项
         */
        constructor(config) {
            /**
             * 路由参数名数组
             */
            this.params = [];
            /**
             * 路由参数数据
             */
            this.data = {};
            /**
             * 子路由
             */
            this.children = [];
            //参数赋值
            for (let o in config) {
                this[o] = config[o];
            }
            if (config.path === '') {
                return;
            }
            this.id = nodom.Util.genId();
            if (!config.notAdd) {
                Router.addRoute(this, config.parent);
            }
            //子路由
            if (nodom.Util.isArray(config.routes)) {
                config.routes.forEach((item) => {
                    item.parent = this;
                    new Route(item);
                });
            }
        }
        /**
         * 设置关联标签激活状态
         */
        setLinkActive() {
            if (this.parent) {
                let pm = nodom.ModuleFactory.get(this.parent.module);
                if (pm) {
                    Router.changeActive(pm, this.fullPath);
                }
            }
        }
        /**
         * 添加子路由
         * @param child
         */
        addChild(child) {
            this.children.push(child);
            child.parent = this;
        }
    }
    nodom.Route = Route;
    /**
     * 路由树类
     */
    class RouterTree {
        /**
         * 添加route到路由树
         *
         * @param route 路由
         * @return 添加是否成功 type Boolean
         */
        static add(route, parent) {
            //创建根节点
            if (!this.root) {
                this.root = new Route({ path: "", notAdd: true });
            }
            let pathArr = route.path.split('/');
            let node = parent || this.root;
            let param = [];
            let paramIndex = -1; //最后一个参数开始
            let prePath = ''; //前置路径
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
                }
                else {
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
                            let r = new Route({ path: prePath, notAdd: true });
                            node.addChild(r);
                            node = node.children[node.children.length - 1];
                        }
                        prePath = v;
                    }
                }
                //不存在参数
                if (paramIndex === -1) {
                    route.params = [];
                }
                else {
                    route.params = param;
                }
            }
            //添加到树
            if (node !== undefined && node !== route) {
                route.path = prePath;
                node.addChild(route);
            }
            return true;
        }
        /**
         * 从路由树中获取路由节点
         * @param path  	路径
         */
        static get(path) {
            if (!this.root) {
                throw new nodom.NodomError("notexist", nodom.TipMsg.TipWords['root']);
            }
            let pathArr = path.split('/');
            let node = this.root;
            let paramIndex = 0; //参数索引
            let retArr = [];
            let fullPath = ''; //完整路径
            let showPath = ''; //显示路径
            let preNode = this.root; //前一个节点
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    continue;
                }
                let find = false;
                for (let j = 0; j < node.children.length; j++) {
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
})(nodom || (nodom = {}));
//# sourceMappingURL=router.js.map