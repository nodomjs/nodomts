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
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         * @returns     IResourceObj
         */
        static getResources(reqs) {
            return __awaiter(this, void 0, void 0, function* () {
                let me = this;
                this.preHandle(reqs);
                let taskId = nodom.Util.genId();
                let res = {};
                //设置资源对象
                for (let item of reqs) {
                    res[item.url] = false;
                }
                this.loadingTasks.set(taskId, res);
                //保存资源id状态
                for (let item of reqs) {
                    //不需要加载
                    if (!item.needLoad) {
                        continue;
                    }
                    let url = item.url;
                    if (this.resources.has(url)) { //已加载
                        res[url].c = item.content;
                    }
                    else if (this.waitList.has(url)) { //加载中
                        let arr = this.waitList.get(url);
                        arr.push(taskId);
                    }
                    else { //新加载
                        //将自己的任务加入等待队列
                        this.waitList.set(url, [taskId]);
                        nodom.request({ url: url }).then((content) => {
                            let rObj = { type: item.type, content: content };
                            this.handleOne(url, rObj);
                            this.resources.set(url, rObj);
                            let arr = this.waitList.get(url);
                            //设置等待队列加载状态
                            for (let tid of arr) {
                                let tobj = this.loadingTasks.get(tid);
                                if (url) {
                                    tobj[url] = true;
                                }
                            }
                            //从等待列表移除
                            this.waitList.delete(item.url);
                        });
                    }
                }
                return new Promise((resolve, reject) => {
                    check();
                    function check() {
                        let r = me.awake(taskId);
                        if (r) {
                            resolve(r);
                            return;
                        }
                        //循环监听
                        setTimeout(check, 0);
                    }
                });
            });
        }
        /**
         * 唤醒任务
         * @param taskId    任务id
         * @param url       资源url
         * @param content   资源内容
         * @returns         加载内容数组或undefined
         */
        static awake(taskId) {
            if (!this.loadingTasks.has(taskId)) {
                return;
            }
            let tobj = this.loadingTasks.get(taskId);
            let finish = true;
            //资源内容数组
            let contents = [];
            //检查是否全部加载完成
            for (let o in tobj) {
                //一个未加载完，则需要继续等待
                if (tobj[o] === false) {
                    finish = false;
                    break;
                }
                //放入返回对象
                contents.push(this.resources.get(o));
            }
            //加载完成
            if (finish) {
                //从loadingTask删除
                this.loadingTasks.delete(taskId);
                return contents;
            }
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
            return type || 'text';
        }
        /**
         * 处理一个资源获取结果
         * @param url   资源url
         * @param rObj  资源对象
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
            let types = [];
            let urls = [];
            let head = document.querySelector('head');
            //预处理请求资源
            for (let i = 0; i < reqs.length; i++) {
                //url串，需要构造成object
                if (typeof reqs[i] === 'string') {
                    reqs[i] = {
                        url: reqs[i]
                    };
                }
                reqs[i].type = reqs[i].type || this.getType(reqs[i].url);
                reqs[i].needLoad = true;
                //css 不需要加载
                if (reqs[i].type === 'css') {
                    let css = nodom.Util.newEl('link');
                    css.type = 'text/css';
                    css.rel = 'stylesheet'; // 保留script标签的path属性
                    css.href = reqs[i].url;
                    head.appendChild(css);
                    reqs[i].needLoad = false;
                }
                return reqs;
            }
        }
    }
    /**
     * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
     */
    ResourceManager.resources = new Map();
    /**
     * 加载任务  任务id:资源对象，{id1:{url1:false,url2:false},id2:...}
     */
    ResourceManager.loadingTasks = new Map();
    /**
     * 资源等待列表  {资源url:[taskId1,taskId2,...]}
     */
    ResourceManager.waitList = new Map();
    nodom.ResourceManager = ResourceManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=resourcemanager.js.map