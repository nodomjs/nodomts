var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 资源管理器
     * 用于url资源的加载及管理，主要针对js、模版等
     */
    class ResourceManager {
        /**
         * 获取资源
         * @param url   资源路径
         * @returns     资源内容
         */
        static getResource(url, type) {
            return __awaiter(this, void 0, void 0, function* () {
                let rObj;
                type = type || this.getType(url);
                //资源已存在
                if (this.resources.has(url)) {
                    rObj = this.resources.get(url);
                    //资源类型为js和css，则直接返回，因为只需要处理一次
                    if (['js', 'css'].includes(type)) {
                        return;
                    }
                }
                else {
                    rObj = { type: type };
                    rObj.content = yield nodom.request({ url: url });
                }
                this.handleOne(url, rObj);
                this.resources.set(url, rObj);
                return rObj.content;
            });
        }
        /**
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         */
        static getResources(reqs) {
            return __awaiter(this, void 0, void 0, function* () {
                let me = this;
                let re = this.preHandle(reqs);
                let urls = re[1];
                let types = re[2];
                let rObjs = [];
                // console.log(re);    
                //返回promise
                return Promise.all(re[0]).then(arr => {
                    //返回resource obj数组
                    for (let i = 0; i < arr.length; i++) {
                        let rObj;
                        if (typeof arr[i] === 'string') { //刚加载的资源需要处理
                            rObj = {
                                type: types[i],
                                content: arr[i]
                            };
                            me.handleOne(urls[i], rObj);
                            rObjs.push(rObj);
                        }
                    }
                    return rObjs;
                });
            });
        }
        /**
         * 获取url类型
         * @param url   url
         * @returns     url type
         */
        static getType(url) {
            let ind = -1;
            let type;
            if ((ind = url.lastIndexOf('.')) !== -1) {
                type = url.substr(ind + 1);
                if (type === 'htm' || type === 'html') {
                    type = 'template';
                }
            }
            return type || 'js';
        }
        /**
         * 处理一个资源获取结果
         * @param rObj
         */
        static handleOne(url, rObj) {
            switch (rObj.type) {
                case 'js':
                    let head = document.querySelector('head');
                    let script = nodom.Util.newEl('script');
                    script.innerHTML = rObj.content;
                    head.appendChild(script);
                    head.removeChild(script);
                    delete rObj.content;
                    break;
                case 'template':
                    rObj.content = nodom.Compiler.compile(rObj.content);
                    break;
                case 'nd':
                    rObj.content = nodom.Serializer.deserialize(rObj.content);
                    break;
                case 'data': //数据
                    try {
                        rObj.content = JSON.parse(rObj.content);
                    }
                    catch (e) {
                        console.log(e);
                    }
            }
            this.resources.set(url, rObj);
        }
        /**
         * 预处理
         * @param reqs  [{url:**,type:**},url,...]
         * @returns     [promises(请求对象数组),urls(url数组),types(类型数组)]
         */
        static preHandle(reqs) {
            let promises = [];
            let types = [];
            let urls = [];
            let head = document.querySelector('head');
            //预处理请求资源
            for (let r of reqs) {
                let url;
                let type;
                //对象中已经包含类型
                if (typeof r === 'object') {
                    url = r.url;
                    type = r.type || this.getType(url);
                }
                else { //只是url串
                    url = r;
                    type = this.getType(url);
                }
                urls.push(url);
                types.push(type);
                //css 不需要加载
                if (type === 'css') {
                    let css = nodom.Util.newEl('link');
                    css.type = 'text/css';
                    css.rel = 'stylesheet'; // 保留script标签的path属性
                    css.href = url;
                    head.appendChild(css);
                }
                else {
                    if (this.resources.has(url)) { //资源已存在，直接返回
                        promises.push(this.resources.get(url));
                    }
                    else {
                        promises.push(nodom.request(url));
                    }
                }
                return [promises, urls, types];
            }
        }
    }
    /**
     * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
     */
    ResourceManager.resources = new Map();
    nodom.ResourceManager = ResourceManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=resourcemanager.js.map