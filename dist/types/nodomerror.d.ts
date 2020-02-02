/// <reference path="nodom.d.ts" />
/**
 * @description 异常处理类
 * @since       0.0.1
 */
declare namespace nodom {
    class NodomError extends Error {
        constructor(errorName: string, p1?: string, p2?: string, p3?: string, p4?: string);
    }
}
