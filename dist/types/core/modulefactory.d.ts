declare namespace nodom {
    /**
     * 过滤器工厂，存储模块过滤器
     */
    class ModuleFactory {
        static items: Map<string, Module>;
        static mainModule: Module;
        /**
         * 添加模块到工厂
         */
        static add(name: string, item: Module): void;
        /**
         * 获得模块
         * @param name 	模块名
         */
        static get(name: string): Module;
        /**
         * 从工厂移除模块
         * @param name	模块名
         */
        static remove(name: string): void;
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
    }
}
