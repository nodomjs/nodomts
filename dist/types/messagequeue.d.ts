/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Message {
        fromModule: string;
        toModule: string;
        content: any;
        readed: boolean;
        constructor(fromModule: string, toModule: string, content: any);
    }
    class MessageQueue {
        static messages: Array<Message>;
        static add(from: string, to: string, data: any): void;
        static handleQueue(): void;
    }
}
