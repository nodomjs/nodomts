/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Factory {
        moduleName: string;
        items: object;
        constructor(module?: Module);
        add(name: any, item: any): void;
        get(name: any): any;
        remove(name: any): void;
    }
}
