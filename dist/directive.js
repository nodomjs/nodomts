var nodom;
(function (nodom) {
    class Directive {
        constructor(type, value, vdom, module, el) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                this.value = value.trim();
            }
            if (type !== undefined) {
                nodom.Util.apply(nodom.DirectiveManager.init, nodom.DirectiveManager, [this, vdom, module, el]);
            }
        }
        exec(value) {
            let args = [this.module, this.type, value];
            return nodom.Util.apply(nodom.DirectiveManager.exec, nodom.DirectiveManager, args);
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
//# sourceMappingURL=directive.js.map