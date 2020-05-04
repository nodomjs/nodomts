/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class DirectiveManager {
        static directiveTypes: Map<string, Directive>;
        static cantEditTypes: Array<string>;
        static addType(name: string, config: any, replacable?: boolean): void;
        static removeType(name: string): void;
        static getType(name: string): Directive;
        static hasType(name: string): boolean;
        static init(directive: Directive, dom: Element, module: Module, el: HTMLElement): any;
        static exec(directive: Directive, dom: Element, module: Module, parent: Element): any;
    }
}
