// / <reference path="nodom.ts" />
namespace nodom {
    /**
     * 改变的dom类型
     * 用于比较需要修改渲染的节点属性存储
     */
    export class ChangedDom{
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
        index:number;

        /**
         * 改变的属性数组
         * [{prop1:value1},...]
         */
        changeProps:Array<object>;

        /**
         * 移除的属性名数组
         */
        removeProps:Array<string>;

        /**
         * 
         * @param node      虚拟节点
         * @param type      修改类型  add(添加节点),del(删除节点),upd(更新节点),rep(替换节点),text(修改文本内容)
         * @param parent    父虚拟dom
         * @param index     在父节点中的位置索引
         */
        constructor(node?:Element,type?:string,parent?:Element,index?:number){
            this.node = node;
            this.type = type;
            this.parent = parent;
            this.index = index;
        }
    }
    /**
     * 虚拟dom
     */
    export class Element {
		/**
		 * key，整颗虚拟dom树唯一
		 */
		key:string;
        
		/**
		 * 绑定的模型id，如果没有，则从父继承
		 */
        modelId:number;
        
		/**
		 * element为textnode时有效
		 */
		textContent:string|HTMLElement;

		/**
		 * 类型，包括: html fragment 或 html element 
		 */
		type:string;

		/**
		 * 指令集
		 */
        directives:Array<Directive> = [];
        
        /**
         * 直接属性 不是来自于attribute，而是直接作用于html element，如el.checked,el.value等
         */
        assets:Map<string,any> = new Map();

		/**
		 * 静态属性(attribute)集合
         * {prop1:value1,...}
		 */
        props:object = {};

		/**
		 * 含表达式的属性集合
         * {prop1:value1,...}
		 */
        exprProps:object = {};
        
		/**
		 * 事件集合,{eventName1:nodomEvent1,...}
         * 一个事件名，可以绑定多个事件方法对象
		 */
		events:Map<string,NodomEvent|NodomEvent[]> = new Map();

		/**
		 * 表达式+字符串数组，用于textnode
		 */
		expressions:Array<Expression|string>=[];
		
		/**
		 * 子element
		 */
        children:Array<Element> = [];
        
		/**
		 * 父element key
		 */
		parentKey:string;

		/**
		 * 父虚拟dom
		 */
        parent:Element;
        
		/**
		 * 元素名，如div
		 */
        tagName:string;

		/**
		 * 不渲染标志，单次渲染有效
		 */
        dontRender:boolean = false;
        
        /**
         * 临时数据
         */
        tmpData:any;
        
        /**
         * 绑定插件
         */
        plugin:Plugin;

		/**
		 * @param tag 标签名
		 */
        constructor(tag?:string) {
            this.tagName = tag; //标签
            //key
            this.key = Util.genId()+'';
        }

        /**
         * 渲染到virtualdom树
         * @param module 	模块
         * @param parent 	父节点
         */
        render(module:Module, parent?:Element) {
            let me = this;
            if(this.dontRender){
                this.doDontRender();
                return;
            }

            // 设置父对象
            if (parent) {
                this.parent = parent;
                this.parentKey = parent.key;
                // 设置modelId
                if (!this.modelId) {
                    this.modelId = parent.modelId;
                }
            }

            
            //自定义元素的前置渲染
            if(this.plugin){
                this.plugin.beforeRender(module,this);
            }
            
            if (this.tagName !== undefined) { //element
                this.handleProps(module);
                this.handleDirectives(module);
            } else { //textContent
                this.handleTextContent(module);
            }
            
            if(this.dontRender){
                this.doDontRender();
                return;
            }
            
            //子节点渲染
            if(!this.hasDirective('module')){
                for (let i = 0; i < this.children.length; i++) {
                    let item = this.children[i];
                    item.render(module, this);
                    if(item.dontRender){
                        item.doDontRender();
                        this.children.splice(i--,1);
                    }
                }
            }
            //自定义元素的后置渲染
            if(this.plugin){
                this.plugin.afterRender(module,this);
            }
            //删除parent
            delete this.parent;
        }


