/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    class Compiler {
        /**
         * 编译
         * 如果为el innerHTML方式，则可能存在多个子节点，只能返回上一级，否则返回模块根节点
         * @param elementStr    待编译html串
         * @param needNotRoot   返回不需要根(根是一个虚节点，如果是对一个模块，则需要根)
         * @returns             虚拟element
         */
        static compile(elementStr: string, needNotRoot?: boolean): Element;
        /**
         * 编译dom
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）
         */
        static compileDom(ele: Node): Element;
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
         * 处理含表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(exprStr: string): string | any[];
    }
}
