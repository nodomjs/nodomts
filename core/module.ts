// / <reference path="nodom.ts" />
namespace nodom {

    /**
     * 模块配置对象
     */
    export interface IModuleCfg {
        /**
         * 模块名(模块内(父模块的子模块之间)唯一)，如果不设置，则系统会自动生成Module+id
         */
        name?: string;
        
        /**
         * 容器选择器
         */
        el?:string;
        /**
         * 是否单例，如果为true，则整个应用中共享一个模块实例，默认false
         */
        singleton?:boolean;

        /**
         * 模块类名
         */
        class?:string;

        /**
         * 模块路径(相对于app module路径)
         */
        path:string;

        /**
         * 模版字符串，如果以“<”开头，则表示模版字符串，否则表示模版url
         */
        template?: string;
        /**
         * 数据，如果为json object，直接作为模型数据，如果为字符串，则表示数据url，需要请求得到数据
         */
        data?: object | string;
        /**
         * 模块方法集合
         * 不要用箭头"=>" 操作符定义
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
         * 先于模块初始化加载的文件集合
         * 如果为string，则表示资源路径，type为js
         * 如果为object，则格式为{type:'js'/'css',url:路径}
         */
        requires?:Array<string|object>;
    }
    /**
     * 模块类
     */
    export class Module {
        /**
         * 模块id(全局唯一)
         */
        id:number;
        /**
         * 模块名(模块内(父模块的子模块之间)唯一)，如果不设置，则系统会自动生成Module+id
         */
        name: string;
        
        /**
         * 模型
         */
        model: Model;

        /**
         * 是否主模块，一个app只有一个根模块
         */
        isMain: boolean;

        /**
         * 是否是首次渲染
         */
        firstRender: boolean=true;
        
        /**
         * 根虚拟dom
         */
        virtualDom: Element;
        
        /**
         * 渲染树
         */
        renderTree: Element;
        
        /**
         * 父模块名
         */
        parentId: number;
        
        /**
         * 子模块id数组
         */
        children: Array < number > = [];
        
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
         * 每次渲染后执行操作数组
         */
        renderOps:Array<Function> = [];

        /**
         * 每次渲染前执行操作数组
         */
        beforeRenderOps:Array<Function> = [];

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
         * 待渲染的虚拟dom数组
         */
        renderDoms: Array < ChangedDom >= [];
        
        /**
         * 初始配置
         */
        initConfig: IModuleCfg;
        
        /**
         * 放置模块的容器
         */
        container: HTMLElement = null;

        /**
         * 模版串
         */
        template:string;

        /**
         * 容器key
         */
        containerKey:string;
        
        /**
         * 子模块名id映射，如 {modulea:1}
         */
        moduleMap:Map<string,number> = new Map();

        /**
         * 插件集合
         */
        plugins:Map<string,Plugin> = new Map();

        /**
         * 构造器
         * @param config    模块配置
         */
        constructor(config?:IModuleCfg) {
            this.id = Util.genId();
            // 模块名字
            if (config && config.name) {
                this.name = config.name;
            } else {
                this.name = 'Module' + this.id;
            }
            ModuleFactory.add(this);
            this.methodFactory = new MethodFactory(this);
            this.modelFactory = new ModelFactory(this);

            //无配置对象，不需要处理
            if(!config){
                return;
            }
            
            //保存config，存在延迟初始化情况
            this.initConfig = config;
            //设置选择器
            this.selector = config.el;
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
        }

