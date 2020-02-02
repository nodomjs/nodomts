/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 堆栈Item
     */
    interface IStatckItem {
        /**
         * item类型
         */
        type: string;
        /**
         * 值
         */
        val: any;
        /**
         * 参数数组
         */
        params?: Array<any>;
        /**
         * 过滤器
         */
        filter?: Filter;
    }
    /**
     * 表达式类
     */
    export class Expression {
        /**
         * 表达式id
         */
        id: number;
        /**
         * 模块名
         */
        moduleName: string;
        /**
         * 堆栈数组
         */
        stack: Array<IStatckItem>;
        /**
         * 字段数组
         */
        fields: Array<string>;
        /**
         * 一个expression可能被多次使用，以modelid进行区分，针对不同的模型id构建对象{modelId:{fieldValue:,value:}
         */
        modelMap: object;
        /**
         * 前置expressionId数组
         */
        pre: Array<number>;
        /**
         * @param exprStr	表达式串
         * @param module 	模块
         */
        constructor(exprStr: string, module: Module);
        /**
         * 初始化，把表达式串转换成堆栈
         * @param exprStr 	表达式串
         * @returns 		堆栈数组
         */
        init(exprStr: string): Array<IStatckItem>;
        /**
         * 表达式计算
         * @param model 	模型 或 fieldObj对象
         * @param modelId 	模型id（model为fieldObj时不能为空）
         * @returns 		计算结果
         */
        val(model: Model, modelId?: number): any;
        /**
         * 添加变量
         * @param field 	字段
         * @param statc 	堆栈
         */
        private addVar;
        /**
         * 添加字符串
         * @param str 		待添加字符串
         * @param stack 	堆栈
         */
        private addStr;
        /**
         * 添加操作符
         * @param str 		操作符
         * @param stack 	堆栈
         */
        private addOperand;
        /**
         * 添加过滤器
         * @param value 	value
         * @param filterArr	过滤器数组
         * @param stack 	堆栈
         * @param vtype 	值类型 field字段 func函数 comp 组合
         * @param extra 	附加参数
         */
        private addFilter;
        /**
         * 计算堆栈
         * @param stack 	堆栈
         * @param fieldObj 	字段对象
         * @param modelId 	模型id
         * @returns 		计算结果
         */
        cacStack(stack: Array<IStatckItem>, fieldObj: any, modelId?: number): string;
        /**
         * 添加字段到fields
         * @param field 	字段
         */
        addField(field: string): void;
        /**
         * 获取field值
         * @param model 	模型，可为空
         * @param field 	字段，可以带.
         * @returns 		字段值
         */
        getFieldValue(model: Model, field: string): any;
    }
    export {};
}
