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
    /**
     * 资源管理器
     * 用于管理url资源的加载状态管理
     */
    let ResourceManager = /** @class */ (() => {
        class ResourceManager {
            /**
             * 获取资源当前状态
             * @param url 资源url
             * @reutrn    0:不存在 1:加载中 2:已加载
             */
            static getState(url) {
                return this.resources.get(url) || 0;
            }
            /**
             * 加载单个资源
             * @param url
             */
            static loadResource(url) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this.resources.has(url)) {
                        return;
                    }
                    //设置加载中标志
                    this.resources.set(url, 1);
                    yield nodom.Linker.gen('getfiles', [url]);
                    //设置加载结束标志
                    this.resources.set(url, 2);
                });
            }
            /**
             * 加载多个资源
             * @param urls
             */
            static loadResources(urls) {
                return __awaiter(this, void 0, void 0, function* () {
                    let url;
                    urls.forEach((url, i) => {
                        //已加载的资源不处理
                        if (this.resources.has(url)) {
                            urls.splice(i, 1);
                        }
                        this.resources.set(url, 1);
                    });
                    if (urls.length === 0) {
                        return;
                    }
                    //设置加载中标志
                    yield nodom.Linker.gen('getfiles', urls);
                    //设置加载结束标志
                    for (url of urls) {
                        this.resources.set(url, 2);
                    }
                });
            }
        }
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        ResourceManager.resources = new Map();
        return ResourceManager;
    })();
    nodom.ResourceManager = ResourceManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=resourcemanager.js.map