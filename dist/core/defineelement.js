/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 自定义元素
     */
    class DefineElement {
        /**
         * 编译时执行方法
         * @param el    待编译html element
         */
        init(el) { }
        ;
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module, uidom) { }
        /**
         * 后置渲染方法(dom render结束后，选到html之前)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        afterRender(module, uidom) { }
        clone() {
            let ele = Reflect.construct(this.constructor, []);
            nodom.Util.getOwnProps(this).forEach((prop) => {
                ele[prop] = nodom.Util.clone(this[prop]);
            });
            return ele;
        }
    }
    nodom.DefineElement = DefineElement;
})(nodom || (nodom = {}));
//# sourceMappingURL=defineelement.js.map