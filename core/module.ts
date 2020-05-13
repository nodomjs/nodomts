/// <reference path="nodom.ts" />
namespace nodom {
    /**
     * 模块配置对象
     */
    export interface IModuleCfg {
        /**
         * 模块名(全局唯一)，如果不设置，则系统会自动生成Module+id
         */
        name ? : string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        static ? : boolean;
        
        /**
         * 父模块名
         */
        parentName ? : string;
        /**
         * 子模块数组
         */
        modules ? : Array < IModuleCfg > ;
        /**
         * 存放模块的容器（选择器或html element）
         */
        el: string | HTMLElement;
        /**
         * 模版字符串，如果以“<”开头，则表示模版字符串，否则表示模版url
         */
        template ? : string;
        /**
         * 数据，如果为json object，直接作为模型数据，如果为字符串，则表示数据url，需要请求得到数据
         */
        data ? : object | string;
        /**
         * 模块方法集合
         * ```
         * 	{
         * 		method1:function1(){},
         * 		method2:function2(){},
         * 		...
         * 	}
         * ```
         */
        methods ? : object;
        /**
         * 延迟初始化，如果设置为true，则不会提前加载并初始化
         */    
        delayInit:boolean;
        /**
         * 先于模块初始化加载的文件[{type:'js'/'css',url:路径}
         */
        requires:Array<string|object>;
    }
    /**
     * 模块类
     */
    export class Module {
        /**
         * 模块名(全局唯一)
         */
        name: string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        static ? : boolean;
        /**
         * 模型
         */
        model ? : Model;

        /**
         * 是否主模块，一个app只有一个根模块
         */
        main ? : boolean;

        /**
         * 是否是首次渲染
         */
        firstRender: boolean=true;
        /**
         * 根虚拟dom
         */
        virtualDom: Element;
        /**
         * 渲染结束
         */
        rendered: boolean;
        /**
         * 待渲染树
         */
        renderTree: Element;
        /**
         * 父模块名
         */
        parentName: string;
        /**
         * 子模块数组
         */
        children: Array < Module > = [];
        /**
         * container 选择器
         */
        selector: string;
        /**
         * 首次渲染后执行操作数组
         */
        firstRenderOps: Array < Function > = [];
        /**
         * 首次渲染前执行操作数组
         */
        beforeFirstRenderOps: Array < Function > = [];
        /**
         * 模块容器参数{module:,selector:}
         */
        containerParam: object;
        /**
         * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)
         */
        state: number = 0;
        /**
         * 数据url
         */
        dataUrl: string;
        
        /**
         * 需要加载新数据
         */
        loadNewData: boolean = false;
        /**
         * 方法工厂
         */
        methodFactory: MethodFactory;
        /**
         * 数据模型工厂
         */
        modelFactory: ModelFactory;
        /**
         * 表达式工厂
         */
        expressionFactory: ExpressionFactory;
        /**
         * 指令工厂
         */
        directiveFactory: DirectiveFactory;
        /**
         * 修改渲染的虚拟dom数组
         */
        renderDoms: Array < ChangedDom >= [];
        /**
         * 初始配置
         */
        initConfig: IModuleCfg;
        /**
         * 放置模块dom的容器
         */
        container: HTMLElement;

        /**
         * 初始化链式处理器
         */
        initLinker:Promise<any>;

        /**
         * 模版串
         */
        template:string;

