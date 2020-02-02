/// <reference path="nodom.d.ts" />
declare namespace nodom {
    /**
     * 属性
     */
    class Property {
        /**
         * 属性名
         */
        name: string;
        /**
         * 值，可以是字符串、数字、bool或表达式数组
         */
        value: any;
        /**
         * @param name 		属性名
         * @param value 	属性值
         */
        constructor(name: string, value: any);
        /**
         * 类型 0:常规属性 1:表达式属性
         */
        type: number;
    }
    /**
     * 改变的dom类型
     */
    class ChangedDom {
        /**
         * 改变方式
         */
        type: string;
        /**
         * 改变的节点
         */
        node: Element;
        /**
         * 父虚拟dom
         */
        parent: Element;
        /**
         * 在父节点中的位置
         */
        index: number;
        /**
         * 改变的属性数组
         */
        changeProps: Array<Property>;
        /**
         * 移除的属性数组
         */
        removeProps: Array<Property>;
        /**
         *
         * @param node      虚拟节点
         * @param type      修改类型  add(添加节点),del(删除节点),upd(更新节点),rep(替换节点),text(修改文本内容)
         * @param parent    父虚拟dom
         * @param index     在父节点中的位置索引
         */
        constructor(node?: Element, type?: string, parent?: Element, index?: number);
    }
    /**
     * 虚拟dom
     */
    class Element {
        /**
         * key，全局唯一
         */
        key: string;
        /**
         * 是不是虚拟dom跟节点
         */
        root: boolean;
        /**
         * 绑定的模型id，如果没有，则从父继承
         */
        modelId: number;
        /**
         * element为textnode时有效
         */
        textContent: string | HTMLElement | HTMLFrameElement;
        /**
         * 类型，包括: html fragment 或 html element
         */
        type: string;
        /**
         * 指令集
         */
        directives: Array<Directive>;
        /**
         * 属性集合
         */
        props: Map<string, Property>;
        /**
         * 含表达式的属性集合
         */
        exprProps: Map<string, Property>;
        /**
         * 事件集合
         */
        events: Array<NodomEvent>;
        /**
         * 表达式集合
         */
        expressions: Array<Expression>;
        /**
         * 修改后的属性(单次渲染周期内)
         */
        changeProps: Array<Property>;
        /**
         * 待删除属性(单次渲染周期内)
         */
        removeProps: Array<Property>;
        /**
         * 子element
         */
        children: Array<Element>;
        /**
         * 父element key
         */
        parentKey: string;
        /**
         * 父虚拟dom
         */
        parent: Element;
        /**
         * 标签名，如div
         */
        tagName: string;
        /**
         * 不渲染标志，单次渲染有效
         */
        dontRender: boolean;
        /**
         * 是否找到（dom比较时使用）
         */
        finded: boolean;
        /**
         * @param tag 标签名
         */
        constructor(tag?: string);
        /**
         * 渲染到virtualdom树
         * @param module 	模块
         * @param parent 	父节点
         */
        render(module: Module, parent?: Element): boolean;
        /**
         * 渲染到html element
         * @param module 	模块
         * @param params 	配置对象{}
         * @param type 		类型
         * @param parent 	父虚拟dom
         */
        renderToHtml(module: Module, params: any): void;
        /**
         * 克隆
         */
        clone(): Element;
        /**
         * 处理指令
         *
         */
        handleDirectives(module: any, parent: any): boolean;
        /**
         * 表达式预处理，添加到expression计算队列
         */
        handleExpression(exprArr: any, module: any): string;
        /**
         * 处理属性（带表达式）
         */
        handleProps(module: any): void;
        /**
         * 处理文本（表达式）
         */
        handleTextContent(module: any): void;
        /**
         * 处理事件
         * @param module
         * @param model
         * @param el
         * @param parent
         */
        handleEvents(module: any, el: any, parent: any, parentEl: any): void;
        /**
         * 移除指令
         * @param directives 	待删除的指令集
         */
        removeDirectives(delDirectives: any): void;
        /**
         * 是否有某个类型的指令
         * @param directiveType 	指令类型名
         * @return true/false
         */
        hasDirective(directiveType: any): boolean;
        /**
         * 获取某个类型的指令
         * @param directiveType 	指令类型名
         * @return directive
         */
        getDirective(directiveType: any): Directive;
        /**
         * 添加子节点
         * @param dom 	子节点
         */
        add(dom: any): void;
        /**
         * 从虚拟dom树和html dom树删除自己
         * @param module 	模块
         * @param delHtml 	是否删除html element
         */
        remove(module: Module, delHtml?: boolean): void;
        /**
         * 从html删除
         */
        removeFromHtml(module: Module): void;
        /**
         * 移除子节点
         */
        removeChild(dom: Element): void;
        /**
         * 替换目标节点
         * @param dst 	目标节点
         */
        replace(dst: Element): boolean;
        /**
         * 是否包含节点
         * @param dom 	包含的节点
         */
        contains(dom: any): boolean;
        /**
         * 查找子孙节点
         * @param key 	element key
         * @returns		虚拟dom/undefined
         */
        query(key: string): any;
        /**
         * 比较节点
         * @param dst 	待比较节点
         * @returns	{type:类型 text/rep/add/upd,node:节点,parent:父节点,
         * 			changeProps:改变属性,[prop1,prop2,...],removeProps:删除属性,[prop1,prop2,...]}
         */
        compare(dst: Element, retArr: Array<ChangedDom>, parentNode?: Element): void;
    }
}
