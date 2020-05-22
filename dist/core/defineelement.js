/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 自定义元素管理器
     */
    let DefineElementManager = /** @class */ (() => {
        class DefineElementManager {
            /**
             * 添加自定义元素
             * @param cfg
             */
            static add(cfg) {
                if (this.elementMap.has(cfg.tagName)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.element, cfg.tagName);
                }
                this.elementMap.set(cfg.tagName, cfg);
            }
            /**
             * 获取自定义元素
             * @param tagName 元素名
             */
            static get(tagName) {
                return this.elementMap.get(tagName);
            }
        }
        DefineElementManager.elementMap = new Map();
        return DefineElementManager;
    })();
    nodom.DefineElementManager = DefineElementManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=defineelement.js.map