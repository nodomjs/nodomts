/// <reference path="../nodom.d.ts" />
declare namespace nodom {
    function newApp(config: IApplicationCfg): Module;
    function createModule(config: IModuleCfg | Array<IModuleCfg>, main?: boolean): Module;
    function createRoute(config: IRouteCfg | Array<IRouteCfg>): Route;
    function createDirective(name: string, priority: number, init: Function, handler: Function): void;
    function createPlugin(name: string, init: Function, handler: Function): void;
}
