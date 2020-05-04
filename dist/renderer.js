var nodom;
(function (nodom) {
    class Renderer {
        static add(module) {
            if (module.state !== 3) {
                return;
            }
            if (this.waitList.indexOf(module.name) === -1) {
                this.waitList.push(module.name);
            }
        }
        static remove(module) {
            let ind;
            if ((ind = this.waitList.indexOf(module.name)) !== -1) {
                this.waitList.splice(ind, 1);
            }
        }
        static render() {
            for (let i = 0; i < this.waitList.length; i++) {
                let m = nodom.ModuleFactory.get(this.waitList[i]);
                if (!m || m.render()) {
                    this.waitList.splice(i--, 1);
                }
            }
        }
    }
    Renderer.waitList = [];
    nodom.Renderer = Renderer;
})(nodom || (nodom = {}));
//# sourceMappingURL=renderer.js.map