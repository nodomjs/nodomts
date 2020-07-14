// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 过滤器工厂，存储模块过滤器
     */
    let ModuleFactory = /** @class */ (() => {
        class ModuleFactory {
            /**
             * 添加模块到工厂
             */
            static add(name, item) {
                this.items.set(name, item);
            }
            /**
             * 获得模块
             * @param name 	模块名
             */
            static get(name) {
                return this.items.get(name);
            }
            /**
             * 从工厂移除模块
             * @param name	模块名
             */
            static remove(name) {
                this.items.delete(name);
            }
            /**
             * 设置主模块
             * @param m 	模块
             */
            static setMain(m) {
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
        ModuleFactory.items = new Map();
        return ModuleFactory;
    })();
    nodom.ModuleFactory = ModuleFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=modulefactory.js.map