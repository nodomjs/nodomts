// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * 链式操作器
     */
    export class Linker{
		/**
		 * 
		 * @param type 		类型，包括：ajax(ajax请求),getfiles(加载多个文件),dolist(执行多个异步操作)
		 * @param config 	配置参数，针对不同type配置不同
		 */
        static gen(type:string, config:any):Promise<any> {
            let p:Promise<any>;
            switch (type) {
            case 'ajax': //单个ajax
                p = this.ajax(config);
                break;
            case 'getfiles': //ajax get 多个文件
                p = this.getfiles(config);
                break;
            case 'dolist': //同步操作组
                if (config.params) {
                    p = this.dolist(config.funcs,config.params);
                } else {
                    p = this.dolist(config.funcs);
                }
            }
            return p;
        }

        /**
         * ajax 请求
         * @param config 	url 				请求地址
         *					reqType 			请求类型 GET(默认) POST
         *					params 				参数，json格式
         *					async 				异步，默认true
         *  				timeout 			超时时间
         *					withCredentials 	同源策略，跨域时cookie保存，默认false
         * 					
         */
        private static async ajax(config):Promise<any> {
            return new Promise((resolve, reject) => {
                //随机数
                if (config.rand) { //针对数据部分，仅在app中使用
                    config.params = config.params || {};
                    config.params.$rand = Math.random();
                }
                let url:string = config.url;
                const async:boolean = config.async === false ? false : true;
                const req:XMLHttpRequest = new XMLHttpRequest();
                //设置同源策略
                req.withCredentials = config.withCredentials;
                //类型默认为get
                const reqType:string = config.reqType || 'GET';
                //超时，同步时不能设置
                req.timeout = async ?config.timeout: 0;

                req.onload = () => {
                    if (req.status === 200) {
                        let r = req.responseText;
                        if (config.type === 'json') {
                            try {
                                r = JSON.parse(r);
                            } catch (e) {
                                reject({ type: "jsonparse" });
                            }
                        }
                        resolve(r);
                    } else {
                        reject({ type: 'error', url: url });
                    }
                }

                req.ontimeout = () => reject({ type: 'timeout' });
                req.onerror = () => reject({ type: 'error', url: url });

                switch (reqType) {
                case 'GET':
                    //参数
                    let pa:string;
                    if (Util.isObject(config.params)) {
                        let ar:string[] = [];
                        Util.getOwnProps(config.params).forEach(function (key) {
                            ar.push(key + '=' + config.params[key]);
                        });
                        pa = ar.join('&');
                    }
                    if (pa !== undefined) {
                        if (url.indexOf('?') !== -1) {
                            url += '&' + pa;
                        } else {
                            url += '?' + pa;
                        }
                    }
                    req.open(reqType, url, async, config.user, config.pwd);
                    req.send(null);
                    break;
                case 'POST':
                    let fd:FormData = new FormData();
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
                    throw new NodomError("notexist1", TipWords.resource, re.url);
                case "timeout":
                    throw new NodomError("timeout");
                case "jsonparse":
                    throw new NodomError("jsonparse");
                }
            });
        }

        /**
         * 通过get获取多个文件
		 * @param urls 	文件url数组
         */
        private static async getfiles(urls):Promise<any>{
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
                throw new NodomError("notexist1", TipWords.resource, text);
            });
        }

        /**
         * 同步顺序执行
         * @param funcArr 	函数数组
         * @param paramArr 	参数数组
         * @returns 		promise对象
         */
        private static dolist(funcArr:Array<Function>, paramArr?:Array<any>):Promise<any> {
            return foo(funcArr, 0, paramArr);
			
            function foo(fa, i, pa) {
                if (fa.length === 0) {
                    return Promise.resolve();
                } else {
                    return new Promise((resolve, reject) => {
                        if (Util.isArray(pa)) {
                            fa[i](resolve, reject, pa[i]);
                        } else {
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
}