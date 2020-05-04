/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class NodomEvent {
        name: string;
        events: Map<string, Array<NodomEvent>>;
        handler: string;
        delg: boolean;
        nopopo: boolean;
        once: boolean;
        capture: boolean;
        moduleName: string;
        domKey: string;
        handleListener: any;
        touchListeners: Map<string, NodomEvent>;
        extParams: any;
        constructor(eventName: string, eventStr?: string);
        fire(e: Event, el?: HTMLElement, dom?: Element): void;
        bind(module: Module, dom: Element, el: HTMLElement): void;
        delegateTo(module: Module, vdom: Element, el: HTMLElement, parent?: Element, parentEl?: HTMLElement): void;
        addSubEvt(ev: any): void;
        removeSubEvt(ev: any): void;
        clone(): NodomEvent;
    }
    class ExternalEvent {
        static touches: any;
        static regist(evtObj: NodomEvent, el: HTMLElement): void;
        static unregist(evtObj: NodomEvent, el?: HTMLElement): void;
    }
}
