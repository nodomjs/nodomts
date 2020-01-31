namespace nodom{
    /**
     * 应用初始化配置类型
     */
    export interface IApplicationCfg{
        /**
         * 应用全局配置，{routerPrePath:路由前置配置,templatePath:模版路径位置,renderTick:调度器间隔时间(ms)，如果支持requestAnimationFrame，则不需要}
         * 
         */
        global:object;
        /**
         * 主模块配置
         */
        module:IModuleCfg;
    }
    /**
     * 应用类
     */
    export class Application{
        /**
         * 路由前置路径，对所有路由路径有效
         */
        static routerPrePath:string='';
        /**
         * 应用文件所在基础路径
         */
        static templatePath:string='';
        /**
         * 调度器执行间隔，如果支持requestAnimationFrame，则不需要
         */
        static renderTick:number;

        static gen(config:IApplicationCfg){
            if(!config.module){
                throw new NodomError('config',TipWords.application);
            }
            if(config.global){
                this.routerPrePath = config.global['routerPrePath'] || '';
                this.templatePath = config.global['templatePath'] || '';
                this.renderTick = config.global['renderTick'] || 100;
            }
            
            //消息工厂发消息
            Scheduler.addTask(MessageQueue.handleQueue);
            //渲染器启动渲染
            Scheduler.addTask(Renderer.render);
            //启动调度器
            Scheduler.start();

            return createModule(config.module,true);
        }
    }
}