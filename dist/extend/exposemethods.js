/// <reference path="../nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 新建一个App
     * @param config {global:全局配置,module:主模块配置}
     *      global:应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
     *      module:主模块配置
     */
    function newApp(config) {
        if (!config.module) {
            throw new nodom.NodomError('config', nodom.TipWords.application);
        }
        if (config.options) {
            nodom.Application.routerPrePath = config.options['routerPrePath'] || '';
            nodom.Application.templatePath = config.options['templatePath'] || '';
            nodom.Application.renderTick = config.options['renderTick'] || 100;
        }
        //消息队列消息处理任务
        nodom.Scheduler.addTask(nodom.MessageQueue.handleQueue, nodom.MessageQueue);
        //渲染器启动渲染
        nodom.Scheduler.addTask(nodom.Renderer.render, nodom.Renderer);
        //启动调度器
        nodom.Scheduler.start();
        return createModule(config.module, true);
    }
    nodom.newApp = newApp;
    /**
     * 暴露方法集
     */
    /**
     * 暴露的创建模块方法
     * @param config  	数组或单个配置
     * @param main 		是否根模块
     */
    function createModule(config, main) {
        if (nodom.Util.isArray(config)) {
            for (let item of config) {
                new nodom.Module(item);
            }
        }
        else {
            return new nodom.Module(config, main);
        }
    }
    nodom.createModule = createModule;
    /**
     * 暴露的创建路由方法
     * @param config  数组或单个配置
     */
    function createRoute(config) {
        if (nodom.Util.isArray(config)) {
            for (let item of config) {
                new nodom.Route(item);
            }
        }
        else {
            return new nodom.Route(config);
        }
    }
    nodom.createRoute = createRoute;
    /**
     * 创建指令
     * @param name      指令名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createDirective(name, init, handler) {
    }
    nodom.createDirective = createDirective;
    /**
     * 创建插件
     * @param name      插件名
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createPlugin(name, init, handler) {
    }
    nodom.createPlugin = createPlugin;
})(nodom || (nodom = {}));
//# sourceMappingURL=exposemethods.js.map