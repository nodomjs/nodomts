var nodom;
(function (nodom) {
    class DirectiveManager {
        static addType(name, config, replacable) {
            if (this.directiveTypes.has(name)) {
                throw new nodom.NodomError('exist1', nodom.TipWords.directiveType, name);
            }
            if (!nodom.Util.isObject(config)) {
                throw new nodom.NodomError('invoke', 'DirectiveManager.addType', '1', 'Function');
            }
            config.prio = config.prio || 10;
            if (replacable && !this.cantEditTypes.includes(name)) {
                this.cantEditTypes.push(name);
            }
            this.directiveTypes.set(name, config);
        }
        static removeType(name) {
            if (this.cantEditTypes.indexOf(name) !== -1) {
                throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.directiveType, name);
            }
            if (!this.directiveTypes.has(name)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
            }
            this.directiveTypes.delete(name);
        }
        static getType(name) {
            return this.directiveTypes.get(name);
        }
        static hasType(name) {
            return this.directiveTypes.has(name);
        }
        static init(directive, dom, module, el) {
            let dt = this.directiveTypes.get(directive.type);
            if (dt === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
            }
            return dt.init(directive, dom, module, el);
        }
        static exec(directive, dom, module, parent) {
            if (!this.directiveTypes.has(directive.type)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, directive.type);
            }
            return nodom.Util.apply(this.directiveTypes.get(directive.type).handle, null, [directive, dom, module, parent]);
        }
    }
    DirectiveManager.directiveTypes = new Map();
    DirectiveManager.cantEditTypes = ['model', 'repeat', 'if', 'else', 'show', 'class', 'field'];
    nodom.DirectiveManager = DirectiveManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=directivemanager.js.map