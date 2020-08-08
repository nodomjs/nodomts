declare namespace nodom {
    /**
     *  编译器
     *  描述：用于进行预编译和预编译后的json串反序列化，处理两个部分：虚拟dom树和表达式工厂
     */
    class Serializer {
        /**
         * 序列化，只序列化virtualDom
         * @param module 	模块
         * @return   		jsonstring
         */
        static serialize(module: Module): string;
        /**
         * 反序列化
         * @param jsonStr 	json串
         * @param module 	模块
         * @returns 		 virtualDom
         */
        static deserialize(jsonStr: string): Element;
    }
}
