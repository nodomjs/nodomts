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
		items:object;
		
		/**
		 * @param module 模块
		 */
		constructor(module?:Module) {
            if (module !== undefined) {
                this.moduleName = module.name;
            }
            //容器map
            this.items = Object.create(null);
        }

        /**
         * 添加到工厂
		 * @param name 	item name
		 * @param item	item
         */
        add(name:any, item:any) {
            this.items[name] = item;
        }

        /**
         * 获得item
		 * @param name 	item name
         */
        get(name:any) {
            return this.items[name];
        }

        /**
         * 从容器移除
		 * @param name 	item name
         */
        remove(name:any) {
            delete this.items[name];
        }
    }
}