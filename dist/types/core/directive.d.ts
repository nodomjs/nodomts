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
         * @param filters   过滤器字符串或过滤器对象,如果为过滤器串，则以｜分割
         */
        constructor(type: string, value: string, filters?: string | Filter[]);
        /**
         * 执行指令
         * @param module    模块
         * @param dom       指令对应虚拟dom
         * @param parent    父虚拟dom
         */
        exec(module: Module, dom: Element, parent?: Element): any;
        /**
         * 克隆
         */
        clone(): Directive;
    }
}
