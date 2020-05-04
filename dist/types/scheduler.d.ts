/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Scheduler {
        static tasks: Array<any>;
        static dispatch(): void;
        static start(): void;
        static addTask(foo: Function, thiser?: any): void;
        static removeTask(foo: any): void;
    }
}
