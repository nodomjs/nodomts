// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * filter类型命名规则：以小写字母a-z命名，其它字母不允许
     */
    export class FilterManager{
        /**
		 * 过滤类型
		 */
		static filterTypes:Map<string,Function> = new Map();
		
        /**
         * 创建过滤器类型
         * @param name 		过滤器类型名
         * @param handler 	过滤器类型处理函数{init:foo1,handler:foo2}
         */
        static addType(name, handler) {
            if (!/^[a-zA-Z]+$/.test(name)) {
                throw new NodomError('namedinvalid', TipMsg.TipWords['filterType'], name);
            }
            if (this.filterTypes.has(name)) {
                throw new NodomError('exist1', TipMsg.TipWords['filterType'], name);
            }
            if (!Util.isFunction(handler)) {
                throw new NodomError('invoke', 'FilterManager.addType', '1', 'Function');
            }
            this.filterTypes.set(name, handler);
        }

        /**
         * 移除过滤器类型
         * @param name  过滤器类型名
         */
        static removeType(name:string) {
            if (!this.filterTypes.has(name)) {
                throw new NodomError('notexist1', TipMsg.TipWords['filterType'], name);
            }
            this.filterTypes.delete(name);
        }

        /**
         * 是否有某个过滤器类型
         * @param type 		过滤器类型名
         * @return 			true/false
         */
        static hasType(name:string):boolean {
            return this.filterTypes.has(name);
        }

        /**
         * 执行过滤器
         * @param module 	模块
         * @param type 		类型
         * @param arguments 参数数组  0模块 1过滤器类型名 2待处理值 3-n处理参数
		 * @returns 		过滤器执行结果
         */
        static exec(module:Module, type:string):string {
            let params = new Array();
            for (let i = 2; i < arguments.length; i++) {
                params.push(arguments[i]);
            }
            if (!FilterManager.filterTypes.has(type)) {
                throw new NodomError('notexist1', TipMsg.TipWords['filterType'], type);
            }
            //调用
            return Util.apply(FilterManager.filterTypes.get(type), module, params);
        }

        /**
         * 解析过滤器串为数组
         * @param src 	源字符串，格式为filtertype:param1:param2:... 	
		 * @returns 	解析后的过滤器数组参数
         */
        static explain(src: string): Array < string > {
            let startStr: string
            let startObj: boolean = false;
            let strings:string = "\"'`"; //字符串开始和结束标志
            let splitCh:string = ':'; //分隔符
            let retArr = new Array();
            let tmp = ''; //临时串
            for (let i = 0; i < src.length; i++) {
                let ch = src[i];
                //字符串开始或结束
                if (strings.indexOf(ch) !== -1) {
                    if (ch === startStr) { //字符串结束
                        startStr = undefined;
                    } else { //字符串开始
                        startStr = ch;
                    }
                } else if (startStr === undefined) { //非字符串开始情况检查对象
                    if (ch === '}' && startObj) { //对象结束
                        startObj = false;
                    } else if (ch === '{') { //对象开始
                        startObj = true;
                    }
                }

                //分割开始
                if (ch === splitCh && startStr === undefined && !startObj && tmp !== '') {
                    retArr.push(handleObj(tmp));
                    tmp = '';
                    continue;
                }
                tmp += ch;
            }

            //最后一个
            if (tmp !== '') {
                retArr.push(handleObj(tmp));
            }
            return retArr;
            /**
             * 转化字符串为对象
             */
            function handleObj(s:string) {
                s = s.trim();
                if (s.charAt(0) === '{') { //转换为对象
                    s = eval('(' + s + ')');
                }
                return s;
            }
        }
    }
}