        /**
         * 渲染到html element
         * @param module 	模块
         * @param params 	配置对象{}
         *          type 		类型
         *          parent 	父虚拟dom
         */
        renderToHtml(module:Module, params:ChangedDom) {
			let el:HTMLElement;
			let el1:Node;
            let type = params.type;
            let parent = params.parent;
            //重置dontRender
            this.dontRender = false;
            //构建el
            if (type === 'fresh' || type === 'add' || type === 'text') {
                if(parent){
                    el = module.container.querySelector("[key='" + parent.key + "']");
                }else{
                    el = module.container;
                }
            } else if (this.tagName !== undefined) { //element节点才可以查找
                el = module.container.querySelector("[key='" + this.key + "']");
                this.handleAssets(el);
            }
        
            if (!el) {
                return;
            }
            
            switch (type) {
            case 'fresh': //首次渲染
                if (this.tagName) {
                    el1 = newEl(this, null, el);
                    //首次渲染需要生成子孙节点
                    genSub(el1, this);
                } else {
                    el1 = newText(<string>this.textContent, this);
                }
                el.appendChild(el1);
                break;
            case 'text': //文本更改
                if (!parent || !parent.children) {
                    break;
                }

                let ind = parent.children.indexOf(this);
                if (ind !== -1) {
                    //element或fragment
                    if (this.type === 'html') {
						let div:HTMLElement = document.querySelector("[key='" + this.key + "']");
                    
						if (div !== null) {
							div.innerHTML = '';
							div.appendChild(<HTMLElement>this.textContent);
                        } else {
                            let div:Node = newText(<string>this.textContent);
                            Util.replaceNode(el.childNodes[ind], div);
                        }
                    } else {
                        el.childNodes[ind].textContent = <string>this.textContent;
                    }
                }
                break;
            case 'upd': //修改属性
                //删除属性
                if (params.removeProps) {
					params.removeProps.forEach((p) => {
                        el.removeAttribute(p);
                    });
                }
                //修改属性
                if(params.changeProps){
                    params.changeProps.forEach((p) => {
                        el.setAttribute(p['k'], p['v']);
                    });
                }
                break;
            case 'rep': //替换节点
                el1 = newEl(this, parent);
                Util.replaceNode(el, el1);
                break;
            case 'add': //添加
                if (this.tagName) {
                    el1 = newEl(this, parent, el);
                    genSub(el1, this);
                } else {
                    el1 = newText(this.textContent);
                }
                if (params.index === el.childNodes.length) {
                    el.appendChild(el1);
                } else {
                    el.insertBefore(el1, el.childNodes[params.index]);
                }
            }

            /**
			 * 新建element节点
			 * @param vdom 		虚拟dom
			 * @param parent 	父虚拟dom
			 * @param parentEl 	父element
			 * @returns 		新的html element
			 */
            function newEl(vdom:Element, parent:Element, parentEl?:Node):HTMLElement {
                //创建element
                let el = document.createElement(vdom.tagName);
				//设置属性
				Util.getOwnProps(vdom.props).forEach((k)=>{
					el.setAttribute(k,vdom.props[k]);
				});
                
                el.setAttribute('key', vdom.key);
                vdom.handleEvents(module, el, parent, parentEl);
                vdom.handleAssets(el);
                return el;
            }

            /**
             * 新建文本节点
             */
            function newText(text:string|HTMLElement|DocumentFragment, dom?:Element) {
                if(text === undefined){
                    text='';
                    dom=null;
                }
                if (dom && 'html' === dom.type) { //html fragment 或 element
                    let div = Util.newEl('div');
                    div.setAttribute('key', dom.key);
                    div.appendChild(<HTMLElement>text);
                    return div;
                } else {
                    return document.createTextNode(<string>text);
                }
            }

            /**
             * 生成子节点
             * @param pEl 	父节点
             * @param vNode 虚拟dom父节点	
             */
            function genSub(pEl:Node, vNode:Element) {
                if (vNode.children && vNode.children.length > 0) {
                    vNode.children.forEach((item) => {
                        let el1;
                        if (item.tagName) {
                            el1 = newEl(item, vNode, pEl);
                            genSub(el1, item);
                        } else {
                            el1 = newText(item.textContent, item);
                        }
                        pEl.appendChild(el1);
                    });
                }
            }
        }

