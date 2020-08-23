/// <reference path="../nodom.ts" />
namespace nodom {
    /**
     *  指令类型初始化    
     *  每个指令类型都有一个init和handle方法，init和handle都可选
     *  init 方法在编译时执行，包含两个参数 directive(指令)、dom(虚拟dom)，无返回
     *  handle方法在渲染时执行，包含四个参数 directive(指令)、dom(虚拟dom)、module(模块)、parent(父虚拟dom)
     */

    /**
     * module 指令
     * 用于指定该元素为模块容器，表示该模块的子模块
     * 用法
     *   x-module='moduleclass|modulename|dataurl'
     *   moduleclass 为模块类名
     *   modulename  为模块对象名，可选
     * 可增加 data 属性，用于指定数据url
     * 可增加 name 属性，用于设置模块name，如果x-module已设置，则无效
     */
    DirectiveManager.addType('module', 
        0,
        (directive: Directive,dom:Element) => {
            let value: string = < string > directive.value;
            let valueArr:string[] = value.split('|');
            directive.value = valueArr[0];

            //设置dom role
            dom.setProp('role','module');
            //设置module name
            if(valueArr.length>1){
                dom.setProp('modulename',valueArr[1]); 
            }

            directive.extra = {};
        },

        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            const ext = directive.extra;
            let needNew:boolean = ext.moduleId === undefined;
            let subMdl:Module;
            //没有moduleId或与容器key不一致，需要初始化模块
            if(ext && ext.moduleId){
                subMdl = ModuleFactory.get(ext.moduleId);
                needNew = subMdl.getContainerKey() !== dom.key;
            }
            
            if(needNew){
                ModuleFactory.getInstance(directive.value,dom.getProp('modulename'),dom.getProp('data'))
                    .then(
                        (m:Module)=>{
                            if(m){
                                //保存绑定moduleid
                                m.setContainerKey(dom.key);
                                //修改virtualdom的module指令附加参数moduleId
                                let dom1:Element = module.virtualDom.query(dom.key);
                                if(dom1){
                                    let dir:Directive = dom1.getDirective('module');
                                    dir.extra.moduleId = m.id;
                                }
                                module.addChild(m.id);
                                m.active();
                            }
                        }
                    );
            }else if(subMdl && subMdl.state !== 3){
                subMdl.active();
            }
        }
    );


    /**
     *  model指令
     */    
    DirectiveManager.addType('model', 
        1,
        (directive: Directive,dom:Element) => {
            let value: string = < string > directive.value;
            //处理以.分割的字段，没有就是一个
            if (Util.isString(value)) {
                //从根数据获取
                if(value.startsWith('$$')){
                    directive.extra = 1;
                    value = value.substr(2);
                }
                directive.value = value;
            }
        },

        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            let startIndex:number=0;
            let data;
            let model:Model;
            //从根获取数据,$$开始数据项
            if (directive.extra===1) {
                model = module.model;
                startIndex = 1;
            }else if(dom.modelId){
                model = module.modelFactory.get(dom.modelId);
            }

            if(!model || !model.data){
                return;
            }
            model = model.get(directive.value);
            if(model){
                dom.modelId = model.id;
            }
        }
    );

    /**
     * 指令名 repeat
     * 描述：重复指令
     */
    DirectiveManager.addType('repeat',
        2,
        (directive: Directive,dom:Element) => {
            let value = directive.value;
            if (!value) {
                throw new NodomError("paramException", "x-repeat");
            }

            let modelName:string;
            let fa:string[] = value.split('|');
            modelName = fa[0];
            //有过滤器
            if(fa.length>1){
                directive.filters = [];
                for(let i=1;i<fa.length;i++){
                    directive.filters.push(new Filter(fa[i]));
                }
            }
            
            //模块全局数据
            if(modelName.startsWith('$$')){
                modelName = modelName.substr(2);
            }
            directive.value = modelName;
        },
        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            let model = module.modelFactory.get(dom.modelId);
            if(!model || !model.data){
                return;
            }
            //得到rows数组的model
            model = model.get(directive.value);
            
            if(!model){
                return;
            }
            let rows = model.data;
            // 无数据，不渲染
            if (!Util.isArray(rows) || rows.length === 0) {
                dom.dontRender = true;
                return;
            }
            //有过滤器，处理数据集合
            if (directive.filters && directive.filters.length>0) {
                for(let f of directive.filters){
                    rows = f.exec(rows,module);
                }
            }
            let chds = [];
            let key = dom.key;
            // 移除指令
            dom.removeDirectives(['repeat']);
            for (let i = 0; i < rows.length; i++) {
                let node = dom.clone();
                //设置modelId
                node.modelId = rows[i].$modelId;
                //设置key
                setKey(node, key, i);
                rows[i].$index = i;
                chds.push(node);
            }

            //找到并追加到dom后
            if (chds.length > 0) {
                for (let i = 0, len = parent.children.length; i < len; i++) {
                    if (parent.children[i] === dom) {
                        chds = [i + 1, 0].concat(chds);
                        Array.prototype.splice.apply(parent.children, chds);
                        break;
                    }
                }
            }
            // 不渲染该节点
            dom.dontRender = true;
            
            function setKey(node, key, id) {
                node.key = key + '_' + id;
                node.children.forEach((dom) => {
                    setKey(dom, dom.key, id);
                });
            }
        }
    );

    /**
     * 指令名 if
     * 描述：条件指令
     */
    DirectiveManager.addType('if',
        10,
        (directive: Directive,dom:Element) => {
            if(typeof directive.value === 'string'){
                let value = directive.value;
                if (!value) {
                    throw new NodomError("paramException", "x-repeat");
                }
                //value为一个表达式
                let expr = new Expression(value);
                directive.value = expr;
            }
        },
        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            //设置forceRender
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //找到并存储if和else在父对象中的位置
            let indif = -1,
                indelse = -1;
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === dom) {
                    indif = i;
                } else if (indelse === -1 && parent.children[i].hasDirective('else')) {
                    indelse = i;
                }

                //if后的第一个element带else才算，否则不算
                if (i !== indif && indif !== -1 && indelse === -1 && parent.children[i].tagName !== undefined) {
                    indelse = -2;
                }

                //都找到了
                if (indif !== -1 && indelse !== -1) {
                    break;
                }
            }
            if (v && v !== 'false') { //为真
                let ind = 0;
                //删除else
                if (indelse > 0) {
                    parent.children[indelse].dontRender = true;
                }
            } else{
                //替换if
                dom.dontRender = true;
                //为假则进入else渲染
                if (indelse > 0) { 
                    parent.children[indelse].dontRender = false;
                }
            }
        }
    );

    /**
     * 指令名 else
     * 描述：else指令
     */
    DirectiveManager.addType('else',
        10,
        (directive: Directive) => {
            return;
        },
        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            return;
        }
    );

    /**
     * 指令名 show
     * 描述：显示指令
     */
    DirectiveManager.addType('show', 
        10,
        (directive: Directive,dom:Element) => {
            if(typeof directive.value === 'string'){
                let value = directive.value;
                if (!value) {
                    throw new NodomError("paramException", "x-show");
                }
                let expr = new Expression(value);
                directive.value = expr;
            }
        },
        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //渲染
            if (v && v !== 'false') {
                dom.dontRender = false;
            } else { //不渲染
                dom.dontRender = true;
            }
        }
    );

    /**
     * 指令名 class
     * 描述：class指令
     */
    DirectiveManager.addType('class',
        10,
        (directive: Directive,dom:Element) => {
            if(typeof directive.value === 'string'){
                //转换为json数据
                let obj = eval('(' + directive.value + ')');
                if (!Util.isObject(obj)) {
                    return;
                }
                let robj = {};
                Util.getOwnProps(obj).forEach(function (key) {
                    if (Util.isString(obj[key])) {
                        //如果是字符串，转换为表达式
                        robj[key] = new Expression(obj[key]);
                    } else {
                        robj[key] = obj[key];
                    }
                });
                directive.value = robj;
            }
        },
        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            let obj = directive.value;
            let clsArr:Array<string> = [];
            let cls:string = dom.getProp('class');
            let model = module.modelFactory.get(dom.modelId);

            if (Util.isString(cls) && !Util.isEmpty(cls)) {
                clsArr = cls.trim().split(/\s+/);
            }
            
            Util.getOwnProps(obj).forEach(function (key) {
                let r = obj[key];

                if (r instanceof Expression) {
                    r = r.val(model);
                }
                let ind = clsArr.indexOf(key);
                if (!r || r === 'false') {
                    //移除class
                    if (ind !== -1) {
                        clsArr.splice(ind, 1);
                    }
                } else if (ind === -1) { //添加class
                    clsArr.push(key);
                }
            });
            //刷新dom的class
            dom.setProp('class',clsArr.join(' '));
        }
    );

    /**
     * 指令名 field
     * 描述：字段指令
     */
    DirectiveManager.addType('field', 
        10,
        (directive: Directive,dom:Element) => {
            dom.setProp('name',directive.value);
            //默认text
            let type = dom.getProp('type') || 'text';
            let eventName = dom.tagName === 'input' && ['text', 'checkbox', 'radio'].includes(type) ? 'input' : 'change';
            dom.addEvent(new NodomEvent(eventName,
                function (dom,model,module,e,el) {
                    if(!el){
                        return;
                    }
                    let type = dom.getProp('type');
                    let field = dom.getDirective('field').value;
                    let v = el.value;
                    //增加value表达式
                    if(['text','number','date','datetime','datetime-local','month','week','time','email','password','search','tel','url','color','radio'].includes(type) 
                        || dom.tagName === 'TEXTAREA'){
                        dom.setProp('value',new Expression(field),true);
                    }
                    //根据选中状态设置checkbox的value
                    if (type === 'checkbox') {
                        if (dom.getProp('yes-value') == v) {
                            v = dom.getProp('no-value');
                        } else {
                            v = dom.getProp('yes-value');
                        }
                    } else if (type === 'radio') {
                        if (!el.checked) {
                            v = undefined;
                        }
                    }

                    //修改字段值
                    model.set(field,v);
                    //修改value值，该节点不重新渲染
                    if (type !== 'radio') {
                        dom.setProp('value',v);
                        el.value = v;
                    }
                }
            ));
        },

        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            const type:string = dom.getProp('type');
            const tgname = dom.tagName.toLowerCase();
            const model = module.modelFactory.get(dom.modelId);
            if(!model.data){
                return;
            }
            const dataValue = model.data[directive.value];
            let value = dom.getProp('value');
            if (type === 'radio') {
                if (dataValue+'' === value) {
                    dom.assets.set('checked',true);
                    dom.setProp('checked','checked');
                } else {
                    dom.assets.set('checked',false);
                    dom.delProp('checked');
                }
            } else if (type === 'checkbox') {
                //设置状态和value
                let yv = dom.getProp('yes-value');
                //当前值为yes-value
                if (dataValue+'' === yv) {
                    dom.setProp('value', yv);
                    dom.assets.set('checked',true);
                } else { //当前值为no-value
                    dom.setProp('value',dom.getProp('no-value'));
                    dom.assets.set('checked',false);
                }
            } else if (tgname === 'select') { //下拉框
                if(dataValue !== dom.getProp('value')){
                    //存在option使用repeat指令，此时尚未渲染出来
                    setTimeout(()=>{
                        dom.setProp('value', dataValue);
                        dom.assets.set('value',dataValue);
                        Renderer.add(module);
                    },0);
                }
            }else{
                dom.assets.set('value',dataValue);
            }
        }    
    );

    /**
     * 指令名 validity
     * 描述：字段指令
     */
    DirectiveManager.addType('validity', 
        10,
        (directive:Directive,dom:Element) => {
            let ind, fn, method;
            let value = directive.value;
            //处理带自定义校验方法
            if ((ind = value.indexOf('|')) !== -1) {
                fn = value.substr(0, ind);
                method = value.substr(ind + 1);
            } else {
                fn = value;
            }
            directive.extra = {initEvent:false};
            directive.value = fn;

            directive.params = {
                enabled: false //不可用
            }
            //如果有方法，则需要存储
            if (method) {
                directive.params.method = method;
            }
            //如果没有子节点，添加一个，需要延迟执行
            if (dom.children.length === 0) {
                let vd1 = new Element();
                vd1.textContent = '';
                dom.add(vd1);
            } else { //子节点
                dom.children.forEach((item) => {
                    if (item.children.length === 0) {
                        let vd1 = new Element();
                        vd1.textContent = '   ';
                        item.add(vd1);
                    }
                });
            }
        },

        (directive: Directive, dom: Element, module: Module, parent: Element) => {
            
            setTimeout(()=>{
                const el:HTMLInputElement = module.container.querySelector("[name='" + directive.value + "']");
                if(!directive.extra.initEvent){
                    directive.extra.initEvent = true;
                    //添加focus和blur事件
                    el.addEventListener('focus', function () {
                        setTimeout(()=>{directive.params.enabled = true;},0);
                    });
                    el.addEventListener('blur', function () {
                        Renderer.add(module);
                    });
                }
            },0);
            
            //未获取focus，不需要校验
            if (!directive.params.enabled) {
                dom.dontRender = true;
                return;
            }

            const el:HTMLInputElement = module.container.querySelector("[name='" + directive.value + "']");
            if(!el){
                return;
            }
            
            let chds = [];
            //找到带rel的节点
            dom.children.forEach((item) => {
                if (item.tagName !== undefined && item.hasProp('rel')) {
                    chds.push(item);
                }
            });

            let resultArr = [];

            //自定义方法校验
            if (directive.params.method) {
                const foo = module.methodFactory.get(directive.params.method);
                if (Util.isFunction(foo)) {
                    let r = foo.call(module.model, el.value);
                    if (!r) {
                        resultArr.push('custom');
                    }
                }
            }

            let vld = el.validity;
            
            if (!vld.valid) {
                // 查找校验异常属性
                for (var o in vld) {
                    if (vld[o] === true) {
                        resultArr.push(o);
                    }
                }
            }
            
            if (resultArr.length > 0) {
                //转换成ref对应值
                let vn = handle(resultArr);
                //单个校验
                if (chds.length === 0) {
                    setTip(dom, vn, el);
                } else { //多个校验
                    for (let i = 0; i < chds.length; i++) {
                        let rel = chds[i].getProp('rel');
                        if (rel === vn) {
                            setTip(chds[i], vn, el);
                        } else { //隐藏
                            chds[i].dontRender = true;
                        }
                    }
                }
            } else {
                dom.dontRender = true;
            }


            /**
             * 设置提示
             * @param vd    虚拟dom节点
             * @param vn    验证结果名
             * @param el    验证html element
             */
            function setTip(vd: Element, vn: string, el ? : HTMLElement) {
                //子节点不存在，添加一个
                let text = ( <string> vd.children[0].textContent).trim();
                if (text === '') { //没有提示内容，根据类型提示
                    text = Util.compileStr(TipMsg.FormMsgs[vn], el.getAttribute(vn));
                }
                vd.children[0].textContent = text;
            }

            /**
             * 验证名转换
             */
            function handle(arr: Array < string > ) {
                for (var i = 0; i < arr.length; i++) {
                    switch (arr[i]) {
                    case 'valueMissing':
                        return 'required';
                    case 'typeMismatch':
                        return 'type';
                    case 'tooLong':
                        return 'maxLength';
                    case 'tooShort':
                        return 'minLength';
                    case 'rangeUnderflow':
                        return 'min';
                    case 'rangeOverflow':
                        return 'max';
                    case 'patternMismatch':
                        return 'pattern';
                    default:
                        return arr[i];
                    }
                }
            }
        }
    );

    /**
     * 增加route指令
     */
    DirectiveManager.addType('route',
        10,
        (directive:Directive, dom:Element) => {
            let value = directive.value;
            if (Util.isEmpty(value)) {
                return;
            }

            //a标签需要设置href
            if (dom.tagName === 'A') {
                dom.setProp('href','javascript:void(0)');
            }
            // 表达式处理
            if (typeof value === 'string' && value.substr(0, 2) === '{{' && value.substr(value.length - 2, 2) === '}}') {
                value = new Expression(value.substring(2, value.length - 2));
            } 
            //表达式，则需要设置为exprProp
            if(value instanceof Expression){
                dom.setProp('path',value,true);
                directive.value = value;
            }else{
                dom.setProp('path',value);
            }
            
            //添加click事件
            dom.addEvent(new NodomEvent('click', '', 
                (dom,model,module,e) => {
                    let path:string = dom.getProp('path');
                    if (Util.isEmpty(path)) {
                        return;
                    }
                    Router.addPath(path);
                }
            ));
        },

        (directive:Directive, dom:Element, module:Module, parent:Element) => {
            if (dom.hasProp('active')) {
                //添加到router的activeDomMap
                let domArr:string[] = Router.activeDomMap.get(module.id);
                if(!domArr){
                    Router.activeDomMap.set(module.id,[dom.key]);
                }else{
                    if(!domArr.includes(dom.key)){
                        domArr.push(dom.key);
                    }
                }
            }

            let path:string = dom.getProp('path');
            if (path === Router.currentPath) {
                return;
            }
            
            //active需要跳转路由（当前路由为该路径对应的父路由）
            if (dom.hasProp('active') && dom.getProp('active') !== 'false' && (!Router.currentPath || path.indexOf(Router.currentPath) === 0)) {
                //可能router尚未渲染出来
                setTimeout(()=>{Router.addPath(path)},0);
            }
        }
    );

    /**
     * 增加router指令
     */
    DirectiveManager.addType('router', 
        10,
        (directive, dom) => {
            //修改节点role
            dom.setProp('role','module');
        },
        (directive, dom, module, parent) => {
            Router.routerKeyMap.set(module.id,dom.key);
        }
    );
}
