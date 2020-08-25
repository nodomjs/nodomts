// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 方法工厂，每个模块一个
     */
    class MethodFactory extends nodom.Factory {
        /**
         * 调用方法
         * @param name 		方法名
         * @param params 	方法参数数组
         */
        invoke(name, params) {
            const foo = this.get(name);
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError(nodom.TipMsg.ErrorMsgs['notexist1'], nodom.TipMsg.TipWords['method'], name);
            }
            return nodom.Util.apply(foo, this.module.model, params);
        }
    }
    nodom.MethodFactory = MethodFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=methodfactory.js.map