/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 工厂基类
     */
    class Factory {
        /**
         * @param module 模块
         */
        constructor(module) {
            /**
             * 工厂item对象
             */
            this.items = new Map();
            if (module !== undefined) {
                this.moduleId = module.id;
            }
        }
        /**
         * 添加到工厂
         * @param name 	item name
         * @param item	item
         */
        add(name, item) {
            this.items.set(name, item);
        }
        /**
         * 获得item
         * @param name 	item name
         */
        get(name) {
            return this.items.get(name);
        }
        /**
         * 从容器移除
         * @param name 	item name
         */
        remove(name) {
            this.items.delete(name);
        }
        /**
         * 是否拥有该项
         * @param name item name
         */
        has(name) {
            return this.items.has(name);
        }
    }
    nodom.Factory = Factory;
})(nodom || (nodom = {}));
//# sourceMappingURL=factory.js.map