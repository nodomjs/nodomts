// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * 消息类
     */
    export class Message {
        /**
         * 来源模块id
         */
        fromModule: number;
        /**
         * 目标模块id 或 名字
         */
        toModule: number|string;

        /**
         * 来源模块父id，当 toModule 为模块名时需要
         */
        parentId:number;

        /**
         * 消息内容
         */
        content: any;
        
        
        /**
         * @param fromModule 	来源模块id
         * @param toModule 		目标模块id或名字
         * @param content 		消息内容
         * @param parentId      父模块id
         */
        constructor(fromModule: number, toModule: number|string, content: any,parentId?:number) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
            this.parentId = parentId;
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

        static noOwnerMessages:Array<Message> = [];
        /**
         * 添加消息到消息队列
         * @param fromModule 	来源模块名
         * @param toModule 		目标模块名
         * @param content 		消息内容
         * @param parentId      父模块消息
         */
        public static add(from: number, to: number|string, data: any,parentId?: number) {
            if(parentId){
                this.noOwnerMessages.push(new Message(from,to,data,parentId));
            }else{
                this.messages.push(new Message(from, to, data));
            }
        }

        /**
         * 从 no owner队列移动到 待发队列
         * @param moduleName    模块名
         * @param moduleId      模块id
         * @param parentId      父模块id
         */
        public static move(moduleName:string,moduleId:number,parentId:number){
            let index;
            while((index = this.noOwnerMessages.findIndex(item=>item.parentId===parentId && moduleName === item.toModule))!==-1){
                let msg:Message = this.noOwnerMessages[index];
                //从noowner数组移除
                this.noOwnerMessages.splice(index,1);
                msg.toModule = moduleId;
                delete msg.parentId;
                //加入待发队列
                this.messages.push(msg);
            }
        }

        /**
         * 处理消息队列
         */
        public static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg: Message = this.messages[i];
                let module: Module = ModuleFactory.get(<number>msg.toModule);
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