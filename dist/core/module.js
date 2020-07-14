var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// / <reference path="nodom.ts" />
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
             * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)
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
                }
            }
        }
        /**
         * 初始化模块（加载和编译）
         */
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                let config = this.initConfig;
                let urlArr = []; //请求url数组
                //app根路径
                let appPath = nodom.Application.templatePath || '';
                //加载文件
                if (config && nodom.Util.isArray(config.requires) && config.requires.length > 0) {
                    config.requires.forEach((item) => {
                        let type;
                        let url = '';
                        if (nodom.Util.isObject(item)) { //为对象，可能是css或js
                            type = item['type'] || 'js';
                            url = item['url'];
                        }
                        else { //js文件
                            type = 'js';
                            url = item;
                        }
                        urlArr.push({ url: appPath + url, type: type });
                    });
                }
                //模版串
                let templateStr = this.template;
                //模版信息
                if (config.template) {
                    config.template = config.template.trim();
                    if (config.template.startsWith('<')) { //html模版串
                        templateStr = config.template;
                    }
                    else { //文件
                        urlArr.push({
                            url: appPath + config.template,
                            type: config.template.endsWith('.nd') ? 'nd' : 'template'
                        });
                    }
                }
                //如果已存在templateStr，则直接编译
                if (!nodom.Util.isEmpty(templateStr)) {
                    this.virtualDom = nodom.Compiler.compile(templateStr);
                }
                //数据
                if (config.data) { //数据
                    if (nodom.Util.isObject(config.data)) { //数据
                        this.model = new nodom.Model(config.data, this);
                    }
                    else { //数据url
                        urlArr.push({
                            url: config.data,
                            type: 'data'
                        });
                        this.dataUrl = config.data;
                    }
                }
                //批量请求文件
                if (urlArr.length > 0) {
                    let rets = yield nodom.ResourceManager.getResources(urlArr);
                    for (let r of rets) {
                        if (r.type === 'template' || r.type === 'nd') {
                            this.virtualDom = r.content;
                        }
                        else if (r.type === 'data') {
                            this.model = new nodom.Model(r.content, this);
                        }
                    }
                }
                changeState(this);
                if (nodom.Util.isArray(this.initConfig.modules)) {
                    this.initConfig.modules.forEach((item) => {
                        this.addChild(item);
                    });
                }
                delete this.initConfig;
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
            });
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
                    nodom.request({
                        url: this.dataUrl,
                        type: 'json'
                    }).then((r) => {
                        this.model = new nodom.Model(r, this);
                        this.doFirstRender(root);
                    }).catch((e) => {
                        console.log(e);
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
                    this.doModuleEvent('onBeforeRenderToHtml');
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
                this.doModuleEvent('onRender');
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
            //执行首次渲染前事件
            this.doModuleEvent('onBeforeFirstRender');
            this.beforeFirstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, this, []);
            });
            this.beforeFirstRenderOps = [];
            //渲染树
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(this, null);
            this.doModuleEvent('onBeforeFirstRenderToHTML');
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
                nodom.Util.apply(foo, this, []);
            });
            this.firstRenderOps = [];
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
        dataChange() {
            nodom.Renderer.add(this);
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
         * 激活模块(添加到渲染器)
         */
        active() {
            return __awaiter(this, void 0, void 0, function* () {
                //激活状态不用激活，创建状态不能激活
                if (this.state === 3) {
                    return;
                }
                //未初始化，需要先初始化
                if (this.state === 0) {
                    yield this.init();
                    this.state = 3;
                }
                else {
                    this.state = 3;
                }
                nodom.Renderer.add(this);
                //子模块
                if (nodom.Util.isArray(this.children)) {
                    this.children.forEach((m) => __awaiter(this, void 0, void 0, function* () {
                        yield m.active();
                    }));
                }
            });
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
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.unactive();
                });
            }
        }
        /**
         * 模块终结
         */
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
            const foo = this.methodFactory.get(eventName);
            if (!foo) {
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