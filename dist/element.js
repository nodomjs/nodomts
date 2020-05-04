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
            this.props = {};
            this.exprProps = {};
            this.events = {};
            this.expressions = [];
            this.children = [];
            this.dontRender = false;
            this.tagName = tag;
            this.key = nodom.Util.genId() + '';
        }
        render(module, parent) {
            if (parent) {
                this.parentKey = parent.key;
                if (!this.modelId) {
                    this.modelId = parent.modelId;
                }
            }
            if (this.tagName !== undefined) {
                this.handleProps(module);
                this.handleDirectives(module, parent);
            }
            else {
                this.handleTextContent(module);
            }
            if (!this.dontRender) {
                for (let i = 0; i < this.children.length; i++) {
                    let item = this.children[i];
                    item.render(module, this);
                    if (item.dontRender) {
                        this.removeChild(item);
                        i--;
                    }
                }
            }
            return true;
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
                            if (el.tagName === 'INPUT' && p.k === 'value') {
                                el.value = p.v;
                            }
                            else {
                                el.setAttribute(p.k, p.v);
                            }
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
                return el;
            }
            function newText(text, dom) {
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
            nodom.Util.getOwnProps(this).forEach((p) => {
                if (typeof this[p] !== 'object') {
                    dst[p] = this[p];
                }
            });
            for (let d of this.directives) {
                dst.directives.push(d);
            }
            nodom.Util.getOwnProps(this.props).forEach((k) => {
                dst.props[k] = this.props[k];
            });
            nodom.Util.getOwnProps(this.exprProps).forEach((k) => {
                dst.exprProps[k] = this.exprProps[k];
            });
            nodom.Util.getOwnProps(this.events).forEach((k) => {
                dst.events[k] = this.events[k].clone();
            });
            dst.expressions = this.expressions;
            this.children.forEach((d) => {
                dst.children.push(d.clone());
            });
            return dst;
        }
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
        handleExpression(exprArr, module) {
            if (this.dontRender) {
                return;
            }
            let value = '';
            let model = module.modelFactory.get(this.modelId);
            exprArr.forEach((v) => {
                if (typeof v === 'number') {
                    let v1 = module.expressionFactory.get(v).val(model);
                    if (v1 instanceof DocumentFragment || nodom.Util.isEl(v1)) {
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
        handleProps(module) {
            if (this.dontRender) {
                return;
            }
            nodom.Util.getOwnProps(this.exprProps).forEach((k) => {
                if (nodom.Util.isArray(this.exprProps[k])) {
                    this.props[k] = this.handleExpression(this.exprProps[k], module);
                }
                else if (this.exprProps[k] instanceof nodom.Expression) {
                    this.props[k] = this.exprProps[k].val(module.modelFactory.get(this.modelId));
                }
            });
        }
        handleTextContent(module) {
            if (this.dontRender) {
                return;
            }
            if (this.expressions !== undefined && this.expressions.length > 0) {
                this.textContent = this.handleExpression(this.expressions, module);
            }
        }
        handleEvents(module, el, parent, parentEl) {
            if (nodom.Util.isEmpty(this.events)) {
                return;
            }
            nodom.Util.getOwnProps(this.events).forEach((k) => {
                let ev = this.events[k];
                if (ev.delg && parent) {
                    ev.delegateTo(module, this, el, parent, parentEl);
                }
                else {
                    ev.bind(module, this, el);
                }
            });
        }
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
        hasDirective(directiveType) {
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return true;
                }
            }
            return false;
        }
        getDirective(directiveType) {
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return this.directives[i];
                }
            }
        }
        add(dom) {
            this.children.push(dom);
        }
        remove(module, delHtml) {
            if (this.parentKey !== undefined) {
                let p = module.renderTree.query(this.parentKey);
                if (p) {
                    p.removeChild(this);
                }
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
                        if (!this.props[k]) {
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
                        });
                    }
                }
            }
        }
    }
    nodom.Element = Element;
})(nodom || (nodom = {}));
//# sourceMappingURL=element.js.map