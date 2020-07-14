/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 自定义元素管理器
     */
    let DefineElementManager = /** @class */ (() => {
        class DefineElementManager {
            /**
             * 添加自定义元素类
             * @param name  元素名
             * @param cfg   元素类
             */
            static add(name, cfg) {
                if (this.elementMap.has(name)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.element, name);
                }
                this.elementMap.set(name, cfg);
            }
            /**
             * 获取自定义元素类
             * @param tagName 元素名
             */
            static get(tagName) {
                return this.elementMap.get(tagName);
            }
            /**
             * 执行自定义元素前置渲染
             * @param module    模块
             * @param dom       虚拟dom
             */
            static beforeRender(module, dom) {
                let de = dom.defineElement;
                if (de && de.beforeRender) {
                    de.beforeRender(module, dom);
                }
            }
            /**
             * 执行自定义元素后置渲染
             * @param module    模块
             * @param dom       虚拟dom
             */
            static afterRender(module, dom) {
                let de = dom.defineElement;
                if (de && de.afterRender) {
                    de.afterRender(module, dom);
                }
            }
        }
        DefineElementManager.elementMap = new Map();
        return DefineElementManager;
    })();
    nodom.DefineElementManager = DefineElementManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=defineelementmanager.js.map