/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class ChangedDom {
        type: string;
        node: Element;
        parent: Element;
        index: number;
        changeProps: Array<object>;
        removeProps: Array<string>;
        constructor(node?: Element, type?: string, parent?: Element, index?: number);
    }
    class Element {
        key: string;
        root: boolean;
        modelId: number;
        textContent: string | HTMLElement | HTMLFrameElement;
        type: string;
        directives: Array<Directive>;
        props: object;
        exprProps: object;
        events: object;
        expressions: Array<Expression>;
        children: Array<Element>;
        parentKey: string;
        parent: Element;
        tagName: string;
        dontRender: boolean;
        finded: boolean;
        constructor(tag?: string);
        render(module: Module, parent?: Element): boolean;
        renderToHtml(module: Module, params: any): void;
        clone(): Element;
        handleDirectives(module: any, parent: any): boolean;
        handleExpression(exprArr: any, module: any): string;
        handleProps(module: any): void;
        handleTextContent(module: any): void;
        handleEvents(module: any, el: any, parent: any, parentEl: any): void;
        removeDirectives(delDirectives: any): void;
        hasDirective(directiveType: any): boolean;
        getDirective(directiveType: any): Directive;
        add(dom: any): void;
        remove(module: Module, delHtml?: boolean): void;
        removeFromHtml(module: Module): void;
        removeChild(dom: Element): void;
        replace(dst: Element): boolean;
        contains(dom: any): boolean;
        query(key: string): any;
        compare(dst: Element, retArr: Array<ChangedDom>, parentNode?: Element): void;
    }
}
