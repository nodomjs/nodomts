var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var nodom;
(function (nodom) {
    /**
     * 新建一个App
     * @param config 应用配置
     */
    function newApp(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (window['NodomConfig']) {
                config = nodom.Util.merge({}, window['NodomConfig'], config);
            }
            let lang = config && config.language;
            if (!lang) {
                lang = navigator.language ? navigator.language.substr(0, 2) : 'zh';
            }
            nodom.TipMsg = eval('(nodom.TipMsg_' + lang + ')');
            if (!config || !config.module) {
                throw new nodom.NodomError('config', nodom.TipMsg.TipWords['application']);
            }
            nodom.Application.setPath(config.path);
            //模块数组初始化
            if (config.modules) {
                yield nodom.ModuleFactory.init(config.modules);
            }
            //消息队列消息处理任务
            nodom.Scheduler.addTask(nodom.MessageQueue.handleQueue, nodom.MessageQueue);
            //渲染器启动渲染
            nodom.Scheduler.addTask(nodom.Renderer.render, nodom.Renderer);
            //启动调度器
            nodom.Scheduler.start(config.scheduleCircle);
            //存在类名
            let module;
            if (config.module.class) {
                module = yield nodom.ModuleFactory.getInstance(config.module.class, config.module.name, config.module.data);
                module.selector = config.module.el;
            }
            else {
                module = new nodom.Module(config.module);
            }
            //设置主模块
            nodom.ModuleFactory.setMain(module);
            yield module.active();
            if (config.routes) {
                this.createRoute(config.routes);
            }
            return module;
        });
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
            return new nodom.Module(config);
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
     * @param priority  优先级（1最小，1-10为框架保留优先级）
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createDirective(name, priority, init, handler) {
        return nodom.DirectiveManager.addType(name, priority, init, handler);
    }
    nodom.createDirective = createDirective;
    /**
     * ajax 请求
     * @param config    object 或 string
     *                  如果为string，则直接以get方式获取资源
     *                  object 项如下:
     *                  url 				请求地址
     *					method 			    请求类型 GET(默认) POST
     *					params 				参数，json格式
     *					async 				异步，默认true
     *  				timeout 			超时时间
     *					withCredentials 	同源策略，跨域时cookie保存，默认false
     *                  header              request header 对象
     *                  user                需要认证的情况需要用户名和密码
     *                  pwd                 密码
     *                  rand                bool随机数，请求动态资源时可能需要
     */
    function request(config) {
        return new Promise((resolve, reject) => {
            if (typeof config === 'string') {
                config = {
                    url: config
                };
            }
            config.params = config.params || {};
            //随机数
            if (config.rand) { //针对数据部分，仅在app中使用
                config.params.$rand = Math.random();
            }
            let url = config.url;
            const async = config.async === false ? false : true;
            const req = new XMLHttpRequest();
            //设置同源策略
            req.withCredentials = config.withCredentials;
            //类型默认为get
            const method = config.method || 'GET';
            //超时，同步时不能设置
            req.timeout = async ? config.timeout : 0;
            req.onload = () => {
                if (req.status === 200) {
                    let r = req.responseText;
                    if (config.type === 'json') {
                        try {
                            r = JSON.parse(r);
                        }
                        catch (e) {
                            reject({ type: "jsonparse" });
                        }
                    }
                    resolve(r);
                }
                else {
                    reject({ type: 'error', url: url });
                }
            };
            req.ontimeout = () => reject({ type: 'timeout' });
            req.onerror = () => reject({ type: 'error', url: url });
            //上传数据
            let data = null;
            switch (method) {
                case 'GET':
                    //参数
                    let pa;
                    if (nodom.Util.isObject(config.params)) {
                        let ar = [];
                        nodom.Util.getOwnProps(config.params).forEach(function (key) {
                            ar.push(key + '=' + config.params[key]);
                        });
                        pa = ar.join('&');
                    }
                    if (pa !== undefined) {
                        if (url.indexOf('?') !== -1) {
                            url += '&' + pa;
                        }
                        else {
                            url += '?' + pa;
                        }
                    }
                    break;
                case 'POST':
                    let fd = new FormData();
                    for (let o in config.params) {
                        fd.append(o, config.params[o]);
                    }
                    req.open(method, url, async, config.user, config.pwd);
                    data = fd;
                    break;
            }
            req.open(method, url, async, config.user, config.pwd);
            //设置request header
            if (config.header) {
                nodom.Util.getOwnProps(config.header).forEach((item) => {
                    req.setRequestHeader(item, config.header[item]);
                });
            }
            req.send(data);
        }).catch((re) => {
            switch (re.type) {
                case "error":
                    throw new nodom.NodomError("notexist1", nodom.TipMsg.TipWords['resource'], re.url);
                case "timeout":
                    throw new nodom.NodomError("timeout");
                case "jsonparse":
                    throw new nodom.NodomError("jsonparse");
            }
        });
    }
    nodom.request = request;
})(nodom || (nodom = {}));
//# sourceMappingURL=nodom.js.map