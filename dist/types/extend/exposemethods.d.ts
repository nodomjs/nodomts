/// <reference path="../nodom.d.ts" />
declare namespace nodom {
    /**
     * 新建一个App
     * @param config {global:全局配置,module:主模块配置}
     *      global:应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
     *      module:主模块配置
     */
    function newApp(config: IApplicationCfg): Module;
    /**
     * 暴露方法集
     */
    /**
     * 暴露的创建模块方法
     * @param config  	数组或单个配置
     * @param main 		是否根模块
     */
    function createModule(config: IModuleCfg | Array<IModuleCfg>, main?: boolean): Module;
    /**
     * 暴露的创建路由方法
     * @param config  数组或单个配置
     */
    function createRoute(config: IRouteCfg | Array<IRouteCfg>): Route;
    /**
     * 创建指令
     * @param name      指令名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createDirective(name: string, init: Function, handler: Function): void;
    /**
     * 创建插件
     * @param name      插件名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createPlugin(name: string, init: Function, handler: Function): void;
}
