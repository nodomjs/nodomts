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
    class Module {
        constructor(config, main) {
            this.firstRender = true;
            this.children = [];
            this.firstRenderOps = [];
            this.beforeFirstRenderOps = [];
            this.state = 0;
            this.loadNewData = false;
            this.renderDoms = [];
            if (config.name) {
                this.name = config.name;
            }
            else {
                this.name = 'Module' + nodom.Util.genId();
            }
            nodom.ModuleFactory.add(this.name, this);
            this.methodFactory = new nodom.MethodFactory(this);
            this.modelFactory = new nodom.ModelFactory(this);
            this.expressionFactory = new nodom.ExpressionFactory(this);
            this.directiveFactory = new nodom.DirectiveFactory(this);
            this.renderDoms = [];
            if (config) {
                this.initConfig = config;
                if (nodom.Util.isString(config.el)) {
                    this.containerParam = {
                        module: config.parentName,
                        selector: config.el
                    };
                }
                else if (nodom.Util.isEl(config.el)) {
                    this.container = config.el;
                }
                if (nodom.Util.isObject(config.methods)) {
                    nodom.Util.getOwnProps(config.methods).forEach((item) => {
                        this.methodFactory.add(item, config.methods[item]);
                    });
                }
                if (this.hasContainer()) {
                    this.template = this.container.innerHTML.trim();
                    this.container.innerHTML = '';
                }
                if (main) {
                    this.main = true;
                    nodom.ModuleFactory.setMain(this);
                    this.active();
                }
                if (!config.delayInit || this.main) {
                    this.init();
                }
            }
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.state !== 0 || this.initing) {
                    return this.initLinker;
                }
                this.initing = true;
                let config = this.initConfig;
                let typeArr = [];
                let urlArr = [];
                let appPath = nodom.Application.templatePath || '';
                if (nodom.Util.isArray(config.requires) && config.requires.length > 0) {
                    const head = document.head;
                    config.requires.forEach((item) => {
                        let type;
                        let url = '';
                        if (nodom.Util.isObject(item)) {
                            type = item['type'] || 'js';
                            url += item['url'];
                        }
                        else {
                            type = 'js';
                            url += item;
                        }
                        if (type === 'css') {
                            let css = nodom.Util.get("link[href='" + url + "']");
                            if (css !== null) {
                                return;
                            }
                            css = nodom.Util.newEl('link');
                            css.type = 'text/css';
                            css.rel = 'stylesheet';
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
                if (config.template) {
                    config.template = config.template.trim();
                    let ch = config.template.substr(0, 1);
                    if (ch === '<') {
                        templateStr = config.template;
                    }
                    else {
                        if (config.template.lastIndexOf('.nd') === config.template.length - 3) {
                            typeArr.push('compiled');
                        }
                        else {
                            typeArr.push('template');
                        }
                        urlArr.push(appPath + config.template);
                    }
                }
                if (!nodom.Util.isEmpty(templateStr)) {
                    this.virtualDom = nodom.Compiler.compile(this, templateStr);
                }
                if (config.data) {
                    if (nodom.Util.isObject(config.data)) {
                        this.model = new nodom.Model(config.data, this);
                    }
                    else {
                        typeArr.push('data');
                        urlArr.push(config.data);
                        this.dataUrl = config.data;
                    }
                }
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
                                case 'compiled':
                                    let arr = nodom.Serializer.deserialize(file, this);
                                    this.virtualDom = arr[0];
                                    this.expressionFactory = arr[1];
                                    break;
                                case 'data':
                                    this.model = new nodom.Model(JSON.parse(file), this);
                            }
                        });
                        changeState(this);
                        delete this.initing;
                    });
                }
                else {
                    this.initLinker = Promise.resolve();
                    changeState(this);
                    delete this.initing;
                }
                if (nodom.Util.isArray(this.initConfig.modules)) {
                    this.initConfig.modules.forEach((item) => {
                        this.addChild(item);
                    });
                }
                delete this.initConfig;
                return this.initLinker;
                function changeState(mod) {
                    if (mod.main) {
                        mod.state = 3;
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
        render() {
            if (this.state !== 3 || !this.virtualDom || !this.hasContainer()) {
                return false;
            }
            let root = this.virtualDom.clone();
            if (this.firstRender) {
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
            else {
                this.doModuleEvent('onBeforeRender');
                if (this.model) {
                    root.modelId = this.model.id;
                    let oldTree = this.renderTree;
                    this.renderTree = root;
                    root.render(this, null);
                    root.compare(oldTree, this.renderDoms);
                    for (let i = this.renderDoms.length - 1; i >= 0; i--) {
                        let item = this.renderDoms[i];
                        if (item.type === 'del') {
                            item.node.removeFromHtml(this);
                            this.renderDoms.splice(i, 1);
                        }
                    }
                    this.renderDoms.forEach((item) => {
                        item.node.renderToHtml(this, item);
                    });
                }
                this.doModuleEvent('onRender');
            }
            this.renderDoms = [];
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach(item => {
                    item.render();
                });
            }
            return true;
        }
        doFirstRender(root) {
            let me = this;
            this.doModuleEvent('onBeforeFirstRender');
            this.beforeFirstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, me, []);
            });
            this.beforeFirstRenderOps = [];
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(me, null);
            if (root.children) {
                root.children.forEach((item) => {
                    item.renderToHtml(me, { type: 'fresh' });
                });
            }
            delete this.firstRender;
            this.doModuleEvent('onFirstRender');
            this.firstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, me, []);
            });
            this.firstRenderOps = [];
        }
        hasContainer() {
            if (this.container) {
                return true;
            }
            else if (this.containerParam !== undefined) {
                let ct;
                if (this.containerParam['module'] === undefined) {
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
        dataChange() {
            nodom.Renderer.add(this);
        }
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
        send(toName, data) {
            nodom.MessageQueue.add(this.name, toName, data);
        }
        broadcast(data) {
            if (this.parentName) {
                let pmod = nodom.ModuleFactory.get(this.parentName);
                if (pmod && pmod.children) {
                    this.send(pmod.name, data);
                    pmod.children.forEach((m) => {
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
        receive(fromName, data) {
            this.doModuleEvent('onReceive', [fromName, data]);
        }
        active(callback) {
            if (this.state === 3) {
                return;
            }
            if (this.state === 0) {
                this.init().then(() => {
                    this.state = 3;
                    if (nodom.Util.isFunction(callback)) {
                        callback(this.model);
                    }
                    nodom.Renderer.add(this);
                });
            }
            else {
                this.state = 3;
                if (callback) {
                    callback(this.model);
                }
                nodom.Renderer.add(this);
            }
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.active(callback);
                });
            }
        }
        unactive() {
            if (this.main || this.state === 2) {
                return;
            }
            this.state = 2;
            this.firstRender = true;
            delete this.container;
            if (nodom.Util.isArray(this.children)) {
                this.children.forEach((m) => {
                    m.unactive();
                });
            }
        }
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
            nodom.ModuleFactory.remove(this.name);
        }
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
            nodom.Util.apply(foo, this, param);
        }
        addFirstRenderOperation(foo) {
            let me = this;
            if (!nodom.Util.isFunction(foo)) {
                return;
            }
            if (this.firstRenderOps.indexOf(foo) === -1) {
                this.firstRenderOps.push(foo);
            }
        }
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