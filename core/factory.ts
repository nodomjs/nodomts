/// <reference path="nodom.ts" />

namespace nodom {
	/**
     * 工厂基类
     */
    export class Factory {
		/**
		 * 模块名
		 */
		moduleId:number;
		/**
		 * 工厂item对象
		 */
		items:Map<number|string,any> = new Map();
		
		/**
		 * @param module 模块
		 */
		constructor(module?:Module) {
            if (module !== undefined) {
                this.moduleId = module.id;
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
         * @returns     item
         */
        get(name:string|number):any{
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
         * @param name  item name
         * @return      true/false
         */
        has(name:string|number):boolean{
            return this.items.has(name);
        }
    }
}