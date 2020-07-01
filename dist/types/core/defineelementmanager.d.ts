/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 自定义元素管理器
     */
    class DefineElementManager {
        static elementMap: Map<string, DefineElement>;
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
        /**
         * 执行自定义元素前置渲染
         * @param module    模块
         * @param dom       虚拟dom
         */
        static beforeRender(module: Module, dom: Element): void;
        /**
         * 执行自定义元素后置渲染
         * @param module    模块
         * @param dom       虚拟dom
         */
        static afterRender(module: Module, dom: Element): void;
    }
}