// / <reference path="nodom.ts" />

namespace nodom {
    /**
     * 指令类
     */
    export class Directive {
		/**
		 * 指令id
		 */
		id:number;

        /**
		 * 指令类型，指令管理器中定义
		 */
        type:DirectiveType;
        
        /**
		 * 指令值
		 */
        value:any;
        
		
        /**
         * 过滤器组
         */
        filters:Filter[];
        /**
         * 附加参数
         */
        params:any;

        /**
         * 附加操作
         */
        extra:any;

        /**
         * 构造方法
         * @param type  	类型名
         * @param value 	指令值
         * @param dom       指令对应的dom
         * @param filters   过滤器字符串或过滤器对象,如果为过滤器串，则以｜分割
         */
        constructor(type:string, value:string,dom?:Element, filters?:string|Filter[]) {
            this.id = Util.genId();
            this.type = DirectiveManager.getType(type);
            if (Util.isString(value)) {
                value = value.trim();
            }
            this.value = value;
            
            if(filters){
                this.filters = [];
                if(typeof filters === 'string'){
                    let fa:string[] = filters.split('|');
                    for(let f of fa){
                        this.filters.push(new Filter(f));
                    }
                }else if(Util.isArray(filters)){
                    for(let f of filters){
                        if(typeof f === 'string'){
                            this.filters.push(new Filter(f));
                        }else if(f instanceof Filter){
                            this.filters.push(f);
                        }
                    }
                }
            }
            if (type !== undefined && dom) {
                DirectiveManager.init(this,dom);
            }
        }

        /**
         * 执行指令
         * @param module    模块 
         * @param dom       指令执行时dom
         * @param parent    父虚拟dom
         */
        exec(module:Module,dom:Element,parent?:Element) {
            return DirectiveManager.exec(this,dom,module,parent);
        }

        /**
         * 克隆
         * @param dst   目标dom
         * @returns     新指令
         */
        clone(dst:Element):Directive{
            let dir = new Directive(this.type.name,this.value);
            if(this.filters){
                dir.filters = [];
                for(let f of this.filters){
                    dir.filters.push(f.clone());
                }
            }
            if(this.params){
                dir.params = Util.clone(this.params);
            }
            if(this.extra){
                dir.extra = Util.clone(this.extra);
            }
            DirectiveManager.init(dir,dst);
            return dir;
        }
    }
}