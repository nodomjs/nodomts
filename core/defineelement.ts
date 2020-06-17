/// <reference path="nodom.ts" />
namespace nodom{
    /**
     * 自定义元素
     */
    export interface IDefineElement{
        /**
         * 编译方法
         */
        init:Function;
        /**
         * 前置渲染方法
         */
        afterRender?:Function;
        /**
         * 后置渲染方法
         */
        beforeRender?:Function;
    }

    /**
     * 自定义元素管理器
     */
    export class DefineElementManager{
        static elementMap:Map<string,IDefineElement> = new Map();
        /**
         * 添加自定义元素类
         * @param name  元素名
         * @param cfg   元素类
         */
        static add(name:string,cfg:any){
            if(this.elementMap.has(name)){
                throw new NodomError('exist1',TipWords.element,name);
            }
            this.elementMap.set(name,cfg);
        }

        /**
         * 获取自定义元素类
         * @param tagName 元素名
         */
        static get(tagName:string):any{
            return this.elementMap.get(tagName);
        }

        /**
         * 执行自定义元素前置渲染
         * @param module    模块 
         * @param dom       虚拟dom
         */
        static beforeRender(module:Module,dom:Element){
            let de:IDefineElement = dom.defineElement;
            if(de && de.beforeRender){
                de.beforeRender(module,dom);
            }
        }

        /**
         * 执行自定义元素后置渲染
         * @param module    模块 
         * @param dom       虚拟dom
         */
        static afterRender(module:Module,dom:Element){
            let de:IDefineElement = dom.defineElement;
            if(de && de.afterRender){
                de.afterRender(module,dom);
            }
        }

    }
}