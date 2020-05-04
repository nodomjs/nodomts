var nodom;
(function (nodom) {
    class MethodFactory extends nodom.Factory {
        invoke(name, params) {
            const foo = this.get(name);
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError(nodom.ErrorMsgs.notexist1, nodom.TipWords.method, name);
            }
            return nodom.Util.apply(foo, this.module.model, params);
        }
    }
    nodom.MethodFactory = MethodFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=methodfactory.js.map