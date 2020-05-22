/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    class Compiler {
        /**
         * 编译
         * @param elementStr    待编译html串
         * @returns             虚拟element
         */
        static compile(elementStr: string): Element;
        /**
         * 编译dom
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）
         */
        static compileDom(ele: Node, parent: Element): Element;
        /**
         * 处理element
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         */
        static handleEl(el: HTMLElement): Element;
        /**
         * 处理插件
         * @param oe 新建的虚拟dom
         * @param el 待处理的html element
         * @returns  如果识别自定义el，则返回true
         */
        static handleDefineEl(el: HTMLElement): Element;
        /**
         * 处理含表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(exprStr: string): string | any[];
    }
}
