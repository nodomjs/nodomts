/// <reference path="nodom.ts" />
namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    export class Compiler {
        /**
         * 编译
         * @param element   待编译element
         * @return          虚拟element
         */
        static compile(module:Module, elementStr:string) {
            const div = Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new Element();
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

        static compileDom(module:Module, ele:Node, parent:Element) {
            const me = this;
            let oe = new Element();
            //注视标志
            let isComment = false;
            switch (ele.nodeType) {
            case Node.ELEMENT_NODE: //元素
                let el:HTMLElement = <HTMLElement>ele;
                oe.tagName = el.tagName;
                //遍历attributes
                for (let i = 0; i < el.attributes.length; i++) {
                    let attr = el.attributes[i];
                    let v = attr.value.trim();
                    if (attr.name.startsWith('x-')) { //指令
                        //添加到dom指令集
                        oe.directives.push(new Directive(attr.name.substr(2), v, oe, module, el));
                    } else if (attr.name.startsWith('e-')) { //事件
                        let en = attr.name.substr(2);
                        oe.events[en] = new NodomEvent(en, attr.value.trim());
                    } else {
                        let isExpr:boolean = false;
                        if (v !== '') {
                            let ra = me.compileExpression(module, v);
                            if (Util.isArray(ra)) {
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
                //子节点编译
                ele.childNodes.forEach((nd:Node)=> {
                    subEls.push(me.compileDom(module, nd, oe));
                });

                //指令按优先级排序
                oe.directives.sort((a, b) => {
                    return DirectiveManager.getType(a.type).prio - DirectiveManager.getType(b.type).prio;
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
                    
                } else { //含表达式
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
            let re:RegExpExecArray;
            let oIndex:number = 0;
            while ((re = reg.exec(exprStr)) !== null) {
                let ind = re.index;
                //字符串
                if (ind > oIndex) {
                    let s = exprStr.substring(oIndex, ind);
                    retA.push(s);
                }

                //实例化表达式对象
                let exp = new Expression(re[0].substring(2, re[0].length - 2), module);
                //加入工厂
                module.expressionFactory.add(exp.id, exp);
                retA.push(exp.id);
                oIndex = ind + re[0].length;
            }
            //最后的字符串
            if (oIndex < exprStr.length - 1) {
                retA.push(exprStr.substr(oIndex));
            }
            return retA;
        }
    }
}