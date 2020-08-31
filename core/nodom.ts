namespace nodom{
    /**
     * 应用初始化配置类型
     */
    interface IAppCfg{
        /**
         * 路径参数，请参阅Application path属性
         */
        path?:any;

        /**
         * 语言，默认 zh
         */
        language:string;

        /**
         * 调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要
         */
        scheduleCircle?:number;

        /**
         * 主模块配置
         */
        module:IModuleCfg;

        /**
         * 模块配置数组，数组元素包括
         *      class:模块类名,
         *      path:模块路径(相对于app module路径),
         *      data:数据路径(字符串)或数据(object),
         *      singleton:单例(全应用公用同一个实例，默认true),
         *      lazy:懒加载(默认false)
         */
        modules:IMdlClassObj[];

        /**
         * 路由配置
         */
        routes:IRouteCfg[];
    }
    /**
     * 新建一个App
     * @param config 应用配置
     */
    export async function newApp(config?:IAppCfg):Promise<Module>{
        if(window['NodomConfig']){
            config = Util.merge({},window['NodomConfig'],config);
        }

        let lang:string = config&&config.language;
        if(!lang){
            lang = navigator.language?navigator.language.substr(0,2):'zh';
        }
        TipMsg = eval('(nodom.TipMsg_' + lang + ')');
        
        if(!config || !config.module){
            throw new NodomError('config',TipMsg.TipWords['application']);
        }

        Application.setPath(config.path);
        
        //模块数组初始化
        if(config.modules){
            await ModuleFactory.init(config.modules);
        }

        //消息队列消息处理任务
        Scheduler.addTask(MessageQueue.handleQueue,MessageQueue);
        //渲染器启动渲染
        Scheduler.addTask(Renderer.render,Renderer);
        //启动调度器
        Scheduler.start(config.scheduleCircle);
        
        //存在类名
        let module:Module;
        if(config.module.class){
            module = await ModuleFactory.getInstance(config.module.class,config.module.name,config.module.data);
            module.selector = config.module.el;
        }else{
            module = new Module(config.module);
        }
        //设置主模块
        ModuleFactory.setMain(module);
        await module.active();

        if(config.routes){
            this.createRoute(config.routes);
        }
        return module;
    }

    /**
     * 暴露的创建路由方法
     * @param config  数组或单个配置
     */
    export function createRoute(config:IRouteCfg|Array<IRouteCfg>):Route {
        if (Util.isArray(config)) {
            for(let item of <Array<IRouteCfg>>config){
                new Route(item);
            }
        } else {
            return new Route(<IRouteCfg>config);
        }
    }

    /**
     * 创建指令
     * @param name      指令名 
     * @param priority  优先级（1最小，1-10为框架保留优先级）
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    export function createDirective(name:string,priority:number,init:Function,handler:Function){
        return DirectiveManager.addType(name,
            priority,
            init,
            handler
        );
    }

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
     *                  type                json,text 默认text
     *					withCredentials 	同源策略，跨域时cookie保存，默认false
     *                  header              request header 对象
     *                  user                需要认证的情况需要用户名和密码
     *                  pwd                 密码
     *                  rand                bool随机数，请求动态资源时可能需要
     */
    export function request(config):Promise<any>{
        return new Promise((resolve, reject) => {
            if(typeof config === 'string'){
                config = {
                    url:config
                }
            }
            config.params = config.params || {};
            //随机数
            if(config.rand) { //针对数据部分，仅在app中使用
                config.params.$rand = Math.random();
            }
            let url:string = config.url;
            const async:boolean = config.async === false ? false : true;
            const req:XMLHttpRequest = new XMLHttpRequest();
            //设置同源策略
            req.withCredentials = config.withCredentials;
            //类型默认为get
            const method:string = config.method || 'GET';
            //超时，同步时不能设置
            req.timeout = async ?config.timeout: 0;

            req.onload = () => {
                if (req.status === 200) {
                    let r = req.responseText;
                    if (config.type === 'json') {
                        try {
                            r = JSON.parse(r);
                        } catch (e) {
                            reject({ type: "jsonparse" });
                        }
                    }
                    resolve(r);
                } else {
                    reject({ type: 'error', url: url });
                }
            }

            req.ontimeout = () => reject({ type: 'timeout' });
            req.onerror = () => reject({ type: 'error', url: url });
            //上传数据
            let data = null;
            switch (method) {
            case 'GET':
                //参数
                let pa:string;
                if (Util.isObject(config.params)) {
                    let ar:string[] = [];
                    Util.getOwnProps(config.params).forEach(function (key) {
                        ar.push(key + '=' + config.params[key]);
                    });
                    pa = ar.join('&');
                }
                if (pa !== undefined) {
                    if (url.indexOf('?') !== -1) {
                        url += '&' + pa;
                    } else {
                        url += '?' + pa;
                    }
                }
                
                break;
            case 'POST':
                if(config.params instanceof FormData){
                    data = config.params;
                }else{ 
                    let fd:FormData = new FormData();
                    for (let o in config.params) {
                        fd.append(o, config.params[o]);
                    }
                    req.open(method, url, async, config.user, config.pwd);
                    data = fd;
                }
                break;
            }

            req.open(method, url, async, config.user, config.pwd);
            //设置request header
            if(config.header){
                Util.getOwnProps(config.header).forEach((item)=>{
                    req.setRequestHeader(item,config.header[item]);
                })
            }
            req.send(data);
        }).catch((re) => {
            switch (re.type) {
            case "error":
                throw new NodomError("notexist1", TipMsg.TipWords['resource'], re.url);
            case "timeout":
                throw new NodomError("timeout");
            case "jsonparse":
                throw new NodomError("jsonparse");
            }
        });
    }
}
