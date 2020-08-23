/// <reference path="nodom.ts" />

namespace nodom {
    /**
     * 指令管理器
     */
    export class DirectiveManager {
        /**
         * 指令类型集合
         */
        static directiveTypes:Map<string,DirectiveType> = new Map();
        
        /**
         * 创建指令类型
         * @param name 		    指令类型名
         * @param config 	    配置对象{order:优先级,init:初始化函数,handler:渲染处理函数}
         */
        static addType(name:string, prio?:number,init?:Function,handle?:Function) {
            this.directiveTypes.set(name, new DirectiveType(name,prio,init,handle));
        }

        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name:string) {
            this.directiveTypes.delete(name);
        }

        /**
         * 获取类型
         * @param name  指令类型名
         * @returns     指令或undefined
         */
        static getType(name:string) {
            return this.directiveTypes.get(name);
        }

        /**
         * 是否有某个过滤器类型
         * @param type 		过滤器类型名
         * @returns 		true/false
         */
        static hasType(name:string) {
            return this.directiveTypes.has(name);
        }

        /**
         * 指令初始化
         * @param directive     指令
         * @param dom           虚拟dom
         */
         
        static init(directive:Directive,dom:Element) {
            let dt = directive.type;
            if (dt) {
                return dt.init(directive,dom);
            }
        }

        /**
         * 执行指令
         * @param directive     指令
         * @param dom           虚拟dom
         * @param module        模块
         * @param parent        父dom
         * @returns             指令执行结果
         */
        static exec(directive:Directive, dom:Element, module:Module, parent:Element) {
            //调用
            return Util.apply(directive.type.handle, null, [directive,dom,module,parent]);
        }
    }
}