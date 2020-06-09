/// <reference path="nodom.ts" />
namespace nodom{
    /**
     * 自定义元素
     */
    export interface IDefineElement{
        /**
         * 虚拟dom
         */
        dom?:Element;
        /**
         * tag name
         */
        tagName:string;
        /**
         * 编译方法
         */
        init:Function;

        /**
         * 前置方法
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
         * 添加自定义元素
         * @param cfg 
         */
        static add(cfg:IDefineElement){
            if(this.elementMap.has(cfg.tagName)){
                throw new NodomError('exist1',TipWords.element,cfg.tagName);
            }
            this.elementMap.set(cfg.tagName,cfg);
        }

        /**
         * 获取自定义元素
         * @param tagName 元素名
         */
        static get(tagName:string):IDefineElement{
            return this.elementMap.get(tagName);
        }

        /**
         * 执行自定义元素前置渲染
         * @param module    模块 
         * @param dom       虚拟dom
         */
        static beforeRender(module:Module,dom:Element){
            let de:IDefineElement = this.get(dom.defineType);
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
            let de:IDefineElement = this.get(dom.defineType);
            if(de && de.afterRender){
                de.afterRender(module,dom);
            }
        }

    }
}