/// <reference path="../nodom.ts" />
var nodom;
(function (nodom) {
    /**
     *  指令类型初始化
     *  每个指令类型都有一个init和handle方法，init和handle都可选
     *  init 方法在编译时执行，包含一个参数 directive(指令)、dom(虚拟dom)，无返回
     *  handle方法在渲染时执行，包含三个参数 directive(指令)、dom(虚拟dom)、module(模块)、parent(父虚拟dom)
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
    nodom.DirectiveManager.addType('module', {
        prio: 0,
        init: (directive, dom) => {
            let value = directive.value;
            let valueArr = value.split('|');
            directive.value = valueArr[0];
            //初始化参数
            directive.extra = {
                name: valueArr.length > 1 ? valueArr[1] : undefined,
                //是否已初始化
                init: false
            };
            dom.setProp('role', 'module');
        },
        handle: (directive, dom, module, parent) => {
            const ext = directive.extra;
            let needNew = ext.moduleId === undefined;
            //没有moduleId或与容器key不一致
            if (ext.moduleId) {
                let m = nodom.ModuleFactory.get(ext.moduleId);
                needNew = m.getContainerKey() !== dom.key;
            }
            // if(needNew){
            //未初始化，进行模块初始化
            ext.init = true;
            nodom.ModuleFactory.getInstance(directive.value, ext.name || dom.getProp('name'), dom.getProp('data'))
                .then((m) => {
                if (m) {
                    //保存绑定moduleid
                    m.setContainerKey(dom.key);
                    ext.moduleId = m.id;
                    module.addChild(m.id);
                    m.active();
                }
            });
            // }
        }
    });
    nodom.DirectiveManager.addType('model', {
        prio: 1,
        init: (directive, dom) => {
            let value = directive.value;
            //处理以.分割的字段，没有就是一个
            if (nodom.Util.isString(value)) {
                //从根数据获取
                if (value.startsWith('$$')) {
                    directive.extra = 1;
                    value = value.substr(2);
                }
                let arr = new Array();
                value.split('.').forEach((item) => {
                    let ind1 = -1, ind2 = -1;
                    if ((ind1 = item.indexOf('[')) !== -1 && (ind2 = item.indexOf(']')) !== -1) { //数组
                        let fn = item.substr(0, ind1);
                        let index = item.substring(ind1 + 1, ind2);
                        arr.push(fn + ',' + index);
                    }
                    else { //普通字符串
                        arr.push(item);
                    }
                });
                directive.value = arr;
            }
        },
        handle: (directive, dom, module, parent) => {
            let startIndex = 0;
            let data;
            //从根获取数据,$$开始数据项
            if (directive.extra === 1) {
                data = module.model.data[directive.value[0]];
                startIndex = 1;
            }
            else if (dom.modelId) {
                let model = module.modelFactory.get(dom.modelId);
                if (model && model.data) {
                    data = model.data;
                }
            }
            if (!data) {
                return;
            }
            for (let i = startIndex; i < directive.value.length; i++) {
                let item = directive.value[i];
                if (!data) {
                    return;
                }
                if (item.indexOf(',') !== -1) { //处理数组
                    let a = item.split(',');
                    data = data[a[0]][parseInt(a[1])];
                }
                else { //非数组
                    data = data[item];
                }
            }
            if (data) {
                dom.modelId = data.$modelId;
            }
        }
    });
    /**
     * 指令名 repeat
     * 描述：重复指令
     */
    nodom.DirectiveManager.addType('repeat', {
        prio: 2,
        init: (directive, dom) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let modelName;
            let fa = value.split('|');
            modelName = fa[0];
            //有过滤器
            if (fa.length > 1) {
                directive.filters = [];
                for (let i = 1; i < fa.length; i++) {
                    directive.filters.push(new nodom.Filter(fa[i]));
                }
            }
            //模块全局数据
            if (modelName.startsWith('$$')) {
                modelName = modelName.substr(2);
            }
            directive.value = modelName;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            if (!model || !model.data) {
                return;
            }
            let rows = model.query(directive.value);
            // 无数据，不渲染
            if (rows === undefined || rows.length === 0) {
                dom.dontRender = true;
                return;
            }
            //有过滤器，处理数据集合
            if (directive.filters && directive.filters.length > 0) {
                for (let f of directive.filters) {
                    rows = f.exec(rows, module);
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
    });
    /**
     * 指令名 if
     * 描述：条件指令
     */
    nodom.DirectiveManager.addType('if', {
        init: (directive, dom) => {
            if (typeof directive.value === 'string') {
                let value = directive.value;
                if (!value) {
                    throw new nodom.NodomError("paramException", "x-repeat");
                }
                //value为一个表达式
                let expr = new nodom.Expression(value);
                directive.value = expr;
            }
        },
        handle: (directive, dom, module, parent) => {
            //设置forceRender
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //找到并存储if和else在父对象中的位置
            let indif = -1, indelse = -1;
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === dom) {
                    indif = i;
                }
                else if (indelse === -1 && parent.children[i].hasDirective('else')) {
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
            }
            else {
                //替换if
                dom.dontRender = true;
                //为假则进入else渲染
                if (indelse > 0) {
                    parent.children[indelse].dontRender = false;
                }
            }
        }
    });
    /**
     * 指令名 else
     * 描述：else指令
     */
    nodom.DirectiveManager.addType('else', {
        name: 'else',
        init: (directive) => {
            return;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
    /**
     * 指令名 show
     * 描述：显示指令
     */
    nodom.DirectiveManager.addType('show', {
        init: (directive, dom) => {
            if (typeof directive.value === 'string') {
                let value = directive.value;
                if (!value) {
                    throw new nodom.NodomError("paramException", "x-show");
                }
                let expr = new nodom.Expression(value);
                directive.value = expr;
            }
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            //渲染
            if (v && v !== 'false') {
                dom.dontRender = false;
            }
            else { //不渲染
                dom.dontRender = true;
            }
        }
    });
    /**
     * 指令名 class
     * 描述：class指令
     */
    nodom.DirectiveManager.addType('class', {
        init: (directive, dom) => {
            if (typeof directive.value === 'string') {
                //转换为json数据
                let obj = eval('(' + directive.value + ')');
                if (!nodom.Util.isObject(obj)) {
                    return;
                }
                let robj = {};
                nodom.Util.getOwnProps(obj).forEach(function (key) {
                    if (nodom.Util.isString(obj[key])) {
                        //如果是字符串，转换为表达式
                        robj[key] = new nodom.Expression(obj[key]);
                    }
                    else {
                        robj[key] = obj[key];
                    }
                });
                directive.value = robj;
            }
        },
        handle: (directive, dom, module, parent) => {
            let obj = directive.value;
            let clsArr = [];
            let cls = dom.getProp('class');
            let model = module.modelFactory.get(dom.modelId);
            if (nodom.Util.isString(cls) && !nodom.Util.isEmpty(cls)) {
                clsArr = cls.trim().split(/\s+/);
            }
            nodom.Util.getOwnProps(obj).forEach(function (key) {
                let r = obj[key];
                if (r instanceof nodom.Expression) {
                    r = r.val(model);
                }
                let ind = clsArr.indexOf(key);
                if (!r || r === 'false') {
                    //移除class
                    if (ind !== -1) {
                        clsArr.splice(ind, 1);
                    }
                }
                else if (ind === -1) { //添加class
                    clsArr.push(key);
                }
            });
            //刷新dom的class
            dom.setProp('class', clsArr.join(' '));
        }
    });
    /**
     * 指令名 field
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('field', {
        init: (directive, dom) => {
            dom.setProp('name', directive.value);
            //默认text
            let type = dom.getProp('type') || 'text';
            let eventName = dom.tagName === 'input' && ['text', 'checkbox', 'radio'].includes(type) ? 'input' : 'change';
            dom.addEvent(new nodom.NodomEvent(eventName, function (dom, model, module, e, el) {
                if (!el) {
                    return;
                }
                let type = dom.getProp('type');
                let field = dom.getDirective('field').value;
                let v = el.value;
                //增加value表达式
                if (['text', 'number', 'date', 'datetime', 'datetime-local', 'month', 'week', 'time', 'email', 'password', 'search', 'tel', 'url', 'color', 'radio'].includes(type)
                    || dom.tagName === 'TEXTAREA') {
                    dom.setProp('value', new nodom.Expression(field), true);
                }
                //根据选中状态设置checkbox的value
                if (type === 'checkbox') {
                    if (dom.getProp('yes-value') == v) {
                        v = dom.getProp('no-value');
                    }
                    else {
                        v = dom.getProp('yes-value');
                    }
                }
                else if (type === 'radio') {
                    if (!el.checked) {
                        v = undefined;
                    }
                }
                //修改字段值
                model.set(field, v);
                //修改value值，该节点不重新渲染
                if (type !== 'radio') {
                    dom.setProp('value', v);
                    el.value = v;
                }
            }));
        },
        handle: (directive, dom, module, parent) => {
            const type = dom.getProp('type');
            const tgname = dom.tagName.toLowerCase();
            const model = module.modelFactory.get(dom.modelId);
            if (!model.data) {
                return;
            }
            const dataValue = model.data[directive.value];
            let value = dom.getProp('value');
            if (type === 'radio') {
                if (dataValue + '' === value) {
                    dom.assets.set('checked', true);
                    dom.setProp('checked', 'checked');
                }
                else {
                    dom.assets.set('checked', false);
                    dom.delProp('checked');
                }
            }
            else if (type === 'checkbox') {
                //设置状态和value
                let yv = dom.getProp('yes-value');
                //当前值为yes-value
                if (dataValue + '' === yv) {
                    dom.setProp('value', yv);
                    dom.assets.set('checked', true);
                }
                else { //当前值为no-value
                    dom.setProp('value', dom.getProp('no-value'));
                    dom.assets.set('checked', false);
                }
            }
            else if (tgname === 'select') { //下拉框
                if (dataValue !== dom.getProp('value')) {
                    //存在option使用repeat指令，此时尚未渲染出来
                    setTimeout(() => {
                        dom.setProp('value', dataValue);
                        dom.assets.set('value', dataValue);
                        nodom.Renderer.add(module);
                    }, 0);
                }
            }
            else {
                dom.assets.set('value', dataValue);
            }
        }
    });
    /**
     * 指令名 validity
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('validity', {
        init: (directive, dom) => {
            let ind, fn, method;
            let value = directive.value;
            //处理带自定义校验方法
            if ((ind = value.indexOf('|')) !== -1) {
                fn = value.substr(0, ind);
                method = value.substr(ind + 1);
            }
            else {
                fn = value;
            }
            directive.extra = { initEvent: false };
            directive.value = fn;
            directive.params = {
                enabled: false //不可用
            };
            //如果有方法，则需要存储
            if (method) {
                directive.params.method = method;
            }
            //如果没有子节点，添加一个，需要延迟执行
            if (dom.children.length === 0) {
                let vd1 = new nodom.Element();
                vd1.textContent = '';
                dom.add(vd1);
            }
            else { //子节点
                dom.children.forEach((item) => {
                    if (item.children.length === 0) {
                        let vd1 = new nodom.Element();
                        vd1.textContent = '   ';
                        item.add(vd1);
                    }
                });
            }
        },
        handle: (directive, dom, module, parent) => {
            setTimeout(() => {
                const el = module.container.querySelector("[name='" + directive.value + "']");
                if (!directive.extra.initEvent) {
                    directive.extra.initEvent = true;
                    //添加focus和blur事件
                    el.addEventListener('focus', function () {
                        setTimeout(() => { directive.params.enabled = true; }, 0);
                    });
                    el.addEventListener('blur', function () {
                        nodom.Renderer.add(module);
                    });
                }
            }, 0);
            //未获取focus，不需要校验
            if (!directive.params.enabled) {
                dom.dontRender = true;
                return;
            }
            const el = module.container.querySelector("[name='" + directive.value + "']");
            if (!el) {
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
                if (nodom.Util.isFunction(foo)) {
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
                }
                else { //多个校验
                    for (let i = 0; i < chds.length; i++) {
                        let rel = chds[i].getProp('rel');
                        if (rel === vn) {
                            setTip(chds[i], vn, el);
                        }
                        else { //隐藏
                            chds[i].dontRender = true;
                        }
                    }
                }
            }
            else {
                dom.dontRender = true;
            }
            /**
             * 设置提示
             * @param vd    虚拟dom节点
             * @param vn    验证结果名
             * @param el    验证html element
             */
            function setTip(vd, vn, el) {
                //子节点不存在，添加一个
                let text = vd.children[0].textContent.trim();
                if (text === '') { //没有提示内容，根据类型提示
                    text = nodom.Util.compileStr(nodom.FormMsgs[vn], el.getAttribute(vn));
                }
                vd.children[0].textContent = text;
            }
            /**
             * 验证名转换
             */
            function handle(arr) {
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
    });
})(nodom || (nodom = {}));
//# sourceMappingURL=directiveinit.js.map