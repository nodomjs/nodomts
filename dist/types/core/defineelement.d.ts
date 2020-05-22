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
         * 渲染方法
         */
        render?: Function;
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
    }
}
