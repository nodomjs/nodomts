var nodom;
(function (nodom) {
    nodom.DirectiveManager.addType('model', {
        prio: 1,
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (nodom.Util.isString(value)) {
                let arr = new Array();
                value.split('.').forEach((item) => {
                    let ind1 = -1, ind2 = -1;
                    if ((ind1 = item.indexOf('[')) !== -1 && (ind2 = item.indexOf(']')) !== -1) {
                        let fn = item.substr(0, ind1);
                        let index = item.substring(ind1 + 1, ind2);
                        arr.push(fn + ',' + index);
                    }
                    else {
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
                if (item.indexOf(',') !== -1) {
                    let a = item.split(',');
                    data = data[a[0]][parseInt(a[1])];
                }
                else {
                    data = data[item];
                }
            });
            if (data) {
                dom.modelId = data.$modelId;
            }
            return true;
        }
    });
    nodom.DirectiveManager.addType('repeat', {
        prio: 2,
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let ind;
            let modelName;
            if ((ind = value.indexOf('|')) !== -1) {
                modelName = value.substr(0, ind).trim();
                directive.filter = new nodom.Filter(value.substr(ind + 1));
            }
            else {
                modelName = value;
            }
            if (!dom.hasDirective('mocel')) {
                dom.directives.push(new nodom.Directive('model', modelName, dom, module));
            }
            directive.value = modelName;
        },
        handle: (directive, dom, module, parent) => {
            const modelFac = module.modelFactory;
            let rows = modelFac.get(dom.modelId + '').data;
            if (directive.filter !== undefined) {
                rows = directive.filter.exec(rows, module);
            }
            if (rows === undefined || rows.length === 0) {
                dom.dontRender = true;
                return true;
            }
            let chds = [];
            let key = dom.key;
            dom.removeDirectives(['model', 'repeat']);
            for (let i = 0; i < rows.length; i++) {
                let node = dom.clone();
                node.modelId = rows[i].$modelId;
                setKey(node, key, node.modelId);
                rows[i].$index = i;
                chds.push(node);
            }
            if (chds.length > 0) {
                for (let i = 0, len = parent.children.length; i < len; i++) {
                    if (parent.children[i] === dom) {
                        chds = [i + 1, 0].concat(chds);
                        Array.prototype.splice.apply(parent.children, chds);
                        break;
                    }
                }
            }
            dom.dontRender = true;
            return false;
            function setKey(node, key, id) {
                node.key = key + '_' + id;
                node.children.forEach((dom) => {
                    setKey(dom, dom.key, id);
                });
            }
        }
    });
    nodom.DirectiveManager.addType('if', {
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-repeat");
            }
            let expr = new nodom.Expression(value, module);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            let indif = -1, indelse = -1;
            for (let i = 0; i < parent.children.length; i++) {
                if (parent.children[i] === dom) {
                    indif = i;
                }
                else if (indelse === -1 && parent.children[i].hasDirective('else')) {
                    indelse = i;
                }
                if (i !== indif && indif !== -1 && indelse === -1 && parent.children[i].tagName !== undefined) {
                    indelse = -2;
                }
                if (indif !== -1 && indelse !== -1) {
                    break;
                }
            }
            if (v && v !== 'false') {
                let ind = 0;
                if (indelse > 0) {
                    parent.children[indelse].dontRender = true;
                }
            }
            else if (indelse > 0) {
                dom.dontRender = true;
            }
            return true;
        }
    });
    nodom.DirectiveManager.addType('else', {
        name: 'else',
        init: (directive, dom, module, el) => {
            return;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
    nodom.DirectiveManager.addType('show', {
        init: (directive, dom, module, el) => {
            let value = directive.value;
            if (!value) {
                throw new nodom.NodomError("paramException", "x-show");
            }
            let expr = new nodom.Expression(value, module);
            directive.value = expr;
        },
        handle: (directive, dom, module, parent) => {
            let model = module.modelFactory.get(dom.modelId);
            let v = directive.value.val(model);
            if (v && v !== 'false') {
                dom.dontRender = false;
            }
            else {
                dom.dontRender = true;
            }
        }
    });
    nodom.DirectiveManager.addType('class', {
        init: (directive, dom, module, el) => {
            let obj = eval('(' + directive.value + ')');
            if (!nodom.Util.isObject(obj)) {
                return;
            }
            let robj = {};
            nodom.Util.getOwnProps(obj).forEach(function (key) {
                if (nodom.Util.isString(obj[key])) {
                    robj[key] = new nodom.Expression(obj[key], module);
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
                    if (ind !== -1) {
                        clsArr.splice(ind, 1);
                    }
                }
                else if (ind === -1) {
                    clsArr.push(key);
                }
            });
            dom.props['class'] = clsArr.join(' ');
        }
    });
    nodom.DirectiveManager.addType('field', {
        init: (directive, dom, module, el) => {
            let dv = directive.value;
            let field = dv;
            let tgname = dom.tagName.toLowerCase();
            let type = dom.props['type'];
            let eventName = 'input';
            if (tgname === 'input' && (type === 'checkbox' || type === 'radio')) {
                eventName = 'change';
            }
            dom.props['name'] = field;
            let method = '$nodomGenMethod' + nodom.Util.genId();
            module.methodFactory.add(method, function (e, module, view, dom) {
                let type = dom.props['type'];
                let model = module.modelFactory.get(dom.modelId);
                let field = dom.getDirective('field').value;
                let v = view.value;
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
                this.data[field] = v;
                if (type !== 'radio') {
                    dom.props['value'] = v;
                    view.value = v;
                }
            });
            dom.events[eventName] = new nodom.NodomEvent(eventName, method);
            setTimeout(() => {
                if (!dom.exprProps.hasOwnProperty('value') && !dom.props.hasOwnProperty('value')) {
                    dom.exprProps['value'] = new nodom.Expression(field, module);
                }
            }, 0);
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
                }
                else {
                    delete dom.props['checked'];
                }
            }
            else if (type === 'checkbox') {
                let yv = dom.props['yes-value'];
                if (dataValue == yv) {
                    dom.props['checked'] = 'checked';
                    dom.props['value'] = yv;
                }
                else {
                    delete dom.props['checked'];
                    dom.props['value'] = dom.props['no-value'];
                }
            }
            else if (tgname === 'select') {
                dom.props['value'] = dataValue;
                setTimeout(() => {
                    let inputEl = module.container.querySelector("[key='" + dom.key + "']");
                    inputEl.value = dataValue;
                }, 0);
            }
        }
    });
    nodom.DirectiveManager.addType('validity', {
        init: (directive, dom, module, el) => {
            let ind, fn, method;
            let value = directive.value;
            if ((ind = value.indexOf('|')) !== -1) {
                fn = value.substr(0, ind);
                method = value.substr(ind + 1);
            }
            else {
                fn = value;
            }
            directive.value = fn;
            directive.params = {
                enabled: false
            };
            if (method) {
                directive.params.method = method;
            }
            setTimeout(() => {
                if (dom.children.length === 0) {
                    let vd1 = new nodom.Element();
                    vd1.textContent = '   ';
                    dom.children.push(vd1);
                }
                else {
                    dom.children.forEach((item) => {
                        if (item.children.length === 0) {
                            let vd1 = new nodom.Element();
                            vd1.textContent = '   ';
                            item.children.push(vd1);
                        }
                    });
                }
            }, 0);
            module.addFirstRenderOperation(function () {
                const m = this;
                const el = module.container.querySelector("[name='" + directive.value + "']");
                if (el) {
                    el.addEventListener('focus', function () {
                        directive.params.enabled = true;
                    });
                    el.addEventListener('blur', function () {
                        nodom.Renderer.add(m);
                    });
                }
            });
        },
        handle: (directive, dom, module, parent) => {
            const el = module.container.querySelector("[name='" + directive.value + "']");
            if (!directive.params.enabled) {
                dom.dontRender = true;
                return;
            }
            let chds = [];
            dom.children.forEach((item) => {
                if (item.tagName !== undefined && item.props.hasOwnProperty('rel')) {
                    chds.push(item);
                }
            });
            let resultArr = [];
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
                for (var o in vld) {
                    if (vld[o] === true) {
                        resultArr.push(o);
                    }
                }
            }
            if (resultArr.length > 0) {
                let vn = handle(resultArr);
                if (chds.length === 0) {
                    setTip(dom, vn, el);
                }
                else {
                    for (let i = 0; i < chds.length; i++) {
                        let rel = chds[i].props['rel'];
                        if (rel === vn) {
                            setTip(chds[i], vn, el);
                        }
                        else {
                            chds[i].dontRender = true;
                        }
                    }
                }
            }
            else {
                dom.dontRender = true;
            }
            function setTip(vd, vn, el) {
                let text = vd.children[0].textContent.trim();
                if (text === '') {
                    text = nodom.Util.compileStr(nodom.FormMsgs[vn], el.getAttribute(vn));
                }
                vd.children[0].textContent = text;
            }
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