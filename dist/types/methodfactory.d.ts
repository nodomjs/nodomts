/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class MethodFactory extends Factory {
        module: Module;
        invoke(name: string, params: Array<any>): any;
    }
}