        /**
         * 克隆
         * changeKey    是否更改key，主要用于创建时克隆，渲染时克隆不允许修改key
         */
        clone(changeKey?:boolean):Element{
            let dst:Element = new Element();

            //不直接拷贝的属性
            let notCopyProps:string[] = ['parent','directives','props','exprProps','events','children'];
            //简单属性
            Util.getOwnProps(this).forEach((p) => {
                if (notCopyProps.includes(p)) {
                    return;
                }
                dst[p] = this[p];
            });

            //表示clone后进行新建节点
            if(changeKey){  
                dst.key = Util.genId() + '';
            }

            //define element复制
            if(this.plugin){
                if(changeKey){
                    dst.plugin = this.plugin.clone(dst);
                }else{
                    dst.plugin = this.plugin;
                }
            }

            //指令复制
            for(let d of this.directives){
                if(changeKey){
                    d = d.clone(dst);
                }
                dst.directives.push(d);
            }

            //普通属性
            Util.getOwnProps(this.props).forEach((k)=>{
                dst.props[k] = this.props[k];
            });

            //表达式属性
            Util.getOwnProps(this.exprProps).forEach((k)=>{
                if(changeKey){
                    let item = this.exprProps[k];
                    if(Array.isArray(item)){   //数组
                        let arr = [];
                        for(let o of item){
                            arr.push(o instanceof Expression?o.clone():o);
                        }
                        dst.exprProps[k] = arr;
                    }else if(item instanceof Expression){ //表达式
                        dst.exprProps[k] = item.clone();
                    }else{  //普通属性
                        dst.exprProps[k] = item;
                    }
                }else{
                    dst.exprProps[k] = this.exprProps[k];
                }
            });

            //事件
            for(let key of this.events.keys()){
                let evt = this.events.get(key);
                //数组需要单独clone
                if(Util.isArray(evt)){
                    let a:NodomEvent[] = [];
                    for(let e of <NodomEvent[]>evt){
                        a.push(e.clone());
                    }
                    dst.events.set(key,a);
                }else{
                    dst.events.set(key,(<NodomEvent>evt).clone());
                }
            }
            
            //孩子节点
            for(let c of this.children){
                dst.add(c.clone(changeKey));
            }
            return dst;
        }

        /**
         * 处理指令
         * @param module    模块
         */
        handleDirectives(module:Module) {
            if (this.dontRender) {
                return;
            }
            for(let d of this.directives.values()){
                //指令可能改变render标志
                if (this.dontRender) {
                    return;
                }
                d.exec(module,this,this.parent);
            }
        }

        /**
         * 表达式处理，添加到expression计算队列
         * @param exprArr   表达式或字符串数组
         * @param module    模块
         */
        handleExpression(exprArr:Array<Expression|string>, module:Module) {
            if (this.dontRender) {
                return;
            }
            let model:Model = module.modelFactory.get(this.modelId);
            
            let value = '';
            exprArr.forEach((v) => {
                if (v instanceof Expression) { //处理表达式
                    let v1 = v.val(model);
                    value += v1!==undefined?v1:'';
                } else {
                    value += v;
                }
            });
            return value;
        }

        /**
         * 处理属性（带表达式）
         * @param module    模块
         */
        handleProps(module:Module) {
            if (this.dontRender) {
                return;
            }
            for(let k of Util.getOwnProps(this.exprProps)) {
                if (this.dontRender) {
                    return;
                }
                //属性值为数组，则为表达式
                if (Util.isArray(this.exprProps[k])) {
                    let pv = this.handleExpression(this.exprProps[k], module);
                    //class可叠加
                    if(k === 'class'){
                        this.addClass(pv);
                    }else{
                        this.props[k] = pv;
                    }
                } else if (this.exprProps[k] instanceof Expression) { //单个表达式
                    this.props[k] = this.exprProps[k].val(module.modelFactory.get(this.modelId));
                }
            }
        }

        /**
         * 处理asset，在渲染到html时执行
         * @param el    dom对应的html element
         */
        handleAssets(el:HTMLElement){
            if(!this.tagName && !el){
                return;
            }
            for(let key of this.assets.keys()){
                el[key] = this.assets.get(key);
            }
        }

        /**
         * 处理文本（表达式）
         * @param module    模块
         */
        handleTextContent(module) {
            if (this.dontRender) {
                return;
            }
            if (this.expressions !== undefined && this.expressions.length>0) {
                let v = this.handleExpression(this.expressions, module)||'';
                this.textContent = this.handleExpression(this.expressions, module);
            }
        }

