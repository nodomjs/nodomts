//# sourceMappingURL=nodom.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * @description 基础服务库
     * @author      yanglei
     * @since       1.0.0
     * @create      2016-09-28
     */
    class Util {
        //唯一主键
        static genId() {
            if (this.generatedId === undefined) {
                this.generatedId = 1;
            }
            return this.generatedId++;
        }
        /******对象相关******/
        /**
         * 对象复制
         * @param srcObj    源对象
         * @param expKey    不复制的键正则表达式或名
         * @returns         复制的对象
         */
        clone(srcObj, expKey) {
            let map = new WeakMap();
            let src = this;
            let retObj = clone(srcObj);
            map = null;
            return retObj;
            /**
             * clone对象
             * @param src   待clone对象
             * @returns     克隆后的对象
             */
            function clone(src) {
                let dst;
                if (this.isObject(src)) {
                    dst = new Object();
                    //把对象加入map，如果后面有新克隆对象，则用新克隆对象进行覆盖
                    map.set(src, dst);
                    Object.getOwnPropertyNames(src).forEach((prop) => {
                        //不克隆的键
                        if (expKey) {
                            if (expKey.constructor === RegExp && expKey.test(prop) //正则表达式匹配的键不复制
                                || expKey.constructor === String && expKey === prop //被排除的键不复制
                            ) {
                                return;
                            }
                        }
                        //数组或对象继续克隆
                        if (this.isObject(src[prop]) || this.isArray(src[prop])) {
                            let co = null;
                            if (!map.has(src[prop])) { //clone新对象
                                co = clone(src[prop]);
                                //存储已克隆对象，避免重复创建或对象相互引用带来的溢出
                                map.set(src[prop], co);
                            }
                            else { //从map中获取对象
                                co = map.get(src[prop]);
                            }
                            dst[prop] = co;
                        }
                        else { //直接复制
                            dst[prop] = src[prop];
                        }
                    });
                }
                else if (this.isArray(src)) {
                    dst = new Array();
                    //把对象加入map，如果后面有新克隆对象，则用新克隆对象进行覆盖
                    map.set(src, dst);
                    src.forEach(function (item, i) {
                        if (this.isObject(item) || this.isArray(item)) {
                            dst[i] = clone(item);
                        }
                        else { //直接复制
                            dst[i] = item;
                        }
                    });
                }
                return dst;
            }
        }
        /**
         * 合并多个对象并返回
         * @param   参数数组
         * @returns 返回对象
         */
        static merge() {
            for (let i = 0; i < arguments.length; i++) {
                if (!this.isObject(arguments[i])) {
                    throw new nodom.NodomError('invoke', 'this.merge', i + '', 'object');
                }
            }
            let retObj = Object.assign.apply(null, arguments);
            subObj(retObj);
            return retObj;
            //处理子对象
            function subObj(retObj) {
                for (let o in retObj) {
                    if (this.isObject(retObj[o]) || this.isArray(retObj[o])) { //对象或数组
                        retObj[o] = retObj[o].clone();
                    }
                }
            }
        }
        /**
         * 把obj2对象所有属性赋值给obj1
         */
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
        /**
         * 获取对象自有属性
         */
        static getOwnProps(obj) {
            if (!obj) {
                return [];
            }
            return Object.getOwnPropertyNames(obj);
        }
        /**************对象判断相关************/
        /**
         * 是否为函数
         * @param foo   检查的对象
         * @returns     true/false
         */
        static isFunction(foo) {
            return foo !== undefined && foo !== null && foo.constructor === Function;
        }
        /**
         * 是否为数组
         * @param obj   检查的对象
         * @returns     true/false
         */
        static isArray(obj) {
            return Array.isArray(obj);
        }
        /**
         * 是否为对象
         * @param obj   检查的对象
         * @returns true/false
         */
        static isObject(obj) {
            return obj !== null && obj !== undefined && obj.constructor === Object;
        }
        /**
         * 判断是否为整数
         * @param v 检查的值
         * @returns true/false
         */
        static isInt(v) {
            return Number.isInteger(v);
        }
        /**
         * 判断是否为number
         * @param v 检查的值
         * @returns true/false
         */
        static isNumber(v) {
            return typeof v === 'number';
        }
        /**
         * 判断是否为boolean
         * @param v 检查的值
         * @returns true/false
         */
        static isBoolean(v) {
            return typeof v === 'boolean';
        }
        /**
         * 判断是否为字符串
         * @param v 检查的值
         * @returns true/false
         */
        static isString(v) {
            return typeof v === 'string';
        }
        /**
         * 是否为数字串
         * @param v 检查的值
         * @returns true/false
         */
        static isNumberString(v) {
            return /^\d+\.?\d*$/.test(v);
        }
        /**
         * 对象/字符串是否为空
         * @param obj   检查的对象
         * @returns     true/false
         */
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
        /***********************对象相关******************/
        /**
         * 找到符合符合属性值条件的对象（深度遍历）
         * @param obj       待查询对象
         * @param props     属性值对象
         * @param one       是否满足一个条件就可以，默认false
         */
        static findObjByProps(obj, props, one) {
            if (!this.isObject(obj)) {
                throw new nodom.NodomError('invoke', 'this.findObjByProps', '0', 'Object');
            }
            //默认false
            one = one || false;
            let ps = this.getOwnProps(props);
            let find = false;
            if (one === false) { //所有条件都满足
                find = true;
                for (let i = 0; i < ps.length; i++) {
                    let p = ps[i];
                    if (obj[p] !== props[p]) {
                        find = false;
                        break;
                    }
                }
            }
            else { //一个条件满足
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
            //子节点查找
            for (let p in obj) {
                let o = obj[p];
                if (o !== null) {
                    if (this.isObject(o)) { //子对象
                        //递归查找
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
                    else if (this.isArray(o)) { //数组对象
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
        /**********dom相关***********/
        /**
         * 获取dom节点
         * @param selector  选择器
         * @param findAll   是否获取所有，默认为false
         * @param pview     父html element
         * @returns         html element/null 或 nodelist或[]
         */
        static get(selector, findAll, pview) {
            pview = pview || document;
            if (findAll === true) {
                return pview.querySelectorAll(selector);
            }
            return pview.querySelector(selector);
        }
        /**
         * 追加子节点
         * @param el    父element
         * @param dom   要添加的dom节点或dom串
         */
        static append(el, dom) {
            if (this.isNode(dom)) {
                el.appendChild(dom);
            }
            else if (this.isString(dom)) {
                let div = this.newEl('div');
                div.innerHTML = dom;
            }
        }
        /**
         * 是否为element
         * @param el    传入的对象
         * @returns     true/false
         */
        static isEl(el) {
            return el instanceof HTMLElement;
        }
        /**
         * 是否为node
         * @param node 传入的对象
         * @returns true/false
         */
        static isNode(node) {
            return node !== undefined && node !== null && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
        }
        /**
         * 获取translate3d 数据
         * @param view  element
         */
        static getTranslate(el) {
            let tr = el.style.transform;
            let arr;
            if (tr && tr !== 'none') {
                arr = [];
                let vs = tr.substring(tr.indexOf('(') + 1, tr.indexOf(')') - 1);
                let va = vs.split(',');
                for (let i = 0; i < va.length; i++) {
                    arr.push(parseInt(va[i]));
                }
            }
            if (arr) {
                return arr;
            }
            return [0, 0, 0];
        }
        /**
         * 新建dom
         * @param tagName   标签名
         * @param config    属性集合
         * @param text      innerText
         * @returns         新建的elelment
         */
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
        /**
         * 新建svg element
         * @param tagName   标签名
         * @returns         svg element
         */
        static newSvgEl(tagName) {
            return document.createElementNS("http://www.w3.org/2000/svg", tagName);
        }
        /**
         * 把srcNode替换为nodes
         * @param srcNode       源dom
         * @param nodes         替换的dom或dom数组
         */
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
        /**
         * 在srcNode后面插入newNode,如果srcNode无效，则插入到第一个
         * @param newNode   新节点或数组
         * @param oldNode   旧节点
         */
        static insertAfter(newNode, srcNode, pNode) {
            if (!this.isNode(newNode)) {
                throw new nodom.NodomError('invoke', 'this.insertAfter', '0', 'Node');
            }
            if (!this.isNode(srcNode) && !this.isNode(pNode)) {
                throw new nodom.NodomError('invoke2', 'this.insertAfter', '1', '2', 'Node');
            }
            let bNode = null;
            //如果srcNode不存在，则添加在第一个位置
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
        /**
         * 清空子节点
         * @param el
         */
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
        /**
         * 删除节点
         * @param node html node
         */
        static remove(node) {
            const me = this;
            if (!me.isNode(node)) {
                throw new nodom.NodomError('invoke', 'this.remove', '0', 'Node');
            }
            if (node.parentNode !== null) {
                node.parentNode.removeChild(node);
            }
        }
        /**
         * 获取／设置属性
         * @param el    element
         * @param param 属性名，设置多个属性时用对象
         * @param value 属性值，获取属性时不需要设置
         * @returns     属性值
         */
        static attr(el, param, value) {
            const me = this;
            if (!me.isEl(el)) {
                throw new nodom.NodomError('invoke', 'this.attr', '0', 'Element');
            }
            if (this.isEmpty(param)) {
                throw new nodom.NodomError('invoke', 'this.attr', '1', 'string', 'object');
            }
            if (value === undefined || value === null) {
                if (this.isObject(param)) { //设置多个属性
                    this.getOwnProps(param).forEach(function (k) {
                        if (k === 'value') {
                            el[k] = param[k];
                        }
                        else {
                            el.setAttribute(k, param[k]);
                        }
                    });
                }
                else if (this.isString(param)) { //获取属性
                    if (param === 'value') {
                        return param[value];
                    }
                    return el.getAttribute(param);
                }
            }
            else { //设置属性
                if (param === 'value') {
                    el[param] = value;
                }
                else {
                    el.setAttribute(param, value);
                }
            }
        }
        /**
         * 获取或设置宽度
         * @param el        elment
         * @param value     如果为false，则获取外部width(含padding)，否则获取内部width，如果为数字，则设置width=value + px
         */
        static width(el, value) {
            if (!this.isEl(el)) {
                throw new nodom.NodomError('invoke', 'nodom.width', '0', 'Element');
            }
            if (this.isNumber(value)) {
                el.style.width = value + 'px';
            }
            else {
                let compStyle;
                //ie 9+ firefox chrome safari
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
        /**
         * 获取或设置高度
         * @param el        elment
         * @param value     如果为false，则获取外部height(含padding)，否则获取内部height，如果为数字，则设置height=value + px
         */
        static height(el, value) {
            if (!this.isEl(el)) {
                throw new nodom.NodomError('invoke', 'this.height', '0', 'Element');
            }
            if (this.isNumber(value)) {
                el.style.height = value + 'px';
            }
            else {
                let compStyle;
                //ie 9+ firefox chrome safari
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
        /**
         * 添加class
         * @param el    html element
         * @param cls   类名
         */
        static addClass(el, cls) {
            if (!this.isEl(el)) {
                throw new nodom.NodomError('invoke', 'this.addClass', '0', 'Element');
            }
            if (this.isEmpty(cls)) {
                throw new nodom.NodomError('invoke', 'this.addClass', '1', 'string');
            }
            let cn = el.className.trim();
            if (this.isEmpty(cn)) {
                el.className = cls;
            }
            else {
                let arr = cn.split(/\s+/);
                //遍历class数组，如果存在cls，则不操作
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === cls) {
                        return;
                    }
                }
                //追加cls
                arr.push(cls);
                el.className = arr.join(' ');
            }
        }
        /**
         * 移除cls
         * @param el    html element
         * @param cls   类名
         */
        static removeClass(el, cls) {
            if (!this.isEl(el)) {
                throw new nodom.NodomError('invoke', 'this.removeClass', '0', 'Element');
            }
            if (this.isEmpty(cls)) {
                throw new nodom.NodomError('invoke', 'this.removeClass', '1', 'string');
            }
            let cn = el.className.trim();
            if (!this.isEmpty(cn)) {
                let arr = cn.split(/\s+/);
                //遍历class数组，如果存在cls，则移除
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === cls) {
                        arr.splice(i, 1);
                        el.className = arr.join(' ');
                        return;
                    }
                }
            }
        }
        /******日期相关******/
        /**
         * 日期格式化
         * @param srcDate   时间戳串
         * @param format    日期格式
         * @returns          日期串
         */
        static formatDate(srcDate, format) {
            //时间戳
            let timeStamp;
            if (this.isString(srcDate)) {
                //排除日期格式串,只处理时间戳
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
            //得到日期
            let date = new Date(timeStamp);
            // invalid date
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
                "S": date.getMilliseconds() //毫秒
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
            //年
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            //月日
            this.getOwnProps(o).forEach(function (k) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            });
            //星期
            if (/(E+)/.test(format)) {
                format = format.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
            }
            return format;
        }
        /******字符串相关*****/
        /**
         * 编译字符串，把{n}替换成带入值
         * @param str 待编译的字符串
         * @param args1,args2,args3,... 待替换的参数
         * @returns 转换后的消息
         */
        static compileStr(src, p1, p2, p3, p4, p5) {
            let reg = new RegExp(/\{.+?\}/);
            let r;
            let args = arguments;
            let str = args[0];
            while ((r = reg.exec(str)) !== null) {
                let rep;
                let sIndex = r[0].substr(1, r[0].length - 2);
                let pIndex = parseInt(sIndex) + 1;
                if (args[pIndex] !== undefined) {
                    rep = args[pIndex];
                }
                else {
                    rep = '';
                }
                str = str.replace(reg, rep);
            }
            return str;
        }
        /**
         * 为字符串值两端添加引号
         * @param srcStr    带转换的字符串
         * @param quot      引号 " 或 ' 或 `
         */
        static addStrQuot(srcStr, quot) {
            srcStr = srcStr.replace(/\'/g, '\\\'');
            srcStr = srcStr.replace(/\"/g, '\\\"');
            srcStr = srcStr.replace(/\`/g, '\\\`');
            quot = quot || '"';
            srcStr = quot + srcStr + quot;
            return srcStr;
        }
        /**
         * 函数调用
         * @param foo   函数
         * @param obj   this指向
         * @param args  参数数组
         */
        static apply(foo, obj, args) {
            if (!foo) {
                return;
            }
            return Reflect.apply(foo, obj || null, args);
        }
    }
    nodom.Util = Util;
})(nodom || (nodom = {}));
//# sourceMappingURL=util.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 应用类
     */
    class Application {
    }
    nodom.Application = Application;
})(nodom || (nodom = {}));
//# sourceMappingURL=application.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 工厂基类
     */
    class Factory {
        /**
         * @param module 模块
         */
        constructor(module) {
            if (module !== undefined) {
                this.moduleName = module.name;
            }
            //容器map
            this.items = Object.create(null);
        }
        /**
         * 添加到工厂
         * @param name 	item name
         * @param item	item
         */
        add(name, item) {
            this.items[name] = item;
        }
        /**
         * 获得item
         * @param name 	item name
         */
        get(name) {
            return this.items[name];
        }
        /**
         * 从容器移除
         * @param name 	item name
         */
        remove(name) {
            delete this.items[name];
        }
    }
    nodom.Factory = Factory;
})(nodom || (nodom = {}));
//# sourceMappingURL=factory.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    class Compiler {
        /**
         * 编译
         * @param element   待编译element
         * @return          虚拟element
         */
        static compile(module, elementStr) {
            const div = nodom.Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new nodom.Element();
            oe.root = true;
            //调用编译
            for (let i = 0; i < div.childNodes.length; i++) {
                this.compileDom(module, div.childNodes[i], oe);
            }
            return oe;
        }
        /**
         * 编译dom
         * @param module        模块
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）
         */
        static compileDom(module, ele, parent) {
            const me = this;
            let oe = new nodom.Element();
            //注视标志
            let isComment = false;
            switch (ele.nodeType) {
                case Node.ELEMENT_NODE: //元素
                    let el = ele;
                    oe.tagName = el.tagName;
                    //遍历attributes
                    for (let i = 0; i < el.attributes.length; i++) {
                        let attr = el.attributes[i];
                        let v = attr.value.trim();
                        if (attr.name.startsWith('x-')) { //指令
                            //添加到dom指令集
                            oe.directives.push(new nodom.Directive(attr.name.substr(2), v, oe, module, el));
                        }
                        else if (attr.name.startsWith('e-')) { //事件
                            let en = attr.name.substr(2);
                            oe.events[en] = new nodom.NodomEvent(en, attr.value.trim());
                        }
                        else {
                            let isExpr = false;
                            if (v !== '') {
                                let ra = me.compileExpression(module, v);
                                if (nodom.Util.isArray(ra)) {
                                    oe.exprProps.set(attr.name, new nodom.Property(attr.name, ra));
                                    isExpr = true;
                                }
                            }
                            if (!isExpr) {
                                oe.props.set(attr.name, new nodom.Property(attr.name, v));
                            }
                        }
                    }
                    let subEls = [];
                    //子节点编译
                    ele.childNodes.forEach((nd) => {
                        subEls.push(me.compileDom(module, nd, oe));
                    });
                    //指令按优先级排序
                    oe.directives.sort((a, b) => {
                        return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
                    });
                    break;
                case Node.TEXT_NODE: //文本节点
                    let txt = ele.textContent;
                    if (txt === "") { //内容为空不加入树
                        return;
                    }
                    let expA = me.compileExpression(module, txt);
                    if (typeof expA === 'string') { //无表达式
                        oe.textContent = expA;
                    }
                    else { //含表达式
                        oe.expressions = expA;
                    }
                    break;
                case Node.COMMENT_NODE: //注释
                    isComment = true;
                    break;
            }
            //添加到子节点,comment节点不需要    
            if (!isComment && parent) {
                parent.children.push(oe);
            }
            return oe;
        }
        /**
         * 处理含表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(module, exprStr) {
            if (/\{\{.+?\}\}/.test(exprStr) === false) {
                return exprStr;
            }
            let reg = /\{\{.+?\}\}/g;
            let retA = new Array();
            let re, oIndex = 0;
            while ((re = reg.exec(exprStr)) !== null) {
                let ind = re.index;
                //字符串
                if (ind > oIndex) {
                    let s = exprStr.substring(oIndex, ind);
                    retA.push(s);
                }
                //实例化表达式对象
                let exp = new nodom.Expression(re[0].substring(2, re[0].length - 2), module);
                //加入工厂
                module.expressionFactory.add(exp.id, exp);
                retA.push(exp.id);
                oIndex = ind + re[0].length;
            }
            //最后的字符串
            if (re && re.index + re[0].length < exprStr.length - 1) {
                retA.push(exprStr.substr(re.index + re[0].length));
            }
            return retA;
        }
    }
    nodom.Compiler = Compiler;
})(nodom || (nodom = {}));
//# sourceMappingURL=compiler.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令类
     */
    class Directive {
        /**
         * 构造方法
         * @param type  	类型
         * @param value 	指令值
         * @param vdom 		指令所属虚拟dom
         * @param module 	模块
         * @param el 		指令所属html element
         */
        constructor(type, value, vdom, module, el) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                this.value = value.trim();
            }
            if (type !== undefined) {
                nodom.Util.apply(nodom.DirectiveManager.init, nodom.DirectiveManager, [this, vdom, module, el]);
            }
        }
        /**
         * 执行
         * @param value 	指令值
         * @returns 		指令结果
         */
        exec(value) {
            let args = [this.module, this.type, value];
            return nodom.Util.apply(nodom.DirectiveManager.exec, nodom.DirectiveManager, args);
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
//# sourceMappingURL=directive.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令工厂
     */
    class DirectiveFactory extends nodom.Factory {
    }
    nodom.DirectiveFactory = DirectiveFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=directivefactory.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令管理器
     */
    class DirectiveManager {
        /**
         * 创建指令类型
         * @param name 		    指令类型名
         * @param config 	    配置对象{order:优先级,init:初始化函数,handler:渲染处理函数}
         * @param replacable    是否可编辑
         */
        static addType(name, config, replacable) {
            if (this.directiveTypes.has(name)) {
                throw new nodom.NodomError('exist1', nodom.TipWords.directiveType, name);
            }
            if (!nodom.Util.isObject(config)) {
                throw new nodom.NodomError('invoke', 'DirectiveManager.addType', '1', 'Function');
            }
            //默认优先级10
            config.prio = config.prio || 10;
            if (replacable && !this.cantEditTypes.includes(name)) {
                this.cantEditTypes.push(name);
            }
            this.directiveTypes.set(name, config);
        }
        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name) {
            if (this.cantEditTypes.indexOf(name) !== -1) {
                throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.directiveType, name);
            }
            if (!this.directiveTypes.has(name)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
            }
            this.directiveTypes.delete(name);
        }
        /**
         * 获取类型
         * @param name  指令类型名
         * @returns     指令或undefined
         */
        static getType(name) {
            return this.directiveTypes.get(name);
        }
        /**
         * 是否有某个过滤器类型
         * @param type 		过滤器类型名
         * @returns 		true/false
         */
        static hasType(name) {
            return this.directiveTypes.has(name);
        }
        /**
         * 指令初始化
         */
        static init(directive, dom, module, el) {
            let dt = this.directiveTypes.get(directive.type);
            if (dt === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
            }
            return dt.init(directive, dom, module, el);
        }
        /**
         * 执行指令
         * @param directive     指令
         * @param dom           虚拟dom
         * @param module        模块
         * @param parent        父dom
         * @returns             指令执行结果
         */
        static exec(directive, dom, module, parent) {
            if (!this.directiveTypes.has(directive.type)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, directive.type);
            }
            //调用
            return nodom.Util.apply(this.directiveTypes.get(directive.type).handle, null, [directive, dom, module, parent]);
        }
    }
    /**
     * 指令类型集合
     */
    DirectiveManager.directiveTypes = new Map();
    /**
     * 不可编辑(被新类型替换)类型
     */
    DirectiveManager.cantEditTypes = ['model', 'repeat', 'if', 'else', 'show', 'class', 'field'];
    nodom.DirectiveManager = DirectiveManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=directivemanager.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 属性
     */
    class Property {
        /**
         * @param name 		属性名
         * @param value 	属性值
         */
        constructor(name, value) {
            this.name = name;
            this.value = value;
        }
    }
    nodom.Property = Property;
    /**
     * 改变的dom类型
     */
    class ChangedDom {
        /**
         *
         * @param node      虚拟节点
         * @param type      修改类型  add(添加节点),del(删除节点),upd(更新节点),rep(替换节点),text(修改文本内容)
         * @param parent    父虚拟dom
         * @param index     在父节点中的位置索引
         */
        constructor(node, type, parent, index) {
            this.node = node;
            this.type = type;
            this.parent = parent;
            this.index = index;
        }
    }
    nodom.ChangedDom = ChangedDom;
    /**
     * 虚拟dom
     */
    class Element {
        /**
         * @param tag 标签名
         */
        constructor(tag) {
            /**
             * 指令集
             */
            this.directives = [];
            /**
             * 属性集合
             */
            this.props = new Map();
            /**
             * 含表达式的属性集合
             */
            this.exprProps = new Map();
            /**
             * 事件集合
             */
            this.events = [];
            /**
             * 表达式集合
             */
            this.expressions = [];
            /**
             * 修改后的属性(单次渲染周期内)
             */
            this.changeProps = []; //
            /**
             * 待删除属性(单次渲染周期内)
             */
            this.removeProps = [];
            /**
             * 子element
             */
            this.children = [];
            /**
             * 不渲染标志，单次渲染有效
             */
            this.dontRender = false;
            this.tagName = tag; //标签
            this.key = nodom.Util.genId() + '';
        }
        /**
         * 渲染到virtualdom树
         * @param module 	模块
         * @param parent 	父节点
         */
        render(module, parent) {
            // 设置父对象
            if (parent) {
                this.parentKey = parent.key;
                // 设置modelId
                if (!this.modelId) {
                    this.modelId = parent.modelId;
                }
            }
            if (this.tagName !== undefined) { //element
                this.handleProps(module);
                //某些指令可能会终止渲染，如果返回false，则不继续渲染
                this.handleDirectives(module, parent);
            }
            else { //textContent
                this.handleTextContent(module);
            }
            //dontrender 为false才渲染子节点
            if (!this.dontRender) {
                //子节点渲染
                for (let i = 0; i < this.children.length; i++) {
                    let item = this.children[i];
                    item.render(module, this);
                    //dontRender 删除
                    if (item.dontRender) {
                        this.removeChild(item);
                        i--;
                    }
                }
            }
            return true;
        }
        /**
         * 渲染到html element
         * @param module 	模块
         * @param params 	配置对象{}
         * @param type 		类型
         * @param parent 	父虚拟dom
         */
        renderToHtml(module, params) {
            let el;
            let el1;
            let type = params.type;
            let parent = params.parent;
            //构建el
            if (!parent) {
                el = module.container;
            }
            else {
                if (type === 'fresh' || type === 'add' || type === 'text') {
                    el = module.container.querySelector("[key='" + parent.key + "']");
                }
                else if (this.tagName !== undefined) { //element节点才可以查找
                    el = module.container.querySelector("[key='" + this.key + "']");
                }
            }
            if (!el) {
                return;
            }
            switch (type) {
                case 'fresh': //首次渲染
                    if (this.tagName) {
                        el1 = newEl(this, null, el);
                        //首次渲染需要生成子孙节点
                        genSub(el1, this);
                    }
                    else {
                        el1 = newText(this.textContent, this);
                    }
                    el.appendChild(el1);
                    break;
                case 'text': //文本更改
                    if (!parent || !parent.children) {
                        break;
                    }
                    let ind = parent.children.indexOf(this);
                    if (ind !== -1) {
                        //element或fragment
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
                case 'upd': //修改属性
                    //删除属性
                    if (params.removeProps) {
                        params.removeProps.forEach((p) => {
                            el.removeAttribute(p.name);
                        });
                    }
                    //修改属性
                    params.changeProps.forEach((p) => {
                        if (el.tagName === 'INPUT' && p.name === 'value') { //文本框单独处理
                            el.value = p.value;
                        }
                        else {
                            el.setAttribute(p.name, p.value);
                        }
                    });
                    break;
                case 'rep': //替换节点
                    el1 = newEl(this, parent);
                    nodom.Util.replaceNode(el, el1);
                    break;
                case 'add': //添加
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
            /**
             * 新建element节点
             * @param vdom 		虚拟dom
             * @param parent 	父虚拟dom
             * @param parentEl 	父element
             * @returns 		新的html element
             */
            function newEl(vdom, parent, parentEl) {
                //创建element
                let el = document.createElement(vdom.tagName);
                //设置属性
                vdom.props.forEach((v, k) => {
                    el.setAttribute(v.name, v.value);
                });
                el.setAttribute('key', vdom.key);
                vdom.handleEvents(module, el, parent, parentEl);
                return el;
            }
            /**
             * 新建文本节点
             */
            function newText(text, dom) {
                if (dom && 'html' === dom.type) { //html fragment 或 element
                    let div = nodom.Util.newEl('div');
                    div.setAttribute('key', dom.key);
                    div.appendChild(text);
                    return div;
                }
                else {
                    return document.createTextNode(text);
                }
            }
            /**
             * 生成子节点
             * @param pEl 	父节点
             * @param vNode 虚拟dom父节点
             */
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
        /**
         * 克隆
         */
        clone() {
            let dst = new Element();
            //简单属性
            nodom.Util.getOwnProps(this).forEach((p) => {
                if (typeof this[p] !== 'object') {
                    dst[p] = this[p];
                }
            });
            for (let d of this.directives) {
                dst.directives.push(d);
            }
            //普通属性
            this.props.forEach((v, k) => {
                dst.props.set(k, v);
            });
            //表达式属性
            this.exprProps.forEach((v, k) => {
                dst.exprProps.set(k, v);
            });
            //事件
            for (let d of this.events) {
                dst.events.push(d);
            }
            //表达式
            dst.expressions = this.expressions;
            this.children.forEach((d) => {
                dst.children.push(d.clone());
            });
            return dst;
        }
        /**
         * 处理指令
         *
         */
        handleDirectives(module, parent) {
            if (this.dontRender) {
                return false;
            }
            const dirs = this.directives;
            for (let i = 0; i < dirs.length && !this.dontRender; i++) {
                nodom.DirectiveManager.exec(dirs[i], this, module, parent);
            }
            return true;
        }
        /**
         * 表达式预处理，添加到expression计算队列
         */
        handleExpression(exprArr, module) {
            if (this.dontRender) {
                return;
            }
            let value = '';
            let model = module.modelFactory.get(this.modelId);
            exprArr.forEach((v) => {
                if (typeof v === 'number') { //处理表达式
                    // 统一添加到表达式计算队列
                    let v1 = module.expressionFactory.get(v).val(model);
                    //html或 fragment
                    if (v1 instanceof DocumentFragment || nodom.Util.isEl(v1)) {
                        // 设置类型
                        this.type = 'html';
                        return v1;
                    }
                    value += v1;
                }
                else {
                    value += v;
                }
            });
            return value;
        }
        /**
         * 处理属性（带表达式）
         */
        handleProps(module) {
            if (this.dontRender) {
                return;
            }
            this.exprProps.forEach((v, k) => {
                //属性值为数组，则为表达式
                if (nodom.Util.isArray(v)) {
                    let p = new Property(k, this.handleExpression(v, module));
                    this.props.set(k, p);
                }
                else if (v instanceof nodom.Expression) { //单个表达式
                    let p = new Property(k, v.val(module.modelFactory.get(this.modelId)));
                    this.props.set(k, p);
                }
            });
        }
        /**
         * 处理文本（表达式）
         */
        handleTextContent(module) {
            if (this.dontRender) {
                return;
            }
            if (this.expressions !== undefined) {
                this.textContent = this.handleExpression(this.expressions, module);
            }
        }
        /**
         * 处理事件
         * @param module
         * @param model
         * @param el
         * @param parent
         */
        handleEvents(module, el, parent, parentEl) {
            if (this.events.length === 0) {
                return;
            }
            this.events.forEach((ev) => {
                if (ev.delg && parent) { //代理到父对象
                    ev.delegateTo(module, this, el, parent, parentEl);
                }
                else {
                    ev.bind(module, this, el);
                }
            });
        }
        /**
         * 移除指令
         * @param directives 	待删除的指令集
         */
        removeDirectives(delDirectives) {
            for (let i = this.directives.length - 1; i >= 0; i--) {
                let d = this.directives[i];
                for (let j = 0; j < delDirectives.length; j++) {
                    if (d.type === delDirectives[j]) {
                        this.directives.splice(i, 1);
                    }
                }
            }
        }
        /**
         * 是否有某个类型的指令
         * @param directiveType 	指令类型名
         * @return true/false
         */
        hasDirective(directiveType) {
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return true;
                }
            }
            return false;
        }
        /**
         * 获取某个类型的指令
         * @param directiveType 	指令类型名
         * @return directive
         */
        getDirective(directiveType) {
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return this.directives[i];
                }
            }
        }
        /**
         * 添加子节点
         * @param dom 	子节点
         */
        add(dom) {
            this.children.push(dom);
        }
        /**
         * 从虚拟dom树和html dom树删除自己
         * @param module 	模块
         * @param delHtml 	是否删除html element
         */
        remove(module, delHtml) {
            // 从父树中移除
            if (this.parentKey !== undefined) {
                let p = module.renderTree.query(this.parentKey);
                if (p) {
                    p.removeChild(this);
                }
            }
            // 删除html dom节点
            if (delHtml && module && module.container) {
                let el = module.container.querySelector("[key='" + this.key + "']");
                if (el !== null) {
                    nodom.Util.remove(el);
                }
            }
        }
        /**
         * 从html删除
         */
        removeFromHtml(module) {
            let el = module.container.querySelector("[key='" + this.key + "']");
            if (el !== null) {
                nodom.Util.remove(el);
            }
        }
        /**
         * 移除子节点
         */
        removeChild(dom) {
            let ind;
            // 移除
            if (nodom.Util.isArray(this.children) && (ind = this.children.indexOf(dom)) !== -1) {
                this.children.splice(ind, 1);
            }
        }
        /**
         * 替换目标节点
         * @param dst 	目标节点
         */
        replace(dst) {
            if (!dst.parent) {
                return false;
            }
            let ind = dst.parent.children.indexOf(dst);
            if (ind === -1) {
                return false;
            }
            //替换
            dst.parent.children.splice(ind, 1, this);
            return true;
        }
        /**
         * 是否包含节点
         * @param dom 	包含的节点
         */
        contains(dom) {
            for (; dom !== undefined && dom !== this; dom = dom.parent)
                ;
            return dom !== undefined;
        }
        /**
         * 查找子孙节点
         * @param key 	element key
         * @returns		虚拟dom/undefined
         */
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
        /**
         * 比较节点
         * @param dst 	待比较节点
         * @returns	{type:类型 text/rep/add/upd,node:节点,parent:父节点,
         * 			changeProps:改变属性,[prop1,prop2,...],removeProps:删除属性,[prop1,prop2,...]}
         */
        compare(dst, retArr, parentNode) {
            if (!dst) {
                return;
            }
            let re = new ChangedDom();
            let change = false;
            if (this.tagName === undefined) { //文本节点
                if (dst.tagName === undefined) {
                    if (this.textContent !== dst.textContent) {
                        re.type = 'text';
                        change = true;
                    }
                }
                else { //节点类型不同
                    re.type = 'rep';
                    change = true;
                }
            }
            else { //element节点
                if (this.tagName !== dst.tagName) { //节点类型不同
                    re.type = 'rep';
                    change = true;
                }
                else { //节点类型相同，可能属性不同
                    //检查属性，如果不同则放到changeProps
                    re.changeProps = [];
                    //待删除属性
                    re.removeProps = [];
                    //删除或增加的属性的属性
                    dst.props.forEach((v, k) => {
                        if (!this.props.has(k)) {
                            re.removeProps.push(v);
                        }
                    });
                    //修改后的属性
                    this.props.forEach((v, k) => {
                        let p1 = dst.props.get(k);
                        if (!p1 || v.value !== p1.value) {
                            re.changeProps.push(v);
                        }
                    });
                    if (re.changeProps.length > 0 || re.removeProps.length > 0) {
                        change = true;
                        re.type = 'upd';
                    }
                }
            }
            //改变则加入数据
            if (change) {
                re.node = this;
                if (parentNode) {
                    re.parent = parentNode;
                }
                retArr.push(re);
            }
            //子节点处理
            if (!this.children || this.children.length === 0) {
                // 旧节点的子节点全部删除
                if (dst.children && dst.children.length > 0) {
                    dst.children.forEach((item) => {
                        retArr.push(new ChangedDom(item, 'del'));
                    });
                }
            }
            else {
                //全部新加节点
                if (!dst.children || dst.children.length === 0) {
                    this.children.forEach((item) => {
                        retArr.push(new ChangedDom(item, 'add', this));
                    });
                }
                else { //都有子节点
                    this.children.forEach((dom1, ind) => {
                        let dom2 = dst.children[ind];
                        // dom1和dom2相同key
                        if (!dom2 || dom1.key !== dom2.key) {
                            dom2 = undefined;
                            //找到key相同的节点
                            for (let i = 0; i < dst.children.length; i++) {
                                //找到了相同key
                                if (dom1.key === dst.children[i].key) {
                                    dom2 = dst.children[i];
                                    break;
                                }
                            }
                        }
                        if (dom2 !== undefined) {
                            dom1.compare(dom2, retArr, this);
                            //设置匹配标志，用于后面删除没有标志的节点
                            dom2.finded = true;
                        }
                        else {
                            // dom1为新增节点
                            retArr.push(new ChangedDom(dom1, 'add', this, ind));
                        }
                    });
                    //未匹配的节点设置删除标志
                    if (dst.children && dst.children.length > 0) {
                        dst.children.forEach((item) => {
                            if (!item.finded) {
                                retArr.push(new ChangedDom(item, 'del', dst));
                            }
                        });
                    }
                }
            }
        }
    }
    nodom.Element = Element;
})(nodom || (nodom = {}));
//# sourceMappingURL=element.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 表达式类
     */
    class Expression {
        /**
         * @param exprStr	表达式串
         * @param module 	模块
         */
        constructor(exprStr, module) {
            /**
             * 一个expression可能被多次使用，以modelid进行区分，针对不同的模型id构建对象{modelId:{fieldValue:,value:}
             */
            this.modelMap = {};
            //旧值
            this.fields = []; // 字段数组
            this.id = nodom.Util.genId();
            if (module) {
                this.moduleName = module.name;
                module.expressionFactory.add(this.id, this);
            }
            if (exprStr) {
                this.stack = this.init(exprStr);
            }
        }
        /**
         * 初始化，把表达式串转换成堆栈
         * @param exprStr 	表达式串
         * @returns 		堆栈数组
         */
        init(exprStr) {
            //字符串开始
            let startStr;
            let type = 0; // 1字符串 2变量 3函数 4过滤器
            //字符串开始结束符
            let strings = "'`\"";
            //运算符
            let operand = "()!|*/+-><=&%";
            let spaceChar = " 	";
            //堆栈
            let stack = [];
            let sTmp = '';
            for (let i = 0; i < exprStr.length; i++) {
                let c = exprStr[i];
                //变量和函数的空格不处理
                if ((type !== 1) && spaceChar.indexOf(c) !== -1) {
                    continue;
                }
                switch (type) {
                    case 1: //当前为字符串
                        //字符串标识
                        if (strings.indexOf(c) !== -1) {
                            if (c === startStr) {
                                this.addStr(sTmp + c, stack);
                                startStr = undefined;
                                sTmp = '';
                                type = 0;
                                continue;
                            }
                        }
                        break;
                    case 2: //当前为变量
                        if (operand.indexOf(c) !== -1) {
                            //转为函数
                            if (c === '(') {
                                type = 3;
                            }
                            else { //变量结束
                                this.addVar(sTmp, stack);
                                sTmp = '';
                                type = 0;
                            }
                        }
                        break;
                    case 3: //当前为函数
                        if (c === ')') {
                            let a = sTmp.trim().split('(');
                            //函数名
                            let fn = a[0];
                            //参数
                            let pa = a[1].split(',');
                            for (let j = 0; j < pa.length; j++) {
                                let field = pa[j].trim();
                                pa[j] = field;
                                // 添加字段到集合 
                                this.addField(field);
                            }
                            //函数入栈
                            stack.push({
                                val: fn,
                                params: pa,
                                type: 'function'
                            });
                            sTmp = '';
                            type = 0;
                            continue;
                        }
                        break;
                    default:
                        //字符串开始
                        if (strings.indexOf(c) !== -1) {
                            startStr = c;
                            type = 1;
                        }
                        else if (operand.indexOf(c) === -1) { //变量开始
                            type = 2;
                            if (sTmp !== '') {
                                this.addStr(sTmp, stack);
                                sTmp = '';
                            }
                        }
                }
                //过滤器标志
                let isFilter = false;
                //过滤器
                if (c === '|') {
                    let j = i + 1;
                    let nextc = exprStr[j];
                    if (nextc >= 'a' && nextc <= 'z') {
                        let strCh = '';
                        for (; j < exprStr.length; j++) {
                            let ch = exprStr[j];
                            if (strings.indexOf(ch) !== -1) {
                                if (ch === strCh) { //字符串结束
                                    strCh = '';
                                }
                                else {
                                    strCh = ch;
                                }
                            }
                            //遇到操作符且不在字符串内
                            if (strCh === '' && operand.indexOf(ch) !== -1) {
                                break;
                            }
                        }
                    }
                    if (j > i) {
                        let s = exprStr.substring(i + 1, j);
                        if (s !== '') {
                            // 过滤器串处理
                            let filterArr = nodom.FilterManager.explain(s);
                            //过滤器
                            if (nodom.FilterManager.hasType(filterArr[0])) {
                                this.addFilter(filterArr, stack);
                                c = '';
                                exprStr = '';
                                isFilter = true;
                            }
                        }
                    }
                }
                //操作符
                if (!isFilter && type !== 1 && type !== 3 && operand.indexOf(c) !== -1) {
                    this.addOperand(c, stack);
                }
                else {
                    sTmp += c;
                }
            }
            if (type === 2) { //变量处理
                this.addVar(sTmp, stack);
            }
            else if (type === 0 && sTmp !== '') { //字符串
                this.addStr(sTmp, stack);
            }
            else if (type !== 0) {
                //抛出表达式错误
                throw new nodom.NodomError('invoke', 'expression', '0', 'Node');
            }
            return stack;
        }
        /**
         * 表达式计算
         * @param model 	模型 或 fieldObj对象
         * @param modelId 	模型id（model为fieldObj时不能为空）
         * @returns 		计算结果
         */
        val(model, modelId) {
            if (!model) {
                return '';
            }
            if (this.stack === null) {
                return '';
            }
            let fieldObj;
            // 模型
            if (model instanceof nodom.Model) {
                modelId = model.id;
                fieldObj = Object.create(null);
                //字段值
                this.fields.forEach((field) => {
                    fieldObj[field] = this.getFieldValue(model, field);
                });
            }
            else {
                fieldObj = model;
            }
            let newFieldValue = '';
            this.fields.forEach((field) => {
                newFieldValue += fieldObj[field];
            });
            //如果对应模型的值对象不存在，需要新建
            if (this.modelMap[modelId] === undefined) {
                this.modelMap[modelId] = Object.create(null);
            }
            //field值不一样，需要重新计算
            if (this.modelMap[modelId].fieldValue !== newFieldValue) {
                this.modelMap[modelId].value = this.cacStack(this.stack, fieldObj, modelId);
            }
            this.modelMap[modelId].fieldValue = newFieldValue;
            return this.modelMap[modelId].value;
        }
        /**
         * 添加变量
         * @param field 	字段
         * @param statc 	堆栈
         */
        addVar(field, stack) {
            let values = ['null', 'undefined', 'true', 'false', 'NaN'];
            //判断是否为值表达式 null undefined true false
            let addFlag = values.indexOf(field) === -1 ? false : true;
            addFlag = addFlag || nodom.Util.isNumberString(field);
            //作为字符串处理   
            if (addFlag) {
                this.addStr(field, stack);
            }
            else {
                stack.push({
                    val: field.trim(),
                    type: 'field'
                });
                this.addField(field);
            }
        }
        /**
         * 添加字符串
         * @param str 		待添加字符串
         * @param stack 	堆栈
         */
        addStr(str, stack) {
            //如果前一个类型为字符串，则追加到前一个
            if (stack.length > 0 && stack[stack.length - 1].type === "string") {
                stack[stack.length - 1].val += str;
            }
            else {
                stack.push({
                    val: str,
                    type: 'string'
                });
            }
        }
        /**
         * 添加操作符
         * @param str 		操作符
         * @param stack 	堆栈
         */
        addOperand(str, stack) {
            stack.push({
                val: str,
                type: 'operand'
            });
        }
        /**
         * 添加过滤器
         * @param value 	value
         * @param filterArr	过滤器数组
         * @param stack 	堆栈
         * @param vtype 	值类型 field字段 func函数 comp 组合
         * @param extra 	附加参数
         */
        addFilter(filterArr, stack) {
            let module = nodom.ModuleFactory.get(this.moduleName);
            if (stack.length > 0) {
                let filterStack = []; //过滤器堆栈
                let pre = stack[stack.length - 1];
                let type = pre.type;
                //字段、函数、不带括号的字符串
                if (type === 'field' || type === 'function' || type === 'string') {
                    filterStack.push(stack.pop());
                }
                else if (type === 'operand' && pre.val === ')') { //括号操作符
                    //匹配括号对
                    let cnt = 1;
                    let j = stack.length - 2;
                    for (; j >= 0; j--) {
                        // filterStack.unshift(stack[j].pop);
                        if (stack[j].val === '(') {
                            if (--cnt === 0) {
                                break;
                            }
                        }
                        else if (stack[j].val === ')') {
                            cnt++;
                        }
                    }
                    //拷贝堆栈元素
                    filterStack = stack.slice(j, stack.length);
                    //删除堆栈元素
                    stack.splice(j, stack.length - j);
                }
                let expr = new Expression(null, module);
                expr.stack = filterStack;
                expr.fields = this.fields;
                //前置表达式
                if (!this.pre) {
                    this.pre = [];
                }
                this.pre.push(expr.id);
                // 过滤器入栈
                stack.push({
                    type: 'filter',
                    filter: new nodom.Filter(filterArr),
                    val: expr.id
                });
            }
        }
        /**
         * 计算堆栈
         * @param stack 	堆栈
         * @param fieldObj 	字段对象
         * @param modelId 	模型id
         * @returns 		计算结果
         */
        cacStack(stack, fieldObj, modelId) {
            let retStr = '';
            let needEval = false;
            let module = nodom.ModuleFactory.get(this.moduleName);
            stack.forEach((item) => {
                let value = '';
                switch (item.type) {
                    case 'string': //字符串
                        retStr += item.val;
                        break;
                    case 'operand': //字符串
                        retStr += item.val;
                        needEval = true;
                        break;
                    case 'field': //变量
                        value = fieldObj[item.val];
                        //字符串需要处理
                        if (nodom.Util.isString(value)) {
                            value = nodom.Util.addStrQuot(value);
                        }
                        retStr += value;
                        break;
                    case 'function': //函数
                        let foo = module.methodFactory.get(item.val);
                        let param = [];
                        if (item.params.length > 0) {
                            item.params.forEach((p) => {
                                let pv = fieldObj[p];
                                let isVal = false;
                                //非数字和值，字符串两边添加引号
                                if (nodom.Util.isString(pv) && pv !== '') {
                                    pv = nodom.Util.addStrQuot(pv);
                                }
                                param.push(pv);
                            });
                        }
                        if (foo !== undefined && nodom.Util.isFunction(foo)) {
                            value = foo.apply(module.model, param);
                        }
                        else { //系统函数
                            value = item.val + '(' + param.join(',') + ')';
                            needEval = true;
                        }
                        retStr += value;
                        break;
                    case 'filter':
                        // 作为前一轮已经计算
                        value = module.expressionFactory.get(item.val).val(fieldObj, modelId);
                        value = item.filter.exec(value, module);
                        if (typeof value === 'object') { //对象，直接赋值，不做加法
                            retStr = value;
                        }
                        else {
                            //字符串
                            if (nodom.Util.isString(value) && value !== '') {
                                value = nodom.Util.addStrQuot(value);
                            }
                            retStr += value;
                        }
                }
            });
            if (needEval) {
                try {
                    retStr = eval(retStr);
                }
                catch (e) {
                }
            }
            else if (nodom.Util.isString(retStr) && retStr.charAt(0) === '"') { //字符串去掉两边的"
                retStr = retStr.substring(1, retStr.length - 1);
            }
            //替换所有undefined为空
            if (retStr === undefined) {
                retStr = '';
            }
            return retStr;
        }
        /**
         * 添加字段到fields
         * @param field 	字段
         */
        addField(field) {
            if (this.fields.indexOf(field) === -1) {
                this.fields.push(field);
            }
        }
        /**
         * 获取field值
         * @param model 	模型，可为空
         * @param field 	字段，可以带.
         * @returns 		字段值
         */
        getFieldValue(model, field) {
            let module = nodom.ModuleFactory.get(this.moduleName);
            if (!model && module) {
                model = module.model;
            }
            if (!model) {
                return undefined;
            }
            let v = model.query(field);
            if (v === undefined && model !== module.model) {
                v = module.model.query(field);
            }
            return v;
        }
    }
    nodom.Expression = Expression;
})(nodom || (nodom = {}));
//# sourceMappingURL=expression.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 表达式工厂
     */
    class ExpressionFactory extends nodom.Factory {
    }
    nodom.ExpressionFactory = ExpressionFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=expressionfactory.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 过滤器类
     */
    class Filter {
        /**
         * 构造方法
         * @param src 		源串，或explain后的数组
         */
        constructor(src) {
            let arr = nodom.Util.isString(src) ? nodom.FilterManager.explain(src) : src;
            if (arr) {
                this.type = arr[0];
                this.params = arr.slice(1);
            }
        }
        /**
         * 过滤器执行
         * @param value 	待过滤值
         * @param module 	模块
         * @returns 		过滤结果
         */
        exec(value, module) {
            let args = [module, this.type, value].concat(this.params);
            return nodom.Util.apply(nodom.FilterManager.exec, module, args);
        }
    }
    nodom.Filter = Filter;
})(nodom || (nodom = {}));
//# sourceMappingURL=filter.js.map
/// <reference path="nodom.ts" />s
var nodom;
(function (nodom) {
    /**
     * 过滤器工厂，存储模块过滤器
     */
    class FilterFactory extends nodom.Factory {
    }
    nodom.FilterFactory = FilterFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=filterfactory.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * filter类型命名规则：以小写字母a-z命名，其它字母不允许
     */
    class FilterManager {
        /**
         * 创建过滤器类型
         * @param name 		过滤器类型名
         * @param handler 	过滤器类型处理函数{init:foo1,handler:foo2}
         */
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
        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name) {
            if (this.cantEditTypes.indexOf(name) !== -1) {
                throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.filterType, name);
            }
            if (!this.filterTypes.has(name)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, name);
            }
            this.filterTypes.delete(name);
        }
        /**
         * 是否有某个过滤器类型
         * @param type 		过滤器类型名
         * @return 			true/false
         */
        static hasType(name) {
            return this.filterTypes.has(name);
        }
        /**
         * 执行过滤器
         * @param module 	模块
         * @param type 		类型
         * @param arguments 参数数组  0模块 1过滤器类型名 2待处理值 3-n处理参数
         * @returns 		过滤器执行结果
         */
        static exec(module, type) {
            let params = new Array();
            for (let i = 2; i < arguments.length; i++) {
                params.push(arguments[i]);
            }
            if (!FilterManager.filterTypes.has(type)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, type);
            }
            //调用
            return nodom.Util.apply(FilterManager.filterTypes.get(type), module, params);
        }
        /**
         * 解析过滤器串为数组
         * @param src 	源字符串，格式为filtertype:param1:param2:...
         * @returns 	解析后的过滤器数组参数
         */
        static explain(src) {
            let startStr;
            let startObj = false;
            let strings = "\"'`"; //字符串开始和结束标志
            let splitCh = ':'; //分隔符
            let retArr = new Array();
            let tmp = ''; //临时串
            for (let i = 0; i < src.length; i++) {
                let ch = src[i];
                //字符串开始或结束
                if (strings.indexOf(ch) !== -1) {
                    if (ch === startStr) { //字符串结束
                        startStr = undefined;
                    }
                    else { //字符串开始
                        startStr = ch;
                    }
                }
                else if (startStr === undefined) { //非字符串开始情况检查对象
                    if (ch === '}' && startObj) { //对象结束
                        startObj = false;
                    }
                    else if (ch === '{') { //对象开始
                        startObj = true;
                    }
                }
                //分割开始
                if (ch === splitCh && startStr === undefined && !startObj && tmp !== '') {
                    retArr.push(handleObj(tmp));
                    tmp = '';
                    continue;
                }
                tmp += ch;
            }
            //最后一个
            if (tmp !== '') {
                retArr.push(handleObj(tmp));
            }
            return retArr;
            /**
             * 转化字符串为对象
             */
            function handleObj(s) {
                s = s.trim();
                if (s.charAt(0) === '{') { //转换为对象
                    s = eval('(' + s + ')');
                }
                return s;
            }
        }
    }
    /**
     * 过滤类型
     */
    FilterManager.filterTypes = new Map();
    /**
     * 不可编辑类型
     */
    FilterManager.cantEditTypes = ['date', 'currency', 'number', 'tolowercase', 'touppercase', 'orderBy', 'filter'];
    nodom.FilterManager = FilterManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=filtermanager.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 链式操作器
     */
    class Linker {
        /**
         *
         * @param type 		类型，包括：ajax(ajax请求),getfiles(加载多个文件),dolist(执行多个异步操作)
         * @param config 	配置参数，针对不同type配置不同
         */
        static gen(type, config) {
            let p;
            switch (type) {
                case 'ajax': //单个ajax
                    p = this.ajax(config);
                    break;
                case 'getfiles': //ajax get 多个文件
                    p = this.getfiles(config);
                    break;
                case 'dolist': //同步操作组
                    if (arguments.length === 3) {
                        p = this.dolist(config.funcs, config.params);
                    }
                    else {
                        p = this.dolist(config.funcs);
                    }
            }
            return p;
        }
        /**
         * ajax 请求
         * @param config 	url 				请求地址
         *					reqType 			请求类型 GET(默认) POST
         *					params 				参数，json格式
         *					async 				异步，默认true
         *  				timeout 			超时时间
         *					withCredentials 	同源策略，跨域时cookie保存，默认false
         *
         */
        static ajax(config) {
            return new Promise((resolve, reject) => {
                //随机数
                if (config.rand) { //针对数据部分，仅在app中使用
                    config.params = config.params || {};
                    config.params.$rand = Math.random();
                }
                let url = config.url;
                const async = config.async === false ? false : true;
                const req = new XMLHttpRequest();
                //设置同源策略
                req.withCredentials = config.withCredentials;
                //类型默认为get
                const reqType = config.reqType || 'GET';
                //超时，同步时不能设置
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
                        //参数
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
        }
        /**
         * 通过get获取多个文件
         * @param urls 	文件url数组
         */
        static getfiles(urls) {
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
        }
        /**
         * 同步顺序执行
         * @param funcArr 	函数数组
         * @param paramArr 	参数数组
         * @returns 		promise对象
         */
        static dolist(funcArr, paramArr) {
            return foo(funcArr, 0, paramArr);
            function foo(fa, i, pa) {
                if (fa.length === 0) {
                    return Promise.resolve();
                }
                else {
                    return new Promise((resolve, reject) => {
                        if (pa !== null || pa !== undefined) {
                            fa[i](resolve, reject, pa[i]);
                        }
                        else {
                            fa[i](resolve, reject);
                        }
                    }).then((success) => {
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
//# sourceMappingURL=linker.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 消息类
     */
    class Message {
        /**
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        constructor(fromModule, toModule, content) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
            this.readed = false;
        }
    }
    nodom.Message = Message;
    /**
     * 消息队列
     */
    class MessageQueue {
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        static add(from, to, data) {
            this.messages.push(new Message(from, to, data));
        }
        /**
         * 处理消息队列
         */
        static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg = this.messages[i];
                let module = nodom.ModuleFactory.get(msg.toModule);
                // 模块状态未未激活或激活才接受消息
                if (module && module.state === 2 || module.state === 3) {
                    module.receive(msg.fromModule, msg.content);
                }
                // 清除已接受消息，或已死亡模块的消息
                if (module && module.state >= 2) {
                    MessageQueue.messages.splice(i--, 1);
                }
            }
        }
    }
    /**
     * 消息数组
     */
    MessageQueue.messages = [];
    nodom.MessageQueue = MessageQueue;
})(nodom || (nodom = {}));
//# sourceMappingURL=messagequeue.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 方法工厂，每个模块一个
     */
    class MethodFactory extends nodom.Factory {
        /**
         * 调用方法
         * @param name 		方法名
         * @param params 	方法参数数组
         */
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
//# sourceMappingURL=methodfactory.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 模型类
     */
    class Model {
        /**
         * @param data 		数据
         * @param module 	模块对象
         */
        constructor(data, module) {
            /**
             * 模型字段集
             */
            this.fields = {};
            this.data = data;
            this.fields = {};
            // modelId
            this.id = nodom.Util.genId();
            //添加到model工厂
            if (module) {
                this.moduleName = module.name;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id + '', this);
                }
            }
            // 给data设置modelid
            data['$modelId'] = this.id;
            this.addSetterGetter(data);
        }
        /**
         * 设置属性，可能属性之前不存在，用于在初始化不存在的属性创建和赋值
         * @param key       键，可以带“.”，如a, a.b.c
         * @param value     对应值
         */
        set(key, value) {
            let fn, data;
            let index = key.lastIndexOf('.');
            if (index !== -1) { //key中有“.”
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                data = this.query(key);
            }
            else {
                fn = key;
                data = this.data;
            }
            //数据不存在
            if (data === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.dataItem, key);
            }
            if (data[fn] !== value) {
                let module = nodom.ModuleFactory.get(this.moduleName);
                // object或array需要创建新model
                if (nodom.Util.isObject(value) || nodom.Util.isArray(value)) {
                    new Model(value, module);
                }
                let model = module.modelFactory.get(data.$modelId);
                if (model) {
                    //如果不存在，则需要定义 set 方法
                    if (data[fn] === undefined) {
                        this.defineProp(data, fn);
                    }
                    model.update(fn, value);
                }
                data[fn] = value;
            }
        }
        /**
         * 更新字段值
         * @param field 	字段名或空(数组更新)
         * @param value 	字段对应的新值
         */
        update(field, value) {
            let change = false;
            //对象设置值
            if (nodom.Util.isString(field)) {
                if (this.fields[field] !== value) {
                    this.fields[field] = value;
                    change = true;
                }
            }
            //添加到模块数据改变
            if (change) {
                nodom.ModuleFactory.get(this.moduleName).dataChange(this);
            }
        }
        /**
         * 为对象添加setter
         */
        addSetterGetter(data) {
            if (nodom.Util.isObject(data)) {
                nodom.Util.getOwnProps(data).forEach((p) => {
                    let v = data[p];
                    if (nodom.Util.isObject(v) || nodom.Util.isArray(v)) {
                        new Model(v, nodom.ModuleFactory.get(this.moduleName));
                    }
                    else {
                        this.update(p, v);
                        this.defineProp(data, p);
                    }
                });
            }
            else if (nodom.Util.isArray(data)) {
                //监听数组事件
                let watcher = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module = nodom.ModuleFactory.get(this.moduleName);
                //添加自定义事件，绑定改变事件
                watcher.forEach((item) => {
                    data[item] = () => {
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
                                //插入新元素
                                if (arguments.length > 2) {
                                    for (let i = 2; i < arguments.length; i++) {
                                        args.push(arguments[i]);
                                    }
                                }
                                break;
                            case 'pop':
                                // module.deleteData(data[data.length - 1].$modelId);
                                break;
                            case 'shift':
                                // module.deleteData(data[0].$modelId);
                                break;
                        }
                        this.update(data);
                        Array.prototype[item].apply(data, arguments);
                        //递归创建新model
                        args.forEach((arg) => {
                            if (nodom.Util.isObject(arg) || nodom.Util.isArray(arg)) {
                                new Model(arg, nodom.ModuleFactory.get(this.moduleName));
                            }
                        });
                    };
                });
                //设置model
                data.forEach((item) => {
                    if (nodom.Util.isObject(item) || nodom.Util.isArray(item)) {
                        new Model(item, nodom.ModuleFactory.get(this.moduleName));
                    }
                });
            }
        }
        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性
         */
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
        /**
         * 查询字段值
         * @param name 		字段名，可以是多段式 如 a.b.c
         */
        query(name) {
            let data = this.data;
            let fa = name.split(".");
            for (let i = 0; i < fa.length && null !== data && typeof data === 'object'; i++) {
                if (data === undefined) {
                    return;
                }
                //是数组
                if (fa[i].charAt(fa[i].length - 1) === ']') {
                    let f = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    //处理单重或多重数组
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
//# sourceMappingURL=model.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 模型工厂
     */
    class ModelFactory extends nodom.Factory {
    }
    nodom.ModelFactory = ModelFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=modelfactory.js.map
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
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 过滤器工厂，存储模块过滤器
     */
    class ModuleFactory {
        /**
         * 添加模块到工厂
         */
        static add(name, item) {
            this.items.set(name, item);
        }
        /**
         * 获得模块
         * @param name 	模块名
         */
        static get(name) {
            return this.items.get(name);
        }
        /**
         * 从工厂移除模块
         * @param name	模块名
         */
        static remove(name) {
            this.items.delete(name);
        }
        /**
         * 设置主模块
         * @param m 	模块
         */
        static setMain(m) {
            this.mainModule = m;
        }
        /**
         * 获取主模块
         * @returns 	应用的主模块
         */
        static getMain() {
            return this.mainModule;
        }
    }
    ModuleFactory.items = new Map();
    nodom.ModuleFactory = ModuleFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=modulefactory.js.map
/// <reference path="nodom.ts" />
/**
 * @description 异常处理类
 * @since       0.0.1
 */
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
            let params = [];
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
//# sourceMappingURL=nodomerror.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 事件类
     * @remarks
     * 事件分为自有事件和代理事件
     * 自有事件绑定在view上
     * 代理事件绑定在父view上，存储于事件对象的events数组中
     * 如果所绑定对象已存在该事件名对应的事件，如果是代理事件，则添加到子事件队列，否则替换view自有事件
     * 事件执行顺序，先执行代理事件，再执行自有事件
     *
     * @author      yanglei
     * @since       1.0
     */
    class NodomEvent {
        /**
         * @param eventName     事件名
         * @param eventStr      事件串,以“:”分割,中间不能有空格,结构为: 方法名[:delg(代理到父对象):nopopo(禁止冒泡):once(只执行一次):capture(useCapture)]
         */
        constructor(eventName, eventStr) {
            this.name = eventName;
            //如果事件串不为空，则不需要处理
            if (eventStr) {
                eventStr.split(':').forEach((item, i) => {
                    item = item.trim();
                    if (i === 0) { //事件方法
                        this.handler = item;
                    }
                    else { //事件附加参数
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
            //设备类型  1:触屏，2:非触屏	
            let dtype = 'ontouchend' in document ? 1 : 2;
            //触屏事件根据设备类型进行处理
            if (dtype) { //触屏设备
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
            else { //转非触屏
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
        /**
         * 事件触发
         * @param e  事件
         */
        fire(e) {
            const module = nodom.ModuleFactory.get(this.moduleName);
            const dom = module.renderTree.query(this.domKey);
            if (!module.hasContainer()) {
                return;
            }
            const el = module.container.querySelector("[key='" + this.domKey + "']");
            const model = module.modelFactory.get(dom.modelId);
            //如果capture为true，则先执行自有事件，再执行代理事件，否则反之
            if (this.capture) {
                handleSelf(e, model, module, el);
                handleDelg(e, model, module, el);
            }
            else {
                if (handleDelg(e, model, module, el)) {
                    handleSelf(e, model, module, el);
                }
            }
            //判断是否清除事件
            if (this.events !== undefined && this.events[this.name].length === 0 && this.handler === undefined) {
                if (ExternalEvent.touches[this.name]) {
                    ExternalEvent.unregist(this, el);
                }
                else {
                    if (el !== null) {
                        el.removeEventListener(this.name, this.handleListener);
                    }
                }
            }
            /**
             * 处理自有事件
             * @param model     模型
             * @param e         事件
             * @param module    模块
             * @param el        事件element
             */
            function handleDelg(e, model, module, el) {
                //代理事件执行
                if (this.events === undefined) {
                    return true;
                }
                let arr = this.events[this.name];
                if (nodom.Util.isArray(arr)) {
                    if (arr.length > 0) {
                        for (let i = 0; i < arr.length; i++) {
                            // 找到对应的子事件执行
                            if (arr[i].el && arr[i].el.contains(e.target)) {
                                //执行
                                arr[i].fire(e);
                                //执行一次，需要移除
                                if (arr[i].once) {
                                    this.removeSubEvt(arr[i]);
                                }
                                //禁止冒泡
                                if (arr[i].nopopo) {
                                    return false;
                                }
                            }
                        }
                    }
                    else { //删除该事件
                        this.events.delete(this.name);
                    }
                }
                return true;
            }
            /**
             * 处理自有事件
             * @param model     模型
             * @param e         事件
             * @param module    模块
             * @param el        事件element
             */
            function handleSelf(e, model, module, el) {
                let foo = module.methodFactory.get(this.handler);
                //自有事件
                if (nodom.Util.isFunction(foo)) {
                    //禁止冒泡
                    if (this.nopopo) {
                        e.stopPropagation();
                    }
                    nodom.Util.apply(foo, model, [e, module, el, dom]);
                    //事件只执行一次，则删除handler
                    if (this.once) {
                        delete this.handler;
                    }
                }
            }
        }
        /**
         * 绑定事件
         * @param module    模块
         * @param vdom      虚拟dom
         * @param el        element
         
         */
        bind(module, vdom, el) {
            const me = this;
            this.domKey = vdom.key;
            this.moduleName = module.name;
            //触屏事件
            if (ExternalEvent.touches[this.name]) {
                ExternalEvent.regist(me, el);
            }
            else {
                this.handleListener = el.addEventListener(this.name, function (e) {
                    this.fire(e);
                }, this.capture);
            }
        }
        /**
         *
         * 事件代理到父对象
         * @param module    模块
         * @param vdom      虚拟dom
         * @param el        事件作用的html element
         * @param parent    父虚拟dom
         * @param parentEl  父element
         */
        delegateTo(module, vdom, el, parent, parentEl) {
            const me = this;
            this.domKey = vdom.key;
            this.moduleName = module.name;
            //如果不存在父对象，则用body
            if (!parentEl) {
                parentEl = document.body;
            }
            //父节点如果没有这个事件，则新建，否则直接指向父节点相应事件
            if (!parent.events.includes(this)) {
                let ev = new NodomEvent(this.name);
                ev.bind(module, parent, parentEl);
                parent.events.push(ev);
            }
            //添加子事件
            parent.events[parent.events.indexOf(this)].addSubEvt(me);
        }
        /**
         * 添加子事件
         * @param ev    事件
         */
        addSubEvt(ev) {
            if (!this.events) {
                this.events = new Map();
            }
            //事件类型对应的数组
            if (!this.events.has(this.name)) {
                this.events.set(this.name, new Array());
            }
            this.events.get(this.name).push(ev);
        }
        /**
         * 移除子事件
         * @param ev    子事件
         */
        removeSubEvt(ev) {
            const me = this;
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
            const me = this;
            let evt = new Event(this.name);
            let arr = ['delg', 'once', 'nopopo', 'useCapture', 'handler', 'handleEvent', 'module'];
            arr.forEach((item) => {
                evt[item] = me[item];
            });
            return evt;
        }
    }
    nodom.NodomEvent = NodomEvent;
    /****************扩展事件*********************/
    class ExternalEvent {
        /**
         * 注册事件
         * @param evtObj    event对象
         */
        static regist(evtObj, el) {
            //触屏事件组
            let touchEvts = this.touches.get(evtObj.name);
            //如果绑定了，需要解绑
            if (!nodom.Util.isEmpty(evtObj.touchListeners)) {
                this.unregist(evtObj);
            }
            if (!el) {
                const module = nodom.ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }
            // el不存在
            evtObj.touchListeners = new Map();
            if (touchEvts && el !== null) {
                // 绑定事件组
                nodom.Util.getOwnProps(touchEvts).forEach(function (ev) {
                    //先记录下事件，为之后释放
                    evtObj.touchListeners[ev] = function (e) {
                        touchEvts[ev](e, evtObj);
                    };
                    el.addEventListener(ev, evtObj.touchListeners[ev], evtObj.capture);
                });
            }
        }
        /**
         * 取消已注册事件
         * @param evtObj    event对象
         * @param el        事件绑定的html element
         */
        static unregist(evtObj, el) {
            const evt = ExternalEvent.touches.get(evtObj.name);
            if (!el) {
                const module = nodom.ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }
            if (evt) {
                // 解绑事件
                if (el !== null) {
                    nodom.Util.getOwnProps(evtObj.touchListeners).forEach(function (ev) {
                        el.removeEventListener(ev, evtObj.touchListeners[ev]);
                    });
                }
            }
        }
    }
    /**
     * 触屏事件
     */
    ExternalEvent.touches = {};
    nodom.ExternalEvent = ExternalEvent;
    /**
     * 触屏事件
     */
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
                //判断是否移动
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    pos.move = true;
                }
            },
            touchend: function (e, evtObj) {
                let pos = evtObj.extParams.pos;
                let dt = Date.now() - pos.t;
                //点下时间不超过200ms
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
                //50ms记录一次
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
                //取值序号 0 或 1，默认1，如果释放时间与上次事件太短，则取0
                let ind = (nt - mv.oldTime[1] < 30) ? 0 : 1;
                let dx = mv.oldLoc.x - mv.speedLoc[ind].x;
                let dy = mv.oldLoc.y - mv.speedLoc[ind].y;
                let s = Math.sqrt(dx * dx + dy * dy);
                let dt = nt - mv.oldTime[ind];
                //超过300ms 不执行事件
                if (dt > 300 || s < 10) {
                    return;
                }
                let v0 = s / dt;
                //速度>0.1,触发swipe事件
                if (v0 > 0.05) {
                    let sname = '';
                    if (dx < 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0; //添加附加参数到e
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
    //swipe事件
    ExternalEvent.touches['swipeleft'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swiperight'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipeup'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipedown'] = ExternalEvent.touches['swipe'];
})(nodom || (nodom = {}));
//# sourceMappingURL=nodomevent.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 渲染器
     */
    class Renderer {
        /**
         * 添加到渲染列表
         * @param module 模块
         */
        static add(module) {
            //非激活状态
            if (module.state !== 3) {
                return;
            }
            //如果已经在列表中，不再添加
            if (this.waitList.indexOf(module.name) === -1) {
                //计算优先级
                this.waitList.push(module.name);
            }
        }
        //从列表移除
        static remove(module) {
            let ind;
            if ((ind = this.waitList.indexOf(module.name)) !== -1) {
                this.waitList.splice(ind, 1);
            }
        }
        /**
         * 队列渲染
         */
        static render() {
            //调用队列渲染
            for (let i = 0; i < this.waitList.length; i++) {
                let m = nodom.ModuleFactory.get(this.waitList[i]);
                if (!m || m.render()) {
                    this.waitList.splice(i--, 1);
                }
            }
        }
    }
    /**
     * 等待渲染列表（模块名）
     */
    Renderer.waitList = [];
    nodom.Renderer = Renderer;
})(nodom || (nodom = {}));
//# sourceMappingURL=renderer.js.map
/// <reference path="nodom.ts" />
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
     * @since 		1.0.0
     * @date		2017-01-21
     */
    class Router {
        /**
         * 往路由管理器中添加路径
         * @param path 	路径
         */
        static addPath(path) {
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
        }
        /**
         * 启动加载
         */
        static load() {
            //在加载，或无等待列表，则返回
            if (this.loading || this.waitList.length === 0) {
                return;
            }
            let path = this.waitList.shift();
            this.loading = true;
            this.start(path);
        }
        /**
         * 切换路由
         * @param path 	路径
         */
        static start(path) {
            let diff = this.compare(this.currentPath, path);
            //获得当前模块，用于寻找router view
            let parentModule = diff[0] === null ? nodom.ModuleFactory.getMain() : nodom.ModuleFactory.get(diff[0].module);
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
            let operArr = []; //待操作函数数组
            let paramArr = []; //函数对应参数数组
            let showPath; //实际要显示的路径
            //设置active
            if (diff[2].length === 0) { //路由相同，参数不同
                if (diff[0] !== null) {
                    setRouteParamToModel(diff[0]);
                    //用父路由路径
                    if (!diff[0].useParentPath) {
                        showPath = diff[0].fullPath;
                    }
                    diff[0].setLinkActive(true);
                }
            }
            else { //路由不同
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
                        throw new nodom.NodomError('notexist', nodom.TipWords.routeView);
                    }
                    //构建module route map
                    Router.moduleRouteMap[route.module] = route.id;
                    //参数数组
                    paramArr.push(route.module);
                    //操作数组
                    operArr.push((resolve, reject, moduleName) => {
                        let module = nodom.ModuleFactory.get(moduleName);
                        //添加before first render 操作
                        module.addBeforeFirstRenderOperation(function () {
                            //清空模块容器
                            nodom.Util.empty(module.container);
                        });
                        //保留container参数
                        module.containerParam = {
                            module: parentModule.name,
                            selector: "[key='" + parentModule.routerKey + "']"
                        };
                        //激活模块
                        module.active((model) => {
                            let route = Router.routes.get(Router.moduleRouteMap[module.name]);
                            if (!route) {
                                return;
                            }
                            route.setLinkActive(true);
                            delete Router.moduleRouteMap[module.name];
                            setRouteParamToModel(route);
                            if (nodom.Util.isFunction(this.onDefaultEnter)) {
                                this.onDefaultEnter(model);
                            }
                            if (nodom.Util.isFunction(route.onEnter)) {
                                route.onEnter(model);
                            }
                            parentModule = module;
                            if (resolve) {
                                resolve();
                            }
                        });
                    });
                }
            }
            if (!showPath) {
                if (!this.getRoute(path)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.route, path);
                }
            }
            //如果是history popstate，则不加入history
            if (this.startStyle !== 2 && showPath) {
                //子路由，替换state
                if (this.showPath && showPath.indexOf(this.showPath) === 0) {
                    history.replaceState(path, '', nodom.Application.routerPrePath + showPath);
                }
                else { //路径push进history
                    history.pushState(path, '', nodom.Application.routerPrePath + showPath);
                }
                //设置显示路径
                this.showPath = showPath;
            }
            if (operArr.length === 0) {
                Router.loading = false;
                Router.startStyle = 0;
                return;
            }
            //修改currentPath
            this.currentPath = path;
            //同步加载模块
            nodom.Linker.gen("dolist", { funcs: operArr, params: paramArr }).then(() => {
                Router.loading = false;
                this.load();
                Router.startStyle = 0;
            }).catch((e) => {
                throw e;
            });
            /**
             * 将路由参数放入model
             * @param route 	路由
             */
            function setRouteParamToModel(route) {
                if (!route) {
                    return;
                }
                const module = nodom.ModuleFactory.get(route.module);
                let model = module.model;
                let o = {
                    path: route.path
                };
                if (!nodom.Util.isEmpty(route.data)) {
                    o['data'] = route.data;
                }
                if (!model) {
                    module.model = new nodom.Model({ $route: o }, module);
                }
                else {
                    model.data['$route'] = o;
                }
                nodom.Renderer.add(module);
            }
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
                throw new nodom.NodomError("exist1", nodom.TipWords.route, route.path);
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
                return [routes[routes.length - 1]];
            }
            else { //获取所有
                return routes;
            }
        }
        /**
         * 比较两个路径对应的路由链
         * @param path1 	第一个路径
         * @param path2 	第二个路径
         * @returns 		[不同路由的父路由，第一个需要销毁的路由数组，第二个需要增加的路由数组，第二个路由]
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
            let retArr1 = [];
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
            if (!module || !path || path === '' || !module.routerActiveViews) {
                return;
            }
            //遍历router active view，设置或取消active class
            module.routerActiveViews.forEach((item) => {
                let dom = module.renderTree.query(item);
                if (!dom) {
                    return;
                }
                // dom route 路径
                let domPath = dom.props['path'];
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
                    }
                    else {
                        model.data[field] = false;
                    }
                }
                else if (dom.props.hasOwnProperty('active')) { //active值属性
                    //路径相同或参数路由路径前部分相同则设置active 为true，否则为false
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
     * module 和 route映射关系 {moduleName:routeId,...}
     */
    Router.moduleRouteMap = new Map();
    /**
     * 启动方式 0:直接启动 1:由element active改变启动 2:popstate 启动
     */
    Router.startStyle = 0;
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
         * @param ancestor 		是否激活祖先路由 true/false
         */
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
                            node.children.push(new Route({ path: prePath, notAdd: true }));
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
                node.children.push(route);
            }
            return true;
        }
        /**
         * 从路由树中获取路由节点
         * @param path  	路径
         */
        static get(path) {
            if (!this.root) {
                throw new nodom.NodomError("notexist", nodom.TipWords.root);
            }
            let pathArr = path.split('/');
            let node = this.root;
            let paramIndex = 0;
            let retArr = [];
            let fullPath = ''; //完整路径
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
    /**
     * 增加route指令
     */
    nodom.DirectiveManager.addType('route', {
        init: (directive, dom, module) => {
            let value = directive.value;
            if (nodom.Util.isEmpty(value)) {
                return;
            }
            //a标签需要设置href
            if (dom.tagName === 'A') {
                dom.props['href'] = 'javascript:void(0)';
            }
            // 表达式处理
            if (value && value.substr(0, 2) === '{{' && value.substr(value.length - 2, 2) === '}}') {
                let expr = new nodom.Expression(value.substring(2, value.length - 2), module);
                dom.exprProps['path'] = expr;
                directive.value = expr;
            }
            else {
                dom.props['path'] = value;
            }
            //添加click事件
            let method = '$nodomGenMethod' + nodom.Util.genId();
            module.methodFactory.add(method, (e, module, view, dom) => {
                let path = dom.props['path'];
                if (!path) {
                    return;
                }
                Router.addPath(path);
            });
            dom.events['click'] = new nodom.NodomEvent('click', method);
        },
        handle: (directive, dom, module, parent) => {
            //添加到active view 队列
            if (!module.routerActiveViews) {
                module.routerActiveViews = [];
            }
            if (module.routerActiveViews.indexOf(dom.key) === -1) {
                //设置已添加标志，避免重复添加
                module.routerActiveViews.push(dom.key);
                if (dom.props.hasOwnProperty('active')) {
                    let route = Router.getRoute(dom.props['path'], true);
                    if (route === null) {
                        return;
                    }
                }
            }
            let path = dom.props['path'];
            if (path === Router.currentPath) {
                return;
            }
            //active需要跳转路由（当前路由为该路径对应的父路由）
            if (dom.props['active'] && dom.props['active'] !== 'false' && (!Router.currentPath || path.indexOf(Router.currentPath) === 0)) {
                Router.addPath(path);
            }
        }
    });
    /**
     * 增加router指令
     */
    nodom.DirectiveManager.addType('router', {
        init: (directive, dom, module) => {
            module.routerKey = dom.key;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
})(nodom || (nodom = {}));
//# sourceMappingURL=router.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 调度器，用于每次空闲的待操作序列调度
     */
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
        /**
         * 添加任务
         * @param foo 		任务和this指向
         * @param thiser 	this指向
         */
        static addTask(foo, thiser) {
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError("invoke", "Scheduler.addTask", "0", "function");
            }
            Scheduler.tasks.push({ func: foo, thiser: thiser });
        }
        /**
         * 移除任务
         * @param foo 	任务
         */
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
    nodom.Scheduler = Scheduler;
})(nodom || (nodom = {}));
//# sourceMappingURL=scheduler.js.map
/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     *  编译器
     *  描述：用于进行预编译和预编译后的json串反序列化，处理两个部分：虚拟dom树和表达式工厂
     */
    class Serializer {
        /**
         * 序列化，只序列化 virtualDom、expressionFactory
         * @param module 	模块
         * @return   		jsonstring
         */
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
            /**
             * 为对象添加class name（递归执行）
             * @param obj 	对象
             */
            function addClsName(obj) {
                if (typeof obj !== 'object') {
                    return;
                }
                obj.className = obj.constructor.name;
                nodom.Util.getOwnProps(obj).forEach((item) => {
                    if (nodom.Util.isArray(obj[item])) {
                        //删除空数组
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
                        //删除空对象
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
        /**
         * 反序列化
         * @param jsonStr 	json串
         * @param module 	模块
         * @returns 		[virtualDom,expressionFactory]
         */
        static deserialize(jsonStr, module) {
            let jsonArr = JSON.parse(jsonStr);
            let arr = [];
            let vdom; //虚拟dom
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
                    //指令需要传入参数
                    switch (cls) {
                        case 'Directive':
                            param = [jsonObj['type'], jsonObj['value'], vdom, module];
                            break;
                        case 'Event':
                            param = [jsonObj['name']];
                            break;
                    }
                    let clazz = eval(cls);
                    // retObj = new .newInstance(cls,param);
                    if (cls === 'Element') {
                        vdom = retObj;
                    }
                }
                else {
                    retObj = {};
                }
                //子对象可能用到父对象属性，所以子对象要在属性赋值后处理
                let objArr = []; //子对象
                let arrArr = []; //子数组
                nodom.Util.getOwnProps(jsonObj).forEach((item) => {
                    //子对象
                    if (nodom.Util.isObject(jsonObj[item])) {
                        objArr.push(item);
                    }
                    else if (nodom.Util.isArray(jsonObj[item])) { //子数组
                        arrArr.push(item);
                    }
                    else { //普通属性
                        if (item !== 'className') {
                            retObj[item] = jsonObj[item];
                        }
                    }
                });
                //子对象处理
                objArr.forEach((item) => {
                    retObj[item] = handleCls(jsonObj[item]);
                });
                //子数组处理
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
//# sourceMappingURL=serializer.js.map
/// <reference path="../nodom.ts" />
var nodom;
(function (nodom) {
    /**
     *  指令类型初始化
     *  每个指令类型都有一个init和handle方法，init和handle都可选
     *  init 方法在编译时执行，包含一个参数 directive(指令)、dom(虚拟dom)、module(模块),el(html element)，无返回
     *  handle方法在渲染时执行，包含三个参数 directive(指令)、dom(虚拟dom)、module(模块)、parent(父虚拟dom)
     *  return true/false false则不进行后面的所有渲染工作
     */
    nodom.DirectiveManager.addType('model', {
        prio: 1,
        init: (directive, dom, module, el) => {
            let value = directive.value;
            //处理以.分割的字段，没有就是一个
            if (nodom.Util.isString(value)) {
                let arr = new Array();
                value.split('.').forEach((item) => {
                    let ind1 = -1, ind2 = -1;
                    if ((ind1 = item.indexOf('[')) !== -1 && (ind2 = item.indexOf(']')) !== -1) { //数组
                        let fn = item.substr(0, ind1);
                        let index = item.substring(ind1 + 1, ind2);
                        arr.push(fn + ',' + index);
                    }
                    else { //普通字符串
                        arr.push(item);
                    }
                });
                directive.value = arr;
            }
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId + '');
            if (!model || !model.data) {
                return;
            }
            let data = model.data;
            directive.value.forEach((item) => {
                if (!data) {
                    return;
                }
                if (item.indexOf(',') !== -1) { //处理数组
                    let a = item.split(',');
                    data = data[a[0]][parseInt(a[1])];
                }
                else { //非数组
                    data = data[item];
                }
            });
            if (data) {
                dom.modelId = data.$modelId;
            }
            return true;
        }
    });
    /**
     * 指令名 repeat
     * 描述：重复指令
     */
    nodom.DirectiveManager.addType('repeat', {
        prio: 2,
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let ind, filter, modelName;
            //过滤器
            if ((ind = value.indexOf('|')) !== -1) {
                modelName = value.substr(0, ind).trim();
                directive.filter = new nodom.Filter(value.substr(ind + 1));
            }
            else {
                modelName = value;
            }
            // 增加model指令
            if (!dom.hasDirective('mocel')) {
                dom.directives.push(new nodom.Directive('model', modelName, dom, module));
            }
            directive.value = modelName;
        },
        handle: (directive, dom, module, parent) => {
            const modelFac = module.modelFactory;
            let rows = modelFac.get(dom.modelId + '').data;
            //有过滤器，处理数据集合
            if (directive.filter !== undefined) {
                rows = directive.filter.exec(rows, module);
            }
            // 无数据，不渲染
            if (rows === undefined || rows.length === 0) {
                dom.dontRender = true;
                return true;
            }
            let chds = [];
            let key = dom.key;
            // 移除指令
            dom.removeDirectives(['model', 'repeat']);
            for (let i = 0; i < rows.length; i++) {
                let node = dom.clone();
                //设置modelId
                node.modelId = rows[i].$modelId;
                //设置key
                setKey(node, key, node.modelId);
                rows[i].$index = i;
                chds.push(node);
            }
            //找到并追加到dom后
            if (chds.length > 0) {
                for (let i = 0, len = parent.children.length; i < len; i++) {
                    if (parent.children[i] === dom) {
                        chds = [i + 1, 0].concat(chds);
                        Array.prototype.splice.apply(parent.children, chds);
                        break;
                    }
                }
            }
            // 不渲染该节点
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
    /**
     * 指令名 if
     * 描述：条件指令
     */
    nodom.DirectiveManager.addType('if', {
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            //value为一个表达式
            let expr = new nodom.Expression(value, module);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            //设置forceRender
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //找到并存储if和else在父对象中的位置
            let indif = -1, indelse = -1;
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === dom) {
                    indif = i;
                }
                else if (indelse === -1 && parent.children[i].hasDirective('else')) {
                    indelse = i;
                }
                //if后的第一个element带else才算，否则不算
                if (i !== indif && indif !== -1 && indelse === -1 && parent.children[i].tagName !== undefined) {
                    indelse = -2;
                }
                //都找到了
                if (indif !== -1 && indelse !== -1) {
                    break;
                }
            }
            if (v && v !== 'false') { //为真
                let ind = 0;
                //删除else
                if (indelse > 0) {
                    parent.children[indelse].dontRender = true;
                }
            }
            else if (indelse > 0) { //为假则进入else渲染
                //替换if
                dom.dontRender = true;
            }
            return true;
        }
    });
    /**
     * 指令名 else
     * 描述：else指令
     */
    nodom.DirectiveManager.addType('else', {
        name: 'else',
        init: (directive, dom, module, el) => {
            return;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
    /**
     * 指令名 show
     * 描述：显示指令
     */
    nodom.DirectiveManager.addType('show', {
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-show");
            }
            let expr = new nodom.Expression(value, module);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //渲染
            if (v && v !== 'false') {
                dom.dontRender = false;
            }
            else { //不渲染
                dom.dontRender = true;
            }
        }
    });
    /**
     * 指令名 class
     * 描述：class指令
     */
    nodom.DirectiveManager.addType('class', {
        init: (directive, dom, module, el) => {
            //转换为json数据
            let obj = eval('(' + directive.value + ')');
            if (!nodom.Util.isObject(obj)) {
                return;
            }
            let robj = {};
            nodom.Util.getOwnProps(obj).forEach(function (key) {
                if (nodom.Util.isString(obj[key])) {
                    //如果是字符串，转换为表达式
                    robj[key] = new nodom.Expression(obj[key], module);
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
                    //移除class
                    if (ind !== -1) {
                        clsArr.splice(ind, 1);
                    }
                }
                else if (ind === -1) { //添加class
                    clsArr.push(key);
                }
            });
            //刷新dom的class
            dom.props['class'] = clsArr.join(' ');
        }
    });
    /**
     * 指令名 field
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('field', {
        init: (directive, dom, module, el) => {
            // 带过滤器情况
            let dv = directive.value;
            let field = dv;
            let tgname = dom.tagName.toLowerCase();
            let type = dom.props['type'];
            let eventName = 'input';
            if (tgname === 'input' && (type === 'checkbox' || type === 'radio')) {
                eventName = 'change';
            }
            //增加name属性
            dom.props['name'] = field;
            //增加自定义方法
            let method = '$nodomGenMethod' + nodom.Util.genId();
            module.methodFactory.add(method, function (e, module, view, dom) {
                let type = dom.props['type'];
                let model = module.modelFactory.get(dom.modelId);
                let field = dom.getDirective('field').value;
                let v = view.value;
                //根据选中状态设置checkbox的value
                if (type === 'checkbox') {
                    if (dom.props['yes-value'] == v) {
                        v = dom.props['no-value'];
                    }
                    else {
                        v = dom.props['yes-value'];
                    }
                }
                else if (type === 'radio') {
                    if (!view.checked) {
                        v = undefined;
                    }
                }
                //修改字段值
                this.data[field] = v;
                //修改value值，该节点不重新渲染
                if (type !== 'radio') {
                    dom.props['value'] = v;
                    view.value = v;
                }
            });
            //追加事件
            dom.events[eventName] = new nodom.NodomEvent(eventName, method);
            //增加value属性，属性可能在后面，需要延迟处理
            setTimeout(() => {
                //增加value属性
                if (!dom.exprProps.hasOwnProperty('value') && !dom.props.hasOwnProperty('value')) {
                    dom.exprProps['value'] = new nodom.Expression(field, module);
                }
            }, 0);
        },
        handle: (directive, dom, module, parent) => {
            const type = dom.props['type'];
            const tgname = dom.tagName.toLowerCase();
            const model = module.modelFactory.get(dom.modelId);
            const dataValue = model.data[directive.value];
            let value = dom.props['value'];
            if (type === 'radio') {
                if (dataValue == value) {
                    dom.props['checked'] = 'checked';
                }
                else {
                    delete dom.props['checked'];
                }
            }
            else if (type === 'checkbox') {
                //设置状态和value
                let yv = dom.props['yes-value'];
                //当前值为yes-value
                if (dataValue == yv) {
                    dom.props['checked'] = 'checked';
                    dom.props['value'] = yv;
                }
                else { //当前值为no-value
                    delete dom.props['checked'];
                    dom.props['value'] = dom.props['no-value'];
                }
            }
            else if (tgname === 'select') { //下拉框
                dom.props['value'] = dataValue;
                //option可能没生成，延迟赋值
                setTimeout(() => {
                    let inputEl = module.container.querySelector("[key='" + dom.key + "']");
                    inputEl.value = dataValue;
                }, 0);
            }
        }
    });
    /**
     * 指令名 validity
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('validity', {
        init: (directive, dom, module, el) => {
            let ind, fn, method;
            let value = directive.value;
            //处理带自定义校验方法
            if ((ind = value.indexOf('|')) !== -1) {
                fn = value.substr(0, ind);
                method = value.substr(ind + 1);
            }
            else {
                fn = value;
            }
            directive.value = fn;
            directive.params = {
                enabled: false //不可用
            };
            //如果有方法，则需要存储
            if (method) {
                directive.params.method = method;
            }
            //如果没有子节点，添加一个，需要延迟执行
            setTimeout(() => {
                if (dom.children.length === 0) {
                    let vd1 = new nodom.Element();
                    vd1.textContent = '   ';
                    dom.children.push(vd1);
                }
                else { //子节点
                    dom.children.forEach((item) => {
                        if (item.children.length === 0) {
                            let vd1 = new nodom.Element();
                            vd1.textContent = '   ';
                            item.children.push(vd1);
                        }
                    });
                }
            }, 0);
            //添加focus和blur事件
            module.addFirstRenderOperation(function () {
                const m = this;
                const el = module.container.querySelector("[name='" + directive.value + "']");
                if (el) {
                    //增加事件
                    el.addEventListener('focus', function (e) {
                        directive.params.enabled = true;
                    });
                    el.addEventListener('blur', function (e) {
                        nodom.Renderer.add(m);
                    });
                }
            });
        },
        handle: (directive, dom, module, parent) => {
            const el = module.container.querySelector("[name='" + directive.value + "']");
            if (!directive.params.enabled) {
                dom.dontRender = true;
                return;
            }
            let chds = [];
            //找到带rel的节点
            dom.children.forEach((item) => {
                if (item.tagName !== undefined && item.props.hasOwnProperty('rel')) {
                    chds.push(item);
                }
            });
            let resultArr = [];
            //自定义方法校验
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
                // 查找校验异常属性
                for (var o in vld) {
                    if (vld[o] === true) {
                        resultArr.push(o);
                    }
                }
            }
            if (resultArr.length > 0) {
                //转换成ref对应值
                let vn = handle(resultArr);
                //单个校验
                if (chds.length === 0) {
                    setTip(dom, vn, el);
                }
                else { //多个校验
                    for (let i = 0; i < chds.length; i++) {
                        let rel = chds[i].props['rel'];
                        if (rel === vn) {
                            setTip(chds[i], vn, el);
                        }
                        else { //隐藏
                            chds[i].dontRender = true;
                        }
                    }
                }
            }
            else {
                dom.dontRender = true;
            }
            /**
             * 设置提示
             * @param vd    虚拟dom节点
             * @param vn    验证结果名
             * @param el    验证html element
             */
            function setTip(vd, vn, el) {
                //子节点不存在，添加一个
                let text = vd.children[0].textContent.trim();
                if (text === '') { //没有提示内容，根据类型提示
                    text = nodom.Util.compileStr(nodom.FormMsgs[vn], el.getAttribute(vn));
                }
                vd.children[0].textContent = text;
            }
            /**
             * 验证名转换
             */
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
//# sourceMappingURL=directiveinit.js.map
/// <reference path="../nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 新建一个App
     * @param config {global:全局配置,module:主模块配置}
     *      global:应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
     *      module:主模块配置
     */
    function newApp(config) {
        if (!config.module) {
            throw new nodom.NodomError('config', nodom.TipWords.application);
        }
        if (config.global) {
            nodom.Application.routerPrePath = config.global['routerPrePath'] || '';
            nodom.Application.templatePath = config.global['templatePath'] || '';
            nodom.Application.renderTick = config.global['renderTick'] || 100;
        }
        //消息队列消息处理任务
        nodom.Scheduler.addTask(nodom.MessageQueue.handleQueue, nodom.MessageQueue);
        //渲染器启动渲染
        nodom.Scheduler.addTask(nodom.Renderer.render, nodom.Renderer);
        //启动调度器
        nodom.Scheduler.start();
        return createModule(config.module, true);
    }
    nodom.newApp = newApp;
    /**
     * 暴露方法集
     */
    /**
     * 暴露的创建模块方法
     * @param config  	数组或单个配置
     * @param main 		是否根模块
     */
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
    /**
     * 暴露的创建路由方法
     * @param config  数组或单个配置
     */
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
    /**
     * 创建指令
     * @param name      指令名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createDirective(name, init, handler) {
    }
    nodom.createDirective = createDirective;
    /**
     * 创建插件
     * @param name      插件名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createPlugin(name, init, handler) {
    }
    nodom.createPlugin = createPlugin;
})(nodom || (nodom = {}));
//# sourceMappingURL=exposemethods.js.map
/// <reference path="../nodom.ts" />
/*
 * 消息js文件 中文文件
 */
var nodom;
(function (nodom) {
    /**
     * 提示单词
     */
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
        root: '根'
    };
    /**
     * 异常信息
     */
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
        config: "{1}配置参数错误"
    };
    /**
     * 表单信息
     */
    nodom.FormMsgs = {
        type: "请输入有效的{0}",
        unknown: "输入错误",
        required: "不能为空",
        min: "最小输入值为{0}",
        max: "最大输入值为{0}"
    };
})(nodom || (nodom = {}));
//# sourceMappingURL=msg_zh.js.map