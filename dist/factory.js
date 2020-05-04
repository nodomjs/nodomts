var nodom;
(function (nodom) {
    class Factory {
        constructor(module) {
            if (module !== undefined) {
                this.moduleName = module.name;
            }
            this.items = Object.create(null);
        }
        add(name, item) {
            this.items[name] = item;
        }
        get(name) {
            return this.items[name];
        }
        remove(name) {
            delete this.items[name];
        }
    }
    nodom.Factory = Factory;
})(nodom || (nodom = {}));
//# sourceMappingURL=factory.js.map