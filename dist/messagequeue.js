var nodom;
(function (nodom) {
    class Message {
        constructor(fromModule, toModule, content) {
            this.fromModule = fromModule;
            this.toModule = toModule;
            this.content = content;
            this.readed = false;
        }
    }
    nodom.Message = Message;
    class MessageQueue {
        static add(from, to, data) {
            this.messages.push(new Message(from, to, data));
        }
        static handleQueue() {
            for (let i = 0; i < this.messages.length; i++) {
                let msg = this.messages[i];
                let module = nodom.ModuleFactory.get(msg.toModule);
                if (module && module.state === 2 || module.state === 3) {
                    module.receive(msg.fromModule, msg.content);
                }
                if (module && module.state >= 2) {
                    MessageQueue.messages.splice(i--, 1);
                }
            }
        }
    }
    MessageQueue.messages = [];
    nodom.MessageQueue = MessageQueue;
})(nodom || (nodom = {}));
//# sourceMappingURL=messagequeue.js.map