        /**
         * 处理事件
         * @param module    模块
         * @param el        html element
         * @param parent    父virtual dom
         * @param parentEl  父html element
         */
        handleEvents(module:Module,el:Node,parent:Element,parentEl?:Node) {
            if (this.events.size === 0) {
                return;
            }
            for(let evt of this.events.values()){
                if(Util.isArray(evt)){
                    for(let evo of <NodomEvent[]>evt){
                        bind(evo,module,this,el,parent,parentEl);    
                    }
                }else{
                    let ev:NodomEvent = <NodomEvent>evt;
                    bind(ev,module,this,el,parent,parentEl);
                }
            }

            /**
             * 绑定事件
             * @param e         event object 
             * @param module    module
             * @param dom       绑定的虚拟dom
             * @param el        绑定的html element
             * @param parent    父虚拟dom
             * @param parentEl  父html element
             */
            function bind(e:NodomEvent,module:Module,dom:Element,el:Node,parent:Element,parentEl?:Node){
                if (e.delg && parent) { //代理到父对象
                    e.delegateTo(module, dom, <HTMLElement>el, parent, <HTMLElement>parentEl);
                } else {
                    e.bind(module, dom, <HTMLElement>el);
                }
            }
        }

        /**
         * 移除指令
         * @param directives 	待删除的指令类型数组
         */
        removeDirectives(directives:string[]) {
            for(let i=0;i<this.directives.length;i++){
                if(directives.length === 0){
                    break;   
                }
                for(let j=0;j<directives.length;j++){
                    if(directives[j].includes(this.directives[i].type.name)){
                        this.directives.splice(i--,1);
                        directives.splice(j--,1);
                        break;
                    }
                }
            }
        }

        /**
         * 添加指令
         * @param directive     指令对象
         * @param sort          是否排序
         */
        addDirective(directive:Directive,sort?:boolean){
            let finded:boolean = false;
            for(let i=0;i<this.directives.length;i++){
                //如果存在相同类型，则直接替换
                if(this.directives[i].type === directive.type){
                    this.directives[i] = directive;
                    finded = true;
                    break;
                }
            }
            if(!finded){
                this.directives.push(directive);
            }

            //指令按优先级排序
            if(sort){
                if(this.directives.length>1){
                    this.directives.sort((a, b) => {
                        return a.type.prio - b.type.prio;
                    });    
                }
            }
        }

        /**
         * 是否有某个类型的指令
         * @param directiveType 	指令类型名
         * @return true/false
         */
        hasDirective(directiveType):boolean {
            return this.directives.find(item=>item.type.name === directiveType) !== undefined;
        }

        /**
         * 获取某个类型的指令
         * @param directiveType 	指令类型名
         * @return directive
         */
        getDirective(directiveType):Directive {
            return this.directives.find(item=>item.type.name === directiveType);
        }

        /**
         * 添加子节点
         * @param dom 	子节点
         */
        add(dom:Element) {
            dom.parentKey = this.key;
            this.children.push(dom);
        }

        /**
         * 从虚拟dom树和html dom树删除自己
         * @param module 	模块
         * @param delHtml 	是否删除html element
         */
        remove(module:Module, delHtml?:boolean) {
            // 从父树中移除
            let parent:Element = this.getParent(module);
            if(parent){
                parent.removeChild(this);
            }
                    
            // 删除html dom节点
            if (delHtml && module && module.container) {
                let el = module.container.querySelector("[key='" + this.key + "']");
                if (el !== null) {
                    Util.remove(el);
                }
            }
        }

        /**
         * 从html删除
         */
        removeFromHtml(module:Module) {
            let el = module.container.querySelector("[key='" + this.key + "']");
            if (el !== null) {
                Util.remove(el);
            }
        }

        /**
         * 移除子节点
         * @param dom   子dom
         */
        removeChild(dom:Element) {
            let ind:number;
            // 移除
            if (Util.isArray(this.children) && (ind = this.children.indexOf(dom)) !== -1) {
                this.children.splice(ind, 1);
            }
        }

