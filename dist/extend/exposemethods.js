var nodom;
(function (nodom) {
    function newApp(config) {
        if (!config.module) {
            throw new nodom.NodomError('config', nodom.TipWords.application);
        }
        if (config.options) {
            nodom.Application.routerPrePath = config.options['routerPrePath'] || '';
            nodom.Application.templatePath = config.options['templatePath'] || '';
            nodom.Application.renderTick = config.options['renderTick'] || 100;
        }
        nodom.Scheduler.addTask(nodom.MessageQueue.handleQueue, nodom.MessageQueue);
        nodom.Scheduler.addTask(nodom.Renderer.render, nodom.Renderer);
        nodom.Scheduler.start();
        return createModule(config.module, true);
    }
    nodom.newApp = newApp;
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
    function createDirective(name, priority, init, handler) {
        return nodom.DirectiveManager.addType(name, {
            prio: priority,
            init: init,
            handler: handler
        });
    }
    nodom.createDirective = createDirective;
    function createPlugin(name, init, handler) {
    }
    nodom.createPlugin = createPlugin;
})(nodom || (nodom = {}));
//# sourceMappingURL=exposemethods.js.map