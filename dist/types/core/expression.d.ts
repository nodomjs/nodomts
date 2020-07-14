declare namespace nodom {
    /**
     * 表达式类
     */
    class Expression {
        /**
         * 表达式id
         */
        id: number;
        /**
         * 字段数组
         */
        fields: Array<string>;
        /**
         * 执行函数
         */
        execFunc: Function;
        /**
         * 执行字符串，编译后生成
         */
        execString: string;
        /**
         * 一个expression可能被多次使用，以modelid进行区分，针对不同的模型id构建对象{modelId:{fieldValue:,value:}
         */
        static REP_STR: string;
        /**
         * 字符串替换map
         */
        replaceMap: Map<string, string>;
        /**
         * @param exprStr	表达式串
         * @param execStr   执行串
         */
        constructor(exprStr?: string, execStr?: string);
        /**
         * 克隆
         */
        clone(): this;
        /**
         * 初始化，把表达式串转换成堆栈
         * @param exprStr 	表达式串
         */
        compile(exprStr: string): string;
        /**
         * 生成执行串
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         */
        private genExecStr;
        /**
        * 还原字符串
        * 从$$NODOM_TMPSTR还原为源串
        * @param str   待还原字符串
        * @returns     还原后的字符串
        */
        private recoveryString;
        /**
         * 判断并处理函数
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         * @param srcOp         前操作数
         * @returns     转换后的串
         */
        private judgeAndHandleFunc;
        /**
         * 判断并处理过滤器
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         * @param srcOp         前操作数
         * @returns             过滤器串
         */
        private judgeAndHandleFilter;
        /**
         * 表达式计算
         * @param model 	模型 或 fieldObj对象
         * @param modelId 	模型id（model为fieldObj时不能为空）
         * @returns 		计算结果
         */
        val(model: Model): any;
        /**
         * 添加字段到fields
         * @param field 	字段
         * @returns         true/false
         */
        addField(field: string): boolean;
    }
}
