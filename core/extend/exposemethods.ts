namespace nodom {


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
}