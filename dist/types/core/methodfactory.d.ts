declare namespace nodom {
    /**
     * 方法工厂，每个模块一个
     */
    class MethodFactory extends Factory {
        module: Module;
        /**
         * 调用方法
         * @param name 		方法名
         * @param params 	方法参数数组
         */
        invoke(name: string, params: Array<any>): any;
    }
}
