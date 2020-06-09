/// <reference path="../nodom.ts" />
var nodom;
(function (nodom) {
    /**
     *  指令类型初始化
     *  每个指令类型都有一个init和handle方法，init和handle都可选
     *  init 方法在编译时执行，包含一个参数 directive(指令)、dom(虚拟dom)、module(模块),el(html element)，无返回
     *  handle方法在渲染时执行，包含三个参数 directive(指令)、dom(虚拟dom)、module(模块)、parent(父虚拟dom)
     *  return true/false false则不进行后面的所有渲染工作
     */
    nodom.DirectiveManager.addType('model', {
        prio: 1,
        init: (directive, dom, el) => {
            let value = directive.value;
            //处理以.分割的字段，没有就是一个
            if (nodom.Util.isString(value)) {
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
            let model = module.modelFactory.get(dom.modelId + '');
            if (!model || !model.data) {
                return;
            }
            let data = model.data;
            directive.value.forEach((item) => {
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
            });
            if (data) {
                dom.modelId = data.$modelId;
            }
            return true;
        }
    });
    /**
     * 指令名 repeat
     * 描述：重复指令
     */
    nodom.DirectiveManager.addType('repeat', {
        prio: 2,
        init: (directive, dom, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let ind;
            let modelName;
            //过滤器
            if ((ind = value.indexOf('|')) !== -1) {
                modelName = value.substr(0, ind).trim();
                directive.filter = new nodom.Filter(value.substr(ind + 1));
            }
            else {
                modelName = value;
            }
            // 增加model指令
            if (!dom.hasDirective('model')) {
                dom.directives.push(new nodom.Directive('model', modelName, dom, el));
            }
            directive.value = modelName;
        },
        handle: (directive, dom, module, parent) => {
            const modelFac = module.modelFactory;
            let rows = modelFac.get(dom.modelId + '').data;
            //有过滤器，处理数据集合
            if (directive.filter !== undefined) {
                rows = directive.filter.exec(rows, module);
            }
            // 无数据，不渲染
            if (rows === undefined || rows.length === 0) {
                dom.dontRender = true;
                return true;
            }
            let chds = [];
            let key = dom.key;
            // 移除指令
            dom.removeDirectives(['model', 'repeat']);
            for (let i = 0; i < rows.length; i++) {
                let node = dom.clone();
                //设置modelId
                node.modelId = rows[i].$modelId;
                //设置key
                setKey(node, key, node.modelId);
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
            dom.dontRender = false;
            return false;
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
        init: (directive, dom, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            //value为一个表达式
            let expr = new nodom.Expression(value);
            directive.value = expr;
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
            else if (indelse > 0) { //为假则进入else渲染
                //替换if
                dom.dontRender = true;
            }
            return true;
        }
    });
    /**
     * 指令名 else
     * 描述：else指令
     */
    nodom.DirectiveManager.addType('else', {
        name: 'else',
        init: (directive, dom, el) => {
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
        init: (directive, dom, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-show");
            }
            let expr = new nodom.Expression(value);
            directive.value = expr;
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
        init: (directive, dom, el) => {
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
        },
        handle: (directive, dom, module, parent) => {
            let obj = directive.value;
            let clsArr = [];
            let cls = dom.props['class'];
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
            dom.props['class'] = clsArr.join(' ');
        }
    });
    /**
     * 指令名 field
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('field', {
        init: (directive, dom, el) => {
            dom.props['name'] = directive.value;
        },
        handle: (directive, dom, module, parent) => {
            const type = dom.props['type'];
            const tgname = dom.tagName.toLowerCase();
            const model = module.modelFactory.get(dom.modelId);
            const dataValue = model.data[directive.value];
            let value = dom.props['value'];
            if (type === 'radio') {
                if (dataValue == value) {
                    dom.props['checked'] = 'checked';
                    setTimeout(() => {
                        module.container.querySelector("[key='" + dom.key + "']").checked = true;
                    }, 0);
                }
                else {
                    delete dom.props['checked'];
                    setTimeout(() => {
                        module.container.querySelector("[key='" + dom.key + "']").checked = false;
                    }, 0);
                }
            }
            else if (type === 'checkbox') {
                //设置状态和value
                let yv = dom.props['yes-value'];
                //当前值为yes-value
                if (dataValue == yv) {
                    dom.props['checked'] = 'checked';
                    dom.props['value'] = yv;
                    setTimeout(() => {
                        module.container.querySelector("[key='" + dom.key + "']").checked = true;
                    }, 0);
                }
                else { //当前值为no-value
                    delete dom.props['checked'];
                    dom.props['value'] = dom.props['no-value'];
                    setTimeout(() => {
                        module.container.querySelector("[key='" + dom.key + "']").checked = false;
                    }, 0);
                }
            }
            else if (tgname === 'select') { //下拉框
                dom.props['value'] = dataValue;
                //option可能没生成，延迟赋值
                setTimeout(() => {
                    let inputEl = module.container.querySelector("[key='" + dom.key + "']");
                    inputEl.value = dataValue;
                }, 0);
            }
            else {
                //value可能无法渲染，需要直接设置到input element
                setTimeout(() => {
                    let inputEl = module.container.querySelector("[key='" + dom.key + "']");
                    inputEl.value = value;
                }, 0);
            }
            if (!directive.extra) {
                let eventName = tgname === 'input' && (type === 'text' || type === 'checkbox' || type === 'radio') ? 'input' : 'change';
                //增加自定义方法
                let method = '$nodomGenMethod' + nodom.Util.genId();
                directive.extra = method;
                module.methodFactory.add(method, function (e, module, view, dom) {
                    let type = dom.props['type'];
                    let field = dom.getDirective('field').value;
                    let v = view.value;
                    //根据选中状态设置checkbox的value
                    if (type === 'checkbox') {
                        if (dom.props['yes-value'] == v) {
                            v = dom.props['no-value'];
                        }
                        else {
                            v = dom.props['yes-value'];
                        }
                    }
                    else if (type === 'radio') {
                        if (!view.checked) {
                            v = undefined;
                        }
                    }
                    //修改字段值
                    this.data[field] = v;
                    //修改value值，该节点不重新渲染
                    if (type !== 'radio') {
                        dom.props['value'] = v;
                        view.value = v;
                    }
                });
                //追加事件
                dom.events[eventName] = new nodom.NodomEvent(eventName, method);
            }
        }
    });
    /**
     * 指令名 validity
     * 描述：字段指令
     */
    nodom.DirectiveManager.addType('validity', {
        init: (directive, dom, el) => {
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
            directive.value = fn;
            directive.params = {
                enabled: false //不可用
            };
            //如果有方法，则需要存储
            if (method) {
                directive.params.method = method;
            }
            //如果没有子节点，添加一个，需要延迟执行
            setTimeout(() => {
                if (dom.children.length === 0) {
                    let vd1 = new nodom.Element();
                    vd1.textContent = '   ';
                    dom.children.push(vd1);
                }
                else { //子节点
                    dom.children.forEach((item) => {
                        if (item.children.length === 0) {
                            let vd1 = new nodom.Element();
                            vd1.textContent = '   ';
                            item.children.push(vd1);
                        }
                    });
                }
            }, 0);
        },
        handle: (directive, dom, module, parent) => {
            setTimeout(() => {
                const el = module.container.querySelector("[name='" + directive.value + "']");
                if (!directive.extra) {
                    directive.extra = true;
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
                if (item.tagName !== undefined && item.props.hasOwnProperty('rel')) {
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
                        let rel = chds[i].props['rel'];
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