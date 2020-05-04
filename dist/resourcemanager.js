var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var nodom;
(function (nodom) {
    class ResourceManager {
        static getState(url) {
            return this.resources.get(url) || 0;
        }
        static loadResource(url) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.resources.has(url)) {
                    return;
                }
                this.resources.set(url, 1);
                yield nodom.Linker.gen('getfiles', [url]);
                this.resources.set(url, 2);
            });
        }
        static loadResources(urls) {
            return __awaiter(this, void 0, void 0, function* () {
                let url;
                urls.forEach((url, i) => {
                    if (this.resources.has(url)) {
                        urls.splice(i, 1);
                    }
                    this.resources.set(url, 1);
                });
                if (urls.length === 0) {
                    return;
                }
                yield nodom.Linker.gen('getfiles', urls);
                for (url of urls) {
                    this.resources.set(url, 2);
                }
            });
        }
    }
    ResourceManager.resources = new Map();
})(nodom || (nodom = {}));
//# sourceMappingURL=resourcemanager.js.map