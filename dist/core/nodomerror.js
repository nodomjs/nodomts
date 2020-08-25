// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 异常处理类
     * @since       1.0.0
     */
    class NodomError extends Error {
        constructor(errorName, p1, p2, p3, p4) {
            super(errorName);
            let msg = nodom.TipMsg.ErrorMsgs[errorName];
            if (msg === undefined) {
                this.message = "未知错误";
                return;
            }
            let params = [msg];
            if (p1) {
                params.push(p1);
            }
            if (p2) {
                params.push(p2);
            }
            if (p3) {
                params.push(p3);
            }
            if (p4) {
                params.push(p4);
            }
            this.message = nodom.Util.compileStr.apply(null, params);
        }
    }
    nodom.NodomError = NodomError;
    ;
})(nodom || (nodom = {}));
//# sourceMappingURL=nodomerror.js.map