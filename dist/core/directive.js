// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 指令类
     */
    class Directive {
        /**
         * 构造方法
         * @param type  	类型
         * @param value 	指令值
         * @param dom       指令对应的dom
         * @param filters   过滤器字符串或过滤器对象,如果为过滤器串，则以｜分割
         */
        constructor(type, value, dom, filters) {
            this.id = nodom.Util.genId();
            this.type = type;
            if (nodom.Util.isString(value)) {
                value = value.trim();
            }
            this.value = value;
            if (filters) {
                this.filters = [];
                if (typeof filters === 'string') {
                    let fa = filters.split('|');
                    for (let f of fa) {
                        this.filters.push(new nodom.Filter(f));
                    }
                }
                else if (nodom.Util.isArray(filters)) {
                    for (let f of filters) {
                        if (typeof f === 'string') {
                            this.filters.push(new nodom.Filter(f));
                        }
                        else if (f instanceof nodom.Filter) {
                            this.filters.push(f);
                        }
                    }
                }
            }
            if (type !== undefined && dom) {
                nodom.DirectiveManager.init(this, dom);
            }
        }
        /**
         * 执行指令
         * @param module    模块
         * @param dom       指令执行时dom
         * @param parent    父虚拟dom
         */
        exec(module, dom, parent) {
            return nodom.DirectiveManager.exec(this, dom, module, parent);
        }
        /**
         * 克隆
         */
        clone(dst) {
            let dir = new Directive(this.type, this.value);
            if (this.filters) {
                dir.filters = [];
                for (let f of this.filters) {
                    dir.filters.push(f.clone());
                }
            }
            if (this.params) {
                dir.params = nodom.Util.clone(this.params);
            }
            nodom.DirectiveManager.init(dir, dst);
            return dir;
        }
    }
    nodom.Directive = Directive;
})(nodom || (nodom = {}));
//# sourceMappingURL=directive.js.map