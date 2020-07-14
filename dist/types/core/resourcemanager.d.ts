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
    }
    /**
     * 资源管理器
     * 用于url资源的加载及管理，主要针对js、模版等
     */
    class ResourceManager {
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        private static resources;
        /**
         * 获取资源
         * @param url   资源路径
         * @returns     资源内容
         */
        static getResource(url: string, type?: string): Promise<any>;
        /**
         * 获取多个资源
         * @param urls  [{url:**,type:**}]或 [url1,url2,...]
         */
        static getResources(reqs: any[]): Promise<IResourceObj[]>;
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
