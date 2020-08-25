// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 消息类
     */
    class Message {
        /**
         * @param fromModule 	来源模块id
         * @param toModule 		目标模块id
         * @param content 		消息内容
         */
        constructor(fromModule, toModule, content) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
        }
    }
    nodom.Message = Message;
    /**
     * 消息队列
     */
    class MessageQueue {
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        static add(from, to, data) {
            this.messages.push(new Message(from, to, data));
        }
        /**
         * 处理消息队列
         */
        static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg = this.messages[i];
                let module = nodom.ModuleFactory.get(msg.toModule);
                // 模块状态未激活或激活才接受消息
                if (module && module.state >= 2) {
                    module.receive(msg.fromModule, msg.content);
                    // 清除已接受消息，或已死亡模块的消息
                    MessageQueue.messages.splice(i--, 1);
                }
            }
        }
    }
    /**
     * 消息数组
     */
    MessageQueue.messages = [];
    nodom.MessageQueue = MessageQueue;
})(nodom || (nodom = {}));
//# sourceMappingURL=messagequeue.js.map