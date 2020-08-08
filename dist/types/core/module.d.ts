declare namespace nodom {
    /**
     * 模块配置对象
     */
    interface IModuleCfg {
        /**
         * 模块名(模块内(父模块的子模块之间)唯一)，如果不设置，则系统会自动生成Module+id
         */
        name?: string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        static?: boolean;
        /**
         * 容器选择器
         */
        el?: string;
        /**
         * 是否单例
         */
        singleton?: boolean;
        /**
         * 模块类名
         */
        class?: string;
        /**
         * 模块路径(相对于app module路径)
         */
        path: string;
        /**
         * 子模块数组
         */
        modules?: Array<IModuleCfg>;
        /**
         * 模版字符串，如果以“<”开头，则表示模版字符串，否则表示模版url
         */
        template?: string;
        /**
         * 数据，如果为json object，直接作为模型数据，如果为字符串，则表示数据url，需要请求得到数据
         */
        data?: object | string;
        /**
         * 模块方法集合
         * ```
         * 	{
         * 		method1:function1(){},
         * 		method2:function2(){},
         * 		...
         * 	}
         * ```
         */
        methods?: object;
        /**
         * 先于模块初始化加载的文件[{type:'js'/'css',url:路径}
         */
        requires?: Array<string | object>;
    }
    /**
     * 模块类
     */
    class Module {
        /**
         * 模块id(全局唯一)
         */
        id: number;
        /**
         * 模块名(模块内(父模块的子模块之间)唯一)，如果不设置，则系统会自动生成Module+id
         */
        name: string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        /**
         * 模型
         */
        model: Model;
        /**
         * 是否主模块，一个app只有一个根模块
         */
        isMain: boolean;
        /**
         * 是否是首次渲染
         */
        firstRender: boolean;
        /**
         * 根虚拟dom
         */
        virtualDom: Element;
        /**
         * 渲染树
         */
        renderTree: Element;
        /**
         * 父模块名
         */
        parentId: number;
        /**
         * 子模块id数组
         */
        children: Array<number>;
        /**
         * container 选择器
         */
        selector: string;
        /**
         * 首次渲染后执行操作数组
         */
        firstRenderOps: Array<Function>;
        /**
         * 首次渲染前执行操作数组
         */
        beforeFirstRenderOps: Array<Function>;
        /**
         * 每次渲染后执行操作数组
         */
        renderOps: Array<Function>;
        /**
         * 每次渲染前执行操作数组
         */
        beforeRenderOps: Array<Function>;
        /**
         * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)
         */
        state: number;
        /**
         * 数据url
         */
        dataUrl: string;
        /**
         * 需要加载新数据
         */
        loadNewData: boolean;
        /**
         * 方法工厂
         */
        methodFactory: MethodFactory;
        /**
         * 数据模型工厂
         */
        modelFactory: ModelFactory;
        /**
         * 待渲染的虚拟dom数组
         */
        renderDoms: Array<ChangedDom>;
        /**
         * 初始配置
         */
        initConfig: IModuleCfg;
        /**
         * 放置模块的容器
         */
        container: HTMLElement;
        /**
         * 模版串
         */
        template: string;
        /**
         * 路由容器key
         */
        routerKey: string;
        /**
         * 容器key
         */
        containerKey: string;
        /**
         * 子模块名id映射，如 {modulea:1}
         */
        moduleMap: Map<string, number>;
        /**
         * 插件集合
         */
        plugins: Map<string, Plugin>;
        /**
         * 构造器
         * @param config    模块配置
         */
        constructor(config?: IModuleCfg);
        /**
         * 初始化模块（加载和编译）
         */
        init(): Promise<any>;
        /**
         * 模型渲染
         * @return false 渲染失败 true 渲染成功
         */
        render(): boolean;
        /**
         * 执行首次渲染
         * @param root 	根虚拟dom
         */
        doFirstRender(root: Element): void;
        /**
         * 克隆模块
         * 共享virtual Dom，但是名字为新名字
         * @param moduleName    新模块名
         */
        clone(moduleName: string): any;
        /**
         * 检查容器是否存在，如果不存在，则尝试找到
         */
        hasContainer(): boolean;
        /**
         * 设置模块容器 key
         * @param key   模块容器key
         */
        setContainerKey(key: string): void;
        /**
         * 获取模块容器 key
         * @param key   模块容器key
         */
        getContainerKey(): string;
        /**
         * 数据改变
         * @param model 	改变的model
         */
        dataChange(): void;
        /**
         * 添加子模块
         * @param moduleId      模块id
         * @param className     类名
         */
        addChild(moduleId: number): void;
        /**
         * 发送
         * @param toName 		接收模块名或模块id，如果为模块id，则直接发送，不需要转换
         * @param data 			消息内容
         */
        send(toName: string | number, data: any): void;
        /**
         * 广播给父、兄弟和孩子（第一级）节点
         */
        broadcast(data: any): void;
        /**
         * 接受消息
         * @param fromName 		来源模块名
         * @param data 			消息内容
         */
        receive(fromName: any, data: any): void;
        /**
         * 激活模块(添加到渲染器)
         */
        active(): Promise<void>;
        /**
         * 取消激活
         */
        unactive(): void;
        /**
         * 模块终结
         */
        destroy(): void;
        /*************事件**************/
        /**
         * 执行模块事件
         * @param eventName 	事件名
         * @param param 		参数，为数组
         */
        doModuleEvent(eventName: string, param?: Array<any>): void;
        /**
         * 添加首次渲染后执行操作
         * @param foo  	操作方法
         */
        addFirstRenderOperation(foo: Function): void;
        /**
         * 添加首次渲染前执行操作
         * @param foo  	操作方法
         */
        addBeforeFirstRenderOperation(foo: any): void;
        /**
         * 添加渲染后执行操作
         * @param foo  	操作方法
         */
        addRenderOperation(foo: any): void;
        /**
         * 添加渲染前执行操作
         * @param foo  	操作方法
         */
        addBeforeRenderOperation(foo: any): void;
        /**
         * 执行渲染相关附加操作
         * @param renderOps
         */
        doRenderOp(renderOps: Function[]): void;
        /**
         * 添加插件
         * @param name  插件名
         * @param ele   插件
         */
        addPlugin(name: string, ele: Plugin): void;
        /**
         * 获取插件
         * @param name  插件名
         */
        getPlugin(name: string): Plugin;
    }
}
