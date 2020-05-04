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
    class Linker {
        static gen(type, config) {
            let p;
            switch (type) {
                case 'ajax':
                    p = this.ajax(config);
                    break;
                case 'getfiles':
                    p = this.getfiles(config);
                    break;
                case 'dolist':
                    if (config.params) {
                        p = this.dolist(config.funcs, config.params);
                    }
                    else {
                        p = this.dolist(config.funcs);
                    }
            }
            return p;
        }
        static ajax(config) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    if (config.rand) {
                        config.params = config.params || {};
                        config.params.$rand = Math.random();
                    }
                    let url = config.url;
                    const async = config.async === false ? false : true;
                    const req = new XMLHttpRequest();
                    req.withCredentials = config.withCredentials;
                    const reqType = config.reqType || 'GET';
                    req.timeout = async ? config.timeout : 0;
                    req.onload = () => {
                        if (req.status === 200) {
                            let r = req.responseText;
                            if (config.type === 'json') {
                                try {
                                    r = JSON.parse(r);
                                }
                                catch (e) {
                                    reject({ type: "jsonparse" });
                                }
                            }
                            resolve(r);
                        }
                        else {
                            reject({ type: 'error', url: url });
                        }
                    };
                    req.ontimeout = () => reject({ type: 'timeout' });
                    req.onerror = () => reject({ type: 'error', url: url });
                    switch (reqType) {
                        case 'GET':
                            let pa;
                            if (nodom.Util.isObject(config.params)) {
                                let ar = [];
                                nodom.Util.getOwnProps(config.params).forEach(function (key) {
                                    ar.push(key + '=' + config.params[key]);
                                });
                                pa = ar.join('&');
                            }
                            if (pa !== undefined) {
                                if (url.indexOf('?') !== -1) {
                                    url += '&' + pa;
                                }
                                else {
                                    url += '?' + pa;
                                }
                            }
                            req.open(reqType, url, async, config.user, config.pwd);
                            req.send(null);
                            break;
                        case 'POST':
                            let fd = new FormData();
                            for (let o in config.params) {
                                fd.append(o, config.params[o]);
                            }
                            req.open(reqType, url, async, config.user, config.pwd);
                            req.send(fd);
                            break;
                    }
                }).catch((re) => {
                    switch (re.type) {
                        case "error":
                            throw new nodom.NodomError("notexist1", nodom.TipWords.resource, re.url);
                        case "timeout":
                            throw new nodom.NodomError("timeout");
                        case "jsonparse":
                            throw new nodom.NodomError("jsonparse");
                    }
                });
            });
        }
        static getfiles(urls) {
            return __awaiter(this, void 0, void 0, function* () {
                let promises = [];
                urls.forEach((url) => {
                    promises.push(new Promise((resolve, reject) => {
                        const req = new XMLHttpRequest();
                        req.onload = () => resolve(req.responseText);
                        req.onerror = () => reject(url);
                        req.open("GET", url);
                        req.send();
                    }));
                });
                return Promise.all(promises).catch((text) => {
                    throw new nodom.NodomError("notexist1", nodom.TipWords.resource, text);
                });
            });
        }
        static dolist(funcArr, paramArr) {
            return foo(funcArr, 0, paramArr);
            function foo(fa, i, pa) {
                if (fa.length === 0) {
                    return Promise.resolve();
                }
                else {
                    return new Promise((resolve, reject) => {
                        if (nodom.Util.isArray(pa)) {
                            fa[i](resolve, reject, pa[i]);
                        }
                        else {
                            fa[i](resolve, reject);
                        }
                    }).then(() => {
                        if (i < fa.length - 1) {
                            return foo(fa, i + 1, pa);
                        }
                    });
                }
            }
        }
    }
    nodom.Linker = Linker;
})(nodom || (nodom = {}));
//# sourceMappingURL=linker.js.map