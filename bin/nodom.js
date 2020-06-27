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
    function newApp(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!config.module) {
                throw new nodom.NodomError('config', nodom.TipWords.application);
            }
            if (config.options) {
                nodom.Application.routerPrePath = config.options['routerPrePath'] || '';
                nodom.Application.templatePath = config.options['templatePath'] || '';
                nodom.Application.renderTick = config.options['renderTick'] || 100;
            }
            nodom.Scheduler.addTask(nodom.MessageQueue.handleQueue, nodom.MessageQueue);
            nodom.Scheduler.addTask(nodom.Renderer.render, nodom.Renderer);
            nodom.Scheduler.start();
            let module = this.createModule(config.module, true);
            yield module.active();
            return module;
        });
    }
    nodom.newApp = newApp;
    function createModule(config, main) {
        if (nodom.Util.isArray(config)) {
            for (let item of config) {
                new nodom.Module(item);
            }
        }
        else {
            return new nodom.Module(config, main);
        }
    }
    nodom.createModule = createModule;
    function createRoute(config) {
        if (nodom.Util.isArray(config)) {
            for (let item of config) {
                new nodom.Route(item);
            }
        }
        else {
            return new nodom.Route(config);
        }
    }
    nodom.createRoute = createRoute;
    function createDirective(name, priority, init, handler) {
        return nodom.DirectiveManager.addType(name, {
            prio: priority,
            init: init,
            handler: handler
        });
    }
    nodom.createDirective = createDirective;
    function createPlugin(name, init, handler) {
    }
    nodom.createPlugin = createPlugin;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let Util = (() => {
        class Util {
            static genId() {
                return this.generatedId++;
            }
            clone(srcObj, expKey) {
                let map = new WeakMap();
                let retObj = clone(srcObj);
                map = null;
                return retObj;
                function clone(src) {
                    let dst;
                    if (this.isObject(src)) {
                        dst = new Object();
                        map.set(src, dst);
                        Object.getOwnPropertyNames(src).forEach((prop) => {
                            if (expKey) {
                                if (expKey.constructor === RegExp && expKey.test(prop)
                                    || expKey.constructor === String && expKey === prop) {
                                    return;
                                }
                            }
                            if (this.isObject(src[prop]) || this.isArray(src[prop])) {
                                let co = null;
                                if (!map.has(src[prop])) {
                                    co = clone(src[prop]);
                                    map.set(src[prop], co);
                                }
                                else {
                                    co = map.get(src[prop]);
                                }
                                dst[prop] = co;
                            }
                            else {
                                dst[prop] = src[prop];
                            }
                        });
                    }
                    else if (this.isArray(src)) {
                        dst = new Array();
                        map.set(src, dst);
                        src.forEach(function (item, i) {
                            if (this.isObject(item) || this.isArray(item)) {
                                dst[i] = clone(item);
                            }
                            else {
                                dst[i] = item;
                            }
                        });
                    }
                    return dst;
                }
            }
            static merge(o1, o2, o3, o4, o5, o6) {
                for (let i = 0; i < arguments.length; i++) {
                    if (!this.isObject(arguments[i])) {
                        throw new nodom.NodomError('invoke', 'this.merge', i + '', 'object');
                    }
                }
                let retObj = Object.assign.apply(null, arguments);
                subObj(retObj);
                return retObj;
                function subObj(retObj) {
                    for (let o in retObj) {
                        if (this.isObject(retObj[o]) || this.isArray(retObj[o])) {
                            retObj[o] = retObj[o].clone();
                        }
                    }
                }
            }
            static assign(obj1, obj2) {
                if (Object.assign) {
                    Object.assign(obj1, obj2);
                }
                else {
                    this.getOwnProps(obj2).forEach(function (p) {
                        obj1[p] = obj2[p];
                    });
                }
                return obj1;
            }
            static getOwnProps(obj) {
                if (!obj) {
                    return [];
                }
                return Object.getOwnPropertyNames(obj);
            }
            static isFunction(foo) {
                return foo !== undefined && foo !== null && foo.constructor === Function;
            }
            static isArray(obj) {
                return Array.isArray(obj);
            }
            static isObject(obj) {
                return obj !== null && obj !== undefined && obj.constructor === Object;
            }
            static isInt(v) {
                return Number.isInteger(v);
            }
            static isNumber(v) {
                return typeof v === 'number';
            }
            static isBoolean(v) {
                return typeof v === 'boolean';
            }
            static isString(v) {
                return typeof v === 'string';
            }
            static isNumberString(v) {
                return /^\d+\.?\d*$/.test(v);
            }
            static isEmpty(obj) {
                if (obj === null || obj === undefined)
                    return true;
                let tp = typeof obj;
                if (this.isObject(obj)) {
                    let keys = Object.keys(obj);
                    if (keys !== undefined) {
                        return keys.length === 0;
                    }
                }
                else if (tp === 'string') {
                    return obj === '';
                }
                return false;
            }
            static findObjByProps(obj, props, one) {
                if (!this.isObject(obj)) {
                    throw new nodom.NodomError('invoke', 'this.findObjByProps', '0', 'Object');
                }
                one = one || false;
                let ps = this.getOwnProps(props);
                let find = false;
                if (one === false) {
                    find = true;
                    for (let i = 0; i < ps.length; i++) {
                        let p = ps[i];
                        if (obj[p] !== props[p]) {
                            find = false;
                            break;
                        }
                    }
                }
                else {
                    for (let i = 0; i < ps.length; i++) {
                        let p = ps[i];
                        if (obj[p] === props[p]) {
                            find = true;
                            break;
                        }
                    }
                }
                if (find) {
                    return obj;
                }
                for (let p in obj) {
                    let o = obj[p];
                    if (o !== null) {
                        if (this.isObject(o)) {
                            let oprops = this.getOwnProps(o);
                            for (let i = 0; i < oprops.length; i++) {
                                let item = o[oprops[i]];
                                if (item !== null && this.isObject(item)) {
                                    let r = this.findObjByProps(item, props, one);
                                    if (r !== null) {
                                        return r;
                                    }
                                }
                            }
                        }
                        else if (this.isArray(o)) {
                            for (let i = 0; i < o.length; i++) {
                                let item = o[i];
                                if (item !== null && this.isObject(item)) {
                                    let r = this.findObjByProps(item, props, one);
                                    if (r !== null) {
                                        return r;
                                    }
                                }
                            }
                        }
                    }
                }
                return null;
            }
            static get(selector, findAll, pview) {
                pview = pview || document;
                if (findAll === true) {
                    return pview.querySelectorAll(selector);
                }
                return pview.querySelector(selector);
            }
            static append(el, dom) {
                if (this.isNode(dom)) {
                    el.appendChild(dom);
                }
                else if (this.isString(dom)) {
                    let div = this.newEl('div');
                    div.innerHTML = dom;
                }
            }
            static isEl(el) {
                return el instanceof HTMLElement;
            }
            static isNode(node) {
                return node !== undefined && node !== null && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
            }
            static newEl(tagName, config, text) {
                if (!this.isString(tagName) || this.isEmpty(tagName)) {
                    throw new nodom.NodomError('invoke', 'this.newEl', '0', 'string');
                }
                let el = document.createElement(tagName);
                if (this.isObject(config)) {
                    this.attr(el, config);
                }
                else if (this.isString(text)) {
                    el.innerHTML = text;
                }
                return el;
            }
            static newSvgEl(tagName) {
                return document.createElementNS("http://www.w3.org/2000/svg", tagName);
            }
            static replaceNode(srcNode, nodes) {
                if (!this.isNode(srcNode)) {
                    throw new nodom.NodomError('invoke', 'this.replaceNode', '0', 'Node');
                }
                if (!this.isNode(nodes) && !this.isArray(nodes)) {
                    throw new nodom.NodomError('invoke1', 'this.replaceNode', '1', 'Node', 'Node Array');
                }
                let pnode = srcNode.parentNode;
                let bnode = srcNode.nextSibling;
                if (pnode === null) {
                    return;
                }
                pnode.removeChild(srcNode);
                const nodeArr = this.isArray(nodes) ? nodes : [nodes];
                nodeArr.forEach(function (node) {
                    if (bnode === undefined || bnode === null) {
                        pnode.appendChild(node);
                    }
                    else {
                        pnode.insertBefore(node, bnode);
                    }
                });
            }
            static insertAfter(newNode, srcNode, pNode) {
                if (!this.isNode(newNode)) {
                    throw new nodom.NodomError('invoke', 'this.insertAfter', '0', 'Node');
                }
                if (!this.isNode(srcNode) && !this.isNode(pNode)) {
                    throw new nodom.NodomError('invoke2', 'this.insertAfter', '1', '2', 'Node');
                }
                let bNode = null;
                if (srcNode === undefined || srcNode === null) {
                    bNode = pNode.firstChild;
                }
                else {
                    pNode = srcNode.parentNode;
                    bNode = srcNode.nextSibling;
                }
                if (!this.isNode(pNode)) {
                    return;
                }
                if (bNode === null) {
                    if (this.isArray(newNode)) {
                        for (let n of newNode) {
                            if (this.isEl(n)) {
                                pNode.appendChild(n);
                            }
                        }
                    }
                    else {
                        pNode.appendChild(newNode);
                    }
                }
                else {
                    if (this.isArray(newNode)) {
                        for (let n of newNode) {
                            if (this.isEl(n)) {
                                pNode.insertBefore(n, bNode);
                            }
                        }
                    }
                    else {
                        pNode.insertBefore(newNode, bNode);
                    }
                }
            }
            static empty(el) {
                const me = this;
                if (!me.isEl(el)) {
                    throw new nodom.NodomError('invoke', 'this.empty', '0', 'Element');
                }
                let nodes = el.childNodes;
                for (let i = nodes.length - 1; i >= 0; i--) {
                    el.removeChild(nodes[i]);
                }
            }
            static remove(node) {
                const me = this;
                if (!me.isNode(node)) {
                    throw new nodom.NodomError('invoke', 'this.remove', '0', 'Node');
                }
                if (node.parentNode !== null) {
                    node.parentNode.removeChild(node);
                }
            }
            static attr(el, param, value) {
                const me = this;
                if (!me.isEl(el)) {
                    throw new nodom.NodomError('invoke', 'this.attr', '0', 'Element');
                }
                if (this.isEmpty(param)) {
                    throw new nodom.NodomError('invoke', 'this.attr', '1', 'string', 'object');
                }
                if (value === undefined || value === null) {
                    if (this.isObject(param)) {
                        this.getOwnProps(param).forEach(function (k) {
                            if (k === 'value') {
                                el[k] = param[k];
                            }
                            else {
                                el.setAttribute(k, param[k]);
                            }
                        });
                    }
                    else if (this.isString(param)) {
                        if (param === 'value') {
                            return param[value];
                        }
                        return el.getAttribute(param);
                    }
                }
                else {
                    if (param === 'value') {
                        el[param] = value;
                    }
                    else {
                        el.setAttribute(param, value);
                    }
                }
            }
            static width(el, value) {
                if (!this.isEl(el)) {
                    throw new nodom.NodomError('invoke', 'Util.width', '0', 'Element');
                }
                if (this.isNumber(value)) {
                    el.style.width = value + 'px';
                }
                else {
                    let compStyle;
                    if (window.getComputedStyle) {
                        compStyle = window.getComputedStyle(el, null);
                    }
                    if (!compStyle) {
                        return null;
                    }
                    let w = parseInt(compStyle['width']);
                    if (value === true) {
                        let pw = parseInt(compStyle['paddingLeft']) + parseInt(compStyle['paddingRight']);
                        w -= pw;
                    }
                    return w;
                }
            }
            static height(el, value) {
                if (!this.isEl(el)) {
                    throw new nodom.NodomError('invoke', 'this.height', '0', 'Element');
                }
                if (this.isNumber(value)) {
                    el.style.height = value + 'px';
                }
                else {
                    let compStyle;
                    if (window.getComputedStyle) {
                        compStyle = window.getComputedStyle(el, null);
                    }
                    if (!compStyle) {
                        return null;
                    }
                    let w = parseInt(compStyle['height']);
                    if (value === true) {
                        let pw = parseInt(compStyle['paddingTop']) + parseInt(compStyle['paddingBottom']);
                        w -= pw;
                    }
                    return w;
                }
            }
            static formatDate(srcDate, format) {
                let timeStamp;
                if (this.isString(srcDate)) {
                    let reg = new RegExp(/^\d+$/);
                    if (reg.test(srcDate) === true) {
                        timeStamp = parseInt(srcDate);
                    }
                }
                else if (this.isNumber(srcDate)) {
                    timeStamp = srcDate;
                }
                else {
                    throw new nodom.NodomError('invoke', 'this.formatDate', '0', 'date string', 'date');
                }
                let date = new Date(timeStamp);
                if (isNaN(date.getDay())) {
                    return '';
                }
                let o = {
                    "M+": date.getMonth() + 1,
                    "d+": date.getDate(),
                    "h+": date.getHours() % 12 === 0 ? 12 : date.getHours() % 12,
                    "H+": date.getHours(),
                    "m+": date.getMinutes(),
                    "s+": date.getSeconds(),
                    "q+": Math.floor((date.getMonth() + 3) / 3),
                    "S": date.getMilliseconds()
                };
                let week = {
                    "0": "日",
                    "1": "一",
                    "2": "二",
                    "3": "三",
                    "4": "四",
                    "5": "五",
                    "6": "六"
                };
                if (/(y+)/.test(format)) {
                    format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                this.getOwnProps(o).forEach(function (k) {
                    if (new RegExp("(" + k + ")").test(format)) {
                        format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                });
                if (/(E+)/.test(format)) {
                    format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
                }
                return format;
            }
            static compileStr(src, p1, p2, p3, p4, p5) {
                let reg;
                let args = arguments;
                let index = 0;
                for (;;) {
                    if (src.indexOf('\{' + index + '\}') !== -1) {
                        reg = new RegExp('\\{' + index + '\\}', 'g');
                        src = src.replace(reg, args[index + 1]);
                        index++;
                    }
                    else {
                        break;
                    }
                }
                return src;
            }
            static apply(foo, obj, args) {
                if (!foo) {
                    return;
                }
                return Reflect.apply(foo, obj || null, args);
            }
        }
        Util.generatedId = 1;
        return Util;
    })();
    nodom.Util = Util;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Application {
    }
    nodom.Application = Application;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Factory {
        constructor(module) {
            if (module !== undefined) {
                this.moduleName = module.name;
            }
            this.items = Object.create(null);
        }
        add(name, item) {
            this.items[name] = item;
        }
        get(name) {
            return this.items[name];
        }
        remove(name) {
            delete this.items[name];
        }
    }
    nodom.Factory = Factory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Compiler {
        static compile(elementStr) {
            const div = nodom.Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new nodom.Element();
            oe.root = true;
            this.handleChildren(oe, div);
            return oe;
        }
        static compileDom(ele) {
            let oe;
            let isComment = false;
            switch (ele.nodeType) {
                case Node.ELEMENT_NODE:
                    let el = ele;
                    oe = this.handleDefineEl(el);
                    if (!oe) {
                        oe = this.handleEl(el);
                    }
                    break;
                case Node.TEXT_NODE:
                    oe = new nodom.Element();
                    let txt = ele.textContent;
                    let expA = this.compileExpression(txt);
                    if (typeof expA === 'string') {
                        oe.textContent = expA;
                    }
                    else {
                        oe.expressions = expA;
                    }
                    break;
                case Node.COMMENT_NODE:
                    isComment = true;
                    break;
            }
            if (!isComment) {
                return oe;
            }
        }
        static handleEl(el) {
            let oe = new nodom.Element();
            oe.tagName = el.tagName;
            this.handleAttributes(oe, el);
            this.handleChildren(oe, el);
            return oe;
        }
        static handleDefineEl(el) {
            let de = nodom.DefineElementManager.get(el.tagName);
            if (!de) {
                return;
            }
            return Reflect.construct(de, []).init(el);
        }
        static handleAttributes(oe, el) {
            for (let i = 0; i < el.attributes.length; i++) {
                let attr = el.attributes[i];
                let v = attr.value.trim();
                if (attr.name.startsWith('x-')) {
                    oe.directives.push(new nodom.Directive(attr.name.substr(2), v, oe));
                }
                else if (attr.name.startsWith('e-')) {
                    let en = attr.name.substr(2);
                    oe.addEvent(new nodom.NodomEvent(en, attr.value.trim()));
                }
                else {
                    let isExpr = false;
                    if (v !== '') {
                        let ra = this.compileExpression(v);
                        if (nodom.Util.isArray(ra)) {
                            oe.exprProps[attr.name] = ra;
                            isExpr = true;
                        }
                    }
                    if (!isExpr) {
                        oe.props[attr.name] = v;
                    }
                }
            }
            oe.directives.sort((a, b) => {
                return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
            });
        }
        static handleChildren(oe, el) {
            el.childNodes.forEach((nd) => {
                let o = this.compileDom(nd);
                if (o) {
                    oe.children.push(o);
                }
            });
        }
        static compileExpression(exprStr) {
            if (/\{\{.+?\}\}/.test(exprStr) === false) {
                return exprStr;
            }
            let reg = /\{\{.+?\}\}/g;
            let retA = new Array();
            let re;
            let oIndex = 0;
            while ((re = reg.exec(exprStr)) !== null) {
                let ind = re.index;
                if (ind > oIndex) {
                    let s = exprStr.substring(oIndex, ind);
                    retA.push(s);
                }
                let exp = new nodom.Expression(re[0].substring(2, re[0].length - 2));
                retA.push(exp);
                oIndex = ind + re[0].length;
            }
            if (oIndex < exprStr.length - 1) {
                retA.push(exprStr.substr(oIndex));
            }
            return retA;
        }
    }
    nodom.Compiler = Compiler;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Directive {
        constructor(type, value, vdom, filter) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                this.value = value.trim();
            }
            if (filter) {
                if (typeof filter === 'string') {
                    this.filter = new nodom.Filter(filter);
                }
                else if (filter instanceof nodom.Filter) {
                    this.filter = filter;
                }
            }
            if (type !== undefined) {
                nodom.DirectiveManager.init(this, vdom);
            }
        }
        exec(value) {
            let args = [this.module, this.type, value];
            return nodom.Util.apply(nodom.DirectiveManager.exec, nodom.DirectiveManager, args);
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class DirectiveFactory extends nodom.Factory {
    }
    nodom.DirectiveFactory = DirectiveFactory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let DirectiveManager = (() => {
        class DirectiveManager {
            static addType(name, config, replacable) {
                if (this.directiveTypes.has(name)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.directiveType, name);
                }
                if (!nodom.Util.isObject(config)) {
                    throw new nodom.NodomError('invoke', 'DirectiveManager.addType', '1', 'Function');
                }
                config.prio = config.prio || 10;
                if (replacable && !this.cantEditTypes.includes(name)) {
                    this.cantEditTypes.push(name);
                }
                this.directiveTypes.set(name, config);
            }
            static removeType(name) {
                if (this.cantEditTypes.indexOf(name) !== -1) {
                    throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.directiveType, name);
                }
                if (!this.directiveTypes.has(name)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
                }
                this.directiveTypes.delete(name);
            }
            static getType(name) {
                return this.directiveTypes.get(name);
            }
            static hasType(name) {
                return this.directiveTypes.has(name);
            }
            static init(directive, dom) {
                let dt = this.directiveTypes.get(directive.type);
                if (dt) {
                    return dt.init(directive, dom);
                }
            }
            static exec(directive, dom, module, parent) {
                if (!this.directiveTypes.has(directive.type)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, directive.type);
                }
                return nodom.Util.apply(this.directiveTypes.get(directive.type).handle, null, [directive, dom, module, parent]);
            }
        }
        DirectiveManager.directiveTypes = new Map();
        DirectiveManager.cantEditTypes = ['model', 'repeat', 'if', 'else', 'show', 'class', 'field'];
        return DirectiveManager;
    })();
    nodom.DirectiveManager = DirectiveManager;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class ChangedDom {
        constructor(node, type, parent, index) {
            this.node = node;
            this.type = type;
            this.parent = parent;
            this.index = index;
        }
    }
    nodom.ChangedDom = ChangedDom;
    class Element {
        constructor(tag) {
            this.directives = [];
            this.assets = new Map();
            this.props = {};
            this.exprProps = {};
            this.events = new Map();
            this.expressions = [];
            this.children = [];
            this.dontRender = false;
            this.tagName = tag;
            this.key = nodom.Util.genId() + '';
        }
        render(module, parent) {
            if (this.dontRender) {
                return;
            }
            if (parent) {
                this.parentKey = parent.key;
                if (!this.modelId) {
                    this.modelId = parent.modelId;
                }
            }
            if (this.extraData) {
                let model = module.modelFactory.get(this.modelId);
                if (!model) {
                    model = new nodom.Model(this.extraData, module);
                    this.modelId = model.id;
                }
                else {
                    nodom.Util.getOwnProps(this.extraData).forEach((item) => {
                        model.set(item, this.extraData[item]);
                    });
                }
            }
            if (this.defineElement) {
                nodom.DefineElementManager.beforeRender(module, this);
            }
            if (this.tagName !== undefined) {
                this.handleProps(module);
                this.handleDirectives(module, parent);
            }
            else {
                this.handleTextContent(module);
            }
            for (let i = 0; i < this.children.length; i++) {
                let item = this.children[i];
                item.render(module, this);
                if (item.dontRender) {
                    this.removeChild(item);
                    i--;
                }
            }
            if (this.defineElement) {
                nodom.DefineElementManager.afterRender(module, this);
            }
        }
        renderToHtml(module, params) {
            let el;
            let el1;
            let type = params.type;
            let parent = params.parent;
            if (!parent) {
                el = module.container;
            }
            else {
                if (type === 'fresh' || type === 'add' || type === 'text') {
                    el = module.container.querySelector("[key='" + parent.key + "']");
                }
                else if (this.tagName !== undefined) {
                    el = module.container.querySelector("[key='" + this.key + "']");
                }
            }
            if (!el) {
                return;
            }
            this.handleAssets(el);
            switch (type) {
                case 'fresh':
                    if (this.tagName) {
                        el1 = newEl(this, null, el);
                        genSub(el1, this);
                    }
                    else {
                        el1 = newText(this.textContent, this);
                    }
                    el.appendChild(el1);
                    break;
                case 'text':
                    if (!parent || !parent.children) {
                        break;
                    }
                    let ind = parent.children.indexOf(this);
                    if (ind !== -1) {
                        if (this.type === 'html') {
                            let div = document.querySelector("[key='" + this.key + "']");
                            if (div !== null) {
                                div.innerHTML = '';
                                div.appendChild(this.textContent);
                            }
                            else {
                                let div = newText(this.textContent);
                                nodom.Util.replaceNode(el.childNodes[ind], div);
                            }
                        }
                        else {
                            el.childNodes[ind].textContent = this.textContent;
                        }
                    }
                    break;
                case 'upd':
                    if (params.removeProps) {
                        params.removeProps.forEach((p) => {
                            el.removeAttribute(p);
                        });
                    }
                    if (params.changeProps) {
                        params.changeProps.forEach((p) => {
                            el.setAttribute(p.k, p.v);
                        });
                    }
                    break;
                case 'rep':
                    el1 = newEl(this, parent);
                    nodom.Util.replaceNode(el, el1);
                    break;
                case 'add':
                    if (this.tagName) {
                        el1 = newEl(this, parent, el);
                        genSub(el1, this);
                    }
                    else {
                        el1 = newText(this.textContent);
                    }
                    if (params.index === el.childNodes.length) {
                        el.appendChild(el1);
                    }
                    else {
                        el.insertBefore(el1, el.childNodes[params.index]);
                    }
            }
            function newEl(vdom, parent, parentEl) {
                let el = document.createElement(vdom.tagName);
                nodom.Util.getOwnProps(vdom.props).forEach((k) => {
                    el.setAttribute(k, vdom.props[k]);
                });
                el.setAttribute('key', vdom.key);
                vdom.handleEvents(module, el, parent, parentEl);
                vdom.handleAssets(el);
                return el;
            }
            function newText(text, dom) {
                if (text === undefined) {
                    text = '';
                    dom = null;
                }
                if (dom && 'html' === dom.type) {
                    let div = nodom.Util.newEl('div');
                    div.setAttribute('key', dom.key);
                    div.appendChild(text);
                    return div;
                }
                else {
                    return document.createTextNode(text);
                }
            }
            function genSub(pEl, vNode) {
                if (vNode.children && vNode.children.length > 0) {
                    vNode.children.forEach((item) => {
                        let el1;
                        if (item.tagName) {
                            el1 = newEl(item, vNode, pEl);
                            genSub(el1, item);
                        }
                        else {
                            el1 = newText(item.textContent, item);
                        }
                        pEl.appendChild(el1);
                    });
                }
            }
        }
        clone() {
            let dst = new Element();
            let notCopyProps = ['parent', 'directives', 'assets', 'props', 'exprProps', 'events', 'children'];
            nodom.Util.getOwnProps(this).forEach((p) => {
                if (notCopyProps.includes(p)) {
                    return;
                }
                dst[p] = this[p];
            });
            for (let d of this.directives) {
                dst.directives.push(d);
            }
            for (let key of this.assets.keys()) {
                dst.assets.set(key, this.assets.get(key));
            }
            nodom.Util.getOwnProps(this.props).forEach((k) => {
                dst.props[k] = this.props[k];
            });
            nodom.Util.getOwnProps(this.exprProps).forEach((k) => {
                dst.exprProps[k] = this.exprProps[k];
            });
            for (let key of this.events.keys()) {
                let evt = this.events.get(key);
                if (nodom.Util.isArray(evt)) {
                    let a = [];
                    for (let e of evt) {
                        a.push(e.clone());
                    }
                    dst.events.set(key, a);
                }
                else {
                    dst.events.set(key, evt.clone());
                }
            }
            for (let i = 0; i < this.children.length; i++) {
                if (!this.children[i]) {
                    this.children.splice(i--, 1);
                }
                else {
                    dst.children.push(this.children[i].clone());
                }
            }
            return dst;
        }
        handleDirectives(module, parent) {
            if (this.dontRender) {
                return false;
            }
            for (let d of this.directives.values()) {
                nodom.DirectiveManager.exec(d, this, module, parent);
            }
            return true;
        }
        handleExpression(exprArr, module) {
            if (this.dontRender) {
                return;
            }
            let model = module.modelFactory.get(this.modelId);
            let value = '';
            exprArr.forEach((v) => {
                if (v instanceof nodom.Expression) {
                    let v1 = v.val(model);
                    value += v1 !== undefined ? v1 : '';
                }
                else {
                    value += v;
                }
            });
            return value;
        }
        handleProps(module) {
            if (this.dontRender) {
                return;
            }
            nodom.Util.getOwnProps(this.exprProps).forEach((k) => {
                if (nodom.Util.isArray(this.exprProps[k])) {
                    let pv = this.handleExpression(this.exprProps[k], module);
                    if (k === 'class') {
                        this.addClass(pv);
                    }
                    else {
                        this.props[k] = pv;
                    }
                }
                else if (this.exprProps[k] instanceof nodom.Expression) {
                    this.props[k] = this.exprProps[k].val(module.modelFactory.get(this.modelId));
                }
            });
        }
        handleAssets(el) {
            if (!this.tagName && !el) {
                return;
            }
            for (let key of this.assets.keys()) {
                el[key] = this.assets.get(key);
            }
        }
        handleTextContent(module) {
            if (this.dontRender) {
                return;
            }
            if (this.expressions !== undefined && this.expressions.length > 0) {
                let v = this.handleExpression(this.expressions, module) || '';
                this.textContent = this.handleExpression(this.expressions, module);
            }
        }
        handleEvents(module, el, parent, parentEl) {
            if (this.events.size === 0) {
                return;
            }
            for (let evt of this.events.values()) {
                if (nodom.Util.isArray(evt)) {
                    for (let evo of evt) {
                        bind(evo, module, this, el, parent, parentEl);
                    }
                }
                else {
                    let ev = evt;
                    bind(ev, module, this, el, parent, parentEl);
                }
            }
            function bind(e, module, dom, el, parent, parentEl) {
                if (e.delg && parent) {
                    e.delegateTo(module, dom, el, parent, parentEl);
                }
                else {
                    e.bind(module, dom, el);
                }
            }
        }
        removeDirectives(directives) {
            for (let i = 0; i < this.directives.length; i++) {
                if (directives.length === 0) {
                    break;
                }
                for (let j = 0; j < directives.length; j++) {
                    if (directives[j].includes(this.directives[i].type)) {
                        this.directives.splice(i--, 1);
                        directives.splice(j--, 1);
                        break;
                    }
                }
            }
        }
        hasDirective(directiveType) {
            return this.directives.find(item => item.type === directiveType) !== undefined;
        }
        getDirective(directiveType) {
            return this.directives.find(item => item.type === directiveType);
        }
        add(dom) {
            dom.parent = this;
            this.children.push(dom);
        }
        remove(module, delHtml) {
            let parent = this.getParent(module);
            if (parent) {
                parent.removeChild(this);
            }
            if (delHtml && module && module.container) {
                let el = module.container.querySelector("[key='" + this.key + "']");
                if (el !== null) {
                    nodom.Util.remove(el);
                }
            }
        }
        removeFromHtml(module) {
            let el = module.container.querySelector("[key='" + this.key + "']");
            if (el !== null) {
                nodom.Util.remove(el);
            }
        }
        removeChild(dom) {
            let ind;
            if (nodom.Util.isArray(this.children) && (ind = this.children.indexOf(dom)) !== -1) {
                this.children.splice(ind, 1);
            }
        }
        getParent(module) {
            if (!module) {
                throw new nodom.NodomError('invoke', 'Element.getParent', '0', 'Module');
            }
            if (this.parent) {
                return this.parent;
            }
            if (this.parentKey) {
                return module.renderTree.query(this.parentKey);
            }
        }
        replace(dst) {
            if (!dst.parent) {
                return false;
            }
            let ind = dst.parent.children.indexOf(dst);
            if (ind === -1) {
                return false;
            }
            dst.parent.children.splice(ind, 1, this);
            return true;
        }
        contains(dom) {
            for (; dom !== undefined && dom !== this; dom = dom.parent)
                ;
            return dom !== undefined;
        }
        hasClass(cls) {
            let clazz = this.props['class'];
            if (!clazz) {
                return false;
            }
            else {
                let sa = clazz.split(' ');
                return sa.includes(cls);
            }
        }
        addClass(cls) {
            let clazz = this.props['class'];
            let finded = false;
            if (!clazz) {
                clazz = cls;
            }
            else {
                let sa = clazz.split(' ');
                let s;
                for (let i = 0; i < sa.length; i++) {
                    if (s === '') {
                        sa.splice(i--, 1);
                        continue;
                    }
                    if (sa[i] === cls) {
                        finded = true;
                        break;
                    }
                }
                if (!finded) {
                    sa.push(cls);
                }
                clazz = sa.join(' ');
            }
            this.props['class'] = clazz;
        }
        removeClass(cls) {
            let clazz = this.props['class'];
            if (!clazz) {
                return;
            }
            else {
                let sa = clazz.split(' ');
                let s;
                for (let i = 0; i < sa.length; i++) {
                    if (s === '') {
                        sa.splice(i--, 1);
                        continue;
                    }
                    if (sa[i] === cls) {
                        sa.splice(i, 1);
                        break;
                    }
                }
                clazz = sa.join(' ');
            }
            this.props['class'] = clazz;
        }
        hasProp(propName, isExpr) {
            if (isExpr) {
                return this.exprProps.hasOwnProperty(propName);
            }
            else {
                return this.props.hasOwnProperty(propName);
            }
        }
        getProp(propName, isExpr) {
            if (isExpr) {
                return this.exprProps[propName];
            }
            else {
                return this.props[propName];
            }
        }
        setProp(propName, v, isExpr) {
            if (isExpr) {
                this.exprProps[propName] = v;
            }
            else {
                this.props[propName] = v;
            }
        }
        delProp(props, isExpr) {
            if (nodom.Util.isArray(props)) {
                if (isExpr) {
                    for (let p of props) {
                        delete this.exprProps[p];
                    }
                }
                else {
                    for (let p of props) {
                        delete this.props[p];
                    }
                }
            }
            else {
                if (isExpr) {
                    delete this.exprProps[props];
                }
                else {
                    delete this.props[props];
                }
            }
        }
        query(key) {
            if (this.key === key) {
                return this;
            }
            for (let i = 0; i < this.children.length; i++) {
                let dom = this.children[i].query(key);
                if (dom) {
                    return dom;
                }
            }
        }
        compare(dst, retArr, parentNode) {
            if (!dst) {
                return;
            }
            let re = new ChangedDom();
            let change = false;
            if (this.tagName === undefined) {
                if (dst.tagName === undefined) {
                    if (this.textContent !== dst.textContent) {
                        re.type = 'text';
                        change = true;
                    }
                }
                else {
                    re.type = 'rep';
                    change = true;
                }
            }
            else {
                if (this.tagName !== dst.tagName) {
                    re.type = 'rep';
                    change = true;
                }
                else {
                    re.changeProps = [];
                    re.removeProps = [];
                    nodom.Util.getOwnProps(dst.props).forEach((k) => {
                        if (!this.props.hasOwnProperty(k)) {
                            re.removeProps.push(k);
                        }
                    });
                    nodom.Util.getOwnProps(this.props).forEach((k) => {
                        let v1 = dst.props[k];
                        if (this.props[k] !== v1) {
                            re.changeProps.push({ k: k, v: this.props[k] });
                        }
                    });
                    if (re.changeProps.length > 0 || re.removeProps.length > 0) {
                        change = true;
                        re.type = 'upd';
                    }
                }
            }
            if (change) {
                re.node = this;
                if (parentNode) {
                    re.parent = parentNode;
                }
                retArr.push(re);
            }
            if (!this.children || this.children.length === 0) {
                if (dst.children && dst.children.length > 0) {
                    dst.children.forEach((item) => {
                        retArr.push(new ChangedDom(item, 'del'));
                    });
                }
            }
            else {
                if (!dst.children || dst.children.length === 0) {
                    this.children.forEach((item) => {
                        retArr.push(new ChangedDom(item, 'add', this));
                    });
                }
                else {
                    this.children.forEach((dom1, ind) => {
                        let dom2 = dst.children[ind];
                        if (!dom2 || dom1.key !== dom2.key) {
                            dom2 = undefined;
                            for (let i = 0; i < dst.children.length; i++) {
                                if (dom1.key === dst.children[i].key) {
                                    dom2 = dst.children[i];
                                    break;
                                }
                            }
                        }
                        if (dom2 !== undefined) {
                            dom1.compare(dom2, retArr, this);
                            dom2.finded = true;
                        }
                        else {
                            retArr.push(new ChangedDom(dom1, 'add', this, ind));
                        }
                    });
                    if (dst.children && dst.children.length > 0) {
                        dst.children.forEach((item) => {
                            if (!item.finded) {
                                retArr.push(new ChangedDom(item, 'del', dst));
                            }
                            else {
                                item.finded = undefined;
                            }
                        });
                    }
                }
            }
        }
        addEvent(event) {
            if (this.events.has(event.name)) {
                let ev = this.events.get(event.name);
                let evs;
                if (nodom.Util.isArray(ev)) {
                    evs = ev;
                }
                else {
                    evs = [ev];
                }
                evs.push(event);
                this.events.set(event.name, evs);
            }
            else {
                this.events.set(event.name, event);
            }
        }
        addDirective(directive) {
            let finded = false;
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directive.type) {
                    this.directives[i] = directive;
                    finded = true;
                    break;
                }
            }
            if (!finded) {
                this.directives.push(directive);
            }
        }
    }
    nodom.Element = Element;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let Expression = (() => {
        class Expression {
            constructor(exprStr) {
                this.replaceMap = new Map();
                this.fields = [];
                this.id = nodom.Util.genId();
                if (exprStr) {
                    this.execString = this.compile(exprStr);
                }
                if (this.execString) {
                    let v = this.fields.length > 0 ? ',' + this.fields.join(',') : '';
                    this.execFunc = eval('(function($module' + v + '){return ' + this.execString + '})');
                }
            }
            compile(exprStr) {
                let stringReg = [/\".*?\"/, /'.*?'/, /`.*?`/];
                let quotReg = [/\\"/g, /\\'/g, /\\`/g];
                let quotStr = ['$$$$NODOM_QUOT1', '$$$$NODOM_QUOT2', '$$$$NODOM_QUOT3'];
                let srcStr = exprStr;
                let replaceIndex = 0;
                for (let i = 0; i < 3; i++) {
                    srcStr = srcStr.replace(quotReg[i], quotStr[i]);
                }
                for (;;) {
                    let r;
                    for (let reg of stringReg) {
                        let r1 = reg.exec(srcStr);
                        if (!r1) {
                            continue;
                        }
                        if (!r || r.index > r1.index) {
                            r = r1;
                        }
                    }
                    if (!r) {
                        break;
                    }
                    let sTmp = Expression.REP_STR + replaceIndex++;
                    this.replaceMap.set(sTmp, r[0]);
                    srcStr = srcStr.substr(0, r.index) + sTmp + srcStr.substr(r.index + r[0].length);
                }
                srcStr = srcStr.replace(/\s+/g, '');
                let arrOperator = srcStr.split(/[\(\)\!\|\*\/\+\-><=&%]/);
                let arrOperand = [];
                let index = 0;
                for (let sp of arrOperator) {
                    index += sp.length;
                    let ch = srcStr.charAt(index++);
                    if (ch !== '') {
                        arrOperand.push(ch);
                    }
                }
                return this.genExecStr(arrOperator, arrOperand);
            }
            genExecStr(arrOperator, arrOperand) {
                let retStr = '';
                for (; arrOperator.length > 1;) {
                    let opr = arrOperator.pop();
                    let opd = arrOperand.pop();
                    let r;
                    let handled = false;
                    if (opd === '(') {
                        r = this.judgeAndHandleFunc(arrOperator, arrOperand, opr);
                        if (r !== undefined) {
                            if (r.startsWith('$module')) {
                                opd = '';
                            }
                            if (opr !== '' && !this.addField(opr)) {
                                opr = this.recoveryString(opr);
                            }
                            retStr = r + opd + opr + retStr;
                            if (arrOperand.length > 0) {
                                retStr = arrOperand.pop() + retStr;
                            }
                            handled = true;
                        }
                    }
                    else if (opd === '|') {
                        r = this.judgeAndHandleFilter(arrOperator, arrOperand, opr);
                        if (r !== undefined) {
                            retStr = (arrOperand.length > 0 ? arrOperand.pop() : '') + r + retStr;
                            handled = true;
                        }
                    }
                    if (!handled) {
                        if (!this.addField(opr)) {
                            opr = this.recoveryString(opr);
                        }
                        retStr = opd + opr + retStr;
                    }
                }
                if (arrOperator.length > 0) {
                    let opr = arrOperator.pop();
                    if (opr !== '') {
                        if (!this.addField(opr)) {
                            opr = this.recoveryString(opr);
                        }
                        retStr = opr + retStr;
                    }
                }
                return retStr;
            }
            recoveryString(str) {
                if (str.startsWith(Expression.REP_STR)) {
                    if (this.replaceMap.has(str)) {
                        str = this.replaceMap.get(str);
                        str = str.replace(/\$\$NODOM_QUOT1/g, '\\"');
                        str = str.replace(/\$\$NODOM_QUOT2/g, "\\'");
                        str = str.replace(/\$\$NODOM_QUOT3/g, '\\`');
                    }
                }
                return str;
            }
            judgeAndHandleFunc(arrOperator, arrOperand, srcOp) {
                let sp = arrOperator[arrOperator.length - 1];
                if (sp && sp !== '') {
                    arrOperator.pop();
                    if (sp.startsWith('$')) {
                        return '$module.methodFactory.get("' + sp.substr(1) + '").call($module,';
                    }
                    else {
                        return sp;
                    }
                }
            }
            judgeAndHandleFilter(arrOperator, arrOperand, srcOp) {
                if (srcOp.startsWith(Expression.REP_STR) || nodom.Util.isNumberString(srcOp)) {
                    return;
                }
                let sa = nodom.FilterManager.explain(srcOp);
                if (sa.length > 1 || nodom.FilterManager.hasType(sa[0])) {
                    let ftype = sa[0];
                    sa.shift();
                    sa.forEach((v, i) => {
                        v = this.recoveryString(v);
                        if (!nodom.Util.isNumberString(v)) {
                            sa[i] = '"' + v + '"';
                        }
                    });
                    let paramStr = sa.length > 0 ? ',' + sa.join(',') : '';
                    let filterValue = '';
                    let opr = arrOperator[arrOperator.length - 1];
                    if (opr !== '') {
                        if (!this.addField(opr)) {
                            opr = this.recoveryString(opr);
                        }
                        filterValue = opr;
                        arrOperator.pop();
                    }
                    else if (arrOperand.length > 2 && arrOperand[arrOperand.length - 1] === ')') {
                        let quotNum = 1;
                        let a1 = [arrOperator.pop()];
                        let a2 = [arrOperand.pop()];
                        for (let i = arrOperand.length - 1; i >= 0; i--) {
                            if (arrOperand[i] === '(') {
                                quotNum--;
                            }
                            else if (arrOperand[i] === ')') {
                                quotNum++;
                            }
                            a1.unshift(arrOperator.pop());
                            a2.unshift(arrOperand.pop());
                            if (quotNum === 0) {
                                a1.unshift(arrOperator.pop());
                                break;
                            }
                        }
                        filterValue = this.genExecStr(a1, a2);
                    }
                    return 'nodom.FilterManager.exec($module,"' + ftype + '",' + filterValue + paramStr + ')';
                }
            }
            val(model) {
                if (!model) {
                    return '';
                }
                let module = nodom.ModuleFactory.get(model.moduleName);
                let fieldObj = model.data;
                let valueArr = [];
                this.fields.forEach((field) => {
                    valueArr.push(getFieldValue(module, fieldObj, field));
                });
                valueArr.unshift(module);
                return this.execFunc.apply(null, valueArr);
                function getFieldValue(module, dataObj, field) {
                    if (dataObj.hasOwnProperty(field)) {
                        return dataObj[field];
                    }
                    if (field.startsWith('$$')) {
                        return module.model.query(field.substr(2));
                    }
                }
            }
            addField(field) {
                const jsKeyWords = ['true', 'false', 'undefined', 'null', 'typeof',
                    'Object', 'Function', 'Array', 'Number', 'Date',
                    'instanceof', 'NaN'];
                if (field === '' || jsKeyWords.includes(field) || field.startsWith(Expression.REP_STR) || nodom.Util.isNumberString(field)) {
                    return false;
                }
                let ind;
                if ((ind = field.indexOf('.')) !== -1) {
                    field = field.substr(0, ind);
                }
                if (!this.fields.includes(field)) {
                    this.fields.push(field);
                }
                return true;
            }
        }
        Expression.REP_STR = '$$NODOM_TMPSTR';
        return Expression;
    })();
    nodom.Expression = Expression;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class ExpressionFactory extends nodom.Factory {
    }
    nodom.ExpressionFactory = ExpressionFactory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Filter {
        constructor(src) {
            let arr = nodom.Util.isString(src) ? nodom.FilterManager.explain(src) : src;
            if (arr) {
                this.type = arr[0];
                this.params = arr.slice(1);
            }
        }
        exec(value, module) {
            let args = [module, this.type, value].concat(this.params);
            return nodom.Util.apply(nodom.FilterManager.exec, module, args);
        }
    }
    nodom.Filter = Filter;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class FilterFactory extends nodom.Factory {
    }
    nodom.FilterFactory = FilterFactory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let FilterManager = (() => {
        class FilterManager {
            static addType(name, handler) {
                if (!/^[a-zA-Z]+$/.test(name)) {
                    throw new nodom.NodomError('namedinvalid', nodom.TipWords.filterType, name);
                }
                if (this.filterTypes.has(name)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.filterType, name);
                }
                if (!nodom.Util.isFunction(handler)) {
                    throw new nodom.NodomError('invoke', 'FilterManager.addType', '1', 'Function');
                }
                this.filterTypes.set(name, handler);
            }
            static removeType(name) {
                if (this.cantEditTypes.indexOf(name) !== -1) {
                    throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.filterType, name);
                }
                if (!this.filterTypes.has(name)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, name);
                }
                this.filterTypes.delete(name);
            }
            static hasType(name) {
                return this.filterTypes.has(name);
            }
            static exec(module, type) {
                let params = new Array();
                for (let i = 2; i < arguments.length; i++) {
                    params.push(arguments[i]);
                }
                if (!FilterManager.filterTypes.has(type)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, type);
                }
                return nodom.Util.apply(FilterManager.filterTypes.get(type), module, params);
            }
            static explain(src) {
                let startStr;
                let startObj = false;
                let strings = "\"'`";
                let splitCh = ':';
                let retArr = new Array();
                let tmp = '';
                for (let i = 0; i < src.length; i++) {
                    let ch = src[i];
                    if (strings.indexOf(ch) !== -1) {
                        if (ch === startStr) {
                            startStr = undefined;
                        }
                        else {
                            startStr = ch;
                        }
                    }
                    else if (startStr === undefined) {
                        if (ch === '}' && startObj) {
                            startObj = false;
                        }
                        else if (ch === '{') {
                            startObj = true;
                        }
                    }
                    if (ch === splitCh && startStr === undefined && !startObj && tmp !== '') {
                        retArr.push(handleObj(tmp));
                        tmp = '';
                        continue;
                    }
                    tmp += ch;
                }
                if (tmp !== '') {
                    retArr.push(handleObj(tmp));
                }
                return retArr;
                function handleObj(s) {
                    s = s.trim();
                    if (s.charAt(0) === '{') {
                        s = eval('(' + s + ')');
                    }
                    return s;
                }
            }
        }
        FilterManager.filterTypes = new Map();
        FilterManager.cantEditTypes = ['date', 'currency', 'number', 'tolowercase', 'touppercase', 'orderBy', 'filter'];
        return FilterManager;
    })();
    nodom.FilterManager = FilterManager;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Linker {
        static gen(type, config) {
            let p;
            switch (type) {
                case 'ajax':
                    p = this.ajax(config);
                    break;
                case 'getfiles':
                    p = this.getfiles(config);
                    break;
                case 'dolist':
                    if (config.params) {
                        p = this.dolist(config.funcs, config.params);
                    }
                    else {
                        p = this.dolist(config.funcs);
                    }
            }
            return p;
        }
        static ajax(config) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    if (config.rand) {
                        config.params = config.params || {};
                        config.params.$rand = Math.random();
                    }
                    let url = config.url;
                    const async = config.async === false ? false : true;
                    const req = new XMLHttpRequest();
                    req.withCredentials = config.withCredentials;
                    const reqType = config.reqType || 'GET';
                    req.timeout = async ? config.timeout : 0;
                    req.onload = () => {
                        if (req.status === 200) {
                            let r = req.responseText;
                            if (config.type === 'json') {
                                try {
                                    r = JSON.parse(r);
                                }
                                catch (e) {
                                    reject({ type: "jsonparse" });
                                }
                            }
                            resolve(r);
                        }
                        else {
                            reject({ type: 'error', url: url });
                        }
                    };
                    req.ontimeout = () => reject({ type: 'timeout' });
                    req.onerror = () => reject({ type: 'error', url: url });
                    switch (reqType) {
                        case 'GET':
                            let pa;
                            if (nodom.Util.isObject(config.params)) {
                                let ar = [];
                                nodom.Util.getOwnProps(config.params).forEach(function (key) {
                                    ar.push(key + '=' + config.params[key]);
                                });
                                pa = ar.join('&');
                            }
                            if (pa !== undefined) {
                                if (url.indexOf('?') !== -1) {
                                    url += '&' + pa;
                                }
                                else {
                                    url += '?' + pa;
                                }
                            }
                            req.open(reqType, url, async, config.user, config.pwd);
                            req.send(null);
                            break;
                        case 'POST':
                            let fd = new FormData();
                            for (let o in config.params) {
                                fd.append(o, config.params[o]);
                            }
                            req.open(reqType, url, async, config.user, config.pwd);
                            req.send(fd);
                            break;
                    }
                }).catch((re) => {
                    switch (re.type) {
                        case "error":
                            throw new nodom.NodomError("notexist1", nodom.TipWords.resource, re.url);
                        case "timeout":
                            throw new nodom.NodomError("timeout");
                        case "jsonparse":
                            throw new nodom.NodomError("jsonparse");
                    }
                });
            });
        }
        static getfiles(urls) {
            return __awaiter(this, void 0, void 0, function* () {
                let promises = [];
                urls.forEach((url) => {
                    promises.push(new Promise((resolve, reject) => {
                        const req = new XMLHttpRequest();
                        req.onload = () => resolve(req.responseText);
                        req.onerror = () => reject(url);
                        req.open("GET", url);
                        req.send();
                    }));
                });
                return Promise.all(promises).catch((text) => {
                    throw new nodom.NodomError("notexist1", nodom.TipWords.resource, text);
                });
            });
        }
        static dolist(funcArr, paramArr) {
            return foo(funcArr, 0, paramArr);
            function foo(fa, i, pa) {
                if (fa.length === 0) {
                    return Promise.resolve();
                }
                else {
                    return new Promise((resolve, reject) => {
                        if (nodom.Util.isArray(pa)) {
                            fa[i](resolve, reject, pa[i]);
                        }
                        else {
                            fa[i](resolve, reject);
                        }
                    }).then(() => {
                        if (i < fa.length - 1) {
                            return foo(fa, i + 1, pa);
                        }
                    });
                }
            }
        }
    }
    nodom.Linker = Linker;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Message {
        constructor(fromModule, toModule, content) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
            this.readed = false;
        }
    }
    nodom.Message = Message;
    let MessageQueue = (() => {
        class MessageQueue {
            static add(from, to, data) {
                this.messages.push(new Message(from, to, data));
            }
            static handleQueue() {
                for (let i = 0; i < this.messages.length; i++) {
                    let msg = this.messages[i];
                    let module = nodom.ModuleFactory.get(msg.toModule);
                    if (module && module.state === 2 || module.state === 3) {
                        module.receive(msg.fromModule, msg.content);
                    }
                    if (module && module.state >= 2) {
                        MessageQueue.messages.splice(i--, 1);
                    }
                }
            }
        }
        MessageQueue.messages = [];
        return MessageQueue;
    })();
    nodom.MessageQueue = MessageQueue;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class MethodFactory extends nodom.Factory {
        invoke(name, params) {
            const foo = this.get(name);
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError(nodom.ErrorMsgs.notexist1, nodom.TipWords.method, name);
            }
            return nodom.Util.apply(foo, this.module.model, params);
        }
    }
    nodom.MethodFactory = MethodFactory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Model {
        constructor(data, module) {
            this.fields = {};
            this.data = data;
            this.fields = {};
            this.id = nodom.Util.genId();
            if (module) {
                this.moduleName = module.name;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id + '', this);
                }
            }
            data['$modelId'] = this.id;
            this.addSetterGetter(data);
        }
        set(key, value) {
            let fn, data;
            let index = key.lastIndexOf('.');
            if (index !== -1) {
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                data = this.query(key);
            }
            else {
                fn = key;
                data = this.data;
            }
            if (data === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.dataItem, key);
            }
            if (data[fn] !== value) {
                let module = nodom.ModuleFactory.get(this.moduleName);
                if (nodom.Util.isObject(value) || nodom.Util.isArray(value)) {
                    new Model(value, module);
                }
                let model = module.modelFactory.get(data.$modelId);
                if (model) {
                    let ds = Object.getOwnPropertyDescriptor(data, fn);
                    if (ds === undefined || ds['writable']) {
                        this.defineProp(data, fn);
                    }
                    model.update(fn, value);
                }
                data[fn] = value;
            }
        }
        update(field, value) {
            let change = false;
            if (nodom.Util.isString(field)) {
                if (this.fields[field] !== value) {
                    this.fields[field] = value;
                    change = true;
                }
            }
            if (change) {
                nodom.ModuleFactory.get(this.moduleName).dataChange();
            }
        }
        addSetterGetter(data) {
            let me = this;
            const excludes = ['$modelId'];
            if (nodom.Util.isObject(data)) {
                nodom.Util.getOwnProps(data).forEach((p) => {
                    let v = data[p];
                    if (nodom.Util.isObject(v) || nodom.Util.isArray(v)) {
                        new Model(v, nodom.ModuleFactory.get(this.moduleName));
                    }
                    else {
                        this.update(p, v);
                        if (!excludes.includes(p)) {
                            this.defineProp(data, p);
                        }
                    }
                });
            }
            else if (nodom.Util.isArray(data)) {
                let watcher = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module = nodom.ModuleFactory.get(this.moduleName);
                watcher.forEach((item) => {
                    data[item] = function () {
                        let args = [];
                        switch (item) {
                            case 'push':
                                for (let i = 0; i < arguments.length; i++) {
                                    args.push(arguments[i]);
                                }
                                break;
                            case 'unshift':
                                for (let i = 0; i < arguments.length; i++) {
                                    args.push(arguments[i]);
                                }
                                break;
                            case 'splice':
                                if (arguments.length > 2) {
                                    for (let i = 2; i < arguments.length; i++) {
                                        args.push(arguments[i]);
                                    }
                                }
                                break;
                            case 'pop':
                                break;
                            case 'shift':
                                break;
                        }
                        Array.prototype[item].apply(data, arguments);
                        args.forEach((arg) => {
                            if (nodom.Util.isObject(arg) || nodom.Util.isArray(arg)) {
                                new Model(arg, module);
                            }
                        });
                        nodom.Renderer.add(nodom.ModuleFactory.get(me.moduleName));
                    };
                });
                data.forEach((item) => {
                    if (nodom.Util.isObject(item) || nodom.Util.isArray(item)) {
                        new Model(item, module);
                    }
                });
            }
        }
        defineProp(data, p) {
            Object.defineProperty(data, p, {
                set: (v) => {
                    if (this.fields[p] === v) {
                        return;
                    }
                    this.update(p, v);
                    data[p] = v;
                },
                get: () => {
                    if (this.fields[p] !== undefined) {
                        return this.fields[p];
                    }
                }
            });
        }
        query(name) {
            let data = this.data;
            let fa = name.split(".");
            for (let i = 0; i < fa.length && null !== data && typeof data === 'object'; i++) {
                if (data === undefined) {
                    return;
                }
                if (fa[i].charAt(fa[i].length - 1) === ']') {
                    let f = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    f.forEach((istr) => {
                        let ind = istr.substr(0, istr.length - 1);
                        data = data[parseInt(ind)];
                    });
                }
                else {
                    data = data[fa[i]];
                }
            }
            return data;
        }
    }
    nodom.Model = Model;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class ModelFactory extends nodom.Factory {
    }
    nodom.ModelFactory = ModelFactory;
})(nodom || (nodom = {}));
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
                }
            }
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
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
                    if (config.template.startsWith('<')) {
                        templateStr = config.template;
                    }
                    else {
                        if (config.template.endsWith('.nd')) {
                            typeArr.push('compiled');
                        }
                        else {
                            typeArr.push('template');
                        }
                        urlArr.push(appPath + config.template);
                    }
                }
                if (!nodom.Util.isEmpty(templateStr)) {
                    this.virtualDom = nodom.Compiler.compile(templateStr);
                }
                if (config.data) {
                    if (nodom.Util.isObject(config.data)) {
                        this.model = new nodom.Model(config.data, this);
                    }
                    else {
                        typeArr.push('data');
                        urlArr.push(config['data']);
                        this.dataUrl = config.data;
                    }
                }
                if (typeArr.length > 0) {
                    let files = yield nodom.Linker.gen('getfiles', urlArr);
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
                                this.virtualDom = nodom.Compiler.compile(file.trim());
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
                }
                changeState(this);
                if (nodom.Util.isArray(this.initConfig.modules)) {
                    this.initConfig.modules.forEach((item) => {
                        this.addChild(item);
                    });
                }
                delete this.initConfig;
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
                    this.doModuleEvent('onBeforeRenderToHtml');
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
            this.doModuleEvent('onBeforeFirstRender');
            this.beforeFirstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, this, []);
            });
            this.beforeFirstRenderOps = [];
            this.renderTree = root;
            if (this.model) {
                root.modelId = this.model.id;
            }
            root.render(this, null);
            this.doModuleEvent('onBeforeFirstRenderToHTML');
            if (root.children) {
                root.children.forEach((item) => {
                    item.renderToHtml(this, { type: 'fresh' });
                });
            }
            delete this.firstRender;
            this.doModuleEvent('onFirstRender');
            this.firstRenderOps.forEach((foo) => {
                nodom.Util.apply(foo, this, []);
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
        active() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.state === 3) {
                    return;
                }
                if (this.state === 0) {
                    yield this.init();
                    this.state = 3;
                }
                else {
                    this.state = 3;
                }
                nodom.Renderer.add(this);
                if (nodom.Util.isArray(this.children)) {
                    this.children.forEach((m) => __awaiter(this, void 0, void 0, function* () {
                        yield m.active();
                    }));
                }
            });
        }
        unactive() {
            if (this.main || this.state === 2) {
                return;
            }
            this.state = 2;
            this.firstRender = true;
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
            nodom.Util.apply(foo, this, param);
        }
        addFirstRenderOperation(foo) {
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
var nodom;
(function (nodom) {
    let ModuleFactory = (() => {
        class ModuleFactory {
            static add(name, item) {
                this.items.set(name, item);
            }
            static get(name) {
                return this.items.get(name);
            }
            static remove(name) {
                this.items.delete(name);
            }
            static setMain(m) {
                this.mainModule = m;
            }
            static getMain() {
                return this.mainModule;
            }
        }
        ModuleFactory.items = new Map();
        return ModuleFactory;
    })();
    nodom.ModuleFactory = ModuleFactory;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class NodomError extends Error {
        constructor(errorName, p1, p2, p3, p4) {
            super(errorName);
            let msg = nodom.ErrorMsgs[errorName];
            if (msg === undefined) {
                this.message = "未知错误";
                return;
            }
            let params = [msg];
            if (p1) {
                params.push(p1);
            }
            if (p2) {
                params.push(p2);
            }
            if (p3) {
                params.push(p3);
            }
            if (p4) {
                params.push(p4);
            }
            this.message = nodom.Util.compileStr.apply(null, params);
        }
    }
    nodom.NodomError = NodomError;
    ;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class NodomEvent {
        constructor(eventName, eventStr, handler) {
            this.name = eventName;
            if (eventStr) {
                let tp = typeof eventStr;
                if (tp === 'string') {
                    eventStr.split(':').forEach((item, i) => {
                        item = item.trim();
                        if (i === 0) {
                            this.handler = item;
                        }
                        else {
                            switch (item) {
                                case 'delg':
                                    this.delg = true;
                                    break;
                                case 'nopopo':
                                    this.nopopo = true;
                                    break;
                                case 'once':
                                    this.once = true;
                                    break;
                                case 'capture':
                                    this.capture = true;
                                    break;
                            }
                        }
                    });
                }
                else if (tp === 'function') {
                    handler = eventStr;
                }
            }
            if (handler) {
                this.handler = handler;
            }
            let dtype = 'ontouchend' in document ? 1 : 2;
            if (dtype === 1) {
                switch (this.name) {
                    case 'click':
                        this.name = 'tap';
                        break;
                    case 'mousedown':
                        this.name = 'touchstart';
                        break;
                    case 'mouseup':
                        this.name = 'touchend';
                        break;
                    case 'mousemove':
                        this.name = 'touchmove';
                        break;
                }
            }
            else {
                switch (this.name) {
                    case 'tap':
                        this.name = 'click';
                        break;
                    case 'touchstart':
                        this.name = 'mousedown';
                        break;
                    case 'touchend':
                        this.name = 'mouseup';
                        break;
                    case 'touchmove':
                        this.name = 'mousemove';
                        break;
                }
            }
        }
        fire(e, el) {
            const module = nodom.ModuleFactory.get(this.moduleName);
            if (!module.hasContainer()) {
                return;
            }
            let dom = module.renderTree.query(this.domKey);
            const model = module.modelFactory.get(dom.modelId);
            if (this.capture) {
                handleSelf(this, e, model, module, dom, el);
                handleDelg(this, e, dom);
            }
            else {
                if (handleDelg(this, e, dom)) {
                    handleSelf(this, e, model, module, dom, el);
                }
            }
            if (this.events !== undefined &&
                this.events.has(this.name) &&
                this.events.get(this.name).length === 0 &&
                this.handler === undefined) {
                if (!el) {
                    el = module.container.querySelector("[key='" + this.domKey + "']");
                }
                if (ExternalEvent.touches[this.name]) {
                    ExternalEvent.unregist(this, el);
                }
                else {
                    if (el !== null) {
                        el.removeEventListener(this.name, this.handleListener);
                    }
                }
            }
            function handleDelg(eObj, e, dom) {
                if (eObj.events === undefined) {
                    return true;
                }
                let eKey = e.target.getAttribute('key');
                let arr = eObj.events.get(eObj.name);
                if (nodom.Util.isArray(arr)) {
                    if (arr.length > 0) {
                        for (let i = 0; i < arr.length; i++) {
                            let sdom = dom.query(arr[i].domKey);
                            if (eKey === sdom.key || sdom.query(eKey)) {
                                arr[i].fire(e);
                                if (arr[i].once) {
                                    eObj.removeChild(arr[i]);
                                }
                                if (arr[i].nopopo) {
                                    return false;
                                }
                            }
                        }
                    }
                    else {
                        eObj.events.delete(eObj.name);
                    }
                }
                return true;
            }
            function handleSelf(eObj, e, model, module, dom, el) {
                if (typeof eObj.handler === 'string') {
                    eObj.handler = module.methodFactory.get(eObj.handler);
                }
                if (!eObj.handler) {
                    return;
                }
                if (eObj.nopopo) {
                    e.stopPropagation();
                }
                nodom.Util.apply(eObj.handler, eObj, [dom, model, module, e, el]);
                if (eObj.once) {
                    delete eObj.handler;
                }
            }
        }
        bind(module, dom, el) {
            this.moduleName = module.name;
            this.domKey = dom.key;
            if (ExternalEvent.touches[this.name]) {
                ExternalEvent.regist(this, el);
            }
            else {
                this.handleListener = (e) => {
                    this.fire(e, el);
                };
                el.addEventListener(this.name, this.handleListener, this.capture);
            }
        }
        delegateTo(module, vdom, el, parent, parentEl) {
            this.domKey = vdom.key;
            this.moduleName = module.name;
            if (!parentEl) {
                parentEl = document.body;
            }
            if (!parent.events.has(this.name)) {
                let ev = new NodomEvent(this.name);
                ev.bind(module, parent, parentEl);
                parent.events.set(this.name, ev);
            }
            let evt = parent.events.get(this.name);
            let ev;
            if (nodom.Util.isArray(evt) && evt.length > 0) {
                ev = evt[0];
            }
            else {
                ev = evt;
            }
            if (ev) {
                ev.addChild(this);
            }
        }
        addChild(ev) {
            if (!this.events) {
                this.events = new Map();
            }
            if (!this.events.has(this.name)) {
                this.events.set(this.name, new Array());
            }
            this.events.get(this.name).push(ev);
        }
        removeChild(ev) {
            if (this.events === undefined || this.events[ev.name] === undefined) {
                return;
            }
            let ind = this.events[ev.name].indexOf(ev);
            if (ind !== -1) {
                this.events[ev.name].splice(ind, 1);
                if (this.events[ev.name].length === 0) {
                    this.events.delete(ev.name);
                }
            }
        }
        clone() {
            let evt = new NodomEvent(this.name);
            let arr = ['delg', 'once', 'nopopo', 'capture', 'handler', 'handleEvent', 'module'];
            arr.forEach((item) => {
                evt[item] = this[item];
            });
            return evt;
        }
    }
    nodom.NodomEvent = NodomEvent;
    let ExternalEvent = (() => {
        class ExternalEvent {
            static regist(evtObj, el) {
                let touchEvts = ExternalEvent.touches[evtObj.name];
                if (!nodom.Util.isEmpty(evtObj.touchListeners)) {
                    this.unregist(evtObj);
                }
                if (!el) {
                    const module = nodom.ModuleFactory.get(evtObj.moduleName);
                    el = module.container.querySelector("[key='" + evtObj.domKey + "']");
                }
                evtObj.touchListeners = new Map();
                if (touchEvts && el !== null) {
                    nodom.Util.getOwnProps(touchEvts).forEach(function (ev) {
                        evtObj.touchListeners[ev] = function (e) {
                            touchEvts[ev](e, evtObj);
                        };
                        el.addEventListener(ev, evtObj.touchListeners[ev], evtObj.capture);
                    });
                }
            }
            static unregist(evtObj, el) {
                const evt = ExternalEvent.touches[evtObj.name];
                if (!el) {
                    const module = nodom.ModuleFactory.get(evtObj.moduleName);
                    el = module.container.querySelector("[key='" + evtObj.domKey + "']");
                }
                if (evt) {
                    if (el !== null) {
                        nodom.Util.getOwnProps(evtObj.touchListeners).forEach(function (ev) {
                            el.removeEventListener(ev, evtObj.touchListeners[ev]);
                        });
                    }
                }
            }
        }
        ExternalEvent.touches = {};
        return ExternalEvent;
    })();
    nodom.ExternalEvent = ExternalEvent;
    ExternalEvent.touches = {
        tap: {
            touchstart: function (e, evtObj) {
                let tch = e.touches[0];
                evtObj.extParams = {
                    pos: { sx: tch.pageX, sy: tch.pageY, t: Date.now() }
                };
            },
            touchmove: function (e, evtObj) {
                let pos = evtObj.extParams.pos;
                let tch = e.touches[0];
                let dx = tch.pageX - pos.sx;
                let dy = tch.pageY - pos.sy;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    pos.move = true;
                }
            },
            touchend: function (e, evtObj) {
                let pos = evtObj.extParams.pos;
                let dt = Date.now() - pos.t;
                if (pos.move === true || dt > 200) {
                    return;
                }
                evtObj.fire(e);
            }
        },
        swipe: {
            touchstart: function (e, evtObj) {
                let tch = e.touches[0];
                let t = Date.now();
                evtObj.extParams = {
                    swipe: {
                        oldTime: [t, t],
                        speedLoc: [{ x: tch.pageX, y: tch.pageY }, { x: tch.pageX, y: tch.pageY }],
                        oldLoc: { x: tch.pageX, y: tch.pageY }
                    }
                };
            },
            touchmove: function (e, evtObj) {
                let nt = Date.now();
                let tch = e.touches[0];
                let mv = evtObj.extParams['swipe'];
                if (nt - mv.oldTime > 50) {
                    mv.speedLoc[0] = { x: mv.speedLoc[1].x, y: mv.speedLoc[1].y };
                    mv.speedLoc[1] = { x: tch.pageX, y: tch.pageY };
                    mv.oldTime[0] = mv.oldTime[1];
                    mv.oldTime[1] = nt;
                }
                mv.oldLoc = { x: tch.pageX, y: tch.pageY };
            },
            touchend: function (e, evtObj) {
                let mv = evtObj.extParams['swipe'];
                let nt = Date.now();
                let ind = (nt - mv.oldTime[1] < 30) ? 0 : 1;
                let dx = mv.oldLoc.x - mv.speedLoc[ind].x;
                let dy = mv.oldLoc.y - mv.speedLoc[ind].y;
                let s = Math.sqrt(dx * dx + dy * dy);
                let dt = nt - mv.oldTime[ind];
                if (dt > 300 || s < 10) {
                    return;
                }
                let v0 = s / dt;
                if (v0 > 0.05) {
                    let sname = '';
                    if (dx < 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0;
                        sname = 'swipeleft';
                    }
                    if (dx > 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0;
                        sname = 'swiperight';
                    }
                    if (dy > 0 && Math.abs(dx / dy) < 1) {
                        e.v0 = v0;
                        sname = 'swipedown';
                    }
                    if (dy < 0 && Math.abs(dx / dy) < 1) {
                        e.v0 = v0;
                        sname = 'swipeup';
                    }
                    if (evtObj.name === sname) {
                        evtObj.fire(e);
                    }
                }
            }
        }
    };
    ExternalEvent.touches['swipeleft'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swiperight'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipeup'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipedown'] = ExternalEvent.touches['swipe'];
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let Renderer = (() => {
        class Renderer {
            static add(module) {
                if (module.state !== 3) {
                    return;
                }
                if (!this.waitList.includes(module.name)) {
                    this.waitList.push(module.name);
                }
            }
            static remove(module) {
                let ind;
                if ((ind = this.waitList.indexOf(module.name)) !== -1) {
                    this.waitList.splice(ind, 1);
                }
            }
            static render() {
                for (let i = 0; i < this.waitList.length; i++) {
                    let m = nodom.ModuleFactory.get(this.waitList[i]);
                    if (!m || m.render()) {
                        this.waitList.shift();
                        i--;
                    }
                }
            }
        }
        Renderer.waitList = [];
        return Renderer;
    })();
    nodom.Renderer = Renderer;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let Router = (() => {
        class Router {
            static addPath(path) {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let i = 0; i < this.waitList.length; i++) {
                        let li = this.waitList[i];
                        if (li === path) {
                            return;
                        }
                        if (li.indexOf(path) === 0 && li.substr(path.length + 1, 1) === '/') {
                            return;
                        }
                    }
                    this.waitList.push(path);
                    this.load();
                });
            }
            static load() {
                return __awaiter(this, void 0, void 0, function* () {
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
            static start(path) {
                return __awaiter(this, void 0, void 0, function* () {
                    let diff = this.compare(this.currentPath, path);
                    let parentModule = diff[0] === null ? nodom.ModuleFactory.getMain() : nodom.ModuleFactory.get(diff[0].module);
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
                        module.unactive();
                    }
                    let showPath;
                    if (diff[2].length === 0) {
                        let route = diff[0];
                        let proute = diff[3];
                        if (route !== null) {
                            showPath = route.useParentPath && proute ? proute.fullPath : route.fullPath;
                            route.setLinkActive(true);
                            setRouteParamToModel(route);
                        }
                    }
                    else {
                        for (let i = 0; i < diff[2].length; i++) {
                            let route = diff[2][i];
                            if (!route || !route.module) {
                                continue;
                            }
                            if (!route.useParentPath) {
                                showPath = route.fullPath;
                            }
                            if (!parentModule.routerKey) {
                                throw new nodom.NodomError('notexist', nodom.TipWords.routeView);
                            }
                            let module = nodom.ModuleFactory.get(route.module);
                            if (!module) {
                                throw new nodom.NodomError('notexist1', nodom.TipWords.module, route.module);
                            }
                            module.containerParam = {
                                module: parentModule.name,
                                selector: "[key='" + parentModule.routerKey + "']"
                            };
                            module.addBeforeFirstRenderOperation(function () {
                                nodom.Util.empty(module.container);
                            });
                            route.setLinkActive(true);
                            delete module.container;
                            module.firstRender = true;
                            yield module.active();
                            setRouteParamToModel(route);
                            if (nodom.Util.isFunction(this.onDefaultEnter)) {
                                this.onDefaultEnter(module.model);
                            }
                            if (nodom.Util.isFunction(route.onEnter)) {
                                route.onEnter(module.model);
                            }
                            parentModule = module;
                        }
                    }
                    if (this.startStyle !== 2 && showPath) {
                        if (this.showPath && showPath.indexOf(this.showPath) === 0) {
                            history.replaceState(path, '', nodom.Application.routerPrePath + showPath);
                        }
                        else {
                            history.pushState(path, '', nodom.Application.routerPrePath + showPath);
                        }
                        this.showPath = showPath;
                    }
                    this.currentPath = path;
                    this.startStyle = 0;
                    function setRouteParamToModel(route) {
                        if (!route) {
                            return;
                        }
                        const module = nodom.ModuleFactory.get(route.module);
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
                });
            }
            static redirect(path) {
                this.addPath(path);
            }
            static addRoute(route, parent) {
                if (RouterTree.add(route, parent) === false) {
                    throw new nodom.NodomError("exist1", nodom.TipWords.route, route.path);
                }
                this.routes.set(route.id, route);
            }
            static getRoute(path, last) {
                if (!path) {
                    return null;
                }
                let routes = RouterTree.get(path);
                if (routes === null || routes.length === 0) {
                    return null;
                }
                if (last) {
                    return [routes.pop()];
                }
                else {
                    return routes;
                }
            }
            static compare(path1, path2) {
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
                let retArr1 = [];
                let retArr2 = [];
                let i = 0;
                for (i = 0; i < len; i++) {
                    if (arr1[i].id === arr2[i].id) {
                        if (JSON.stringify(arr1[i].data) !== JSON.stringify(arr2[i].data)) {
                            i++;
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if (arr1 !== null) {
                    for (let j = i; j < arr1.length; j++) {
                        retArr1.push(arr1[j]);
                    }
                }
                if (arr2 !== null) {
                    for (let j = i; j < arr2.length; j++) {
                        retArr2.push(arr2[j]);
                    }
                }
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
            static changeActive(module, path) {
                if (!module || !path || path === '') {
                    return;
                }
                let domArr = Router.activeDomMap.get(module.name);
                if (!domArr) {
                    return;
                }
                domArr.forEach((item) => {
                    let dom = module.renderTree.query(item);
                    if (!dom) {
                        return;
                    }
                    let domPath = dom.props['path'];
                    if (dom.exprProps.hasOwnProperty('active')) {
                        let model = module.modelFactory.get(dom.modelId);
                        if (!model) {
                            return;
                        }
                        let expr = module.expressionFactory.get(dom.exprProps['active'][0]);
                        if (!expr) {
                            return;
                        }
                        let field = expr.fields[0];
                        if (path === domPath || path.indexOf(domPath + '/') === 0) {
                            model.data[field] = true;
                        }
                        else {
                            model.data[field] = false;
                        }
                    }
                    else if (dom.props.hasOwnProperty('active')) {
                        if (path === domPath || path.indexOf(domPath + '/') === 0) {
                            dom.props['active'] = true;
                        }
                        else {
                            dom.props['active'] = false;
                        }
                    }
                });
            }
        }
        Router.loading = false;
        Router.routes = new Map();
        Router.currentPath = '';
        Router.showPath = '';
        Router.waitList = [];
        Router.currentIndex = 0;
        Router.moduleRouteMap = new Map();
        Router.startStyle = 0;
        Router.activeDomMap = new Map();
        return Router;
    })();
    nodom.Router = Router;
    class Route {
        constructor(config) {
            this.params = [];
            this.data = {};
            this.children = [];
            this.onEnter = config.onEnter;
            this.onLeave = config.onLeave;
            this.useParentPath = config.useParentPath;
            this.path = config.path;
            this.module = config.module instanceof nodom.Module ? config.module.name : config.module;
            if (config.path === '') {
                return;
            }
            this.id = nodom.Util.genId();
            if (!config.notAdd) {
                Router.addRoute(this, config.parent);
            }
            if (nodom.Util.isArray(config.routes)) {
                config.routes.forEach((item) => {
                    item.parent = this;
                    new Route(item);
                });
            }
        }
        setLinkActive(ancestor) {
            let path = this.fullPath;
            let module = nodom.ModuleFactory.get(this.module);
            if (module && module.containerParam) {
                let pm = nodom.ModuleFactory.get(module.containerParam['module']);
                if (pm) {
                    Router.changeActive(pm, path);
                }
            }
            if (ancestor && this.parent) {
                this.parent.setLinkActive(true);
            }
        }
    }
    nodom.Route = Route;
    class RouterTree {
        static add(route, parent) {
            if (!this.root) {
                this.root = new Route({ path: "", notAdd: true });
            }
            let pathArr = route.path.split('/');
            let node = parent || this.root;
            let param = [];
            let paramIndex = -1;
            let prePath = '';
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    pathArr.splice(i--, 1);
                    continue;
                }
                if (v.startsWith(':')) {
                    if (param.length === 0) {
                        paramIndex = i;
                    }
                    param.push(v.substr(1));
                }
                else {
                    paramIndex = -1;
                    param = [];
                    route.path = v;
                    let j = 0;
                    for (; j < node.children.length; j++) {
                        let r = node.children[j];
                        if (r.path === v) {
                            node = r;
                            break;
                        }
                    }
                    if (j === node.children.length) {
                        if (prePath !== '') {
                            node.children.push(new Route({ path: prePath, notAdd: true }));
                            node = node.children[node.children.length - 1];
                        }
                        prePath = v;
                    }
                }
                if (paramIndex === -1) {
                    route.params = [];
                }
                else {
                    route.params = param;
                }
            }
            if (node !== undefined && node !== route) {
                route.path = prePath;
                node.children.push(route);
            }
            return true;
        }
        static get(path) {
            if (!this.root) {
                throw new nodom.NodomError("notexist", nodom.TipWords.root);
            }
            let pathArr = path.split('/');
            let node = this.root;
            let paramIndex = 0;
            let retArr = [];
            let fullPath = '';
            let showPath = '';
            let preNode = this.root;
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    continue;
                }
                let find = false;
                for (let j = 0; j < node.children.length; j++) {
                    if (node.children[j].path === v) {
                        if (preNode !== this.root) {
                            preNode.fullPath = fullPath;
                            preNode.data = node.data;
                            retArr.push(preNode);
                        }
                        node = node.children[j];
                        node.data = {};
                        preNode = node;
                        find = true;
                        break;
                    }
                }
                fullPath += '/' + v;
                if (!find) {
                    if (paramIndex < node.params.length) {
                        node.data[node.params[paramIndex++]] = v;
                    }
                }
            }
            if (node !== this.root) {
                node.fullPath = fullPath;
                retArr.push(node);
            }
            return retArr;
        }
    }
    window.addEventListener('popstate', function (e) {
        const state = history.state;
        if (!state) {
            return;
        }
        Router.startStyle = 2;
        Router.addPath(state);
    });
    nodom.DirectiveManager.addType('route', {
        init: (directive, dom, module) => {
            let value = directive.value;
            if (nodom.Util.isEmpty(value)) {
                return;
            }
            if (dom.tagName === 'A') {
                dom.props['href'] = 'javascript:void(0)';
            }
            if (value && value.substr(0, 2) === '{{' && value.substr(value.length - 2, 2) === '}}') {
                let expr = new nodom.Expression(value.substring(2, value.length - 2));
                dom.exprProps['path'] = expr;
                directive.value = expr;
            }
            else {
                dom.props['path'] = value;
            }
            dom.addEvent(new nodom.NodomEvent('click', '', (dom, model, module, e) => __awaiter(this, void 0, void 0, function* () {
                let path = dom.props['path'];
                if (nodom.Util.isEmpty(path)) {
                    return;
                }
                Router.addPath(path);
            })));
        },
        handle: (directive, dom, module, parent) => {
            if (dom.props.hasOwnProperty('active')) {
                let domArr = Router.activeDomMap.get(module.name);
                if (!domArr) {
                    Router.activeDomMap.set(module.name, [dom.key]);
                }
                else {
                    if (!domArr.includes(dom.key)) {
                        domArr.push(dom.key);
                    }
                }
            }
            let path = dom.props['path'];
            if (path === Router.currentPath) {
                return;
            }
            if (dom.props.hasOwnProperty('active') && dom.props['active'] !== 'false' && (!Router.currentPath || path.indexOf(Router.currentPath) === 0)) {
                Router.addPath(path);
            }
        }
    });
    nodom.DirectiveManager.addType('router', {
        init: (directive, dom, module) => {
            module.routerKey = dom.key;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let Scheduler = (() => {
        class Scheduler {
            static dispatch() {
                Scheduler.tasks.forEach((item) => {
                    if (nodom.Util.isFunction(item.func)) {
                        if (item.thiser) {
                            item.func.call(item.thiser);
                        }
                        else {
                            item.func();
                        }
                    }
                });
            }
            static start() {
                Scheduler.dispatch();
                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(Scheduler.start);
                }
                else {
                    window.setTimeout(Scheduler.start, nodom.Application.renderTick);
                }
            }
            static addTask(foo, thiser) {
                if (!nodom.Util.isFunction(foo)) {
                    throw new nodom.NodomError("invoke", "Scheduler.addTask", "0", "function");
                }
                Scheduler.tasks.push({ func: foo, thiser: thiser });
            }
            static removeTask(foo) {
                if (!nodom.Util.isFunction(foo)) {
                    throw new nodom.NodomError("invoke", "Scheduler.removeTask", "0", "function");
                }
                let ind = -1;
                if ((ind = Scheduler.tasks.indexOf(foo)) !== -1) {
                    Scheduler.tasks.splice(ind, 1);
                }
            }
        }
        Scheduler.tasks = [];
        return Scheduler;
    })();
    nodom.Scheduler = Scheduler;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    class Serializer {
        static serialize(module) {
            let props = ['virtualDom', 'expressionFactory'];
            let jsonStr = '[';
            props.forEach((p, i) => {
                addClsName(module[p]);
                let s = JSON.stringify(module[p]);
                jsonStr += s;
                if (i < props.length - 1) {
                    jsonStr += ',';
                }
                else {
                    jsonStr += ']';
                }
            });
            return jsonStr;
            function addClsName(obj) {
                if (typeof obj !== 'object') {
                    return;
                }
                obj.className = obj.constructor.name;
                nodom.Util.getOwnProps(obj).forEach((item) => {
                    if (nodom.Util.isArray(obj[item])) {
                        if (obj[item].length === 0) {
                            delete obj[item];
                        }
                        else {
                            obj[item].forEach((item1) => {
                                addClsName(item1);
                            });
                        }
                    }
                    else if (typeof obj[item] === 'object') {
                        if (nodom.Util.isEmpty(obj[item])) {
                            delete obj[item];
                        }
                        else {
                            addClsName(obj[item]);
                        }
                    }
                });
            }
        }
        static deserialize(jsonStr, module) {
            let jsonArr = JSON.parse(jsonStr);
            let arr = [];
            let vdom;
            jsonArr.forEach((item) => {
                arr.push(handleCls(item));
            });
            return arr;
            function handleCls(jsonObj) {
                if (!nodom.Util.isObject(jsonObj)) {
                    return jsonObj;
                }
                if (jsonObj.moduleName) {
                    jsonObj.moduleName = module.name;
                }
                let retObj;
                if (jsonObj.hasOwnProperty('className')) {
                    const cls = jsonObj['className'];
                    let param = [];
                    switch (cls) {
                        case 'Directive':
                            param = [jsonObj['type'], jsonObj['value'], vdom, module];
                            break;
                        case 'Event':
                            param = [jsonObj['name']];
                            break;
                    }
                    let clazz = eval(cls);
                    if (cls === 'Element') {
                        vdom = retObj;
                    }
                }
                else {
                    retObj = {};
                }
                let objArr = [];
                let arrArr = [];
                nodom.Util.getOwnProps(jsonObj).forEach((item) => {
                    if (nodom.Util.isObject(jsonObj[item])) {
                        objArr.push(item);
                    }
                    else if (nodom.Util.isArray(jsonObj[item])) {
                        arrArr.push(item);
                    }
                    else {
                        if (item !== 'className') {
                            retObj[item] = jsonObj[item];
                        }
                    }
                });
                objArr.forEach((item) => {
                    retObj[item] = handleCls(jsonObj[item]);
                });
                arrArr.forEach(item => {
                    retObj[item] = [];
                    jsonObj[item].forEach((item1) => {
                        retObj[item].push(handleCls(item1));
                    });
                });
                return retObj;
            }
        }
    }
    nodom.Serializer = Serializer;
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    nodom.DirectiveManager.addType('model', {
        prio: 1,
        init: (directive, dom) => {
            let value = directive.value;
            if (value.startsWith('$$')) {
                directive.extra = 1;
                value = value.substr(2);
            }
            if (nodom.Util.isString(value)) {
                let arr = new Array();
                value.split('.').forEach((item) => {
                    let ind1 = -1, ind2 = -1;
                    if ((ind1 = item.indexOf('[')) !== -1 && (ind2 = item.indexOf(']')) !== -1) {
                        let fn = item.substr(0, ind1);
                        let index = item.substring(ind1 + 1, ind2);
                        arr.push(fn + ',' + index);
                    }
                    else {
                        arr.push(item);
                    }
                });
                directive.value = arr;
            }
        },
        handle: (directive, dom, module, parent) => {
            let startIndex = 0;
            let data;
            if (directive.extra === 1) {
                data = module.model.data[directive.value[0]];
                startIndex = 1;
            }
            else if (dom.modelId) {
                let model = module.modelFactory.get(dom.modelId);
                if (model) {
                    data = model.data;
                }
            }
            for (let i = startIndex; i < directive.value.length; i++) {
                let item = directive.value[i];
                if (!data) {
                    return;
                }
                if (item.indexOf(',') !== -1) {
                    let a = item.split(',');
                    data = data[a[0]][parseInt(a[1])];
                }
                else {
                    data = data[item];
                }
            }
            if (data) {
                dom.modelId = data.$modelId;
            }
            return true;
        }
    });
    nodom.DirectiveManager.addType('repeat', {
        prio: 2,
        init: (directive, dom) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let ind;
            let modelName;
            if ((ind = value.indexOf('|')) !== -1) {
                modelName = value.substr(0, ind).trim();
                directive.filter = new nodom.Filter(value.substr(ind + 1));
            }
            else {
                modelName = value;
            }
            if (!dom.hasDirective('model')) {
                dom.directives.push(new nodom.Directive('model', modelName, dom));
            }
            if (modelName.startsWith('$$')) {
                modelName = modelName.substr(2);
            }
            directive.value = modelName;
        },
        handle: (directive, dom, module, parent) => {
            const modelFac = module.modelFactory;
            let rows = modelFac.get(dom.modelId).data;
            if (rows === undefined || rows.length === 0) {
                dom.dontRender = true;
                return true;
            }
            if (directive.filter !== undefined) {
                rows = directive.filter.exec(rows, module);
            }
            let chds = [];
            let key = dom.key;
            dom.removeDirectives(['model', 'repeat']);
            for (let i = 0; i < rows.length; i++) {
                let node = dom.clone();
                node.modelId = rows[i].$modelId;
                setKey(node, key, i);
                rows[i].$index = i;
                chds.push(node);
            }
            if (chds.length > 0) {
                for (let i = 0, len = parent.children.length; i < len; i++) {
                    if (parent.children[i] === dom) {
                        chds = [i + 1, 0].concat(chds);
                        Array.prototype.splice.apply(parent.children, chds);
                        break;
                    }
                }
            }
            dom.dontRender = true;
            return false;
            function setKey(node, key, id) {
                node.key = key + '_' + id;
                node.children.forEach((dom) => {
                    setKey(dom, dom.key, id);
                });
            }
        }
    });
    nodom.DirectiveManager.addType('if', {
        init: (directive, dom) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let expr = new nodom.Expression(value);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            let indif = -1, indelse = -1;
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === dom) {
                    indif = i;
                }
                else if (indelse === -1 && parent.children[i].hasDirective('else')) {
                    indelse = i;
                }
                if (i !== indif && indif !== -1 && indelse === -1 && parent.children[i].tagName !== undefined) {
                    indelse = -2;
                }
                if (indif !== -1 && indelse !== -1) {
                    break;
                }
            }
            if (v && v !== 'false') {
                let ind = 0;
                if (indelse > 0) {
                    parent.children[indelse].dontRender = true;
                }
            }
            else {
                dom.dontRender = true;
                if (indelse > 0) {
                    parent.children[indelse].dontRender = false;
                }
            }
            return true;
        }
    });
    nodom.DirectiveManager.addType('else', {
        name: 'else',
        init: (directive, dom) => {
            return;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
    nodom.DirectiveManager.addType('show', {
        init: (directive, dom) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-show");
            }
            let expr = new nodom.Expression(value);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            if (v && v !== 'false') {
                dom.dontRender = false;
            }
            else {
                dom.dontRender = true;
            }
        }
    });
    nodom.DirectiveManager.addType('class', {
        init: (directive, dom) => {
            let obj = eval('(' + directive.value + ')');
            if (!nodom.Util.isObject(obj)) {
                return;
            }
            let robj = {};
            nodom.Util.getOwnProps(obj).forEach(function (key) {
                if (nodom.Util.isString(obj[key])) {
                    robj[key] = new nodom.Expression(obj[key]);
                }
                else {
                    robj[key] = obj[key];
                }
            });
            directive.value = robj;
        },
        handle: (directive, dom, module, parent) => {
            let obj = directive.value;
            let clsArr = [];
            let cls = dom.props['class'];
            let model = module.modelFactory.get(dom.modelId);
            if (nodom.Util.isString(cls) && !nodom.Util.isEmpty(cls)) {
                clsArr = cls.trim().split(/\s+/);
            }
            nodom.Util.getOwnProps(obj).forEach(function (key) {
                let r = obj[key];
                if (r instanceof nodom.Expression) {
                    r = r.val(model);
                }
                let ind = clsArr.indexOf(key);
                if (!r || r === 'false') {
                    if (ind !== -1) {
                        clsArr.splice(ind, 1);
                    }
                }
                else if (ind === -1) {
                    clsArr.push(key);
                }
            });
            dom.props['class'] = clsArr.join(' ');
        }
    });
    nodom.DirectiveManager.addType('field', {
        init: (directive, dom) => {
            dom.props['name'] = directive.value;
            let eventName = dom.props['tagName'] === 'input' && ['text', 'checkbox', 'radio'].includes(dom.props['type']) ? 'input' : 'change';
            dom.addEvent(new nodom.NodomEvent(eventName, '', function (dom, model, module, e, el) {
                if (!el) {
                    return;
                }
                let type = dom.props['type'];
                let field = dom.getDirective('field').value;
                let v = el.value;
                if (type === 'checkbox') {
                    if (dom.props['yes-value'] == v) {
                        v = dom.props['no-value'];
                    }
                    else {
                        v = dom.props['yes-value'];
                    }
                }
                else if (type === 'radio') {
                    if (!el.checked) {
                        v = undefined;
                    }
                }
                model.data[field] = v;
                if (type !== 'radio') {
                    dom.props['value'] = v;
                    el.value = v;
                }
            }));
        },
        handle: (directive, dom, module, parent) => {
            const type = dom.props['type'];
            const tgname = dom.tagName.toLowerCase();
            const model = module.modelFactory.get(dom.modelId);
            const dataValue = model.data[directive.value];
            let value = dom.props['value'];
            if (type === 'radio') {
                if (dataValue + '' === value) {
                    dom.assets.set('checked', true);
                }
                else {
                    dom.assets.set('checked', false);
                }
            }
            else if (type === 'checkbox') {
                let yv = dom.props['yes-value'];
                if (dataValue + '' === yv) {
                    dom.props['value'] = yv;
                    dom.assets.set('checked', true);
                }
                else {
                    dom.props['value'] = dom.props['no-value'];
                    dom.assets.set('checked', false);
                }
            }
            else if (tgname === 'select') {
                dom.props['value'] = dataValue;
                dom.assets.set('value', dataValue);
            }
            else {
                dom.assets.set('value', value);
            }
        }
    });
    nodom.DirectiveManager.addType('validity', {
        init: (directive, dom) => {
            let ind, fn, method;
            let value = directive.value;
            if ((ind = value.indexOf('|')) !== -1) {
                fn = value.substr(0, ind);
                method = value.substr(ind + 1);
            }
            else {
                fn = value;
            }
            directive.value = fn;
            directive.params = {
                enabled: false
            };
            if (method) {
                directive.params.method = method;
            }
            setTimeout(() => {
                if (dom.children.length === 0) {
                    let vd1 = new nodom.Element();
                    vd1.textContent = '   ';
                    dom.children.push(vd1);
                }
                else {
                    dom.children.forEach((item) => {
                        if (item.children.length === 0) {
                            let vd1 = new nodom.Element();
                            vd1.textContent = '   ';
                            item.children.push(vd1);
                        }
                    });
                }
            }, 0);
        },
        handle: (directive, dom, module, parent) => {
            setTimeout(() => {
                const el = module.container.querySelector("[name='" + directive.value + "']");
                if (!directive.extra) {
                    directive.extra = true;
                    el.addEventListener('focus', function () {
                        setTimeout(() => { directive.params.enabled = true; }, 0);
                    });
                    el.addEventListener('blur', function () {
                        nodom.Renderer.add(module);
                    });
                }
            }, 0);
            if (!directive.params.enabled) {
                dom.dontRender = true;
                return;
            }
            const el = module.container.querySelector("[name='" + directive.value + "']");
            if (!el) {
                return;
            }
            let chds = [];
            dom.children.forEach((item) => {
                if (item.tagName !== undefined && item.props.hasOwnProperty('rel')) {
                    chds.push(item);
                }
            });
            let resultArr = [];
            if (directive.params.method) {
                const foo = module.methodFactory.get(directive.params.method);
                if (nodom.Util.isFunction(foo)) {
                    let r = foo.call(module.model, el.value);
                    if (!r) {
                        resultArr.push('custom');
                    }
                }
            }
            let vld = el.validity;
            if (!vld.valid) {
                for (var o in vld) {
                    if (vld[o] === true) {
                        resultArr.push(o);
                    }
                }
            }
            if (resultArr.length > 0) {
                let vn = handle(resultArr);
                if (chds.length === 0) {
                    setTip(dom, vn, el);
                }
                else {
                    for (let i = 0; i < chds.length; i++) {
                        let rel = chds[i].props['rel'];
                        if (rel === vn) {
                            setTip(chds[i], vn, el);
                        }
                        else {
                            chds[i].dontRender = true;
                        }
                    }
                }
            }
            else {
                dom.dontRender = true;
            }
            function setTip(vd, vn, el) {
                let text = vd.children[0].textContent.trim();
                if (text === '') {
                    text = nodom.Util.compileStr(nodom.FormMsgs[vn], el.getAttribute(vn));
                }
                vd.children[0].textContent = text;
            }
            function handle(arr) {
                for (var i = 0; i < arr.length; i++) {
                    switch (arr[i]) {
                        case 'valueMissing':
                            return 'required';
                        case 'typeMismatch':
                            return 'type';
                        case 'tooLong':
                            return 'maxLength';
                        case 'tooShort':
                            return 'minLength';
                        case 'rangeUnderflow':
                            return 'min';
                        case 'rangeOverflow':
                            return 'max';
                        case 'patternMismatch':
                            return 'pattern';
                        default:
                            return arr[i];
                    }
                }
            }
        }
    });
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    nodom.FilterManager.addType('date', (value, param) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        param = param.substr(1, param.length - 2);
        return nodom.Util.formatDate(value, param);
    });
    nodom.FilterManager.addType('currency', (value, sign) => {
        if (isNaN(value)) {
            return '';
        }
        sign = sign || '¥';
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        return sign + ((value * 100 + 0.5 | 0) / 100);
    });
    nodom.FilterManager.addType('number', (value, param) => {
        let digits = param || 0;
        if (isNaN(value) || digits < 0) {
            return '';
        }
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        let x = 1;
        for (let i = 0; i < digits; i++) {
            x *= 10;
        }
        return ((value * x + 0.5) | 0) / x;
    });
    nodom.FilterManager.addType('tolowercase', (value) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        if (!nodom.Util.isString(value) || nodom.Util.isEmpty(value)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' tolowercase', '0', 'string');
        }
        return value.toLowerCase();
    });
    nodom.FilterManager.addType('touppercase', (value) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        if (!nodom.Util.isString(value) || nodom.Util.isEmpty(value)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' touppercase', '0', 'string');
        }
        return value.toUpperCase();
    });
    nodom.FilterManager.addType('orderby', function () {
        let args = arguments;
        let arr = args[0];
        let field = args[1];
        let odr = args[2] || 'asc';
        if (!nodom.Util.isArray(arr)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' orderby', '0', 'array');
        }
        let ret = arr.concat([]);
        if (field && nodom.Util.isObject(arr[0])) {
            if (odr === 'asc') {
                ret.sort((a, b) => a[field] >= b[field] ? 1 : -1);
            }
            else {
                ret.sort((a, b) => a[field] <= b[field] ? 1 : -1);
            }
        }
        else {
            if (odr === 'asc') {
                ret.sort((a, b) => a >= b ? 1 : -1);
            }
            else {
                ret.sort((a, b) => a <= b ? 1 : -1);
            }
        }
        return ret;
    });
    nodom.FilterManager.addType('select', function () {
        if (!nodom.Util.isArray(arguments[0])) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' filter', '0', 'array');
        }
        let params = new Array();
        for (let i = 0; i < arguments.length; i++) {
            params.push(arguments[i]);
        }
        let handler = {
            odd: function () {
                let arr = arguments[0];
                let ret = [];
                for (let i = 0; i < arr.length; i++) {
                    if (i % 2 === 1) {
                        ret.push(arr[i]);
                    }
                }
                return ret;
            },
            even: function () {
                let arr = arguments[0];
                let ret = [];
                for (let i = 0; i < arr.length; i++) {
                    if (i % 2 === 0) {
                        ret.push(arr[i]);
                    }
                }
                return ret;
            },
            range: function () {
                let args = arguments;
                let arr = args[0];
                let ret = [];
                let first = args[1];
                let last = args[2];
                if (isNaN(first)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                if (!nodom.Util.isNumber(first)) {
                    first = parseInt(first);
                }
                if (isNaN(last)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                if (!nodom.Util.isNumber(last)) {
                    last = parseInt(last);
                }
                if (first > last) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                return arr.slice(first, last + 1);
            },
            index: function () {
                let args = arguments;
                let arr = args[0];
                if (!nodom.Util.isArray(args[0])) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter index');
                }
                let ret = [];
                if (arr.length > 0) {
                    for (let i = 1; i < args.length; i++) {
                        if (isNaN(args[i])) {
                            continue;
                        }
                        let k = parseInt(args[i]);
                        if (k < arr.length) {
                            ret.push(arr[k]);
                        }
                    }
                }
                return ret;
            },
            func: function (arr, param) {
                if (!nodom.Util.isArray(arr) || nodom.Util.isEmpty(param)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter func');
                }
                let foo = this.methodFactory.get(param);
                if (nodom.Util.isFunction(foo)) {
                    return foo(arr);
                }
                return arr;
            },
            value: function (arr, param) {
                if (!nodom.Util.isArray(arr) || nodom.Util.isEmpty(param)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter value');
                }
                if (nodom.Util.isObject(param)) {
                    let keys = nodom.Util.getOwnProps(param);
                    return arr.filter(function (item) {
                        for (let i = 0; i < keys.length; i++) {
                            let v = item[keys[i]];
                            let v1 = param[keys[i]];
                            if (v === undefined || v !== v1 || typeof v === 'string' && v.indexOf(v1) === -1) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                else {
                    return arr.filter(function (item) {
                        let props = nodom.Util.getOwnProps(item);
                        for (let i = 0; i < props.length; i++) {
                            let v = item[props[i]];
                            if (nodom.Util.isString(v) && v.indexOf(param) !== -1) {
                                return item;
                            }
                        }
                    });
                }
            }
        };
        let type;
        if (nodom.Util.isString(params[1])) {
            type = params[1].trim();
            if (handler.hasOwnProperty(type)) {
                params.splice(1, 1);
            }
            else {
                type = 'value';
            }
        }
        else {
            type = 'value';
        }
        if (type === 'range' || type === 'index' || type === 'func') {
            if (params.length < 2) {
                throw new nodom.NodomError('paramException', nodom.TipWords.filter);
            }
        }
        return nodom.Util.apply(handler[type], this, params);
    });
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    nodom.TipWords = {
        application: "应用",
        system: "系统",
        module: "模块",
        moduleClass: '模块类',
        model: "模型",
        directive: "指令",
        directiveType: "指令类型",
        expression: "表达式",
        event: "事件",
        method: "方法",
        filter: "过滤器",
        filterType: "过滤器类型",
        data: "数据",
        dataItem: '数据项',
        route: '路由',
        routeView: '路由容器',
        plugin: '插件',
        resource: '资源',
        root: '根',
        element: '元素'
    };
    nodom.ErrorMsgs = {
        unknown: "未知错误",
        paramException: "{0}'{1}'方法参数错误，请参考api",
        invoke: "{0}方法调用参数{1}必须为{2}",
        invoke1: "{0}方法调用参数{1}必须为{2}或{3}",
        invoke2: "{0}方法调用参数{1}或{2}必须为{3}",
        invoke3: "{0}方法调用参数{1}不能为空",
        exist: "{0}已存在",
        exist1: "{0}'{1}'已存在",
        notexist: "{0}不存在",
        notexist1: "{0}'{1}'不存在",
        notupd: "{0}不可修改",
        notremove: "{0}不可删除",
        notremove1: "{0}{1}不可删除",
        namedinvalid: "{0}{1}命名错误，请参考用户手册对应命名规范",
        initial: "{0}初始化参数错误",
        jsonparse: "JSON解析错误",
        timeout: "请求超时",
        config: "{0}配置参数错误",
        config1: "{0}配置参数'{1}'错误"
    };
    nodom.FormMsgs = {
        type: "请输入有效的{0}",
        unknown: "输入错误",
        required: "不能为空",
        min: "最小输入值为{0}",
        max: "最大输入值为{0}"
    };
})(nodom || (nodom = {}));
var nodom;
(function (nodom) {
    let DefineElementManager = (() => {
        class DefineElementManager {
            static add(name, cfg) {
                if (this.elementMap.has(name)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.element, name);
                }
                this.elementMap.set(name, cfg);
            }
            static get(tagName) {
                return this.elementMap.get(tagName);
            }
            static beforeRender(module, dom) {
                let de = dom.defineElement;
                if (de && de.beforeRender) {
                    de.beforeRender(module, dom);
                }
            }
            static afterRender(module, dom) {
                let de = dom.defineElement;
                if (de && de.afterRender) {
                    de.afterRender(module, dom);
                }
            }
        }
        DefineElementManager.elementMap = new Map();
        return DefineElementManager;
    })();
    nodom.DefineElementManager = DefineElementManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=nodom.js.map