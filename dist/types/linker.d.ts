/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 链式操作器
     */
    class Linker {
        /**
         *
         * @param type 		类型，包括：ajax(ajax请求),getfiles(加载多个文件),dolist(执行多个异步操作)
         * @param config 	配置参数，针对不同type配置不同
         */
        static gen(type: string, config: any): Promise<any>;
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
        private static ajax;
        /**
         * 通过get获取多个文件
         * @param urls 	文件url数组
         */
        private static getfiles;
        /**
         * 同步顺序执行
         * @param funcArr 	函数数组
         * @param paramArr 	参数数组
         * @returns 		promise对象
         */
        private static dolist;
    }
}
