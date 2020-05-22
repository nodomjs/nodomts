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
         * 渲染方法
         */
        render?:Function;
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
    }
}