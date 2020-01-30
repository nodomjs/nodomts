import { Z_NO_COMPRESSION } from "zlib";

namespace nodom {
	/**
     * 方法工厂，每个模块一个
     */
    export class MethodFactory extends Factory {
		module:Module;
		/**
         * 调用方法
         * @param name 		方法名
         * @param params 	方法参数
         */
        invoke(name, params) {
            const me = this;
            let foo = me.get(name);
            if (!Util.isFunction(foo)) {
                throw new NodomError(nodom.ErrorMsgs.notexist1, nodom.words.method, name);
            }
            return Util.apply(foo, me.module.model, params);
        }
    }
}