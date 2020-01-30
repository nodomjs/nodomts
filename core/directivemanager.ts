namespace nodom {
    /**
     * 指令管理器
     */
    export class DirectiveManager {
        /**
         * 指令类型集合
         */
        static directiveTypes:Map<string,Directive> = new Map();
        /**
         * 不可编辑(被新类型替换)类型
         */
        static cantEditTypes:Array<string> = ['model','repeat','if','else','show','class','field'];
        /**
         * 创建指令类型
         * @param name 		    指令类型名
         * @param config 	    配置对象{order:优先级,init:初始化函数,handler:渲染处理函数}
         * @param replacable    是否可编辑
         */
        static addType(name:string, config:any,replacable?:boolean) {
            if (this.directiveTypes.has(name)) {
                throw new NodomError('exist1', TipWords.directiveType, name);
            }
            if (!Util.isObject(config)) {
                throw new NodomError('invoke', 'DirectiveManager.addType','1', 'Function');
            }
            //默认优先级10
            config.prio = config.prio || 10;
            if(replacable && !this.cantEditTypes.includes(name)){
                this.cantEditTypes.push(name);
            }
            this.directiveTypes.set(name, config);
        }

        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name:string) {
            if (this.cantEditTypes.indexOf(name) !== -1) {
                throw new NodomError('notupd', TipWords.system + TipWords.directiveType, name);
            }
            if (!this.directiveTypes.has(name)) {
                throw new NodomError('notexist1', TipWords.directiveType, name);
            }
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
         */
        static init(directive:Directive, dom:Element, module:Module, el:HTMLElement) {
            let dt = this.directiveTypes.get(directive.type);
            if (dt === undefined) {
                throw new NodomError('notexist1', TipWords.directiveType, name);
            }
            return dt.init(directive, dom, module, el);
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
            if (!this.directiveTypes.has(directive.type)) {
                throw new NodomError('notexist1', TipWords.directiveType, directive.type);
            }

            //调用
            return Util.apply(this.directiveTypes.get(directive.type).handler, null, [directive,dom,module,parent]);
        }
    }
}