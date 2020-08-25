/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    class Compiler {
        /**
         * 编译
         * 如果为el.innerHTML方式，可能存在多个子节点，则在外面包一层父节点，因为模块只能有一个根节点，否则返回模块根节点
         * @param elementStr    待编译html串
         * @returns             虚拟dom
         */
        static compile(elementStr: string): Element;
        /**
         * 编译dom
         * @param ele           待编译html element
         * @param parent        父节点（virtualdom）
         */
        static compileDom(ele: Node): Element;
        /**
         * 编译html element
         * @param oe    新建的虚拟dom
         * @returns     虚拟dom
         */
        static handleEl(el: HTMLElement): Element;
        /**
         * 编译插件
         * @param el 待处理的html element
         * @returns  如果识别自定义el，则返回编译后的虚拟dom，否则返回undefined
         */
        static handleDefineEl(el: HTMLElement): Element;
        /**
         * 处理属性
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleAttributes(oe: Element, el: HTMLElement): void;
        /**
         * 处理子节点
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleChildren(oe: Element, el: HTMLElement): void;
        /**
         * 处理表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(exprStr: string): string | any[];
    }
}
