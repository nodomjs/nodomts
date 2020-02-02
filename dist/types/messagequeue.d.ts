/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 消息类
     */
    class Message {
        /**
         * 来源模块名
         */
        fromModule: string;
        /**
         * 目标模块名
         */
        toModule: string;
        /**
         * 消息内容
         */
        content: any;
        /**
         * 是否已读
         */
        readed: boolean;
        /**
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        constructor(fromModule: string, toModule: string, content: any);
    }
    /**
     * 消息队列
     */
    class MessageQueue {
        /**
         * 消息数组
         */
        static messages: Array<Message>;
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        static add(from: string, to: string, data: any): void;
        /**
         * 处理消息队列
         */
        static handleQueue(): void;
    }
}
