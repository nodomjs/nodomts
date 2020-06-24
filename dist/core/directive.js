// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令类
     */
    class Directive {
        /**
         * 构造方法
         * @param type  	类型
         * @param value 	指令值
         * @param vdom 		指令所属虚拟dom
         * @param filterStr 过滤器字符串
         */
        constructor(type, value, vdom, filterStr) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                this.value = value.trim();
            }
            if (filterStr) {
                this.filter = new nodom.Filter(filterStr);
            }
            if (type !== undefined) {
                nodom.DirectiveManager.init(this, vdom);
            }
        }
        /**
         * 执行
         * @param value 	指令值
         * @returns 		指令结果
         */
        exec(value) {
            let args = [this.module, this.type, value];
            return nodom.Util.apply(nodom.DirectiveManager.exec, nodom.DirectiveManager, args);
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
//# sourceMappingURL=directive.js.map