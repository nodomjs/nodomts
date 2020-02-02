/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 模块配置对象
     */
    interface IModuleCfg {
        /**
         * 模块名(全局唯一)，如果不设置，则系统会自动生成Module+id
         */
        name?: string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        static?: boolean;
        /**
         * 父模块名
         */
        parentName?: string;
        /**
         * 子模块数组
         */
        modules?: Array<IModuleCfg>;
        /**
         * 存放模块的容器（选择器或html element）
         */
        el: string | HTMLElement;
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
         * 延迟初始化，如果设置为true，则不会提前加载并初始化
         */
        delayInit: boolean;
        /**
         * 先于模块初始化加载的文件[{type:'js'/'css',url:路径}
         */
        requires: Array<string | object>;
    }
    /**
     * 模块类
     */
    class Module {
        /**
         * 模块名(全局唯一)
         */
        name: string;
        /**
         * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
         */
        static?: boolean;
        /**
         * 模型
         */
        model?: Model;
        /**
         * 是否主模块，一个app只有一个根模块
         */
        main?: boolean;
        /**
         * 是否是首次渲染
         */
        firstRender: boolean;
        /**
         * 根虚拟dom
         */
        virtualDom: Element;
        /**
         * 渲染结束
         */
        rendered: boolean;
        /**
         * 待渲染树
         */
        renderTree: Element;
        /**
         * 父模块名
         */
        parentName: string;
        /**
         * 子模块数组
         */
        children: Array<Module>;
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
         * 模块容器参数{module:,selector:}
         */
        containerParam: object;
        /**
         * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)、4 dead(死亡)
         */
        state: number;
        /**
         * 数据url
         */
        dataUrl: string;
        /**
         * 正则初始化
         */
        initing: boolean;
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
         * 表达式工厂
         */
        expressionFactory: ExpressionFactory;
        /**
         * 指令工厂
         */
        directiveFactory: DirectiveFactory;
        /**
         * 修改渲染的虚拟dom数组
         */
        renderDoms: Array<ChangedDom>;
        /**
         * 初始配置
         */
        initConfig: IModuleCfg;
        /**
         * 放置模块dom的容器
         */
        container: HTMLElement;
        /**
         * 初始化链式处理器
         */
        initLinker: Promise<any>;
        /**
         * 模版串
         */
        template: string;
        /**
         * 路由容器key
         */
        routerKey: number;
        /**
         * 构造器
         * @param config
         */
        constructor(config: IModuleCfg, main?: boolean);
        /**
         * 加载模块
         * @param callback  加载后的回调函数
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
        doFirstRender(root: any): void;
        hasContainer(): boolean;
        /**
         * 数据改变
         * @param model 	改变的model
         */
        dataChange(model: any): void;
        /**
         * 添加子模块
         * @param config 	模块配置
         */
        addChild(config: any): Module;
        /**
         * 发送
         * @param toName 		接收模块名
         * @param data 			消息内容
         */
        send(toName: string, data: any): void;
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
         * 激活
         * @param callback 	激活后的回调函数
         */
        active(callback?: Function): any;
        /**
         * 取消激活
         */
        unactive(): void;
        /**
         * 模块终结
         */
        dead(): void;
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
    }
}
