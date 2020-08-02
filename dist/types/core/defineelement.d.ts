/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 自定义元素
     */
    class DefineElement {
        /**
         * tag name
         */
        tagName: string;
        /**
         * 绑定的dom key
         */
        key: string;
        /**
         * 编译时执行方法
         * @param el    待编译html element
         */
        init(el: HTMLElement): void;
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module: nodom.Module, uidom: nodom.Element): void;
        /**
         * 后置渲染方法(dom render结束后，选到html之前)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        afterRender(module: nodom.Module, uidom: nodom.Element): void;
        clone(): any;
    }
}
