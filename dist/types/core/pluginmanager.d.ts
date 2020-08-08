/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 自定义元素管理器
     */
    class PluginManager {
        static plugins: Map<string, Plugin>;
        /**
         * 添加自定义元素类
         * @param name  元素名
         * @param cfg   元素类
         */
        static add(name: string, cfg: any): void;
        /**
         * 获取自定义元素类
         * @param tagName 元素名
         */
        static get(tagName: string): any;
    }
}
