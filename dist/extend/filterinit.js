var nodom;
(function (nodom) {
    nodom.FilterManager.addType('date', (value, param) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        param = param.substr(1, param.length - 2);
        return nodom.Util.formatDate(value, param);
    });
    nodom.FilterManager.addType('currency', (value, sign) => {
        if (isNaN(value)) {
            return '';
        }
        sign = sign || '¥';
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        return sign + ((value * 100 + 0.5 | 0) / 100);
    });
    nodom.FilterManager.addType('number', (value, param) => {
        let digits = param || 0;
        if (isNaN(value) || digits < 0) {
            return '';
        }
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        let x = 1;
        for (let i = 0; i < digits; i++) {
            x *= 10;
        }
        console.log(x);
        return ((value * x + 0.5) | 0) / x;
    });
    nodom.FilterManager.addType('tolowercase', (value) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        if (!nodom.Util.isString(value) || nodom.Util.isEmpty(value)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' tolowercase', '0', 'string');
        }
        return value.toLowerCase();
    });
    nodom.FilterManager.addType('touppercase', (value) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        if (!nodom.Util.isString(value) || nodom.Util.isEmpty(value)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' touppercase', '0', 'string');
        }
        return value.toUpperCase();
    });
    nodom.FilterManager.addType('orderby', function () {
        let args = arguments;
        let arr = args[0];
        let field = args[1];
        let odr = args[2] || 'asc';
        if (!nodom.Util.isArray(arr)) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' orderby', '0', 'array');
        }
        let ret = arr.concat([]);
        if (field && nodom.Util.isObject(arr[0])) {
            if (odr === 'asc') {
                ret.sort((a, b) => a[field] >= b[field] ? 1 : -1);
            }
            else {
                ret.sort((a, b) => b[field] <= a[field] ? 1 : -1);
            }
        }
        else {
            if (odr === 'asc') {
                ret.sort((a, b) => a >= b ? 1 : -1);
            }
            else {
                ret.sort((a, b) => b <= a ? 1 : -1);
            }
        }
        return ret;
    });
    nodom.FilterManager.addType('select', function () {
        if (!nodom.Util.isArray(arguments[0])) {
            throw new nodom.NodomError('invoke1', nodom.TipWords.filter + ' filter', '0', 'array');
        }
        let params = new Array();
        for (let i = 0; i < arguments.length; i++) {
            params.push(arguments[i]);
        }
        let handler = {
            odd: function () {
                let arr = arguments[0];
                let ret = [];
                for (let i = 0; i < arr.length; i++) {
                    if (i % 2 === 1) {
                        ret.push(arr[i]);
                    }
                }
                return ret;
            },
            even: function () {
                let arr = arguments[0];
                let ret = [];
                for (let i = 0; i < arr.length; i++) {
                    if (i % 2 === 0) {
                        ret.push(arr[i]);
                    }
                }
                return ret;
            },
            range: function () {
                let args = arguments;
                let arr = args[0];
                let ret = [];
                let first = args[1];
                let last = args[2];
                if (isNaN(first)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                if (!nodom.Util.isNumber(first)) {
                    first = parseInt(first);
                }
                if (isNaN(last)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                if (!nodom.Util.isNumber(last)) {
                    last = parseInt(last);
                }
                if (first > last) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter range');
                }
                return arr.slice(first, last + 1);
            },
            index: function () {
                let args = arguments;
                let arr = args[0];
                if (!nodom.Util.isArray(args[0])) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter index');
                }
                let ret = [];
                if (arr.length > 0) {
                    for (let i = 1; i < args.length; i++) {
                        if (isNaN(args[i])) {
                            continue;
                        }
                        let k = parseInt(args[i]);
                        if (k < arr.length) {
                            ret.push(arr[k]);
                        }
                    }
                }
                return ret;
            },
            func: function (arr, param) {
                if (!nodom.Util.isArray(arr) || nodom.Util.isEmpty(param)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter func');
                }
                let foo = this.methodFactory.get(param);
                if (nodom.Util.isFunction(foo)) {
                    return foo(arr);
                }
                return arr;
            },
            value: function (arr, param) {
                if (!nodom.Util.isArray(arr) || nodom.Util.isEmpty(param)) {
                    throw new nodom.NodomError('paramException', nodom.TipWords.filter, 'filter value');
                }
                if (nodom.Util.isObject(param)) {
                    let keys = nodom.Util.getOwnProps(param);
                    return arr.filter(function (item) {
                        for (let i = 0; i < keys.length; i++) {
                            let v = item[keys[i]];
                            let v1 = param[keys[i]];
                            if (v === undefined || v !== v1 && typeof v === 'string' && v.indexOf(v1) === -1) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                else {
                    return arr.filter(function (item) {
                        let props = nodom.Util.getOwnProps(item);
                        for (let i = 0; i < props.length; i++) {
                            let v = item[props[i]];
                            if (nodom.Util.isString(v) && v.indexOf(param) !== -1) {
                                return item;
                            }
                        }
                    });
                }
            }
        };
        let type;
        if (nodom.Util.isString(params[1])) {
            type = params[1].trim();
            if (handler.hasOwnProperty(type)) {
                params.splice(1, 1);
            }
            else {
                type = 'value';
            }
        }
        else {
            type = 'value';
        }
        if (type === 'range' || type === 'index' || type === 'func') {
            if (params.length < 2) {
                throw new nodom.NodomError('paramException', nodom.TipWords.filter);
            }
        }
        return nodom.Util.apply(handler[type], this, params);
    });
    nodom.FilterManager.addType('html', (value) => {
        if (nodom.Util.isEmpty(value)) {
            return '';
        }
        let div = nodom.Util.newEl('div');
        div.innerHTML = value;
        let frag = document.createDocumentFragment();
        for (let i = 0; i < div.childNodes.length; i++) {
            frag.appendChild(div.childNodes[i]);
        }
        return frag;
    });
})(nodom || (nodom = {}));
//# sourceMappingURL=filterinit.js.map