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
		 * 指令值
		 */
		value:string|Expression[];

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
		handler:Function;
		
        /**
         * 构造方法
         * @param type  	类型
         * @param value 	指令值
         * @param vdom 		指令所属虚拟dom
         * @param module 	模块	
         * @param el 		指令所属html element
         */
        constructor(type:string, value:string, vdom:Element, module:Module, el:HTMLElement) {
			this.id = Util.genId();
			this.type = type;
            if (Util.isString(value)) {
                this.value = value.trim();
            }
            if (type !== undefined) {
                Util.apply(DirectiveManager.init, DirectiveManager, [this, vdom, module, el]);
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
    }
}