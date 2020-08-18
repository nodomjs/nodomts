/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 插件，插件为自定义元素方式实现
     */
    class Plugin {
        /**
         * tag name
         */
        tagName: string;
        /**
         * 绑定的element
         */
        element: Element;
        /**
         * module id
         */
        moduleId: number;
        /**
         * model id
         */
        modelId: number;
        /**
         * 绑定的dom key
         */
        key: string;
        /**
         * 插件名，在module中唯一
         */
        name: string;
        /**
         * 是否需要前置渲染
         */
        needPreRender: boolean;
        constructor(params: HTMLElement | object);
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
        /**
         * 克隆
         */
        clone(dst?: Element): any;
    }
}
