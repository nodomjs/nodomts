/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Util {
        static generatedId: number;
        static genId(): number;
        clone(srcObj: object, expKey?: string | RegExp): object;
        static merge(): any;
        static assign(obj1: any, obj2: any): any;
        static getOwnProps(obj: any): Array<string>;
        static isFunction(foo: any): boolean;
        static isArray(obj: any): boolean;
        static isObject(obj: any): boolean;
        static isInt(v: any): boolean;
        static isNumber(v: any): boolean;
        static isBoolean(v: any): boolean;
        static isString(v: any): boolean;
        static isNumberString(v: any): boolean;
        static isEmpty(obj: any): boolean;
        static findObjByProps(obj: object, props: object, one: boolean): Array<object> | object;
        static get(selector: string, findAll?: boolean, pview?: HTMLElement | Document): Node | NodeList;
        static append(el: HTMLElement, dom: Node | string): void;
        static isEl(el: any): boolean;
        static isNode(node: any): boolean;
        static getTranslate(el: HTMLElement): Array<number>;
        static newEl(tagName: string, config?: object, text?: string): HTMLElement;
        static newSvgEl(tagName: any): HTMLElement;
        static replaceNode(srcNode: Node, nodes: Node | Array<Node>): void;
        static insertAfter(newNode: Node | Array<Node>, srcNode: Node, pNode: Node): void;
        static empty(el: HTMLElement): void;
        static remove(node: Node): void;
        static attr(el: HTMLElement, param: string | object, value?: any): any;
        static width(el: HTMLElement, value?: number | boolean): number;
        static height(el: HTMLElement, value: number | boolean): number;
        static addClass(el: HTMLElement, cls: string): void;
        static removeClass(el: HTMLElement, cls: string): void;
        static formatDate(srcDate: string | number, format: string): string;
        static compileStr(src: string, p1?: any, p2?: any, p3?: any, p4?: any, p5?: any): string;
        static addStrQuot(srcStr: string, quot?: string): string;
        static apply(foo: Function, obj: any, args?: Array<any>): any;
    }
}
