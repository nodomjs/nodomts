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
        add(name, item) {
            this.items[name] = item;
        }
        /**
         * 获得item
         * @param name 	item name
         */
        get(name) {
            return this.items[name];
        }
        /**
         * 从容器移除
         * @param name 	item name
         */
        remove(name) {
            delete this.items[name];
        }
    }
    nodom.Factory = Factory;
})(nodom || (nodom = {}));
//# sourceMappingURL=factory.js.map