/**
 * 资源管理器
 * 用于管理url资源的加载状态管理
 */
namespace nodom {
    class ResourceManager{
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        private static resources:Map<string,number> = new Map();
        
        /**
         * 获取资源当前状态
         * @param url 资源url
         * @reutrn    0:不存在 1:加载中 2:已加载
         */
        public static getState(url:string):number{
            return this.resources.get(url)||0;
        }

        /**
         * 加载单个资源
         * @param url 
         */
        public static async loadResource(url:string){
            if(this.resources.has(url)){
                return;
            }
            //设置加载中标志
            this.resources.set(url,1);
            await Linker.gen('getfiles',[url]);
            //设置加载结束标志
            this.resources.set(url,2);
        }

        /**
         * 加载多个资源
         * @param urls 
         */
        public static async loadResources(urls:string[]){
            let url:string;
            urls.forEach((url,i)=>{
                //已加载的资源不处理
                if(this.resources.has(url)){
                    urls.splice(i,1);
                }
                this.resources.set(url,1);
            });
            
            if(urls.length === 0){
                return;
            }
            //设置加载中标志
            await Linker.gen('getfiles',urls);
            //设置加载结束标志
            for(url of urls){
                this.resources.set(url,2);
            }
        }
    }
}