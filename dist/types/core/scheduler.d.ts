declare namespace nodom {
    /**
     * 调度器，用于每次空闲的待操作序列调度
     */
    class Scheduler {
        static tasks: Array<any>;
        static dispatch(): void;
        static start(): void;
        /**
         * 添加任务
         * @param foo 		任务和this指向
         * @param thiser 	this指向
         */
        static addTask(foo: Function, thiser?: any): void;
        /**
         * 移除任务
         * @param foo 	任务
         */
        static removeTask(foo: any): void;
    }
}
