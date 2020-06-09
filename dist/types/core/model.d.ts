declare namespace nodom {
    /**
     * 模型类
     */
    class Model {
        /**
         * 模型id（唯一）
         */
        id: number;
        /**
         * 模型对应的模块名
         */
        moduleName: string;
        /**
         * 模型对应数据
         */
        data: any;
        /**
         * 模型字段集
         */
        fields: object;
        /**
         * @param data 		数据
         * @param module 	模块对象
         */
        constructor(data: any, module: Module);
        /**
         * 设置属性，可能属性之前不存在，用于在初始化不存在的属性创建和赋值
         * @param key       键，可以带“.”，如a, a.b.c
         * @param value     对应值
         */
        set(key: string, value: any): void;
        /**
         * 更新字段值
         * @param field 	字段名或空(数组更新)
         * @param value 	字段对应的新值
         */
        update(field: string, value?: any): void;
        /**
         * 为对象添加setter
         */
        addSetterGetter(data: any): void;
        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性
         */
        defineProp(data: any, p: string): void;
        /**
         * 查询字段值
         * @param name 		字段名，可以是多段式 如 a.b.c
         */
        query(name: string): any;
    }
}
