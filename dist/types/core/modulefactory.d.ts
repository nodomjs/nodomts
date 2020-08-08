declare namespace nodom {
    /**
     * module class obj
     */
    interface IMdlClassObj {
        /**
         * class名或class
         */
        class: any;
        /**
         * 模块名
         */
        name?: string;
        /**
         * class文件路径
         */
        path: string;
        /**
         * 实例
         */
        instance?: Module;
        /**
         * 数据
         */
        data?: string | object;
        /**
         * 是否单例
         */
        singleton?: boolean;
        /**
         * 懒加载
         */
        lazy?: boolean;
    }
    /**
     * 过滤器工厂，存储模块过滤器
     */
    class ModuleFactory {
        /**
         * 模块对象工厂 {moduleId:{key:容器key,className:模块类名,instance:模块实例}}
         */
        static modules: Map<number, Module>;
        /**
         * 模块类集合
         */
        static classes: Map<string, IMdlClassObj>;
        /**
         * 主模块
         */
        static mainModule: Module;
        /**
         * 添加模块到工厂
         * @param id    模块id
         * @param item  模块存储对象
         */
        static add(item: Module): void;
        /**
         * 获得模块
         * @param id    模块id
         */
        static get(id: number): Module;
        /**
         * 获取模块实例（通过类名）
         * @param className     模块类名
         * @param moduleName    模块名
         * @param data          数据或数据url
         */
        static getInstance(className: string, moduleName?: string, data?: any): Promise<Module>;
        /**
         * 从工厂移除模块
         * @param id    模块id
         */
        static remove(id: number): void;
        /**
         * 设置主模块
         * @param m 	模块
         */
        static setMain(m: Module): void;
        /**
         * 获取主模块
         * @returns 	应用的主模块
         */
        static getMain(): Module;
        /**
         * 初始化模块类
         * @param modules
         */
        static init(modules: Array<IMdlClassObj>): Promise<void>;
        /**
         * 出事化模块
         * @param cfg 模块类对象
         */
        static initModule(cfg: IMdlClassObj): Promise<void>;
    }
}
