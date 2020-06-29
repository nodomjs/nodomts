/// <reference path="nodom.ts" />
namespace nodom{
    /**
     * 自定义元素
     */
    export class DefineElement {
        /**
         * tag name
         */
        tagName:string;
        /**
         * 编译时执行方法
         * @param el    待编译html element
         */
        init(el:HTMLElement){};
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module:nodom.Module,uidom:nodom.Element){}
        /**
         * 后置渲染方法(dom render结束后，选到html之前)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        afterRender(module:nodom.Module,uidom:nodom.Element){}

        clone(){
            let ele = Reflect.construct(this.constructor,[]);
            Util.getOwnProps(this).forEach((prop)=>{
                ele[prop] = Util.clone(this[prop]);
            })
            return ele;
        }
    }
}