        /**
         * 初始化模块（加载和编译）
         */
        async init():Promise<any> {
            let config = this.initConfig;
            let urlArr:Array<object> = []; //请求url数组
            let cssPath:string = Application.getPath('css');
            let templatePath:string = Application.getPath('template');
            let jsPath:string = Application.getPath('js');
            //加载文件
            if (config && Util.isArray(config.requires) && config.requires.length > 0) {
                config.requires.forEach((item) => {
                    let type:string;
                    let url:string = '';
                    if (Util.isObject(item)) { //为对象，可能是css或js
                        type = item['type'] || 'js';
                        url = item['url'];
                    } else { //js文件
                        type = 'js';
                        url = <string>item;
                    }
                    //转换路径
                    let path:string = type === 'js'?jsPath:cssPath;
                    urlArr.push({url:Util.mergePath([path,url]),type:type});
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
                    urlArr.push({
                        url:Util.mergePath([templatePath,config.template]),
                        type:config.template.endsWith('.nd')?'nd':'template'
                    });
                }
            }
            //删除template
            delete this.template;
            //如果已存在templateStr，则直接编译
            if (!Util.isEmpty(templateStr)) {
                this.virtualDom = Compiler.compile(templateStr);
            }

            //数据
            if (config.data) { //数据
                if(Util.isObject(config.data)){ //数据
                    this.model = new Model(config.data, this);
                }else{ //数据url
                    urlArr.push({
                        url:config.data,
                        type:'data'
                    });
                    this.dataUrl = <string>config.data;
                }
            }else{ //空数据
                this.model = new Model({},this);
            }
            console.log(config);
            //批量请求文件
            if (urlArr.length > 0) {
                let rets:IResourceObj[] = await ResourceManager.getResources(urlArr);
                for(let r of rets){
                    
                    if(r.type === 'template' || r.type === 'nd'){
                        this.virtualDom = <Element>r.content;
                    }else if(r.type === 'data'){
                    
                        this.model = new Model(r.content,this);
                    }
                }
            }

            changeState(this);
            
            delete this.initConfig;
            /**
             * 修改状态
             * @param mod 	模块
             */
            function changeState(mod:Module) {
                if (mod.isMain) {
                    mod.state = 3;
                    //可能不能存在数据，需要手动添加到渲染器
                    Renderer.add(mod);
                } else if (mod.parentId) {
                    mod.state = ModuleFactory.get(mod.parentId).state;
                } else {
                    mod.state = 1;
                }
            }
        }

        /**
         * 模型渲染
         * @return false 渲染失败 true 渲染成功
         */
        render():boolean{
            //容器没就位或state不为active则不渲染，返回渲染失败
            if (this.state !== 3 || !this.virtualDom || !this.hasContainer()) {
                return false;
            }
            
            //克隆新的树
            let root:Element = this.virtualDom.clone();
            
            if (this.firstRender) {
                //model无数据，如果存在dataUrl，则需要加载数据
                if (this.loadNewData && this.dataUrl) {
                    request({
                        url: this.dataUrl,
                        type: 'json'
                    }).then(
                        (r)=>{
                            this.model = new Model(r, this);
                            this.doFirstRender(root);
                            this.loadNewData = false;
                        }
                    );
                } else {
                    this.doFirstRender(root);
                }
            } else { //增量渲染
                this.doRenderOp(this.beforeRenderOps);
                //执行每次渲染前事件
                this.doModuleEvent('onBeforeRender');
                if (this.model) {
                    root.modelId = this.model.id;
                    let oldTree = this.renderTree;
                    this.renderTree = root;
                    //渲染
                    root.render(this, null);
                    this.doModuleEvent('onBeforeRenderToHtml');
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
                //执行每次渲染后事件
                this.doModuleEvent('onRender');
                //执行渲染后操作
                this.doRenderOp(this.renderOps);
            }

            //数组还原
            this.renderDoms = [];
            return true;
        }

        /**
         * 执行首次渲染
         * @param root 	根虚拟dom
         */
        private doFirstRender(root:Element) {
            //执行首次渲染前事件
            this.doRenderOp(this.beforeFirstRenderOps);
            this.doModuleEvent('onBeforeFirstRender');
            
            //渲染树
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(this, null);
            this.doModuleEvent('onBeforeFirstRenderToHTML');
            //清空子元素
            Util.empty(this.container);
            //渲染到html
            root.renderToHtml(this, <ChangedDom>{type: 'fresh'});
            //删除首次渲染标志
            delete this.firstRender;
            //执行首次渲染后事件
            this.doModuleEvent('onFirstRender');
            //执行首次渲染后操作队列
            this.doRenderOp(this.firstRenderOps);
        }

        /**
         * 克隆模块
         * 共享virtual Dom，但是名字为新名字
         * @param moduleName    新模块名
         */
        clone(moduleName:string):any{
            let me = this;
            let m:any = {};
            let excludes = ['id','name','model','virtualDom','container','containerKey'];
            Object.getOwnPropertyNames(this).forEach((item)=>{
                if(excludes.includes(item)){
                    return;
                }
                m[item] = me[item];
            });
            //重置name和id，绑定原型
            m.id = Util.genId();
            m.name = moduleName || 'Module' + m.id;
            //绑定原型
            m.__proto__ = (<any>this).__proto__;
            //加入module factory
            ModuleFactory.add(m);
            //构建model
            if(this.model){
                let d = this.model.getData();
                m.model = new Model(Util.clone(d),m);
            }
            //克隆虚拟dom树
            m.virtualDom = this.virtualDom.clone(true);
            //插件清空
            m.plugins.clear();
            return m;
        }
        
        /**
         * 检查容器是否存在，如果不存在，则尝试找到
         */ 
        hasContainer() {
            //根模块，直接使用el
            if(this.selector){
                this.container = document.querySelector(this.selector);
            }else{  //非根模块，根据容器key获得
                this.container = document.querySelector("[key='"+ this.containerKey +"']");
            }
            return this.container !== null;
        }

        /**
         * 设置模块容器 key
         * @param key   模块容器key
         */
        setContainerKey(key:string){
            this.containerKey = key;
        }

        /**
         * 获取模块容器 key
         * @param key   模块容器key
         */
        getContainerKey(){
            return(this.containerKey);
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
         * @param moduleId      模块id 
         * @param className     类名     
         */
        addChild(moduleId:number){
            if(!this.children.includes(moduleId)){
                this.children.push(moduleId);
                let m:nodom.Module = ModuleFactory.get(moduleId);
                if(m){
                    m.parentId = this.id;
                }
                //保存name和id映射
                this.moduleMap.set(m.name,moduleId);
            }
        }

        /**
         * 发送
         * @param toName 		接收模块名或模块id，如果为模块id，则直接发送，不需要转换
         * @param data 			消息内容
         */
        send(toName:string|number, data:any) {
            if(typeof toName === 'number'){
                MessageQueue.add(this.id, toName, data);
                return;
            }

            //目标模块id
            let toId:number;
            let m:Module = this;
            
            //一共需要找3级(孩子、兄弟、父模块)
            for(let i=0;i<3 && m;i++){
                toId = m.moduleMap.get(toName);
                if(!toId && m.parentId){
                    m = ModuleFactory.get(m.parentId);
                }else{
                    break;
                }
            }
            
            if(toId){
                MessageQueue.add(this.id, toId, data);
            }
        }


        /**
         * 广播给父、兄弟和孩子（第一级）节点
         */
        broadcast(data:any) {
            //兄弟节点
            if (this.parentId) {
                let pmod:Module = ModuleFactory.get(this.parentId);
                if (pmod) {
                    //父模块
                    this.send(pmod.name, data);
                    if(pmod.children){
                        pmod.children.forEach((item) => {
                            //自己不发
                            if (item === this.id) {
                                return;
                            }
                            let m:nodom.Module = ModuleFactory.get(item);
                            //兄弟模块
                            this.send(m.name, data);
                        });
                    }
                }
            }

            if (this.children !== undefined) {
                this.children.forEach((item) => {
                    let m:nodom.Module = ModuleFactory.get(item);
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
            } 
            this.state = 3;
            //添加到渲染器
            Renderer.add(this);
            //孩子节点激活
            if (Util.isArray(this.children)) {
                this.children.forEach((item) => {
                    let m:Module = ModuleFactory.get(item);
                    if(m){
                        m.unactive();
                    }
                });
            }
        }

        /**
         * 取消激活
         */
        unactive() {
            //主模块不允许取消
            if (this.isMain || this.state === 2) {
                return;
            }
            this.state = 2;
            //设置首次渲染标志
            this.firstRender = true;
            if (Util.isArray(this.children)) {
                this.children.forEach((item) => {
                    let m:Module = ModuleFactory.get(item);
                    if(m){
                        m.unactive();
                    }
                });
            }
        }

        /**
         * 模块终结
         */
        destroy() {
            if (Util.isArray(this.children)) {
                this.children.forEach((item) => {
                    let m:Module = ModuleFactory.get(item);
                    if(m){
                        m.destroy();
                    }
                });
            }
            //从工厂释放
            ModuleFactory.remove(this.id);
        }

        /*************事件**************/

        /**
         * 执行模块事件
         * @param eventName 	事件名
         * @param param 		参数，为数组
         */
        private doModuleEvent(eventName:string, param?:Array<any>) {
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
        addBeforeFirstRenderOperation(foo:Function) {
            if (!Util.isFunction(foo)) {
                return;
            }
            if (!this.beforeFirstRenderOps.includes(foo)) {
                this.beforeFirstRenderOps.push(foo);
            }
        }

        /**
         * 添加渲染后执行操作
         * @param foo  	操作方法
         */
        addRenderOperation(foo:Function) {
            if (!Util.isFunction(foo)) {
                return;
            }
            if (!this.renderOps.includes(foo)) {
                this.renderOps.push(foo);
            }
        }

        /**
         * 添加渲染前执行操作
         * @param foo  	操作方法
         */
        addBeforeRenderOperation(foo:Function) {
            if (!Util.isFunction(foo)) {
                return;
            }
            if (!this.beforeRenderOps.includes(foo)) {
                this.beforeRenderOps.push(foo);
            }
        }

        /**
         * 执行渲染相关附加操作
         * @param renderOps 
         */
        private doRenderOp(renderOps:Function[]){
            for(;renderOps.length>0;){
                Util.apply(renderOps.shift(), this, []);
            }
        }

        /**
         * 添加插件
         * @param name      插件名
         * @param plugin    插件
         */
        addPlugin(name:string,plugin:Plugin){
            if(name){
                this.plugins.set(name,plugin);
            }
        }

        /**
         * 获取插件
         * @param name  插件名 
         * @returns     插件实例
         */
        getPlugin(name:string):Plugin{
            return this.plugins.get(name);
        }
    }
}