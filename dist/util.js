var nodom;
(function (nodom) {
    class Util {
        static genId() {
            return this.generatedId++;
        }
        clone(srcObj, expKey) {
            let map = new WeakMap();
            let src = this;
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
        static merge() {
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
                throw new nodom.NodomError('invoke', 'nodom.width', '0', 'Element');
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
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === cls) {
                        return;
                    }
                }
                arr.push(cls);
                el.className = arr.join(' ');
            }
        }
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
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] === cls) {
                        arr.splice(i, 1);
                        el.className = arr.join(' ');
                        return;
                    }
                }
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
        static addStrQuot(srcStr, quot) {
            srcStr = srcStr.replace(/\'/g, '\\\'');
            srcStr = srcStr.replace(/\"/g, '\\\"');
            srcStr = srcStr.replace(/\`/g, '\\\`');
            quot = quot || '"';
            srcStr = quot + srcStr + quot;
            return srcStr;
        }
        static apply(foo, obj, args) {
            if (!foo) {
                return;
            }
            return Reflect.apply(foo, obj || null, args);
        }
    }
    Util.generatedId = 1;
    nodom.Util = Util;
})(nodom || (nodom = {}));
//# sourceMappingURL=util.js.map