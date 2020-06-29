/// <reference path="nodom.ts" />

namespace nodom {
	/**
     * 工厂基类
     */
    export class Factory {
		/**
		 * 模块名
		 */
		moduleName:string;
		/**
		 * 工厂item对象
		 */
		items:Map<number|string,any> = new Map();
		
		/**
		 * @param module 模块
		 */
		constructor(module?:Module) {
            if (module !== undefined) {
                this.moduleName = module.name;
            }
        }

        /**
         * 添加到工厂
		 * @param name 	item name
		 * @param item	item
         */
        add(name:string|number, item:any) {
            this.items.set(name,item);
        }

        /**
         * 获得item
		 * @param name 	item name
         */
        get(name:string|number) {
            return this.items.get(name);
        }

        
        /**
         * 从容器移除
		 * @param name 	item name
         */
        remove(name:string|number) {
            this.items.delete(name);
        }

        /**
         * 是否拥有该项
         * @param name item name
         */
        has(name:string|number){
            return this.items.has(name);
        }
    }
}