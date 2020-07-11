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

    }
    /**
     * 资源管理器
     * 用于url资源的加载及管理，主要针对js、模版等
     */
    export class ResourceManager{
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        private static resources:Map<string,IResourceObj> = new Map();
        
        /**
         * 获取资源
         * @param url   资源路径
         * @returns     资源内容 
         */
        public static async getResource(url:string,type?:string):Promise<any>{
            let rObj:IResourceObj;
            type = type || this.getType(url);
            //资源已存在
            if(this.resources.has(url)){
                rObj = this.resources.get(url);
                //资源类型为js和css，则直接返回，因为只需要处理一次
                if(['js','css'].includes(type)){
                    return;
                }
            }else{
                rObj = {type:type};
                rObj.content = await request({url:url});
            }
            this.handleOne(url,rObj);
            this.resources.set(url,rObj);
            return rObj.content;
        }

        /**
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         */
        public static async getResources(reqs:any[]){
            let me = this;
            
            let re = this.preHandle(reqs);
            let urls:string[] = re[1];
            let types:string[] = re[2];
            let rObjs:IResourceObj[] = [];
            //返回promise
            return Promise.all(re[0]).then(arr=>{
                //返回resource obj数组
                for(let i=0;i<arr.length;i++){
                    let rObj:IResourceObj;
                    if(typeof arr[i] === 'string'){ //刚加载的资源需要处理
                        rObj = {
                            type:types[i],
                            content:arr[i]
                        }
                        me.handleOne(urls[i],rObj);
                        rObjs.push(rObj);
                    }
                }
                return rObjs;
            });
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
            return type || 'js';
        }

        /**
         * 处理一个资源获取结果
         * @param rObj 
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
            let promises = [];
            let types = [];
            let urls = [];
            let head = document.querySelector('head');
                    
            //预处理请求资源
            for(let r of reqs){
                let url:string;
                let type:string;
                //对象中已经包含类型
                if(typeof r === 'object'){
                    url = r.url;
                    type = r.type || this.getType(url);
                }else{ //只是url串
                    url = r;
                    type = this.getType(url);
                }
                urls.push(url);
                types.push(type);

                //css 不需要加载
                if(type === 'css'){
                    let css = <HTMLLinkElement>Util.newEl('link');
                    css.type = 'text/css';
                    css.rel = 'stylesheet'; // 保留script标签的path属性
                    css.href = url;
                    head.appendChild(css);
                }else{
                    if(this.resources.has(url)){
                        promises.push(this.resources.get(url));
                    }else{
                        promises.push(request(url))
                    }
                }
                return [promises,urls,types];
            }
        }
    }
}