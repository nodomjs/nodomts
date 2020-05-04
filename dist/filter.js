var nodom;
(function (nodom) {
    class Filter {
        constructor(src) {
            let arr = nodom.Util.isString(src) ? nodom.FilterManager.explain(src) : src;
            if (arr) {
                this.type = arr[0];
                this.params = arr.slice(1);
            }
        }
        exec(value, module) {
            let args = [module, this.type, value].concat(this.params);
            return nodom.Util.apply(nodom.FilterManager.exec, module, args);
        }
    }
    nodom.Filter = Filter;
})(nodom || (nodom = {}));
//# sourceMappingURL=filter.js.map