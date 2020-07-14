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
        items: Map<number | string, any>;
        /**
         * @param module 模块
         */
        constructor(module?: Module);
        /**
         * 添加到工厂
         * @param name 	item name
         * @param item	item
         */
        add(name: string | number, item: any): void;
        /**
         * 获得item
         * @param name 	item name
         */
        get(name: string | number): any;
        /**
         * 从容器移除
         * @param name 	item name
         */
        remove(name: string | number): void;
        /**
         * 是否拥有该项
         * @param name item name
         */
        has(name: string | number): boolean;
    }
}
