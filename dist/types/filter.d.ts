/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Filter {
        type: string;
        params: Array<string>;
        constructor(src: string | string[]);
        exec(value: string, module: Module): string;
    }
}
