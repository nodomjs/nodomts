/// <reference path="nodom.ts" />

namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    export class Compiler {
        /**
         * 编译
         * 如果为el.innerHTML方式，可能存在多个子节点，则在外面包一层父节点，因为模块只能有一个根节点，否则返回模块根节点
         * @param elementStr    待编译html串
         * @returns             虚拟dom
         */
        static compile(elementStr:string):Element {
            const div:HTMLElement = Util.newEl('div');
            div.innerHTML = elementStr;
            let oe = new Element('div');
            this.handleChildren(oe,div);
            
            //保证模块只有一个根节点
            if(oe.children.length===1){
                return oe.children[0];
            }
            return oe;
        }

        /**
         * 编译dom
         * @param ele           待编译html element
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
         * 编译html element
         * @param oe    新建的虚拟dom
         * @returns     虚拟dom
         */
        static handleEl(el:HTMLElement):Element{
            let oe:Element = new Element(el.tagName);
            this.handleAttributes(oe,el);
            this.handleChildren(oe,el);
            return oe;
        }

        /**
         * 编译插件
         * @param el 待处理的html element
         * @returns  如果识别自定义el，则返回编译后的虚拟dom，否则返回undefined
         */
        static handleDefineEl(el:HTMLElement):Element{
            let de:any = PluginManager.get(el.tagName);
            if(!de){
                return;
            }
            return Reflect.construct(de,[el]).element;
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
                    oe.addDirective(new Directive(attr.name.substr(2), v,oe),true);
                } else if (attr.name.startsWith('e-')) { //事件
                    let en = attr.name.substr(2);
                    oe.addEvent(new NodomEvent(en, attr.value.trim()));
                } else {
                    let isExpr:boolean = false;
                    if (v !== '') {
                        let ra = this.compileExpression(v);
                        if (Util.isArray(ra)) {
                            oe.setProp(attr.name, ra,true);
                            isExpr = true;
                        }
                    }
                    if (!isExpr) {
                        oe.setProp(attr.name, v);
                    }
                }
            }
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
         * 处理表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(exprStr:string) {
            if (/\{\{.+?\}\}/.test(exprStr) === false) {
                return exprStr;
            }
            let reg:RegExp = /\{\{.+?\}\}/g;
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