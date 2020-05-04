/// <reference path="nodom.d.ts" />
declare namespace nodom {
    interface IApplicationCfg {
        options: object;
        module: IModuleCfg;
    }
    class Application {
        static routerPrePath: string;
        static templatePath: string;
        static renderTick: number;
    }
}
