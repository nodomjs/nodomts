// / <reference path="nodom.ts" />
namespace nodom {
	/**
     * 方法工厂，每个模块一个
     */
    export class MethodFactory extends Factory {
		module:Module;
		/**
         * 调用方法
         * @param name 		方法名
         * @param params 	方法参数数组
         */
        invoke(name:string, params:Array<any>) {
            const foo = this.get(name);
            if (!Util.isFunction(foo)) {
                throw new NodomError(TipMsg.ErrorMsgs['notexist1'], TipMsg.TipWords['method'], name);
            }
            return Util.apply(foo, this.module.model, params);
        }
    }
}