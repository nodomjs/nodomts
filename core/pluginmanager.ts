namespace nodom{
    /**
     * 插件配置项
     */
    export interface IPluginCfg{
        /**
         * 插件名
         */
        name:string;
        /**
         * 模版
         */
        template:string;
        /**
         * 初始化函数（编译时执行）
         */
        init?:Function;
        /**
         * 渲染时函数
         */
        render?:Function;
    }

    /**
     * 插件接口
     */
    export class Plugin{
        /**
         * 插件根结点
         */
        root:Element;
        /**
         * 插件容器
         */
        el:HTMLElement;

        constructor(cfg:IPluginCfg){
            this.root = this.compile(cfg.template);
        }
        /**
         * 编译
         */
        compile(template:string):Element{
            return Compiler.compile(template);
        }
        /**
         * 渲染
         */
        render(){

        }
    }

    /**
     * 插件管理器
     */
    export class PluginManager{
        /**
         * 插件集合
         */
        static plugins:Map<string,Plugin> = new Map();

        /**
         * 添加插件
         * @param cfg   插件配置 
         */
        static add(cfg:IPluginCfg){
            if(this.plugins.has(cfg.name)){
                throw new NodomError('exist1',TipWords.plugin,cfg.name);
            }
        }

        /**
         * 获取插件
         * @param name  插件名 
         */
        static get(name:string){
            
        }
    }

}