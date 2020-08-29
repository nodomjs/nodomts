// / <reference path="nodom.ts" />
namespace nodom {
    
    /**
     * module class obj
     */
    export interface IMdlClassObj{
        /**
         * class名或class
         */
        class:any;

        /**
         * 模块名
         */
        name?:string;

        /**
         * class文件路径
         */
        path:string;
        /**
         * 实例
         */
        instance?:Module;
        /**
         * 数据
         */
        data?:string|object;
        /**
         * 是否单例
         */
        singleton?:boolean;
        /**
         * 懒加载
         */
        lazy?:boolean;
    }

	/**
	 * 过滤器工厂，存储模块过滤器
	 */
    export class ModuleFactory {
        /**
         * 模块对象工厂 {moduleId:{key:容器key,className:模块类名,instance:模块实例}}
         */
        static modules:Map<number,Module> = new Map();

        /**
         * 模块类集合
         */
        static classes:Map<string,IMdlClassObj> = new Map();
        
        /**
         * 主模块
         */
        static mainModule: Module;
        /**
         * 添加模块到工厂
         * @param id    模块id
         * @param item  模块存储对象
         */
        static add(item:Module) {
            this.modules.set(item.id, item);
        }

        /**
         * 获得模块
		 * @param id    模块id
         */
        static get(id:number):Module {
            return this.modules.get(id);
        }
        
        /**
         * 获取模块实例（通过类名）
         * @param className     模块类名
         * @param moduleName    模块名
         * @param data          数据或数据url
         */
        static async getInstance(className:string,moduleName?:string,data?:any){
            if(!this.classes.has(className)){
                throw new NodomError('notexist1',TipMsg.TipWords['moduleClass'],className);
            }
            let cfg:IMdlClassObj = this.classes.get(className);
            if(moduleName){
                cfg.name = moduleName;
            }
            if(!cfg.instance){
                await this.initModule(cfg);
            }
            if(cfg.instance){
                if(cfg.singleton){
                    return cfg.instance;
                }else{
                    let mdl:Module = cfg.instance.clone(moduleName);
                    
                    //处理数据
                    if(data){
                        //如果为url，则设置dataurl和loadnewdata标志
                        if(typeof data === 'string'){
                            mdl.dataUrl = data;
                            mdl.loadNewData = true;
                        }else{ //数据模型化
                            mdl.model = new Model(data,mdl);
                        }
                    }
                    return mdl;
                }
            }
            return null;
        }
        /**
         * 从工厂移除模块
		 * @param id    模块id
         */
        static remove(id:number) {
            this.modules.delete(id);
        }
		/**
		 * 设置主模块
		 * @param m 	模块 
		 */
        static setMain(m:Module) {
            this.mainModule = m;
            m.isMain = true;
        }

		/**
		 * 获取主模块
		 * @returns 	应用的主模块
		 */
        static getMain() {
            return this.mainModule;
        }

        /**
         * 初始化模块类
         * @param modules 
         */
        static async init(modules:Array<IMdlClassObj>){
            for(let cfg of modules){
                if(!cfg.path){
                    throw new nodom.NodomError("paramException",'modules','path');
                }
                if(!cfg.class){
                    throw new nodom.NodomError("paramException",'modules','class');
                }
                //lazy默认true
                if(cfg.lazy === undefined){
                    cfg.lazy = true;
                }
                //singleton默认true
                if(cfg.singleton === undefined){
                    cfg.singleton = true;
                }
                if(!cfg.lazy){
                    await this.initModule(cfg);
                }
                //存入class工厂
                this.classes.set(cfg.class,cfg);
            }
        }

        /**
         * 出事化模块
         * @param cfg 模块类对象
         */
        static async initModule(cfg:IMdlClassObj){
            //增加 .js后缀
            let path:string = cfg.path;
            if(!path.endsWith('.js')){
                path += '.js';
            }
            //加载模块类js文件
            let url:string = Util.mergePath([Application.getPath('module'),path]);
            await ResourceManager.getResources([{url:url,type:'js'}]);
            let cls = eval(cfg.class);
            if(cls){
                let instance = Reflect.construct(cls,[{
                    name:cfg.name,
                    data:cfg.data,
                    lazy:cfg.lazy
                }]);
                
                //模块初始化
                await instance.init();
                cfg.instance = instance;
                //单例，则需要保存到modules
                if(cfg.singleton){
                    this.modules.set(instance.id,instance);
                }
            }else{
                throw new NodomError('notexist1',TipMsg.TipWords['moduleClass'],cfg.class);
            }
        }
    }
}