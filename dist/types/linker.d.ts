/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Linker {
        static gen(type: string, config: any): Promise<any>;
        private static ajax;
        private static getfiles;
        private static dolist;
    }
}
