// / <reference path="nodom.ts" />
namespace nodom {
	
    /**
     * 改变的dom类型
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
         * {prop1:value1,...}
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
		 * key，全局唯一
		 */
		key:string;
        /**
         * 是不是虚拟dom跟节点
         */
        root:boolean;
		/**
		 * 绑定的模型id，如果没有，则从父继承
		 */
		modelId:number;
		/**
		 * element为textnode时有效
		 */
		textContent:string|HTMLElement|HTMLFrameElement;

		/**
		 * 类型，包括: html fragment 或 html element 
		 */
		type:string;

		/**
		 * 指令集
		 */
		directives:Array<Directive> = [];
		/**
		 * 属性集合
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
		 */
		events:object={};

		/**
		 * 表达式集合
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
		 * 标签名，如div
		 */
        tagName:string;
		/**
		 * 不渲染标志，单次渲染有效
		 */
		dontRender:boolean = false;
		/**
		 * 是否找到（dom比较时使用）
		 */
        finded:boolean;
        
        /**
         * 额外数据
         * @param tag 
         */
        extraData:object;

        /**
         * 自定义element类型名
         */
        defineType:string;
		/**
		 * @param tag 标签名
		 */
        constructor(tag?:string) {
            this.tagName = tag; //标签
            this.key = Util.genId()+'';
        }