        /**
         * 路由容器key
         */
        routerKey:number;
        /**
         * 构造器
         * @param config 
         */
        constructor(config: IModuleCfg,main?:boolean) {
            // 模块名字
            if (config.name) {
                this.name = config.name;
            } else {
                this.name = 'Module' + Util.genId();
            }

            // 把模块添加到工厂
            ModuleFactory.add(this.name, this);
            
            this.methodFactory = new MethodFactory(this);
            this.modelFactory = new ModelFactory(this);
            this.expressionFactory = new ExpressionFactory(this);
            this.directiveFactory = new DirectiveFactory(this);
            
            if (config) {
                //保存config，存在延迟初始化情况
                this.initConfig = config;
                //保存container参数
                if (Util.isString(config.el)) {
                    this.containerParam = {
                        module: config.parentName,
                        selector: config.el
                    };
                } else if (Util.isEl(config.el)) { //element
                    this.container = < HTMLElement > config.el;
                }

                //方法加入工厂
                if (Util.isObject(config.methods)) {
                    Util.getOwnProps(config.methods).forEach((item) => {
                        this.methodFactory.add(item, config.methods[item]);
                    });
                }
                
                //清除container的内部内容
                if (this.hasContainer()) {
                    this.template = this.container.innerHTML.trim();
                    this.container.innerHTML = '';
                }

                //主模块
                if (main) {
                    this.main = true;
                    ModuleFactory.setMain(this);
                    // this.active();
                }

                //不延迟初始化或为主模块，需要立即初始化
                // if (!config.delayInit) {
                //     this.init();
                // }
            }
        }

        /**
         * 初始化模块（加载和编译）
         */
        async init():Promise<any> {
            let config = this.initConfig;
            let typeArr:Array<string> = []; //请求类型数组
            let urlArr:Array<string> = []; //请求url数组
            
            //app页面根路径
            let appPath:string = Application.templatePath || '';
            //加载文件
            if (Util.isArray(config.requires) && config.requires.length > 0) {
                const head:HTMLHeadElement = document.head;
                config.requires.forEach((item) => {
                    let type:string;
                    let url:string = '';
                    if (Util.isObject(item)) { //为对象，可能是css或js
                        type = item['type'] || 'js';
                        url += item['url'];
                    } else { //js文件
                        type = 'js';
                        url += item;
                    }
                    //如果已经加载，则不再加载
                    if (type === 'css') {
                        let css: HTMLLinkElement = <HTMLLinkElement>Util.get("link[href='" + url + "']");
                        if (css !== null) {
                            return;
                        }
                        css = <HTMLLinkElement>Util.newEl('link');
                        css.type = 'text/css';
                        css.rel = 'stylesheet'; // 保留script标签的path属性
                        css.href = url;
                        head.appendChild(css);
                        return;
                    } else if (type === 'js') {
                        let cs = Util.get("script[dsrc='" + url + "']");
                        if (cs !== null) {
                            return;
                        }
                    }
                    typeArr.push(type);
                    urlArr.push(url);
                });
            }

            //模版串
            let templateStr:string=this.template;
            //模版信息
            if(config.template){
                config.template = config.template.trim();
                if(config.template.startsWith('<')){ //html模版串
                    templateStr = config.template;
                }else{  //文件
                    if(config.template.endsWith('.nd')){ //nodom编译文件
                        typeArr.push('compiled');
                    }else{  //普通html文件
                        typeArr.push('template');
                    }
                    urlArr.push(appPath + config.template);
                }
            }
            
            //如果已存在templateStr，则直接编译
            if (!Util.isEmpty(templateStr)) {
                this.virtualDom = Compiler.compile(templateStr);
            }

            //数据信息
            if (config.data) { //数据
                if(Util.isObject(config.data)){ //数据
                    this.model = new Model(config.data, this);
                }else{ //数据文件
                    typeArr.push('data');
                    urlArr.push((<object>config)['data']);
                    this.dataUrl = <string>config.data;
                }
            }

            //批量请求文件
            if (typeArr.length > 0) {
                let files = await Linker.gen('getfiles', urlArr);
                let head = document.querySelector('head');
                files.forEach((file, ind) => {
                    switch (typeArr[ind]) {
                    case 'js':
                        let script = Util.newEl('script');
                        script.innerHTML = file;
                        head.appendChild(script);
                        script.setAttribute('dsrc', urlArr[ind]);
                        script.innerHTML = '';
                        head.removeChild(script);
                        break;
                    case 'template':
                        this.virtualDom = Compiler.compile(file.trim());
                        break;
                    case 'compiled': //预编译后的js文件
                        let arr = Serializer.deserialize(file, this);
                        this.virtualDom = arr[0];
                        this.expressionFactory = arr[1];
                        break;
                    case 'data': //数据
                        this.model = new Model(JSON.parse(file), this);
                    }
                });
            } 
            changeState(this);
            
            if (Util.isArray(this.initConfig.modules)) {
                this.initConfig.modules.forEach((item) => {
                    this.addChild(item);
                });
            }
            
            delete this.initConfig;
            /**
             * 修改状态
             * @param mod 	模块
             */
            function changeState(mod:Module) {
                if (mod.main) {
                    mod.state = 3;
                    //可能不能存在数据，需要手动添加到渲染器
                    Renderer.add(mod);
                } else if (mod.parentName) {
                    mod.state = ModuleFactory.get(mod.parentName).state;
                } else {
                    mod.state = 1;
                }
            }
        }

