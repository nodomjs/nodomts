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
         * @param config    模块配置
         */
        constructor(config) {
            /**
             * 是否是首次渲染
             */
            this.firstRender = true;
            /**
             * 子模块id数组
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
             * 每次渲染后执行操作数组
             */
            this.renderOps = [];
            /**
             * 每次渲染前执行操作数组
             */
            this.beforeRenderOps = [];
            /**
             * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)
             */
            this.state = 0;
            /**
             * 需要加载新数据
             */
            this.loadNewData = false;
            /**
             * 待渲染的虚拟dom数组
             */
            this.renderDoms = [];
            /**
             * 放置模块的容器
             */
            this.container = null;
            /**
             * 子模块名id映射，如 {modulea:1}
             */
            this.moduleMap = new Map();
            /**
             * 插件集合
             */
            this.plugins = new Map();
            this.id = nodom.Util.genId();
            // 模块名字
            if (config && config.name) {
                this.name = config.name;
            }
            else {
                this.name = 'Module' + this.id;
            }
            nodom.ModuleFactory.add(this);
            this.methodFactory = new nodom.MethodFactory(this);
            this.modelFactory = new nodom.ModelFactory(this);
            //无配置对象，不需要处理
            if (!config) {
                return;
            }
            //保存config，存在延迟初始化情况
            this.initConfig = config;
            //设置选择器
            this.selector = config.el;
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
        }
        /**
         * 初始化模块（加载和编译）
         */
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                let config = this.initConfig;
                let urlArr = []; //请求url数组
                let cssPath = nodom.Application.getPath('css');
                let templatePath = nodom.Application.getPath('template');
                let jsPath = nodom.Application.getPath('js');
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
                        //转换路径
                        let path = type === 'js' ? jsPath : cssPath;
                        urlArr.push({ url: nodom.Util.mergePath([path, url]), type: type });
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
                            url: nodom.Util.mergePath([templatePath, config.template]),
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
                delete this.initConfig;
                /**
                 * 修改状态
                 * @param mod 	模块
                 */
                function changeState(mod) {
                    if (mod.isMain) {
                        mod.state = 3;
                        //可能不能存在数据，需要手动添加到渲染器
                        nodom.Renderer.add(mod);
                    }
                    else if (mod.parentId) {
                        mod.state = nodom.ModuleFactory.get(mod.parentId).state;
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
            this.doRenderOp(this.beforeRenderOps);
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
                        this.loadNewData = false;
                    });
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
            this.doRenderOp(this.renderOps);
            return true;
        }
        /**
         * 执行首次渲染
         * @param root 	根虚拟dom
         */
        doFirstRender(root) {
            //执行首次渲染前事件
            this.doModuleEvent('onBeforeFirstRender');
            this.doRenderOp(this.beforeFirstRenderOps);
            //渲染树
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(this, null);
            this.doModuleEvent('onBeforeFirstRenderToHTML');
            //清空子元素
            nodom.Util.empty(this.container);
            //渲染到html
            if (root.tagName) {
                root.renderToHtml(this, { type: 'fresh' });
            }
            else {
                if (root.children) {
                    root.children.forEach((item) => {
                        item.renderToHtml(this, { type: 'fresh' });
                    });
                }
            }
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
        clone(moduleName) {
            let me = this;
            let m = {};
            let excludes = ['id', 'name', 'model', 'virtualDom', 'container', 'containerKey'];
            Object.getOwnPropertyNames(this).forEach((item) => {
                if (excludes.includes(item)) {
                    return;
                }
                m[item] = me[item];
            });
            //重置name和id，绑定原型
            m.id = nodom.Util.genId();
            m.name = moduleName || 'Module' + m.id;
            //绑定原型
            m.__proto__ = this.__proto__;
            //加入module factory
            nodom.ModuleFactory.add(m);
            //构建model
            if (this.model) {
                let d = this.model.getData();
                m.model = new nodom.Model(nodom.Util.clone(d), m);
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
            if (this.selector) {
                this.container = document.querySelector(this.selector);
            }
            else { //非根模块，根据容器key获得
                this.container = document.querySelector("[key='" + this.containerKey + "']");
            }
            return this.container !== null;
        }
        /**
         * 设置模块容器 key
         * @param key   模块容器key
         */
        setContainerKey(key) {
            this.containerKey = key;
        }
        /**
         * 获取模块容器 key
         * @param key   模块容器key
         */
        getContainerKey() {
            return (this.containerKey);
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
         * @param moduleId      模块id
         * @param className     类名
         */
        addChild(moduleId) {
            if (!this.children.includes(moduleId)) {
                this.children.push(moduleId);
                let m = nodom.ModuleFactory.get(moduleId);
                if (m) {
                    m.parentId = this.id;
                }
                //保存name和id映射
                this.moduleMap.set(m.name, moduleId);
            }
        }
        /**
         * 发送
         * @param toName 		接收模块名或模块id，如果为模块id，则直接发送，不需要转换
         * @param data 			消息内容
         */
        send(toName, data) {
            if (typeof toName === 'number') {
                nodom.MessageQueue.add(this.id, toName, data);
                return;
            }
            //目标模块id
            let toId;
            let m = this;
            //一共需要找3级(孩子、兄弟、父模块)
            for (let i = 0; i < 3 && m; i++) {
                toId = m.moduleMap.get(toName);
                if (!toId && m.parentId) {
                    m = nodom.ModuleFactory.get(m.parentId);
                }
                else {
                    break;
                }
            }
            if (toId) {
                nodom.MessageQueue.add(this.id, toId, data);
            }
        }
        /**
         * 广播给父、兄弟和孩子（第一级）节点
         */
        broadcast(data) {
            //兄弟节点
            if (this.parentId) {
                let pmod = nodom.ModuleFactory.get(this.parentId);
                if (pmod) {
                    //父模块
                    this.send(pmod.name, data);
                    if (pmod.children) {
                        pmod.children.forEach((item) => {
                            //自己不发
                            if (item === this.id) {
                                return;
                            }
                            let m = nodom.ModuleFactory.get(item);
                            //兄弟模块
                            this.send(m.name, data);
                        });
                    }
                }
            }
            if (this.children !== undefined) {
                this.children.forEach((item) => {
                    let m = nodom.ModuleFactory.get(item);
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
                }
                this.state = 3;
                //添加到渲染器
                nodom.Renderer.add(this);
            });
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
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((item) => {
                    let m = nodom.ModuleFactory.get(item);
                    if (m) {
                        m.unactive();
                    }
                });
            }
        }
        /**
         * 模块终结
         */
        destroy() {
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((item) => {
                    let m = nodom.ModuleFactory.get(item);
                    if (m) {
                        m.destroy();
                    }
                });
            }
            //从工厂释放
            nodom.ModuleFactory.remove(this.id);
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
            if (!nodom.Util.isFunction(foo)) {
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
        addRenderOperation(foo) {
            if (!nodom.Util.isFunction(foo)) {
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
        addBeforeRenderOperation(foo) {
            if (!nodom.Util.isFunction(foo)) {
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
        doRenderOp(renderOps) {
            for (; renderOps.length > 0;) {
                nodom.Util.apply(renderOps.shift(), this, []);
            }
        }
        /**
         * 添加插件
         * @param name  插件名
         * @param ele   插件
         */
        addPlugin(name, ele) {
            if (ele.name) {
                this.plugins.set(name, ele);
            }
        }
        /**
         * 获取插件
         * @param name  插件名
         */
        getPlugin(name) {
            return this.plugins.get(name);
        }
    }
    nodom.Module = Module;
})(nodom || (nodom = {}));
//# sourceMappingURL=module.js.map