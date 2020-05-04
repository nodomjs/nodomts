/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class FilterManager {
        static filterTypes: Map<string, Function>;
        static cantEditTypes: Array<string>;
        static addType(name: any, handler: any): void;
        static removeType(name: string): void;
        static hasType(name: string): boolean;
        static exec(module: Module, type: string): string;
        static explain(src: string): Array<string>;
    }
}
