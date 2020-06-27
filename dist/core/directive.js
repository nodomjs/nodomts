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
         * @param filter    过滤器字符串或过滤器对象
         */
        constructor(type, value, vdom, filter) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                value = value.trim();
            }
            this.value = value;
            if (filter) {
                if (typeof filter === 'string') {
                    this.filter = new nodom.Filter(filter);
                }
                else if (filter instanceof nodom.Filter) {
                    this.filter = filter;
                }
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
        /**
         * 克隆
         * @param vdom  虚拟dom
         */
        clone(vdom) {
            let dir = new Directive(this.type, this.value, vdom, this.filter);
            if (this.params) {
                dir.params = nodom.Util.clone(this.params);
            }
            return dir;
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
//# sourceMappingURL=directive.js.map