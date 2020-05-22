
/// <reference path="nodom.ts" />
namespace nodom{
    /**
     * node编译器，负责模版的编译
     * @since 1.0
     */
    export class NodeCompiler {
        /**
         * 编译
         * @param elementStr    待编译html串
         * @returns             虚拟element
         */
        static compile(elementStr:string):Element {
            let oe = new Element();
            oe.root = true;
            //通过cheerio得到节点，结构为 root->body->当前节点
            const root = require('cheerio').load(elementStr).root();
            let node = root[0].children[0].children[1].children[0];
            for (let i = 0; i < node.children.length; i++) {
                this.compileDom(node.children[i], oe);
            }
            return oe;
        }

        /**
         * 编译dom
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）   
         */

        static compileDom(ele:any, parent:Element) {
            const me = this;
            let oe = new Element();
            //注视标志
            let isComment = false;
            switch (ele.type) {
            case 'tag': //元素
                oe.tagName = ele.tagName;
                //遍历attributes
                Util.getOwnProps(ele.attribs).forEach((attr)=>{
                    let v = ele.attribs[attr].trim();
                    if (attr.startsWith('x-')) { //指令
                        //添加到dom指令集
                        oe.directives.push(new Directive(attr.substr(2), v, oe, ele));
                    } else if (attr.startsWith('e-')) { //事件
                        let en = attr.substr(2);
                        oe.events[en] = new NodomEvent(en, v);
                    } else {
                        let isExpr:boolean = false;
                        if (v !== '') {
                            let ra = me.compileExpression(v);
                            if (Util.isArray(ra)) {
                                oe.exprProps[attr] = ra;
                                isExpr = true;
                            }
                        }
                        if (!isExpr) {
                            oe.props[attr] = v;
                        }
                    }
                });
                let subEls = [];
                //子节点编译
                ele.childNodes.forEach((nd:Node)=> {
                    subEls.push(me.compileDom(nd, oe));
                });

                //指令按优先级排序
                oe.directives.sort((a, b) => {
                    return DirectiveManager.getType(a.type).prio - DirectiveManager.getType(b.type).prio;
                });
                break;
            case 'text': //文本节点
                if (ele.data.trim() === "") { //内容为空不加入树
                    return;
                }
                let expA = me.compileExpression(ele.data);
                if (typeof expA === 'string') { //无表达式
                    oe.textContent = expA;
                } else { //含表达式
                    oe.expressions = expA;
                }
                break;
            case 'comment': //注释
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
        static compileExpression(exprStr:string) {
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
                let exp = new Expression(re[0].substring(2, re[0].length - 2));
                //加入工厂
                retA.push(exp);
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