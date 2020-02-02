/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 模块类
     */
    class Module {
        /**
         * 构造器
         * @param config
         */
        constructor(config, main) {
            /**
             * 是否是首次渲染
             */
            this.firstRender = true;
            /**
             * 子模块数组
             */
            this.children = [];
            /**
             * 首次渲染后执行操作数组
             */
            this.firstRenderOps = [];
            /**
             * 首次渲染前执行操作数组
             */
            this.beforeFirstRenderOps = [];
            /**
             * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)、4 dead(死亡)
             */
            this.state = 0;
            /**
             * 需要加载新数据
             */
            this.loadNewData = false;
            /**
             * 修改渲染的虚拟dom数组
             */
            this.renderDoms = [];
            // 模块名字
            if (config.name) {
                this.name = config.name;
            }
            else {
                this.name = 'Module' + nodom.Util.genId();
            }
            // 把模块添加到工厂
            nodom.ModuleFactory.add(this.name, this);
            this.methodFactory = new nodom.MethodFactory(this);
            this.modelFactory = new nodom.ModelFactory(this);
            this.expressionFactory = new nodom.ExpressionFactory(this);
            this.directiveFactory = new nodom.DirectiveFactory(this);
            this.renderDoms = []; //修改渲染的el数组
            if (config) {
                //保存config，存在延迟初始化情况
                this.initConfig = config;
                //保存container参数
                if (nodom.Util.isString(config.el)) {
                    this.containerParam = {
                        module: config.parentName,
                        selector: config.el
                    };
                }
                else if (nodom.Util.isEl(config.el)) { //element
                    this.container = config.el;
                }
                //方法加入工厂
                if (nodom.Util.isObject(config.methods)) {
                    nodom.Util.getOwnProps(config.methods).forEach((item) => {
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
                    nodom.ModuleFactory.setMain(this);
                    this.active();
                }
                //不延迟初始化或为主模块，需要立即初始化
                if (!config.delayInit || this.main) {
                    this.init();
                }
            }
        }
        /**
         * 加载模块
         * @param callback  加载后的回调函数
         */
        init() {
            //已初始化，不用再初始化
            if (this.state !== 0 || this.initing) {
                return this.initLinker;
            }
            this.initing = true;
            let config = this.initConfig;
            let typeArr = []; //请求类型数组
            let urlArr = []; //请求url数组
            //app页面根路径
            let appPath = nodom.Application.templatePath || '';
            if (nodom.Util.isArray(config.requires) && config.requires.length > 0) {
                const head = document.head;
                config.requires.forEach((item) => {
                    let type;
                    let url = '';
                    if (nodom.Util.isObject(item)) { //为对象，可能是css或js
                        type = item['type'] || 'js';
                        url += item['url'];
                    }
                    else { //js文件
                        type = 'js';
                        url += item;
                    }
                    //如果已经加载，则不再加载
                    if (type === 'css') {
                        let css = nodom.Util.get("link[href='" + url + "']");
                        if (css !== null) {
                            return;
                        }
                        css = nodom.Util.newEl('link');
                        css.type = 'text/css';
                        css.rel = 'stylesheet'; // 保留script标签的path属性
                        css.href = url;
                        head.appendChild(css);
                        return;
                    }
                    else if (type === 'js') {
                        let cs = nodom.Util.get("script[dsrc='" + url + "']");
                        if (cs !== null) {
                            return;
                        }
                    }
                    typeArr.push(type);
                    urlArr.push(url);
                });
            }
            let templateStr = this.template;
            //模版信息
            if (config.template) {
                config.template = config.template.trim();
                let ch = config.template.substr(0, 1);
                if (ch === '<') { //html模版串
                    templateStr = config.template;
                }
                else { //文件
                    if (config.template.lastIndexOf('.nd') !== config.template.length - 3) { //nodom编译文件
                        typeArr.push('compiled');
                    }
                    else { //普通html文件
                        typeArr.push('template');
                    }
                    urlArr.push(appPath + config.template);
                }
            }
            //如果已存在templateStr，则直接编译
            if (!nodom.Util.isEmpty(templateStr)) {
                this.virtualDom = nodom.Compiler.compile(this, templateStr);
            }
            //数据信息
            if (config.data) { //数据
                if (nodom.Util.isObject(config.data)) { //数据
                    this.model = new nodom.Model(config.data, this);
                }
                else { //数据文件
                    typeArr.push('data');
                    urlArr.push(config.data);
                    this.dataUrl = config.data;
                }
            }
            //批量请求文件
            if (typeArr.length > 0) {
                this.initLinker = nodom.Linker.gen('getfiles', urlArr).then((files) => {
                    let head = document.querySelector('head');
                    files.forEach((file, ind) => {
                        switch (typeArr[ind]) {
                            case 'js':
                                let script = nodom.Util.newEl('script');
                                script.innerHTML = file;
                                head.appendChild(script);
                                script.setAttribute('dsrc', urlArr[ind]);
                                script.innerHTML = '';
                                head.removeChild(script);
                                break;
                            case 'template':
                                this.virtualDom = nodom.Compiler.compile(this, file.trim());
                                break;
                            case 'compiled': //预编译后的js文件
                                let arr = nodom.Serializer.deserialize(file, this);
                                this.virtualDom = arr[0];
                                this.expressionFactory = arr[1];
                                break;
                            case 'data': //数据
                                this.model = new nodom.Model(JSON.parse(file), this);
                        }
                    });
                    //主模块状态变为3
                    changeState(this);
                    delete this.initing;
                });
            }
            else {
                this.initLinker = Promise.resolve();
                //修改状态
                changeState(this);
                delete this.initing;
            }
            if (nodom.Util.isArray(this.initConfig.modules)) {
                this.initConfig.modules.forEach((item) => {
                    this.addChild(item);
                });
            }
            //初始化后，不再需要initConfig
            delete this.initConfig;
            return this.initLinker;
            /**
             * 修改状态
             * @param mod 	模块
             */
            function changeState(mod) {
                if (mod.main) {
                    mod.state = 3;
                    //可能不能存在数据，需要手动添加到渲染器
                    nodom.Renderer.add(mod);
                }
                else if (mod.parentName) {
                    mod.state = nodom.ModuleFactory.get(mod.parentName).state;
                }
                else {
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
                    nodom.Linker.gen('ajax', {
                        url: this.dataUrl,
                        type: 'json'
                    }).then((r) => {
                        this.model = new nodom.Model(r, this);
                        this.doFirstRender(root);
                    });
                    this.loadNewData = false;
                }
                else {
                    this.doFirstRender(root);
                }
            }
            else { //增量渲染
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
                        let item = this.renderDoms[i];
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
                setTimeout(() => {
                    this.doModuleEvent('onRender');
                }, 0);
            }
            //数组还原
            this.renderDoms = [];
            //子模块渲染
            if (nodom.Util.isArray(this.children)) {
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
        doFirstRender(root) {
            let me = this;
            //执行首次渲染前事件
            this.doModuleEvent('onBeforeFirstRender');
            this.beforeFirstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, me, []);
            });
            this.beforeFirstRenderOps = [];
            //渲染树
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(me, null);
            //渲染到html
            if (root.children) {
                root.children.forEach((item) => {
                    item.renderToHtml(me, { type: 'fresh' });
                });
            }
            //删除首次渲染标志
            delete this.firstRender;
            //延迟执行
            setTimeout(() => {
                //执行首次渲染后事件
                this.doModuleEvent('onFirstRender');
                //执行首次渲染后操作队列
                this.firstRenderOps.forEach((foo) => {
                    nodom.Util.apply(foo, me, []);
                });
                this.firstRenderOps = [];
            }, 0);
        }
        // 检查容器是否存在，如果不存在，则尝试找到
        hasContainer() {
            if (this.container) {
                return true;
            }
            else if (this.containerParam !== undefined) {
                let ct;
                if (this.containerParam['module'] === undefined) { //没有父节点
                    ct = document;
                }
                else {
                    let module = nodom.ModuleFactory.get(this.containerParam['module']);
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
        dataChange(model) {
            nodom.Renderer.add(this);
        }
        /**
         * 添加子模块
         * @param config 	模块配置
         */
        addChild(config) {
            const me = this;
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
        send(toName, data) {
            nodom.MessageQueue.add(this.name, toName, data);
        }
        /**
         * 广播给父、兄弟和孩子（第一级）节点
         */
        broadcast(data) {
            //兄弟节点
            if (this.parentName) {
                let pmod = nodom.ModuleFactory.get(this.parentName);
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
         * 激活
         * @param callback 	激活后的回调函数
         */
        active(callback) {
            const me = this;
            //激活状态不用激活，创建状态不能激活
            if (this.state === 3) {
                return;
            }
            let linker;
            //未初始化，需要先初始化
            if (this.state === 0) {
                this.init().then(() => {
                    this.state = 3;
                    if (nodom.Util.isFunction(callback)) {
                        callback(this.model);
                    }
                    nodom.Renderer.add(me);
                });
            }
            else {
                this.state = 3;
                if (callback) {
                    callback(this.model);
                }
                nodom.Renderer.add(me);
            }
            //子节点
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.active(callback);
                });
            }
            if (!linker) {
                return Promise.resolve();
            }
            return linker;
        }
        /**
         * 取消激活
         */
        unactive() {
            const me = this;
            //主模块不允许取消
            if (this.main || this.state === 2) {
                return;
            }
            this.state = 2;
            //设置首次渲染标志
            this.firstRender = true;
            delete this.container;
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.unactive();
                });
            }
        }
        /**
         * 模块终结
         */
        dead() {
            if (this.state === 4) {
                return;
            }
            this.state = 4;
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.unactive();
                });
            }
        }
        destroy() {
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.destroy();
                });
            }
            //从工厂释放
            nodom.ModuleFactory.remove(this.name);
        }
        /*************事件**************/
        /**
         * 执行模块事件
         * @param eventName 	事件名
         * @param param 		参数，为数组
         */
        doModuleEvent(eventName, param) {
            let foo = this.methodFactory.get(eventName);
            if (!nodom.Util.isFunction(foo)) {
                return;
            }
            if (!param) {
                param = [this.model];
            }
            else {
                param.unshift(this.model);
            }
            //调用方法
            nodom.Util.apply(foo, this, param);
        }
        /**
         * 添加首次渲染后执行操作
         * @param foo  	操作方法
         */
        addFirstRenderOperation(foo) {
            let me = this;
            if (!nodom.Util.isFunction(foo)) {
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
            if (!nodom.Util.isFunction(foo)) {
                return;
            }
            if (this.beforeFirstRenderOps.indexOf(foo) === -1) {
                this.beforeFirstRenderOps.push(foo);
            }
        }
    }
    nodom.Module = Module;
})(nodom || (nodom = {}));
//# sourceMappingURL=module.js.map