/// <reference path="nodom.ts" />
namespace nodom{
    /**
     * 插件，插件为自定义元素方式实现
     */
    export class Plugin {
        /**
         * tag name
         */
        tagName:string;

        /**
         * 绑定的element
         */
        element:Element;

        /**
         * module id
         */
        moduleId:number;

        /**
         * model id
         */
        modelId:number;

        /**
         * 绑定的dom key
         */
        key:string;

        /**
         * 插件名，在module中唯一
         */
        name:string;

        /**
         * 是否需要前置渲染
         */
        needPreRender:boolean;

        /**
         * 附加数据项名
         */
        extraDataName:string;

        /**
         * 临时参数
         */
        tmpParam:object;
        
        constructor(params:HTMLElement|object){}
        
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module:nodom.Module,uidom:nodom.Element){
            this.element = uidom;
            this.moduleId = module.id;
            if(!this.modelId || uidom.key !== this.key){
                this.key = uidom.key;
                this.modelId = uidom.modelId;
                //添加到模块
                if(uidom.hasProp('name')){
                    module.addPlugin(uidom.getProp('name'),this);       
                }
                this.needPreRender = true;    
            }else{
                this.needPreRender = false;
            }
        }
        /**
         * 后置渲染方法(dom render结束后，选到html之前)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        afterRender(module:nodom.Module,uidom:nodom.Element){}

        /**
         * 克隆
         */
        clone(dst?:Element){
            let plugin = Reflect.construct(this.constructor,[]);
            //不拷贝属性
            let excludeProps:string[] = ['key','element','modelId','moduleId'];
            Util.getOwnProps(this).forEach((prop)=>{
                if(excludeProps.includes(prop)){
                    return;
                }
                plugin[prop] = Util.clone(this[prop]);
            });
            if(dst){
                plugin.element = dst;
            }
            return plugin;
        }

        /**
         * 设置临时参数
         * @param name      参数名
         * @param value     参数值
         */
        setTmp(name:string,value:any){
            this.tmpParam[name] = value;
        }

        /**
         * 获取临时参数
         * @param name      参数名
         * @returns         参数值
         */
        getTmp(name:string,value:any){
            this.tmpParam[name] = value;
        }

        /**
         * 移除临时值
         * @param name      参数名 
         */
        removeTmp(name:string){
            delete this.tmpParam[name];
        }
    }
}