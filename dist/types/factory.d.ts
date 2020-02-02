/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 工厂基类
     */
    class Factory {
        /**
         * 模块名
         */
        moduleName: string;
        /**
         * 工厂item对象
         */
        items: object;
        /**
         * @param module 模块
         */
        constructor(module?: Module);
        /**
         * 添加到工厂
         * @param name 	item name
         * @param item	item
         */
        add(name: any, item: any): void;
        /**
         * 获得item
         * @param name 	item name
         */
        get(name: any): any;
        /**
         * 从容器移除
         * @param name 	item name
         */
        remove(name: any): void;
    }
}
