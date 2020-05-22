declare namespace nodom {
    /**
     * 过滤器类
     */
    class Filter {
        /**
         * 过滤器类型
         */
        type: string;
        /**
         * 过滤器参数数组
         */
        params: Array<string>;
        /**
         * 构造方法
         * @param src 		源串，或explain后的数组
         */
        constructor(src: string | string[]);
        /**
         * 过滤器执行
         * @param value 	待过滤值
         * @param module 	模块
         * @returns 		过滤结果
         */
        exec(value: string, module: Module): string;
    }
}
