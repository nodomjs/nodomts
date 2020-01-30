namespace nodom{
/**
 * 模块配置对象
 */
export interface IModuleCfg{	
	/**
	 * 模块名(全局唯一)，如果不设置，则系统会自动生成Module+id
	 */
	name?:string; 		
	/**
	 * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
	 */
	static?:boolean; 						
	/**
	 * 是否主模块，一个app只有一个根模块
	 */
	main?:boolean; 		
	/**
	 * 父模块名
	 */					
	parentName?:string;
	/**
	 * 子模块数组
	 */
	modules?:Array<IModuleCfg>; 
	/**
	 * 存放模块的容器（选择器或html element）
	 */
	el:string|HTMLElement; 					
	/**
	 * 模版字符串，如果以“<”开头，则表示模版字符串，否则表示模版url
	 */
	template?:string; 				
	/**
	 * 数据，如果为json object，直接作为模型数据，如果为字符串，则表示数据url，需要请求得到数据
	 */
	data?:object|string;
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
	methods?:object;
}
/**
 * 模块类
 */
export class Module{
	/**
	 * 模块名(全局唯一)
	 */
	name:string; 		
	/**
	 * 是否静态，如果为静态模块，则不产生虚拟dom，只需要把该模块对应模版置入容器即可
	 */
	static?:boolean; 						
	/**
	 * 是否主模块，一个app只有一个根模块
	 */
	main?:boolean;
	/**
	 * 模型
	 */
	model?:Model;
	/**
	 * 是否是首次渲染
	 */
	firstRender:boolean;
	/**
	 * 根虚拟dom
	 */
	virtualDom:Element;
	/**
	 * 渲染结束
	 */
	rendered:boolean;
	/**
	 * 待渲染树
	 */
	renderTree:Element;
	/**
	 * 父模块名
	 */	
	parentName:string; 
	/**
	 * 子模块数组
	 */
	children:Array<Module> = [];  			
	/**
	 * container 选择器
	 */
	selector:string;
	/**
	 * 首次渲染后执行操作数组
	 */
	firstRenderOps:Array<Function> = []; 
	/**
	 * 首次渲染前执行操作数组
	 */
	beforeFirstRenderOps:Array<Function> = [];
	/**
	 * 模块容器参数{module:,selector:}
	 */
	containerParam:object;
	/**
	 * 状态 0 create(创建)、1 init(初始化，已编译)、2 unactive(渲染后被置为非激活) 3 active(激活，可渲染显示)、4 dead(死亡)
	 */
	state:number = 0; 
	/**
	 * 数据url
	 */
	data:string;
	/**
	 * 需要加载新数据
	 */
	loadNewData:boolean = false;
	/**
	 * 方法工厂
	 */ 
	methodFactory:MethodFactory;
	/**
	 * 数据模型工厂
	 */
	modelFactory:ModelFactory;
	/**
	 * 表达式工厂
	 */
	expressionFactory:ExpressionFactory;
	/**
	 * 指令工厂
	 */
	directiveFactory:DirectiveFactory;
	/**
	 * 修改渲染的虚拟dom数组
	 */
	renderDoms:Array<Element>=[];
	/**
	 * 初始配置
	 */
	initConfig:IModuleCfg;
	/**
	 * 放置模块dom的容器
	 */
	container:HTMLElement;

	/**
	 * 构造器
	 * @param config 
	 */
	constructor(config:IModuleCfg){
		// 模块名字
		if(config.name){
			this.name = config.name;
		}else{
			this.name = 'Module' + nodom.Util.genId();
		}

		// 把模块添加到工厂
		ModuleFactory.add(this.name,this);
		
		this.methodFactory = new MethodFactory(this);
		this.modelFactory = new ModelFactory(this);
		this.expressionFactory = new ExpressionFactory(this);
		this.directiveFactory = new DirectiveFactory(this);
		this.renderDoms = [];			//修改渲染的el数组
		
		if(config){
			//保存config，存在延迟初始化情况
			this.initConfig = config;
			//保存container参数
			if(Util.isString(config.el)){
				this.containerParam = {
					module:config.parentName,
					selector:config.el
				};
			}else if(Util.isEl(config.el)){  //element
				this.container = <HTMLElement>config.el;
			}

			//方法加入工厂
			if(Util.isObject(config.methods)){
				Util.getOwnProps(config.methods).forEach((item)=>{
					this.methodFactory.add(item,config.methods[item]);
				});
			}
			let templateStr:string = '';
			//清除container的内部内容
			if(this.hasContainer()){
				templateStr = this.container.innerHTML.trim();
				this.container.innerHTML = '';
			}

			//主模块
			if(config.root){ 
				this.isMain = true;  
				ModuleFactory.setMain(me);
				this.active();
			}

			//不延迟初始化或为主模块，需要立即初始化
			if(!config.delayInit || this.isMain){
				this.init();
			}
		}
	}

	/**
     * 加载模块
     * @param callback  加载后的回调函数
     */
    init(){
        const me = this;
        //已初始化，不用再初始化
        if(this.state !== 0 || this.initing){
        	return this.initLinker;
        }

        this.initing = true;
        let config = this.initConfig;
        let typeArr = [];  //请求类型数组
    	let urlArr = [];   //请求url数组
    	//app页面路径
    	let appPath = nodom.config.appPath || '';
        if(nodom.isArray(config.requires) && config.requires.length>0){
        	config.requires.forEach((item)=>{
        		let type;
        		let url = '';
        		if(nodom.isObject(item)){  //为对象，可能是css或js
        			type = item.type || 'js';
        			url += item.path;
        		}else{   //js文件
        			type = 'js';
        			url += item; 
        		}
        		//如果已经加载，则不再加载
        		if(type === 'css'){
        			let css:HTMLElement = nodom.get("link[href='" + url + "']"); 
	                if(css !== null){     
	                    return; 
	                }
	                css = nodom.newEl('link');
	                css.type = 'text/css'; 
	                css.rel = 'stylesheet';  // 保留script标签的path属性
	                css.href = path; 
	                head.appendChild(css); 
	                return;
        		}else if(type === 'js'){
        			let cs = nodom.get("script[dsrc='" + url + "']");
	                if(cs !== null){ 
	                    return;
	                }
        		}
        		typeArr.push(type);
        		urlArr.push(url);
        	});
        }

        //模版信息
        if(config.template){ //模版串
        	//合并容器中的内容和template模版内容
    		this.templateStr += config.template.trim();
    	}else if(config.templateUrl){ //模版文件
    		typeArr.push('template');
    		urlArr.push(appPath + config.templateUrl);
    	}else if(config.compiledTemplate){ //编译后的json串
    		typeArr.push('compiled');
    		urlArr.push(appPath + config.compiledTemplate);
    	}
    	
    	//如果已存在templateStr，则直接编译
    	if(!nodom.isEmpty(this.templateStr)){
    		this.virtualDom = Compiler.compile(me,this.templateStr);
			//用后删除
			delete this.templateStr;
		}

    	//数据信息
    	if(config.data){ //数据
    		this.model = new Model(config.data,me);
    	}else if(config.dataUrl){  //数据文件url
    		typeArr.push('data');
			urlArr.push(config.dataUrl);
			this.dataUrl = config.dataUrl;
		}
    	
    	//批量请求文件
    	if(typeArr.length > 0){
    		this.initLinker = new Linker('getfiles',urlArr).then((files)=>{
	    		let head = document.querySelector('head');
	    		files.forEach((file,ind)=>{
	    			switch(typeArr[ind]){
	    				case 'js':
	    					let script = nodom.newEl('script');
	    					script.innerHTML = file;
			                head.appendChild(script);
			                script.setAttribute('dsrc',urlArr[ind]);
			                script.innerHTML = '';
	                    	head.removeChild(script);
	    					break;
	    				case 'template':
	    					this.virtualDom = Compiler.compile(me,file.trim());
	    					break;
	    				case 'compiled': //预编译后的js文件
	    					let arr = Serializer.deserialize(file,me);
	    					this.virtualDom = arr[0];
	    					this.expressionFactory = arr[1];
	    					break;
	    				case 'data': 	//数据
							this.model = new Model(JSON.parse(file),me);
	    			}
	    		});
	    		//主模块状态变为3
		    	changeState(me);
				delete this.initing;
	    	});
    	}else{
    		this.initLinker = Promise.resolve();
    		//修改状态
    		changeState(me);
    		delete this.initing;
    	}

    	if(nodom.isArray(this.initConfig.modules)){
    		this.initConfig.modules.forEach((item)=>{
    			this.addChild(item);
    		});
    	}

    	//初始化后，不再需要initConfig
		delete this.initConfig;
		return this.initLinker;
		/**
    	 * 修改状态
    	 * @param mod 	模块
    	 */
    	function changeState(mod){
    		if(mod.isMain){
    			mod.state = 3;
    			//可能不能存在数据，需要手动添加到渲染器
    			Renderer.add(mod);
    		}else if(mod.parentName){
    			mod.state = ModuleFactory.get(mod.parentName).state;
    		}else{
    			mod.state = 1;
    		}
    	}
    	
    }

	/**
	 * 模型渲染
	 * @return false 渲染失败 true 渲染成功
	 */
	render(){
		const me = this;
		//容器没就位或state不为active则不渲染，返回渲染失败
		if(this.state !== 3 || !this.virtualDom || !this.hasContainer()){
			return false;
		}
		//克隆新的树
		let root = this.virtualDom.clone(me);
		if(this.firstRender){
			//model无数据，如果存在dataUrl，则需要加载数据
			if(this.loadNewData && this.dataUrl){
				new Linker('ajax',{
					url:this.dataUrl,
					type:'json'
				}).then((r)=>{
					this.model = new Model(r,me);
					this.doFirstRender(root);
				});
				this.loadNewData = false;
			}else{
				this.doFirstRender(root);
			}
		}else{  //增量渲染
			//执行每次渲染前事件
			this.doModuleEvent('onBeforeRender');
			if(this.model){
				root.modelId = this.model.id;
				let oldTree = this.renderTree;
				this.renderTree = root;
				//渲染
				root.render(me,null);

				// 比较节点
				root.compare(oldTree,this.renderDoms);
				// 删除
				for(let i=this.renderDoms.length-1;i>=0;i--){
					let item = this.renderDoms[i];
					if(item.type === 'del'){
						item.node.removeFromHtml(me);
						this.renderDoms.splice(i,1);
					}
				}

				// 渲染
				this.renderDoms.forEach((item)=>{
					item.node.renderToHtml(me,item);
				});
			}
			
			//执行每次渲染后事件，延迟执行
			setTimeout(()=>{
				this.doModuleEvent('onRender');
			},0);
		}

		//数组还原
		this.renderDoms = [];
		
		//子模块渲染
		if(nodom.isArray(this.children)){
			this.children.forEach(item=>{
				item.render();
			});
		}
		return true;
	}
	/**
	 * 执行首次渲染
	 * @param root 	根虚拟dom
	 */
	doFirstRender(root){
		let me = this;
		//执行首次渲染前事件
		this.doModuleEvent('onBeforeFirstRender');
		this.beforeFirstRenderOps.forEach((foo)=>{
			nodom.apply(foo,me,[]);
		});
		this.beforeFirstRenderOps = [];
		//渲染树
		this.renderTree = root;	
		if(this.model){
			root.modelId = this.model.id;
		}
		
		root.render(me,null);
		
		//渲染到html
		if(root.children){
			root.children.forEach((item)=>{
				item.renderToHtml(me,{type:'fresh'});
			});	
		}

		//删除首次渲染标志
		delete this.firstRender;
		//延迟执行
		setTimeout(()=>{
			//执行首次渲染后事件
			this.doModuleEvent('onFirstRender');
			//执行首次渲染后操作队列
			this.firstRenderOps.forEach((foo)=>{
				nodom.apply(foo,me,[]);
			});
			this.firstRenderOps = [];
		},0);
		
	}
	// 检查容器是否存在，如果不存在，则尝试找到
	hasContainer(){
		const me = this;
		if(this.container){
			return true;
		}else if(this.containerParam !== undefined){
			let ct;
			if(this.containerParam.module === undefined){  //没有父节点
				ct = document;
			}else{
				let module = ModuleFactory.get(this.containerParam.module);
				if(module){
					ct = module.container;
				}
			}

			if(ct){
				this.container = ct.querySelector(this.containerParam.selector);
				return this.container !== null;
			}
			console.log(this.container);
		}
		
		return false;
	}
	/**
	 * 数据改变
	 * @param model 	改变的model
	 */
	dataChange(model){
		Renderer.add(this);
	}

	/**
	 * 添加子模块
	 * @param config 	模块配置 
	 */
	addChild(config){
		const me = this;
		config.parentName = this.name;
		let chd = new Module(config);
		if(this.children === undefined){
			this.children = [];
		}
		this.children.push(chd);
		return chd;
	}

	/**
	 * 发送
	 * @param toName 		接受模块名
	 * @param data 			消息内容
	 */
	send(toName,data){
		MessageFactory.add(this.name,toName,data);
	}


	/**
	 * 广播给父、兄弟和孩子（第一级）节点
	 */
	broadcast(data){
		const me = this;
		//兄弟节点
		if(this.parentName){
			let pmod = ModuleFactory.get(this.parentName);
			if(pmod && pmod.children){
				this.send(pmod.name,data);
				pmod.children.forEach((m)=>{
					//自己不发
					if(m === me){
						return;
					}
					this.send(m.name,data);
				});
			}
		}

		if(this.children !== undefined){
			this.children.forEach((m)=>{
				this.send(m.name,data);
			});
		}
	}

	/**
	 * 接受消息
	 * @param fromName 		来源模块名
	 * @param data 			消息内容
	 */
	receive(fromName,data){
		this.doModuleEvent('onReceive',[fromName,data]);
	}

	
	/**
	 * 激活
	 * @param callback 	激活后的回调函数
	 */
	active(callback){
		const me = this;
		//激活状态不用激活，创建状态不能激活
		if(this.state === 3){
			return;
		}
		let linker;
		//未初始化，需要先初始化
		if(this.state === 0){
			this.init().then(()=>{
				this.state = 3;
				if(nodom.isFunction(callback)){
					callback(this.model);
				}
				Renderer.add(me);
			});
		
		}else{
			this.state = 3;
			if(callback){
				callback(this.model);
			}
			Renderer.add(me);
		}

		//子节点
		if(nodom.isArray(this.children)){
			this.children.forEach((m)=>{
				m.active(callback);
			});
		}
		if(!linker){
			return Promise.resolve();
		}	
		return linker;
	}

	/**
	 * 取消激活
	 */
	unactive(){
		const me = this;
		//主模块不允许取消
		if(this.isRoot || this.state===2){
			return;
		}
		this.state = 2;
		//设置首次渲染标志
		this.firstRender = true;
		delete this.container;
		if(nodom.isArray(this.children)){
			this.children.forEach((m)=>{
				m.unactive();
			});
		}
	}

	/**
	 * 模块终结
	 */
	dead(){
		if(this.state === 4){
			return;
		}
		
		this.state = 4;

		if(nodom.isArray(this.children)){
			this.children.forEach((m)=>{
				m.unactive();
			});
		}
	}

	destroy(){
		if(nodom.isArray(this.children)){
			this.children.forEach((m)=>{
				m.destroy();
			});
		}
		//从工厂释放
		ModuleFactory.remove(this.name);
	}


	/*************事件**************/

	/**
	 * 执行模块事件
	 * @param eventName 	事件名
	 * @param param 		参数，为数组
	 */
	doModuleEvent(eventName,param){
		const me = this;
		let foo = this.methodFactory.get(eventName);
		if(!nodom.isFunction(foo)){
			return;
		}
		if(!param){
			param = [this.model];
		}else{
			param.unshift(this.model);
		}
		//调用方法
		nodom.apply(foo,me,param);
	}

	/**
	 * 添加首次渲染后执行操作
	 * @param foo  	操作方法
	 */
	addFirstRenderOperation(foo){
		let me = this;
		if(!nodom.isFunction(foo)){
			return;
		}
		if(this.firstRenderOps.indexOf(foo) === -1){
			this.firstRenderOps.push(foo);
		}
	}

	/**
	 * 添加首次渲染前执行操作
	 * @param foo  	操作方法
	 */
	addBeforeFirstRenderOperation(foo){
		let me = this;
		if(!Util.isFunction(foo)){
			return;
		}
		if(this.beforeFirstRenderOps.indexOf(foo) === -1){
			this.beforeFirstRenderOps.push(foo);
		}
	}
}

}
