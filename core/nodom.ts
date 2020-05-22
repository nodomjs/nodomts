namespace nodom{
    /**
     * 新建一个App
     * @param config {global:全局配置,module:主模块配置}
     *      global:应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
     *      module:主模块配置
     */
    export async function newApp(config:IApplicationCfg):Promise<Module>{
        if(!config.module){
            throw new NodomError('config',TipWords.application);
        }
        if(config.options){
            Application.routerPrePath = config.options['routerPrePath'] || '';
            Application.templatePath = config.options['templatePath'] || '';
            Application.renderTick = config.options['renderTick'] || 100;
        }
        
        //消息队列消息处理任务
        Scheduler.addTask(MessageQueue.handleQueue,MessageQueue);
        //渲染器启动渲染
        Scheduler.addTask(Renderer.render,Renderer);
        //启动调度器
        Scheduler.start();
        let module = this.createModule(config.module,true);
        await module.active();
        return module;
    }

    /**
     * 暴露方法集
     */

    /**
     * 暴露的创建模块方法
     * @param config  	数组或单个配置
	 * @param main 		是否根模块
     */
    export function createModule(config:IModuleCfg|Array<IModuleCfg>,main?:boolean):Module {
        if (Util.isArray(config)) {
			for(let item of <Array<IModuleCfg>>config){
                new Module(item);
            }
        } else {
            return new Module(<IModuleCfg>config,main);
        }
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
        return DirectiveManager.addType(name,{
            prio:priority,
            init:init,
            handler:handler
        });
    }

    /**
     * 创建插件
     * @param name      插件名 
     * @param init      初始化方法
     * @param handler   渲染时方法
     */
    export function createPlugin(name:string,init:Function,handler:Function){
        
    }
}