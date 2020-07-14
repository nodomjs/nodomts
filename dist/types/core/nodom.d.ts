declare namespace nodom {
    /**
     * 新建一个App
     * @param config {global:全局配置,module:主模块配置}
     *      global:应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
     *      module:主模块配置
     */
    function newApp(config: IApplicationCfg): Promise<Module>;
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
     * @param priority  优先级（1最小，1-10为框架保留优先级）
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    function createDirective(name: string, priority: number, init: Function, handler: Function): void;
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
    function request(config: any): Promise<unknown>;
}
