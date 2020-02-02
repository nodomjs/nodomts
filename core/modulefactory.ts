/// <reference path="nodom.ts" />
namespace nodom {
	/**
	 * 过滤器工厂，存储模块过滤器
	 */
    export class ModuleFactory {
        static items: Map < string, Module > = new Map();
        static mainModule: Module;
        /**
         * 添加模块到工厂
         */
        static add(name:string, item:Module) {
            this.items.set(name, item);
        }

        /**
         * 获得模块
		 * @param name 	模块名
         */
        static get(name:string) {
            return this.items.get(name);
        }

        /**
         * 从工厂移除模块
		 * @param name	模块名
         */
        static remove(name:string) {
            this.items.delete(name);
        }

		/**
		 * 设置主模块
		 * @param m 	模块 
		 */
        static setMain(m:Module) {
            this.mainModule = m;
        }

		/**
		 * 获取主模块
		 * @returns 	应用的主模块
		 */
        static getMain() {
            return this.mainModule;
        }
    }
}