        /**
         * 获取parent
         * @param module 模块 
         * @returns      父element
         */
        getParent(module:Module):Element{
            if(!module){
                throw new NodomError('invoke','Element.getParent','0','Module');
            }
            if(this.parent){
                return this.parent;
            }
            if(this.parentKey){
                return module.renderTree.query(this.parentKey);    
            }
        }

        /**
         * 替换目标节点
         * @param dst 	目标节点　
         */
        replace(dst:Element) {
            if (!dst.parent) {
                return false;
            }
            let ind = dst.parent.children.indexOf(dst);
            if (ind === -1) {
                return false;
            }
            //替换
            dst.parent.children.splice(ind, 1, this);
            return true;
        }

        /**
         * 是否包含节点
         * @param dom 	包含的节点 
         */
        contains(dom:Element) {
            for (; dom !== undefined && dom !== this; dom = dom.parent);
            return dom !== undefined;
        }

        /**
         * 是否存在某个class
         * @param cls   classname
         * @return      true/false
         */
        hasClass(cls:string):boolean{
            let clazz = this.props['class'];
            if(!clazz){
                return false;
            }else{
                return clazz.trim().split(/\s+/).includes(cls); 
            }
        }

        /**
         * 添加css class
         * @param cls class名
         */
        addClass(cls:string){
            let clazz = this.props['class'];
            if(!clazz){
                this.props['class'] = cls;
            }else{
                let sa:string[] = clazz.trim().split(/\s+/);
                if(!sa.includes(cls)){
                    sa.push(cls);
                    clazz = sa.join(' ');
                    this.props['class'] = clazz;
                }
            }
        }

        /**
         * 删除css class
         * @param cls class名
         */
        removeClass(cls:string){
            let clazz = this.props['class'];
            if(!clazz){
                return;
            }else{
                let sa:string[] = clazz.trim().split(/\s+/);
                let index;
                if((index = sa.indexOf(cls)) !== -1){
                    sa.splice(index,1);
                    clazz = sa.join(' ');
                }
            }
            this.props['class'] = clazz;
        }

        /**
         * 是否拥有属性
         * @param propName  属性名
         * @param isExpr    是否是表达式属性 默认false  
         */
        hasProp(propName:string,isExpr?:boolean){
            if(isExpr){
                return this.exprProps.hasOwnProperty(propName);
            }else{
                return this.props.hasOwnProperty(propName);
            }
        }

        /**
         * 获取属性值
         * @param propName  属性名
         * @param isExpr    是否是表达式属性 默认false  
         */
        getProp(propName:string,isExpr?:boolean){
            if(isExpr){
                return this.exprProps[propName];
            }else{
                return this.props[propName];
            }
        }

        /**
         * 设置属性值
         * @param propName  属性名
         * @param v         属性值
         * @param isExpr    是否是表达式属性 默认false  
         */
        setProp(propName:string,v:any,isExpr?:boolean){
            if(isExpr){
                this.exprProps[propName] = v;
            }else{
                this.props[propName] = v;
            }
        }

        /**
         * 删除属性
         * @param props     属性名或属性名数组 
         * @param isExpr    是否是表达式属性 默认false  
         */
        delProp(props:string|string[],isExpr?:boolean){
            if(Util.isArray(props)){
                if(isExpr){
                    for(let p of <string[]>props){
                        delete this.exprProps[p];
                    }
                }else{
                    for(let p of <string[]>props){
                        delete this.props[p];
                    }
                }
            }else{
                if(isExpr){
                    delete this.exprProps[<string>props];
                }else{
                    delete this.props[<string>props];
                }
            }
        }
        /**
         * 查找子孙节点
         * @param key 	element key
         * @returns		虚拟dom/undefined
         */
        query(key:string) {
            if (this.key === key) {
                return this;
            }
            for (let i = 0; i < this.children.length; i++) {
                let dom = this.children[i].query(key);
                if (dom) {
                    return dom;
                }
            }
        }
		
