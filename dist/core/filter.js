// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 过滤器类
     */
    class Filter {
        /**
         * 构造方法
         * @param src 		源串，或explain后的数组
         */
        constructor(src) {
            let arr = nodom.Util.isString(src) ? nodom.FilterManager.explain(src) : src;
            if (arr) {
                this.type = arr[0];
                this.params = arr.slice(1);
            }
        }
        /**
         * 过滤器执行
         * @param value 	待过滤值
         * @param module 	模块
         * @returns 		过滤结果
         */
        exec(value, module) {
            let args = [module, this.type, value].concat(this.params);
            return nodom.Util.apply(nodom.FilterManager.exec, module, args);
        }
    }
    nodom.Filter = Filter;
})(nodom || (nodom = {}));
//# sourceMappingURL=filter.js.map