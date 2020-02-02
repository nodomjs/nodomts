/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 渲染器
     */
    class Renderer {
        /**
         * 等待渲染列表（模块名）
         */
        static waitList: Array<string>;
        /**
         * 添加到渲染列表
         * @param module 模块
         */
        static add(module: Module): void;
        static remove(module: Module): void;
        /**
         * 队列渲染
         */
        static render(): void;
    }
}
