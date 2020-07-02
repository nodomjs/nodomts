declare namespace nodom {
    /**
     * 指令类
     */
    class Directive {
        /**
         * 指令id
         */
        id: number;
        /**
         * 指令类型，指令管理器中定义
         */
        type: string;
        /**
         * 优先级，越小优先级越高
         */
        prio: number;
        /**
         * 指令值
         */
        value: any;
        /**
         * 指令对应模块
         */
        module: Module;
        /**
         * 编译时执行方法
         */
        init: Function;
        /**
         * 渲染时执行方法
         */
        handle: Function;
        /**
         * 过滤器组
         */
        filters: Filter[];
        /**
         * 附加参数
         */
        params: any;
        /**
         * 附加操作
         */
        extra: any;
        /**
         * 构造方法
         * @param type  	类型
         * @param value 	指令值
         * @param vdom 		指令所属虚拟dom
         * @param filters   过滤器字符串或过滤器对象,如果为过滤器串，则以｜分割
         */
        constructor(type: string, value: string, vdom: Element, filters?: string | Filter[]);
        /**
         * 执行
         * @param value 	指令值
         * @returns 		指令结果
         */
        exec(value: any): any;
        /**
         * 克隆
         * @param vdom  虚拟dom
         */
        clone(vdom: Element): Directive;
    }
}
