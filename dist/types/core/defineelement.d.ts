/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 自定义元素
     */
    interface IDefineElement {
        /**
         * 虚拟dom
         */
        dom?: Element;
        /**
         * tag name
         */
        tagName: string;
        /**
         * 编译方法
         */
        init: Function;
        /**
         * 前置方法
         */
        afterRender?: Function;
        /**
         * 后置渲染方法
         */
        beforeRender?: Function;
    }
    /**
     * 自定义元素管理器
     */
    class DefineElementManager {
        static elementMap: Map<string, IDefineElement>;
        /**
         * 添加自定义元素
         * @param cfg
         */
        static add(cfg: IDefineElement): void;
        /**
         * 获取自定义元素
         * @param tagName 元素名
         */
        static get(tagName: string): IDefineElement;
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
