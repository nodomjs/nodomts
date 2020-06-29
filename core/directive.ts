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
		type:string;
        /**
         * 优先级，越小优先级越高
         */
        prio:number;
		/**
		 * 指令值
		 */
        value:any;
        
		/**
		 * 指令对应模块
		 */
		module:Module;

		/**
		 * 编译时执行方法
		 */
		init:Function;

		/**
		 * 渲染时执行方法
		 */
		handle:Function;
        
        /**
         * 过滤器
         */
        filter:Filter;
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
         * @param type  	类型
         * @param value 	指令值
         * @param vdom 		指令所属虚拟dom
         * @param filter    过滤器字符串或过滤器对象
         */
        constructor(type:string, value:string, vdom:Element,filter?:string|Filter) {
            this.id = Util.genId();
            this.type = type;
            if (Util.isString(value)) {
                value = value.trim();
            }
            this.value = value;

            if(filter){
                if(typeof filter === 'string'){
                    this.filter = new Filter(filter);
                }else if(filter instanceof Filter){
                    this.filter = filter;
                }
            }
            
            if (type !== undefined) {
                DirectiveManager.init(this,vdom);
            }
        }

        /**
         * 执行
         * @param value 	指令值
         * @returns 		指令结果
         */
        exec(value) {
            let args:Array<any> = [this.module, this.type, value];
            return Util.apply(DirectiveManager.exec, DirectiveManager, args);
        }

        /**
         * 克隆
         * @param vdom  虚拟dom
         */
        clone(vdom:Element){
            let dir = new Directive(this.type,this.value,vdom);
            if(this.filter){
                dir.filter = this.filter.clone();
            }
            if(this.params){
                dir.params = Util.clone(this.params);
            }
            return dir;
        }
    }
}