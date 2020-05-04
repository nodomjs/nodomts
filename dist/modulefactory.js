var nodom;
(function (nodom) {
    class ModuleFactory {
        static add(name, item) {
            this.items.set(name, item);
        }
        static get(name) {
            return this.items.get(name);
        }
        static remove(name) {
            this.items.delete(name);
        }
        static setMain(m) {
            this.mainModule = m;
        }
        static getMain() {
            return this.mainModule;
        }
    }
    ModuleFactory.items = new Map();
    nodom.ModuleFactory = ModuleFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=modulefactory.js.map