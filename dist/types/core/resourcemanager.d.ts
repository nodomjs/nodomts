declare namespace nodom {
    /**
     * 资源管理器
     * 用于管理url资源的加载状态管理
     */
    class ResourceManager {
        /**
         * 资源map，key为url，值为整数，1表示正在加载，2表示已加载完成
         */
        private static resources;
        /**
         * 获取资源当前状态
         * @param url 资源url
         * @reutrn    0:不存在 1:加载中 2:已加载
         */
        static getState(url: string): number;
        /**
         * 加载单个资源
         * @param url
         */
        static loadResource(url: string): Promise<void>;
        /**
         * 加载多个资源
         * @param urls
         */
        static loadResources(urls: string[]): Promise<void>;
    }
}
