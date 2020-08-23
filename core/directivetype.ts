// / <reference path="nodom.ts" />

namespace nodom {
    /**
     * 指令类
     */
    export class DirectiveType {
		
        /**
		 * 指令类型名
		 */
        name:string;
        
        /**
         * 优先级，越小优先级越高
         */
        prio:number;

		/**
		 * 编译时执行方法
		 */
		init:Function;

		/**
		 * 渲染时执行方法
		 */
		handle:Function;
        
        /**
         * 构造方法
         * @param name      指令类型名       
         * @param prio      类型优先级
         * @param init      编译时执行方法
         * @param handle    渲染时执行方法
         */ 
        constructor(name:string, prio?:number,init?:Function,handle?:Function) {
            this.name = name;
            this.prio = prio || 10;
            this.init = init;
            this.handle = handle;
        }
    }
}