/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class Serializer {
        static serialize(module: Module): string;
        static deserialize(jsonStr: string, module: Module): any[];
    }
}
