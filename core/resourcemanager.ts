// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * 资源对象
     */
    export interface IResourceObj{
        /**
         * 资源内容 字符串或数据对象或element
         */
        content?:any;

        /**
         * 类型js、template(html,htm), nd(编译后的模版文件)，data(不保存资源)
         */
        type?:string;

        /**
         * 需要加载
         */
        needLoad?:boolean;
    }

    /**
     * 资源管理器
     * 用于url资源的加载及管理，主要针对js、模版等
     */
    export class ResourceManager{
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        public static resources:Map<string,IResourceObj> = new Map();
        
        /**
         * 加载任务  任务id:资源对象，{id1:{url1:false,url2:false},id2:...}
         */
        private static loadingTasks:Map<number,object> = new Map();

        /**
         * 资源等待列表  {资源url:[taskId1,taskId2,...]}
         */
        private static waitList:Map<string,number[]> = new Map();
        
        /**
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         * @returns     IResourceObj
         */
        public static async getResources(reqs:any[]):Promise<IResourceObj[]>{
            let me = this;
            this.preHandle(reqs);
            
            let taskId:number = Util.genId();
            let res = {};
            
            //设置资源对象
            for(let item of reqs){
                res[item.url] = false;
            }
            this.loadingTasks.set(taskId,res);

            //保存资源id状态
            for(let item of reqs){
                //不需要加载
                if(!item.needLoad){
                    continue;
                }

                let url:string = item.url;
                if(this.resources.has(url)){//已加载
                    res[url].c = item.content;
                }else if(this.waitList.has(url)){//加载中
                    let arr = this.waitList.get(url);
                    arr.push(taskId);
                }else{  //新加载
                    //将自己的任务加入等待队列
                    this.waitList.set(url,[taskId]);
                    request({url:url}).then((content)=>{
                        let rObj = {type:item.type,content:content};
                        this.handleOne(url,rObj);
                        this.resources.set(url,rObj);
                        let arr = this.waitList.get(url);
                        
                        //设置等待队列加载状态
                        for(let tid of arr){
                            let tobj = this.loadingTasks.get(tid);
                            if(url){
                                tobj[url] = true;
                            }
                        }
                        //从等待列表移除
                        this.waitList.delete(item.url);
                    });
                }
            }

            return new Promise((resolve,reject)=>{
                check();
                function check(){
                    let r:IResourceObj[] = me.awake(taskId);
                    if(r){
                        resolve(r);
                        return;
                    }
                    //循环监听
                    setTimeout(check,0);
                }
            });
        }

        /**
         * 唤醒任务
         * @param taskId    任务id
         * @param url       资源url
         * @param content   资源内容
         * @returns         加载内容数组或undefined
         */
        static awake(taskId:number):IResourceObj[]{
            if(!this.loadingTasks.has(taskId)){
                return;
            }
            let tobj = this.loadingTasks.get(taskId);
            let finish:boolean = true;
            //资源内容数组
            let contents = [];
            //检查是否全部加载完成
            for(let o in tobj){
                //一个未加载完，则需要继续等待
                if(tobj[o] === false){
                    finish = false;
                    break;
                }
                //放入返回对象
                contents.push(this.resources.get(o));
            }
            //加载完成
            if(finish){
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
        static getType(url:string):string{
            let ind = -1;
            let type:string;
            if((ind=url.lastIndexOf('.')) !== -1){
                type = url.substr(ind+1);
                if(type === 'htm' || type === 'html'){
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
        static handleOne(url:string,rObj:IResourceObj){
            switch(rObj.type){
                case 'js':
                    let head = document.querySelector('head');
                    let script = Util.newEl('script');
                    script.innerHTML = rObj.content;
                    head.appendChild(script);
                    head.removeChild(script);
                    delete rObj.content;
                    break;
                case 'template':
                    rObj.content = Compiler.compile(rObj.content);
                    break;
                case 'nd':
                    rObj.content = Serializer.deserialize(rObj.content);
                    break;
                case 'data': //数据
                    try{
                        rObj.content = JSON.parse(rObj.content);
                    }catch(e){
                        console.log(e);
                    }
            }
            this.resources.set(url,rObj);
        }

        /**
         * 预处理
         * @param reqs  [{url:**,type:**},url,...]
         * @returns     [promises(请求对象数组),urls(url数组),types(类型数组)]
         */
        static preHandle(reqs:any[]):any[]{
            let types = [];
            let urls = [];
            let head = document.querySelector('head');
            
            //预处理请求资源
            for(let i=0;i<reqs.length;i++){
                //url串，需要构造成object
                if(typeof reqs[i] === 'string'){
                    reqs[i] = {
                        url:reqs[i]
                    }
                }
                reqs[i].type = reqs[i].type || this.getType(reqs[i].url);
                reqs[i].needLoad = true;
                //css 不需要加载
                if(reqs[i].type === 'css'){
                    let css = <HTMLLinkElement>Util.newEl('link');
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
}