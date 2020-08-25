declare namespace nodom {
    /**
     * filter类型命名规则：以小写字母a-z命名，其它字母不允许
     */
    class FilterManager {
        /**
         * 过滤类型
         */
        static filterTypes: Map<string, Function>;
        /**
         * 创建过滤器类型
         * @param name 		过滤器类型名
         * @param handler 	过滤器类型处理函数{init:foo1,handler:foo2}
         */
        static addType(name: any, handler: any): void;
        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name: string): void;
        /**
         * 是否有某个过滤器类型
         * @param type 		过滤器类型名
         * @return 			true/false
         */
        static hasType(name: string): boolean;
        /**
         * 执行过滤器
         * @param module 	模块
         * @param type 		类型
         * @param arguments 参数数组  0模块 1过滤器类型名 2待处理值 3-n处理参数
         * @returns 		过滤器执行结果
         */
        static exec(module: Module, type: string): string;
        /**
         * 解析过滤器串为数组
         * @param src 	源字符串，格式为filtertype:param1:param2:...
         * @returns 	解析后的过滤器数组参数
         */
        static explain(src: string): Array<string>;
    }
}
