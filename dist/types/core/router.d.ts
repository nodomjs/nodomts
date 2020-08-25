declare namespace nodom {
    /**
     * 路由配置
     */
    interface IRouteCfg {
        /**
         * 路由路径，可以带通配符*，可以带参数 /:
         */
        path: string;
        /**
         * 路由模块id或模块类名，id为数字，类名为string
         */
        module?: number | string;
        /**
         * 模块名
         */
        moduleName?: string;
        /**
         * 子路由数组
         */
        routes?: Array<IRouteCfg>;
        /**
         * 进入路由事件方法
         */
        onEnter?: Function;
        /**
         * 离开路由方法
         */
        onLeave?: Function;
        /**
         * 是否使用父路由路径
         */
        useParentPath?: boolean;
        /**
         * 不添加到路由树
         */
        notAdd?: boolean;
        /**
         * 父路由
         */
        parent?: Route;
    }
    /**
     * 路由，主要用于模块间跳转，一个应用中存在一个router，多个route
     * 采用修改页面hash方式进行路由历史控制，每个route 可设置onEnter事件(钩子) 和 onLeave事件(钩子)
     * 回调调用的几个问题
     * onLeave事件在路由切换时响应，如果存在多级路由切换，则从底一直到相同祖先路由，都会进行onLeave事件响应
     *  如：从/r1/r2/r3  到 /r1/r4/r5，则onLeave响应顺序为r3、r2
     *  onEnter事件则从上往下执行
     * @author 		yanglei
     * @since 		1.0
     */
    class Router {
        /**
         * 加载中标志
         */
        static loading: boolean;
        /**
         * 路由map
         */
        static routes: Map<number, Route>;
        /**
         * 当前路径
         */
        static currentPath: string;
        /**
         * 显示路径（useParentPath时，实际路由路径与显示路径不一致）
         */
        static showPath: string;
        /**
         * path等待链表
         */
        static waitList: Array<string>;
        /**
         * 当前路由在路由链中的index
         */
        static currentIndex: number;
        /**
         * 默认路由进入事件方法
         */
        static onDefaultEnter: Function;
        /**
         * 默认路由离开事件
         */
        static onDefaultLeave: Function;
        /**
         * 启动方式 0:直接启动 1:由element active改变启动 2:popstate 启动
         */
        static startStyle: number;
        /**
         * 激活Dom map，格式为{moduleId:[]}
         */
        static activeDomMap: Map<number, Array<string>>;
        /**
         * 绑定到module的router指令对应的key，即router容器对应的key，格式为 {moduleId:routerKey,...}
         */
        static routerKeyMap: Map<number, string>;
        /**
         * 往路由管理器中添加路径
         * @param path 	路径
         */
        static addPath(path: string): Promise<void>;
        /**
         * 启动加载
         */
        static load(): Promise<void>;
        /**
         * 切换路由
         * @param path 	路径
         */
        static start(path: string): Promise<void>;
        static redirect(path: string): void;
        /**
         * 添加路由
         * @param route 	路由配置
         * @param parent 	父路由
         */
        static addRoute(route: Route, parent: Route): void;
        /**
         * 获取路由
         * @param path 	路径
         * @param last 	是否获取最后一个路由,默认false
         */
        static getRoute(path: string, last?: boolean): Array<Route>;
        /**
         * 比较两个路径对应的路由链
         * @param path1 	第一个路径
         * @param path2 	第二个路径
         * @returns 		[不同路由的父路由，第一个需要销毁的路由数组，第二个需要增加的路由数组，上2级路由]
         */
        static compare(path1: string, path2: string): Array<any>;
        /**
         * 修改模块active view（如果为view active为true，则需要路由跳转）
         * @param module 	模块
         * @param path 		view对应的route路径
         */
        static changeActive(module: any, path: any): void;
    }
    /**
     * 路由类
     */
    class Route {
        /**
         * 路由id
         */
        id: number;
        /**
         * 路由参数名数组
         */
        params: Array<string>;
        /**
         * 路由参数数据
         */
        data: any;
        /**
         * 子路由
         */
        children: Array<Route>;
        /**
         * 进入路由事件方法
         */
        onEnter: Function;
        /**
         * 离开路由方法
         */
        onLeave: Function;
        /**
         * 是否使用父路由路径
         */
        useParentPath: boolean;
        /**
         * 路由路径
         */
        path: string;
        /**
         * 完整路径
         */
        fullPath: string;
        /**
         * 路由对应模块id或类名
         */
        module: number | string;
        /**
         * 模块名
         */
        moduleName: string;
        /**
         * 父路由
         */
        parent: Route;
        /**
         *
         * @param config 路由配置项
         */
        constructor(config: IRouteCfg);
        /**
         * 设置关联标签激活状态
         */
        setLinkActive(): void;
        /**
         * 添加子路由
         * @param child
         */
        addChild(child: Route): void;
    }
}
