var nodom;
(function (nodom) {
    class Compiler {
        static compile(module, elementStr) {
            const div = nodom.Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new nodom.Element();
            oe.root = true;
            for (let i = 0; i < div.childNodes.length; i++) {
                this.compileDom(module, div.childNodes[i], oe);
            }
            return oe;
        }
        static compileDom(module, ele, parent) {
            const me = this;
            let oe = new nodom.Element();
            let isComment = false;
            switch (ele.nodeType) {
                case Node.ELEMENT_NODE:
                    let el = ele;
                    oe.tagName = el.tagName;
                    for (let i = 0; i < el.attributes.length; i++) {
                        let attr = el.attributes[i];
                        let v = attr.value.trim();
                        if (attr.name.startsWith('x-')) {
                            oe.directives.push(new nodom.Directive(attr.name.substr(2), v, oe, module, el));
                        }
                        else if (attr.name.startsWith('e-')) {
                            let en = attr.name.substr(2);
                            oe.events[en] = new nodom.NodomEvent(en, attr.value.trim());
                        }
                        else {
                            let isExpr = false;
                            if (v !== '') {
                                let ra = me.compileExpression(module, v);
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
                    let subEls = [];
                    ele.childNodes.forEach((nd) => {
                        subEls.push(me.compileDom(module, nd, oe));
                    });
                    oe.directives.sort((a, b) => {
                        return nodom.DirectiveManager.getType(a.type).prio - nodom.DirectiveManager.getType(b.type).prio;
                    });
                    break;
                case Node.TEXT_NODE:
                    let txt = ele.textContent;
                    if (txt === "") {
                        return;
                    }
                    let expA = me.compileExpression(module, txt);
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
            if (!isComment && parent) {
                parent.children.push(oe);
            }
            return oe;
        }
        static compileExpression(module, exprStr) {
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
                let exp = new nodom.Expression(re[0].substring(2, re[0].length - 2), module);
                module.expressionFactory.add(exp.id, exp);
                retA.push(exp.id);
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
//# sourceMappingURL=compiler.js.map