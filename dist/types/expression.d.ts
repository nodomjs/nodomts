/// <reference path="nodom.d.ts" />
declare namespace nodom {
    interface IStatckItem {
        type: string;
        val: any;
        params?: Array<any>;
        filter?: Filter;
    }
    export class Expression {
        id: number;
        moduleName: string;
        stack: Array<IStatckItem>;
        fields: Array<string>;
        modelMap: object;
        pre: Array<number>;
        constructor(exprStr: string, module: Module);
        init(exprStr: string): Array<IStatckItem>;
        val(model: Model, modelId?: number): any;
        private addVar;
        private addStr;
        private addOperand;
        private addFilter;
        cacStack(stack: Array<IStatckItem>, fieldObj: any, modelId?: number): string;
        addField(field: string): void;
        getFieldValue(model: Model, field: string): any;
    }
    export {};
}
