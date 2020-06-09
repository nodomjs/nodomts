/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令管理器
     */
    let DirectiveManager = /** @class */ (() => {
        class DirectiveManager {
            /**
             * 创建指令类型
             * @param name 		    指令类型名
             * @param config 	    配置对象{order:优先级,init:初始化函数,handler:渲染处理函数}
             * @param replacable    是否可编辑
             */
            static addType(name, config, replacable) {
                if (this.directiveTypes.has(name)) {
                    throw new nodom.NodomError('exist1', nodom.TipWords.directiveType, name);
                }
                if (!nodom.Util.isObject(config)) {
                    throw new nodom.NodomError('invoke', 'DirectiveManager.addType', '1', 'Function');
                }
                //默认优先级10
                config.prio = config.prio || 10;
                if (replacable && !this.cantEditTypes.includes(name)) {
                    this.cantEditTypes.push(name);
                }
                this.directiveTypes.set(name, config);
            }
            /**
             * 移除过滤器类型
             * @param name  过滤器类型名
             */
            static removeType(name) {
                if (this.cantEditTypes.indexOf(name) !== -1) {
                    throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.directiveType, name);
                }
                if (!this.directiveTypes.has(name)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, name);
                }
                this.directiveTypes.delete(name);
            }
            /**
             * 获取类型
             * @param name  指令类型名
             * @returns     指令或undefined
             */
            static getType(name) {
                return this.directiveTypes.get(name);
            }
            /**
             * 是否有某个过滤器类型
             * @param type 		过滤器类型名
             * @returns 		true/false
             */
            static hasType(name) {
                return this.directiveTypes.has(name);
            }
            /**
             * 指令初始化
             */
            static init(directive, dom, el) {
                let dt = this.directiveTypes.get(directive.type);
                if (dt) {
                    // throw new NodomError('notexist1', TipWords.directiveType, directive.type);
                    return dt.init(directive, dom, el);
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
            static exec(directive, dom, module, parent) {
                if (!this.directiveTypes.has(directive.type)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.directiveType, directive.type);
                }
                //调用
                return nodom.Util.apply(this.directiveTypes.get(directive.type).handle, null, [directive, dom, module, parent]);
            }
        }
        /**
         * 指令类型集合
         */
        DirectiveManager.directiveTypes = new Map();
        /**
         * 不可编辑(被新类型替换)类型
         */
        DirectiveManager.cantEditTypes = ['model', 'repeat', 'if', 'else', 'show', 'class', 'field'];
        return DirectiveManager;
    })();
    nodom.DirectiveManager = DirectiveManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=directivemanager.js.map