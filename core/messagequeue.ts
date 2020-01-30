namespace nodom {
    /**
     * 消息类
     */
    export class Message {
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
        constructor(fromModule: string, toModule: string, content: any) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
            this.readed = false;
        }
    }
    /**
     * 消息队列
     */
    export class MessageQueue {
        /**
         * 消息数组
         */
        static messages: Array < Message > ;
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        static add(from: string, to: string, data: any) {
            this.messages.push(new Message(from, to, data));
        }

        /**
         * 处理消息队列
         */
        static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg: Message = this.messages[i];
                let module: Module = ModuleFactory.get(msg.toModule);
                // 模块状态未未激活或激活才接受消息
                if (module && module.state === 2 || module.state === 3) {
                    module.receive(msg.fromModule, msg.content);
                }
                // 清除已接受消息，或已死亡模块的消息
                if (module && module.state >= 2) {
                    MessageQueue.messages.splice(i--, 1);
                }
            }
        }
    }
}