        /**
         * 比较节点
         * @param dst 	待比较节点
         * @returns	{type:类型 text/rep/add/upd,node:节点,parent:父节点, 
         * 			changeProps:改变属性,[{k:prop1,v:value1},...],removeProps:删除属性,[prop1,prop2,...]}
         */
        compare(dst:Element, retArr:Array<ChangedDom>, parentNode?:Element) {
            if (!dst) {
                return;
            }
            let re:ChangedDom = new ChangedDom();
            let change:boolean = false;
            //找到过的dom map {domKey:true/false}，比较后，则添加到map
            let findedMap:Map<string,boolean> = new Map();

            if (this.tagName === undefined) { //文本节点
                if (dst.tagName === undefined) {
                    if (this.textContent !== dst.textContent) {
                        re.type = 'text';
                        change = true;
                    }
                } else { //节点类型不同
                    re.type = 'rep';
                    change = true;
                }
            } else { //element节点
                if (this.tagName !== dst.tagName) { //节点类型不同
                    re.type = 'rep';
                    change = true;
                } else { //节点类型相同，可能属性不同
                    //检查属性，如果不同则放到changeProps
                    re.changeProps = [];
                    //待删除属性
                    re.removeProps = [];
                    
					//删除或增加的属性
					Util.getOwnProps(dst.props).forEach((k)=>{
						if (!this.hasProp(k)) {
                            re.removeProps.push(k);
                        }
					})
                    
					//修改后的属性
					Util.getOwnProps(this.props).forEach((k)=>{
						let v1 = dst.props[k];
						if (this.props[k] !== v1) {
                            re.changeProps.push({k:k,v:this.props[k]});
                        }
					});
                    if (re.changeProps.length > 0 || re.removeProps.length > 0) {
                        change = true;
                        re.type = 'upd';
                    }
                }
            }
            //改变则加入数据
            if (change) {
                re.node = this;
                if (parentNode) {
                    re.parent = parentNode;
                }
                retArr.push(re);
            }

            //子节点处理
            if (!this.children || this.children.length === 0) {
                // 旧节点的子节点全部删除
                if (dst.children && dst.children.length > 0) {
                    dst.children.forEach((item) => {
                        retArr.push(new ChangedDom(item,'del'));
                    });
                }
            } else {
                //全部新加节点
                if (!dst.children || dst.children.length === 0) {
                    this.children.forEach((item) => {
                        retArr.push(new ChangedDom(item,'add',this));
                    });
                } else { //都有子节点
                    this.children.forEach((dom1, ind) => {
                        let dom2:Element = dst.children[ind];
                        // dom1和dom2相同key
                        if (!dom2 || dom1.key !== dom2.key) {
                            dom2 = undefined;
                            //找到key相同的节点
                            for (let i = 0; i < dst.children.length; i++) {
                                //找到了相同key
                                if (dom1.key === dst.children[i].key) {
                                    dom2 = dst.children[i];
                                    break;
                                }
                            }
                        }
                        if (dom2 !== undefined) {
                            dom1.compare(dom2, retArr, this);
                            //设置匹配标志，用于后面删除没有标志的节点
                            findedMap.set(dom2.key,true);
                        } else {
                            // dom1为新增节点
                            retArr.push(new ChangedDom(dom1,'add',this,ind));
                        }
                    });

                    //未匹配的节点设置删除标志
                    if (dst.children && dst.children.length > 0) {
                        dst.children.forEach((item) => {
                            if (!findedMap.has(item.key)) {
                                retArr.push(new ChangedDom(item,'del',dst));
                            }
                        });
                    }
                }
            }
        }

        /**
         * 添加事件
         * @param event         事件对象
         */
        addEvent(event:NodomEvent){
            //如果已经存在，则改为event数组，即同名event可以多个执行方法
            if(this.events.has(event.name)){
                let ev = this.events.get(event.name);
                let evs:NodomEvent[];
                if(Util.isArray(ev)){
                    evs = <NodomEvent[]>ev;
                }else{
                    evs = [<NodomEvent>ev];
                }
                evs.push(event);
                this.events.set(event.name,evs);
            }else{
                this.events.set(event.name,event);
            }
        }

        /**
         * 执行不渲染关联操作
         * 关联操作，包括:
         *  1 节点(子节点)含有module指令，需要unactive
         */
        doDontRender(){
            if(this.hasDirective('module')){
                let d:Directive = this.getDirective('module');
                if(d.extra && d.extra.moduleId){
                    let mdl:Module = ModuleFactory.get(d.extra.moduleId);
                    if(mdl){
                        mdl.unactive();
                    }
                }
            }
            //子节点递归
            for(let c of this.children){
                c.doDontRender();
            }
        }
    }
}