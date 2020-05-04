/// <reference path="nodom.d.ts" />
declare namespace nodom {
    interface IModuleCfg {
        name?: string;
        static?: boolean;
        parentName?: string;
        modules?: Array<IModuleCfg>;
        el: string | HTMLElement;
        template?: string;
        data?: object | string;
        methods?: object;
        delayInit: boolean;
        requires: Array<string | object>;
    }
    class Module {
        name: string;
        static?: boolean;
        model?: Model;
        main?: boolean;
        firstRender: boolean;
        virtualDom: Element;
        rendered: boolean;
        renderTree: Element;
        parentName: string;
        children: Array<Module>;
        selector: string;
        firstRenderOps: Array<Function>;
        beforeFirstRenderOps: Array<Function>;
        containerParam: object;
        state: number;
        dataUrl: string;
        initing: boolean;
        loadNewData: boolean;
        methodFactory: MethodFactory;
        modelFactory: ModelFactory;
        expressionFactory: ExpressionFactory;
        directiveFactory: DirectiveFactory;
        renderDoms: Array<ChangedDom>;
        initConfig: IModuleCfg;
        container: HTMLElement;
        initLinker: Promise<any>;
        template: string;
        routerKey: number;
        constructor(config: IModuleCfg, main?: boolean);
        init(): Promise<any>;
        render(): boolean;
        doFirstRender(root: any): void;
        hasContainer(): boolean;
        dataChange(): void;
        addChild(config: any): Module;
        send(toName: string, data: any): void;
        broadcast(data: any): void;
        receive(fromName: any, data: any): void;
        active(callback?: Function): void;
        unactive(): void;
        dead(): void;
        destroy(): void;
        doModuleEvent(eventName: string, param?: Array<any>): void;
        addFirstRenderOperation(foo: Function): void;
        addBeforeFirstRenderOperation(foo: any): void;
    }
}
