// / <reference path="nodom.ts" />

namespace nodom {
    /**
     * 过滤器类
     */
    export class Filter {
        /**
		 * 过滤器类型
		 */
		type:string;
		/**
		 * 过滤器参数数组
		 */
		params:Array<string>;
        /**
         * 构造方法
         * @param src 		源串，或explain后的数组
         */
        constructor(src?:string|string[]) {
            if(src){
                let arr:Array<string> = Util.isString(src)?FilterManager.explain(<string>src):<Array<string>>src;
                if (arr) {
                    this.type = arr[0];
                    this.params = arr.slice(1);
                }
            }
	    }

        /**
         * 过滤器执行
         * @param value 	待过滤值
         * @param module 	模块
         * @returns 		过滤结果
         */
        exec(value:string, module:Module):string{
            let args = [module, this.type, value].concat(this.params);
            return Util.apply(FilterManager.exec, module, args);
        }

        /**
         * 克隆
         */
        clone():Filter{
            let filter = new Filter();
            filter.type = this.type;
            if(this.params){
                filter.params = Util.clone(this.params);
            }
            return filter;
        }
    }
}