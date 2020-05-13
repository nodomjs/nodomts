/// <reference path="nodom.ts" />
/**
 * @description 异常处理类
 * @since       0.0.1
 */
namespace nodom{
    export class NodomError extends Error{
        constructor(errorName:string,p1?:string,p2?:string,p3?:string,p4?:string){
            super(errorName);
            let msg:string = nodom.ErrorMsgs[errorName];
            if(msg === undefined){
                this.message = "未知错误";
                return;
            }
            let params:Array<string> = [msg];
            if(p1){
                params.push(p1);
            }
            if(p2){
                params.push(p2);
            }
            if(p3){
                params.push(p3);
            }
            if(p4){
                params.push(p4);
            }
            this.message = Util.compileStr.apply(null,params);
        }
    };
}