        /**
         * 渲染到virtualdom树
         * @param module 	模块
         * @param parent 	父节点
         */
        render(module:Module, parent?:Element) {
            if(this.dontRender){
                return;
            }
            // 设置父对象
            if (parent) {
                this.parentKey = parent.key;
                // 设置modelId
                if (!this.modelId) {
                    this.modelId = parent.modelId;
                }
            }

            //添加额外数据
            if(this.extraData){
                let model:Model = module.modelFactory.get(this.modelId);
                if(!model){
                    model = new Model(this.extraData,module);
                    this.modelId = model.id;
                }else{
                    Util.getOwnProps(this.extraData).forEach((item)=>{
                        model.set(item,this.extraData[item]);
                    });
                }
            }
            
            if (this.tagName !== undefined) { //element
                this.handleProps(module);
                //某些指令可能会终止渲染，如果返回false，则不继续渲染
                this.handleDirectives(module, parent);
            } else { //textContent
                this.handleTextContent(module);
            }

            // dontrender 为false才渲染子节点
                //子节点渲染
            for (let i = 0; i < this.children.length; i++) {
                let item = this.children[i];
                item.render(module, this);
                //dontRender 删除
                if (item.dontRender) {
                    this.removeChild(item);
                    i--;
                }
            }
        }
        /**
         * 渲染到html element
         * @param module 	模块
         * @param params 	配置对象{}
         * @param type 		类型
         * @param parent 	父虚拟dom
         */
        renderToHtml(module:Module, params:any) {
			let el:HTMLElement;
			let el1:Node;
            let type = params.type;
            let parent = params.parent;
            //构建el
            if (!parent) {
                el = module.container;
            } else {
                if (type === 'fresh' || type === 'add' || type === 'text') {
                    el = module.container.querySelector("[key='" + parent.key + "']")
                } else if (this.tagName !== undefined) { //element节点才可以查找
                    el = module.container.querySelector("[key='" + this.key + "']");
                }
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
                        el.setAttribute(p.k, p.v);
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
                return el;
            }

            /**
             * 新建文本节点
             */
            function newText(text:string|HTMLElement|DocumentFragment, dom?:Element) {
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
         */
        clone():Element{
            let dst:Element = new Element();
            //简单属性
			Util.getOwnProps(this).forEach((p) => {
                if (typeof this[p] !== 'object') {
                    dst[p] = this[p];
                }
            });

            //附加数据
            dst['extraData'] = this['extraData'];
            for(let d of this.directives){
				dst.directives.push(d);
			}
			//普通属性
            Util.getOwnProps(this.props).forEach((k)=>{
				dst.props[k] = this.props[k];
		    });

            //表达式属性
            Util.getOwnProps(this.exprProps).forEach((k)=>{
				dst.exprProps[k] = this.exprProps[k];
		    });

            //事件
            Util.getOwnProps(this.events).forEach((k)=>{
                dst.events[k] = this.events[k].clone();
            });
            
            //表达式
            dst.expressions = this.expressions;

            this.children.forEach((d) => {
                dst.children.push(d.clone());
            });
            return dst;
        }

        /**
         * 处理指令
         * 
         */
        handleDirectives(module, parent) {
            if (this.dontRender) {
                return false;
            }
            const dirs = this.directives;
            for (let i = 0; i < dirs.length && !this.dontRender; i++) {
                DirectiveManager.exec(dirs[i], this, module, parent);
            }
            return true;
        }



        /**
         * 表达式预处理，添加到expression计算队列
         */
        handleExpression(exprArr:Array<Expression|string>, module:Module) {
            if (this.dontRender) {
                return;
            }
            let model:Model = module.modelFactory.get(this.modelId);
            let value = '';
            exprArr.forEach((v) => {
                if (v instanceof Expression) { //处理表达式
                    // 统一添加到表达式计算队列
                    let v1 = v.val(model);
                    //html或 fragment
                    if (v1 instanceof DocumentFragment || Util.isEl(v1)) {
                        // 设置类型
                        this.type = 'html';
                        return v1;
                    }
                    value += v1;
                } else {
                    value += v;
                }
            });
            return value;
        }

        /**
         * 处理属性（带表达式）
         */
        handleProps(module) {
            if (this.dontRender) {
                return;
            }
            Util.getOwnProps(this.exprProps).forEach((k) => {
                //属性值为数组，则为表达式
                if (Util.isArray(this.exprProps[k])) {
                    this.props[k] = this.handleExpression(this.exprProps[k], module);
                } else if (this.exprProps[k] instanceof Expression) { //单个表达式
                    this.props[k] = this.exprProps[k].val(module.modelFactory.get(this.modelId));
                }
            });
        }

        /**
         * 处理文本（表达式）
         */
        handleTextContent(module) {
            if (this.dontRender) {
                return;
            }
            if (this.expressions !== undefined && this.expressions.length>0) {
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
        handleEvents(module, el, parent, parentEl) {
            if (Util.isEmpty(this.events)) {
                return;
            }
            Util.getOwnProps(this.events).forEach((k) => {
                let ev:NodomEvent = this.events[k];
                if (ev.delg && parent) { //代理到父对象
                    ev.delegateTo(module, this, el, parent, parentEl);
                } else {
                    ev.bind(module, this, el);
                }
            });
        }

        /**
         * 移除指令
         * @param directives 	待删除的指令集
         */
        removeDirectives(delDirectives) {
            
            for (let i = this.directives.length - 1; i >= 0; i--) {
                let d = this.directives[i];
                for (let j = 0; j < delDirectives.length; j++) {
                    if (d.type === delDirectives[j]) {
                        this.directives.splice(i, 1);
                    }
                }
            }
        }

        /**
         * 是否有某个类型的指令
         * @param directiveType 	指令类型名
         * @return true/false
         */
        hasDirective(directiveType) {
            
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 获取某个类型的指令
         * @param directiveType 	指令类型名
         * @return directive
         */
        getDirective(directiveType) {
            
            for (let i = 0; i < this.directives.length; i++) {
                if (this.directives[i].type === directiveType) {
                    return this.directives[i];
                }
            }
        }

        /**
         * 添加子节点
         * @param dom 	子节点
         */
        add(dom) {
            this.children.push(dom);
        }
        /**
         * 从虚拟dom树和html dom树删除自己
         * @param module 	模块
         * @param delHtml 	是否删除html element
         */
        remove(module:Module, delHtml?:boolean) {
            // 从父树中移除
            if (this.parentKey !== undefined) {
                let p = module.renderTree.query(this.parentKey);
                if (p) {
                    p.removeChild(this);
                }
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
         */
        removeChild(dom:Element) {
            let ind:number;
            // 移除
            if (Util.isArray(this.children) && (ind = this.children.indexOf(dom)) !== -1) {
                this.children.splice(ind, 1);
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
        contains(dom) {
            for (; dom !== undefined && dom !== this; dom = dom.parent);
            return dom !== undefined;
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
						if (!this.props.hasOwnProperty(k)) {
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
                            dom2.finded = true;
                        } else {
                            // dom1为新增节点
                            retArr.push(new ChangedDom(dom1,'add',this,ind));
                        }
                    });

                    //未匹配的节点设置删除标志
                    if (dst.children && dst.children.length > 0) {
                        dst.children.forEach((item) => {
                            if (!item.finded) {
                                retArr.push(new ChangedDom(item,'del',dst));
                            }
                        });
                    }
                }
            }
        }
    }
}