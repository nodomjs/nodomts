/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 编译器，负责模版的编译
     * @since 1.0
     */
    class Compiler {
        /**
         * 编译
         * @param element   待编译element
         * @return          虚拟element
         */
        static compile(module: Module, elementStr: string): Element;
        /**
         * 编译dom
         * @param module        模块
         * @param ele           待编译element
         * @param parent        父节点（virtualdom）
         */
        static compileDom(module: Module, ele: Node, parent: Element): Element;
        /**
         * 处理含表达式串
         * @param exprStr   含表达式的串
         * @return          处理后的字符串和表达式数组
         */
        static compileExpression(module: any, exprStr: any): any;
    }
}
