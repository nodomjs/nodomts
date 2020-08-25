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
         * 模型对应的模块id
         */
        moduleId: number;
        /**
         * 模型对应数据，初始化后，data会增加“$modelId”数据项
         */
        data: any;
        /**
         * 模型字段集
         * 每个字段对象结构为{value:值[,handlers:观察器，观察器为模块方法名或函数]}
         */
        fields: object;
        /**
         * 父model
         */
        parent: Model;
        /**
         * 子model
         */
        children: object | Array<Model>;
        /**
         * @param data 		数据
         * @param module 	模块对象
         * @param parent    父model
         */
        constructor(data: any, module: Module, parent?: Model, key?: string);
        /**
         * 设置属性，可能属性之前不存在，用于在初始化不存在的属性增强model能力
         * @param key       键，可以带“.”，如a, a.b.c
         * @param value     对应值
         */
        set(key: string, value: any): Model;
        /**
         * 获取子孙model
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        get(key: string | number): Model;
        /**
         * 删除属性
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        del(key: string | number): void;
        /**
         * 更新字段值
         * @param field 	字段名或空(数组更新)
         * @param value 	字段对应的新值
         */
        private update;
        /**
         * 获取数据
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        query(key: string): any;
        /**
         * 获取所有数据
         * @param dirty   是否获取脏数据（"$"开头数据项，这类数据项由nodom生成）
         */
        getData(dirty?: boolean): any;
        /**
         * 观察(取消观察)某个数据项
         * @param key       数据项名
         * @param operate   数据项变化时执行方法名(在module的methods中定义)
         * @param cancel    取消观察
         */
        watch(key: string, operate: string | Function, cancel?: boolean): void;
        /**
         * 为对象添加setter
         * @param data  数据
         */
        private addSetterGetter;
        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性名
         */
        private defineProp;
    }
}
