/// <reference path="nodom.ts" />
namespace nodom{
    
    /**
     * 应用类
     */
    export class Application{
        /**
         * 路径对象 包含 {
         *              app:appPath(应用基础路径),
         *              css:css路径(css加载基础路径 app+css),
         *              template:模版路径(模版加载基础 app+template)
         *              route:路由前置路径(路由完整路径为 route + routePath)
         */
        static path:any;
        
        /**
         * 调度器执行间隔，如果支持requestAnimationFrame，则不需要
         */
        static renderTick:number;
        /**
         * 根容器
         */
        static rootContainer:HTMLElement|string;

        /**
         * 获取路径
         * @param type  路径类型 app,template,css,js,module,route 
         */
        static getPath(type:string):string{
            if(!this.path){
                return '';
            }
            let appPath:string = this.path.app || '';
            
            if(type === 'app'){
                return appPath;
            }else if(type === 'route'){
                return this.path.route || '';
            }else{
                let p = this.path[type] || '';
                if(appPath !== ''){
                    if(p !== ''){
                        return appPath + '/' + p;
                    }else{
                        return appPath;
                    }
                }
                return p; 
            }
        }

        /**
         * 设置path 对象
         */
        static setPath(pathObj){
            this.path = pathObj;
        }
    }
}
