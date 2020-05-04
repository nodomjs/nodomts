/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Renderer {
        static waitList: Array<string>;
        static add(module: Module): void;
        static remove(module: Module): void;
        static render(): void;
    }
}
