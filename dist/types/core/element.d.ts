declare namespace nodom {
    /**
     * 改变的dom类型
     * 用于比较需要修改渲染的节点属性存储
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
         * [{prop1:value1},...]
         */
        changeProps: Array<object>;
        /**
         * 移除的属性名数组
         */
        removeProps: Array<string>;
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
         * key，整颗虚拟dom树唯一
         */
        key: string;
        /**
         * 绑定的模型id，如果没有，则从父继承
         */
        modelId: number;
        /**
         * element为textnode时有效
         */
        textContent: string | HTMLElement;
        /**
         * 类型，包括: html fragment 或 html element
         */
        type: string;
        /**
         * 指令集
         */
        directives: Array<Directive>;
        /**
         * 直接属性 不是来自于attribute，而是直接作用于html element，如el.checked,el.value等
         */
        assets: Map<string, any>;
        /**
         * 静态属性(attribute)集合
         * {prop1:value1,...}
         */
        props: object;
        /**
         * 含表达式的属性集合
         * {prop1:value1,...}
         */
        exprProps: object;
        /**
         * 事件集合,{eventName1:nodomEvent1,...}
         * 一个事件名，可以绑定多个事件方法对象
         */
        events: Map<string, NodomEvent | NodomEvent[]>;
        /**
         * 表达式+字符串数组，用于textnode
         */
        expressions: Array<Expression | string>;
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
         * 元素名，如div
         */
        tagName: string;
        /**
         * 不渲染标志，单次渲染有效
         */
        dontRender: boolean;
        /**
         * 临时数据
         */
        tmpData: any;
        /**
         * 绑定插件
         */
        plugin: Plugin;
        /**
         * @param tag 标签名
         */
        constructor(tag?: string);
        /**
         * 渲染到virtualdom树
         * @param module 	模块
         * @param parent 	父节点
         */
        render(module: Module, parent?: Element): void;
        /**
         * 渲染到html element
         * @param module 	模块
         * @param params 	配置对象{}
         *          type 		类型
         *          parent 	父虚拟dom
         */
        renderToHtml(module: Module, params: ChangedDom): void;
        /**
         * 克隆
         * changeKey    是否更改key，主要用于创建时克隆，渲染时克隆不允许修改key
         */
        clone(changeKey?: boolean): Element;
        /**
         * 处理指令
         * @param module    模块
         */
        handleDirectives(module: Module): void;
        /**
         * 表达式处理，添加到expression计算队列
         * @param exprArr   表达式或字符串数组
         * @param module    模块
         */
        handleExpression(exprArr: Array<Expression | string>, module: Module): string;
        /**
         * 处理属性（带表达式）
         * @param module    模块
         */
        handleProps(module: Module): void;
        /**
         * 处理asset，在渲染到html时执行
         * @param el    dom对应的html element
         */
        handleAssets(el: HTMLElement): void;
        /**
         * 处理文本（表达式）
         * @param module    模块
         */
        handleTextContent(module: any): void;
        /**
         * 处理事件
         * @param module    模块
         * @param el        html element
         * @param parent    父virtual dom
         * @param parentEl  父html element
         */
        handleEvents(module: Module, el: Node, parent: Element, parentEl?: Node): void;
        /**
         * 移除指令
         * @param directives 	待删除的指令类型数组
         */
        removeDirectives(directives: string[]): void;
        /**
         * 添加指令
         * @param directive     指令对象
         * @param sort          是否排序
         */
        addDirective(directive: Directive, sort?: boolean): void;
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
        add(dom: Element): void;
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
         * @param dom   子dom
         */
        removeChild(dom: Element): void;
        /**
         * 获取parent
         * @param module 模块
         * @returns      父element
         */
        getParent(module: Module): Element;
        /**
         * 替换目标节点
         * @param dst 	目标节点
         */
        replace(dst: Element): boolean;
        /**
         * 是否包含节点
         * @param dom 	包含的节点
         */
        contains(dom: Element): boolean;
        /**
         * 是否存在某个class
         * @param cls   classname
         * @return      true/false
         */
        hasClass(cls: string): boolean;
        /**
         * 添加css class
         * @param cls class名
         */
        addClass(cls: string): void;
        /**
         * 删除css class
         * @param cls class名
         */
        removeClass(cls: string): void;
        /**
         * 是否拥有属性
         * @param propName  属性名
         * @param isExpr    是否是表达式属性 默认false
         */
        hasProp(propName: string, isExpr?: boolean): boolean;
        /**
         * 获取属性值
         * @param propName  属性名
         * @param isExpr    是否是表达式属性 默认false
         */
        getProp(propName: string, isExpr?: boolean): any;
        /**
         * 设置属性值
         * @param propName  属性名
         * @param v         属性值
         * @param isExpr    是否是表达式属性 默认false
         */
        setProp(propName: string, v: any, isExpr?: boolean): void;
        /**
         * 删除属性
         * @param props     属性名或属性名数组
         * @param isExpr    是否是表达式属性 默认false
         */
        delProp(props: string | string[], isExpr?: boolean): void;
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
         * 			changeProps:改变属性,[{k:prop1,v:value1},...],removeProps:删除属性,[prop1,prop2,...]}
         */
        compare(dst: Element, retArr: Array<ChangedDom>, parentNode?: Element): void;
        /**
         * 添加事件
         * @param event         事件对象
         */
        addEvent(event: NodomEvent): void;
        /**
         * 执行不渲染关联操作
         * 关联操作，包括:
         *  1 节点(子节点)含有module指令，需要unactive
         */
        doDontRender(): void;
    }
}
