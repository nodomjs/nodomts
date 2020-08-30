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
        private static loadingTasks:Map<number,string[]> = new Map();

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
            
            //设置任务资源数组
            let resArr = [];
            for(let item of reqs){
                resArr.push(item.url);
            }
            this.loadingTasks.set(taskId,resArr);
            return new Promise(async(res,rej)=>{
                //保存资源id状态
                for(let item of reqs){
                    //不需要加载
                    if(!item.needLoad){
                        continue;
                    }

                    let url:string = item.url;
                    if(this.resources.has(url)){        //已加载，直接获取资源内容
                        let r = me.awake(taskId);
                        if(r){
                            res(r);
                        }
                    }else if(this.waitList.has(url)){   //加载中，放入资源等待队列
                        this.waitList.get(url).push(taskId);
                    }else{  //新加载
                        //将自己的任务加入等待队列
                        this.waitList.set(url,[taskId]);
                        //请求资源
                        let content = await request({url:url})
                        let rObj = {type:item.type,content:content};
                        this.handleOne(url,rObj);
                        this.resources.set(url,rObj);
                        
                        let arr = this.waitList.get(url);
                        //从等待列表移除
                        this.waitList.delete(url);
                        //唤醒任务
                        for(let tid of arr){
                            let r = me.awake(tid);
                            if(r){
                                res(r);
                            }
                        }
                    }
                }
            });
        }

        /**
         * 唤醒任务
         * @param taskId    任务id
         * @returns         加载内容数组或undefined
         */
        static awake(taskId:number):IResourceObj[]{
            if(!this.loadingTasks.has(taskId)){
                return;
            }
            let resArr = this.loadingTasks.get(taskId);
            let finish:boolean = true;
            //资源内容数组
            let contents = [];
            //检查是否全部加载完成
            for(let url of resArr){
                //一个未加载完，则需要继续等待
                if(!this.resources.has(url)){
                    finish = false;
                    break;
                }
                //放入返回对象
                contents.push(this.resources.get(url));
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
            }
            return reqs;
        }
    }
}