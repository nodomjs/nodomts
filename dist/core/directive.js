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
         * @param el 		指令所属html element
         */
        constructor(type, value, vdom, el) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                this.value = value.trim();
            }
            if (type !== undefined) {
                nodom.Util.apply(nodom.DirectiveManager.init, nodom.DirectiveManager, [this, vdom, el]);
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