/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Directive {
        id: number;
        type: string;
        prio: number;
        value: any;
        module: Module;
        init: Function;
        handle: Function;
        filter: Filter;
        params: any;
        constructor(type: string, value: string, vdom: Element, module: Module, el?: HTMLElement);
        exec(value: any): any;
    }
}
