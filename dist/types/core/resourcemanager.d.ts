declare namespace nodom {
    /**
     * 资源对象
     */
    interface IResourceObj {
        /**
         * 资源内容 字符串或数据对象或element
         */
        content?: any;
        /**
         * 类型js、template(html,htm), nd(编译后的模版文件)，data(不保存资源)
         */
        type?: string;
        /**
         * 需要加载
         */
        needLoad?: boolean;
    }
    /**
     * 资源管理器
     * 用于url资源的加载及管理，主要针对js、模版等
     */
    class ResourceManager {
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        static resources: Map<string, IResourceObj>;
        /**
         * 加载任务  任务id:资源对象，{id1:{url1:false,url2:false},id2:...}
         */
        private static loadingTasks;
        /**
         * 资源等待列表  {资源url:[taskId1,taskId2,...]}
         */
        private static waitList;
        /**
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         */
        static getResources(reqs: any[]): Promise<IResourceObj[]>;
        /**
         * 唤醒任务
         * @param taskId    任务id
         * @param url       资源url
         * @param content   资源内容
         *
         * @returns         加载内容数组或undefined
         */
        static awake(taskId: number, url?: string): IResourceObj[];
        /**
         * 获取url类型
         * @param url   url
         * @returns     url type
         */
        static getType(url: string): string;
        /**
         * 处理一个资源获取结果
         * @param rObj
         */
        static handleOne(url: string, rObj: IResourceObj): void;
        /**
         * 预处理
         * @param reqs  [{url:**,type:**},url,...]
         * @returns     [promises(请求对象数组),urls(url数组),types(类型数组)]
         */
        static preHandle(reqs: any[]): any[];
    }
}
