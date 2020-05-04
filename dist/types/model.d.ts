/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Model {
        id: number;
        moduleName: string;
        data: object;
        fields: object;
        constructor(data: any, module: Module);
        set(key: string, value: any): void;
        update(field: string, value?: any): void;
        addSetterGetter(data: any): void;
        defineProp(data: any, p: string): void;
        query(name: string): any;
    }
}
