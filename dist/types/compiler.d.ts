/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Compiler {
        static compile(module: Module, elementStr: string): Element;
        static compileDom(module: Module, ele: Node, parent: Element): Element;
        static compileExpression(module: any, exprStr: any): any;
    }
}
