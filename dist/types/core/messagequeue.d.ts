declare namespace nodom {
    /**
     * 消息类
     */
    class Message {
        /**
         * 来源模块名
         */
        fromModule: number;
        /**
         * 目标模块名
         */
        toModule: number;
        /**
         * 消息内容
         */
        content: any;
        /**
         * 是否已读
         */
        readed: boolean;
        /**
         * @param fromModule 	来源模块id
         * @param toModule 		目标模块id
         * @param content 		消息内容
         */
        constructor(fromModule: number, toModule: number, content: any);
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
        static add(from: number, to: number, data: any): void;
        /**
         * 处理消息队列
         */
        static handleQueue(): void;
    }
}
