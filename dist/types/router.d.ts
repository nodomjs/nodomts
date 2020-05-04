/// <reference path="nodom.d.ts" />
declare namespace nodom {
    interface IRouteCfg {
        path: string;
        module?: string | Module;
        routes?: Array<IRouteCfg>;
        onEnter?: Function;
        onLeave?: Function;
        useParentPath?: boolean;
        notAdd?: boolean;
        parent?: Route;
    }
    class Router {
        static loading: boolean;
        static routes: Map<number, Route>;
        static currentPath: string;
        static showPath: string;
        static waitList: Array<string>;
        static currentIndex: number;
        static onDefaultEnter: Function;
        static onDefaultLeave: Function;
        static moduleRouteMap: Map<string, number>;
        static startStyle: number;
        static activeDomMap: Map<string, Array<string>>;
        static addPath(path: string): void;
        static load(): void;
        static start(path: string): Promise<void>;
        static redirect(path: string): void;
        static addRoute(route: Route, parent: Route): void;
        static getRoute(path: string, last?: boolean): Array<Route>;
        static compare(path1: string, path2: string): Array<any>;
        static changeActive(module: any, path: any): void;
    }
    class Route {
        id: number;
        params: Array<string>;
        data: any;
        children: Array<Route>;
        onEnter: Function;
        onLeave: Function;
        useParentPath: boolean;
        path: string;
        fullPath: string;
        module: string;
        parent: Route;
        constructor(config: IRouteCfg);
        setLinkActive(ancestor: boolean): void;
    }
}
