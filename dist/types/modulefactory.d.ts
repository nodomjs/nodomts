/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class ModuleFactory {
        static items: Map<string, Module>;
        static mainModule: Module;
        static add(name: string, item: Module): void;
        static get(name: string): Module;
        static remove(name: string): void;
        static setMain(m: Module): void;
        static getMain(): Module;
    }
}
