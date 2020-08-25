// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令类
     */
    class DirectiveType {
        /**
         * 构造方法
         * @param name      指令类型名
         * @param prio      类型优先级
         * @param init      编译时执行方法
         * @param handle    渲染时执行方法
         */
        constructor(name, prio, init, handle) {
            this.name = name;
            this.prio = prio || 10;
            this.init = init;
            this.handle = handle;
        }
    }
    nodom.DirectiveType = DirectiveType;
})(nodom || (nodom = {}));
//# sourceMappingURL=directivetype.js.map