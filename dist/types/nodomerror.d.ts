/// <reference path="nodom.d.ts" />
declare namespace nodom {
    class NodomError extends Error {
        constructor(errorName: string, p1?: string, p2?: string, p3?: string, p4?: string);
    }
}