        /**
         * 模型渲染
         * @return false 渲染失败 true 渲染成功
         */
        render() {
            //容器没就位或state不为active则不渲染，返回渲染失败
            if (this.state !== 3 || !this.virtualDom || !this.hasContainer()) {
                return false;
            }
            //克隆新的树
            let root = this.virtualDom.clone();

            if (this.firstRender) {
                //model无数据，如果存在dataUrl，则需要加载数据
                if (this.loadNewData && this.dataUrl) {
                    Linker.gen('ajax', {
                        url: this.dataUrl,
                        type: 'json'
                    }).then((r) => {
                        this.model = new Model(r, this);
                        this.doFirstRender(root);
                    });
                    this.loadNewData = false;
                } else {
                    this.doFirstRender(root);
                }
            } else { //增量渲染
                //执行每次渲染前事件
                this.doModuleEvent('onBeforeRender');
                if (this.model) {
                    root.modelId = this.model.id;
                    let oldTree = this.renderTree;
                    this.renderTree = root;
                    //渲染
                    root.render(this, null);

                    // 比较节点
                    root.compare(oldTree, this.renderDoms);
                    // 删除
                    for (let i = this.renderDoms.length - 1; i >= 0; i--) {
                        let item:ChangedDom = this.renderDoms[i];
                        if (item.type === 'del') {
                            item.node.removeFromHtml(this);
                            this.renderDoms.splice(i, 1);
                        }
                    }
                    // 渲染
                    this.renderDoms.forEach((item) => {
                        item.node.renderToHtml(this, item);
                    });
                }
                //执行每次渲染后事件，延迟执行
                this.doModuleEvent('onRender');
            }

            //数组还原
            this.renderDoms = [];

            //子模块渲染
            if (Util.isArray(this.children)) {
                this.children.forEach(item => {
                    item.render();
                });
            }
            return true;
        }
        /**
         * 执行首次渲染
         * @param root 	根虚拟dom
         */
        doFirstRender(root:Element) {
            //执行首次渲染前事件
            this.doModuleEvent('onBeforeFirstRender');
            this.beforeFirstRenderOps.forEach((foo) => {
                Util.apply(foo, this, []);
            });
            this.beforeFirstRenderOps = [];
            //渲染树
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }

            root.render(this, null);
            //渲染到html
            if (root.children) {
                root.children.forEach((item) => {
                    item.renderToHtml(this, { type: 'fresh' });
                });
            }

            //删除首次渲染标志
            delete this.firstRender;
            
