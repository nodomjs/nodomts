// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * 消息类
     */
    export class Message {
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
         * @param fromModule 	来源模块id
         * @param toModule 		目标模块id
         * @param content 		消息内容
         */
        constructor(fromModule: number, toModule: number, content: any) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
        }
    }
    /**
     * 消息队列
     */
    export class MessageQueue {
        /**
         * 消息数组
         */
        static messages: Array < Message > =[];
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         */
        static add(from: number, to: number, data: any) {
            this.messages.push(new Message(from, to, data));
        }

        /**
         * 处理消息队列
         */
        static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg: Message = this.messages[i];
                let module: Module = ModuleFactory.get(msg.toModule);
                // 模块状态未激活或激活才接受消息
                if (module && module.state >= 2) {
                    module.receive(msg.fromModule, msg.content);
                    // 清除已接受消息，或已死亡模块的消息
                    MessageQueue.messages.splice(i--, 1);
                }
            }
        }
    }
}