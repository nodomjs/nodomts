/// <reference path="nodom.ts" />
namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    export class Compiler {
        /**
         * 编译
         * @param elementStr    待编译html串
         * @returns             虚拟element
         */
        static compile(elementStr:string):Element {
            const div:HTMLElement = Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new Element();
            oe.root = true;
            this.handleChildren(oe,div);
            return oe;
        }

        /**
         * 编译dom
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）   
         */

        static compileDom(ele:Node) {
            let oe:Element;
            //注视标志
            let isComment = false;
            switch (ele.nodeType) {
            case Node.ELEMENT_NODE: //元素
                let el:HTMLElement = <HTMLElement>ele;
                oe = this.handleDefineEl(el);
                if(!oe){
                    oe = this.handleEl(el);
                }
                break;
            case Node.TEXT_NODE: //文本节点
                oe = new Element();
                let txt = ele.textContent;
                let expA = this.compileExpression(txt);
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
            if (!isComment) {
                return oe;
            }
        }

        /**
         * 处理element
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleEl(el:HTMLElement){
            let oe:Element = new Element();
            oe.tagName = el.tagName;
            this.handleAttributes(oe,el);
            this.handleChildren(oe,el);
            return oe;
        }

        /**
         * 处理插件
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         * @returns  如果识别自定义el，则返回true
         */
        static handleDefineEl(el:HTMLElement):Element{
            let de:IDefineElement = DefineElementManager.get(el.tagName);
            if(!de){
                return;
            }
            return de.init(el);
        }

        /**
         * 处理属性
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleAttributes(oe:Element,el:HTMLElement){
            //遍历attributes
            for (let i = 0; i < el.attributes.length; i++) {
                let attr = el.attributes[i];
                let v = attr.value.trim();
                if (attr.name.startsWith('x-')) { //指令
                    //添加到dom指令集
                    oe.directives.push(new Directive(attr.name.substr(2), v, oe, el));
                } else if (attr.name.startsWith('e-')) { //事件
                    let en = attr.name.substr(2);
                    oe.addEvent(new NodomEvent(en, attr.value.trim()));
                } else {
                    let isExpr:boolean = false;
                    if (v !== '') {
                        let ra = this.compileExpression(v);
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
            //指令按优先级排序
            oe.directives.sort((a, b) => {
                return DirectiveManager.getType(a.type).prio - DirectiveManager.getType(b.type).prio;
            });
        }

        /**
         * 处理子节点
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleChildren(oe:Element,el:HTMLElement){
            //子节点编译
            el.childNodes.forEach((nd:Node)=> {
                let o = this.compileDom(nd);
                if(o){
                    oe.children.push(o);
                }
            });
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