            //执行首次渲染后事件
            this.doModuleEvent('onFirstRender');
            //执行首次渲染后操作队列
            this.firstRenderOps.forEach((foo) => {
                Util.apply(foo, this, []);
            });
            this.firstRenderOps = [];
        }
        // 检查容器是否存在，如果不存在，则尝试找到
        hasContainer() {
            if (this.container) {
                return true;
            } else if (this.containerParam !== undefined) {
                let ct;
                if (this.containerParam['module'] === undefined) { //没有父节点
                    ct = document;
                } else {
                    let module = ModuleFactory.get(this.containerParam['module']);
                    if (module) {
                        ct = module.container;
                    }
                }

                if (ct) {
                    this.container = ct.querySelector(this.containerParam['selector']);
                    return this.container !== null;
                }
            }
            return false;
        }
        /**
         * 数据改变
         * @param model 	改变的model
         */
        dataChange() {
            Renderer.add(this);
        }

        /**
         * 添加子模块
         * @param config 	模块配置 
         */
        addChild(config) {
            config.parentName = this.name;
            let chd = new Module(config);
            if (this.children === undefined) {
                this.children = [];
            }
            this.children.push(chd);
            return chd;
        }

        /**
         * 发送
         * @param toName 		接收模块名
         * @param data 			消息内容
         */
        send(toName:string, data:any) {
            MessageQueue.add(this.name, toName, data);
        }


        /**
         * 广播给父、兄弟和孩子（第一级）节点
         */
        broadcast(data:any) {
            //兄弟节点
            if (this.parentName) {
                let pmod = ModuleFactory.get(this.parentName);
                if (pmod && pmod.children) {
                    this.send(pmod.name, data);
                    pmod.children.forEach((m) => {
                        //自己不发
                        if (m === this) {
                            return;
                        }
                        this.send(m.name, data);
                    });
                }
            }

            if (this.children !== undefined) {
                this.children.forEach((m) => {
                    this.send(m.name, data);
                });
            }
        }

        /**
         * 接受消息
         * @param fromName 		来源模块名
         * @param data 			消息内容
         */
        receive(fromName, data) {
            this.doModuleEvent('onReceive', [fromName, data]);
        }
        
        /**
         * 激活模块(添加到渲染器)
         */
        async active() {
            //激活状态不用激活，创建状态不能激活
            if (this.state === 3) {
                return;
            }
            //未初始化，需要先初始化
            if (this.state === 0) {
                await this.init();
                this.state = 3;
            } else {
                this.state = 3;
            }
            
            Renderer.add(this);
            
            //子模块
            if (Util.isArray(this.children)) {
                this.children.forEach(async (m) => {
                    await m.active();
                });
            }
        }

        /**
         * 取消激活
         */
        unactive() {
            //主模块不允许取消
            if (this.main || this.state === 2) {
                return;
            }
            this.state = 2;
            //设置首次渲染标志
            this.firstRender = true;
            if (Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.unactive();
                });
            }
        }

        /**
         * 模块终结
         */
        
        destroy() {
            if (Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.destroy();
                });
            }
            //从工厂释放
            ModuleFactory.remove(this.name);
        }


        /*************事件**************/

        /**
         * 执行模块事件
         * @param eventName 	事件名
         * @param param 		参数，为数组
         */
        doModuleEvent(eventName:string, param?:Array<any>) {
            const foo:Function = this.methodFactory.get(eventName);
            if (!foo) {
                return;
            }
            if (!param) {
                param = [this.model];
            } else {
                param.unshift(this.model);
            }
            //调用方法
            Util.apply(foo, this, param);
        }

        /**
         * 添加首次渲染后执行操作
         * @param foo  	操作方法
         */
        addFirstRenderOperation(foo:Function) {
            if (!Util.isFunction(foo)) {
                return;
            }
            if (this.firstRenderOps.indexOf(foo) === -1) {
                this.firstRenderOps.push(foo);
            }
        }

        /**
         * 添加首次渲染前执行操作
         * @param foo  	操作方法
         */
        addBeforeFirstRenderOperation(foo) {
            let me = this;
            if (!Util.isFunction(foo)) {
                return;
            }
            if (this.beforeFirstRenderOps.indexOf(foo) === -1) {
                this.beforeFirstRenderOps.push(foo);
            }
        }
    }
}