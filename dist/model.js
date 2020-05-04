var nodom;
(function (nodom) {
    class Model {
        constructor(data, module) {
            this.fields = {};
            this.data = data;
            this.fields = {};
            this.id = nodom.Util.genId();
            if (module) {
                this.moduleName = module.name;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id + '', this);
                }
            }
            data['$modelId'] = this.id;
            this.addSetterGetter(data);
        }
        set(key, value) {
            let fn, data;
            let index = key.lastIndexOf('.');
            if (index !== -1) {
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                data = this.query(key);
            }
            else {
                fn = key;
                data = this.data;
            }
            if (data === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.dataItem, key);
            }
            if (data[fn] !== value) {
                let module = nodom.ModuleFactory.get(this.moduleName);
                if (nodom.Util.isObject(value) || nodom.Util.isArray(value)) {
                    new Model(value, module);
                }
                let model = module.modelFactory.get(data.$modelId);
                if (model) {
                    if (data[fn] === undefined) {
                        this.defineProp(data, fn);
                    }
                    model.update(fn, value);
                }
                data[fn] = value;
            }
        }
        update(field, value) {
            let change = false;
            if (nodom.Util.isString(field)) {
                if (this.fields[field] !== value) {
                    this.fields[field] = value;
                    change = true;
                }
            }
            if (change) {
                nodom.ModuleFactory.get(this.moduleName).dataChange();
            }
        }
        addSetterGetter(data) {
            if (nodom.Util.isObject(data)) {
                nodom.Util.getOwnProps(data).forEach((p) => {
                    let v = data[p];
                    if (nodom.Util.isObject(v) || nodom.Util.isArray(v)) {
                        new Model(v, nodom.ModuleFactory.get(this.moduleName));
                    }
                    else {
                        this.update(p, v);
                        this.defineProp(data, p);
                    }
                });
            }
            else if (nodom.Util.isArray(data)) {
                let watcher = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module = nodom.ModuleFactory.get(this.moduleName);
                watcher.forEach((item) => {
                    data[item] = () => {
                        let args = [];
                        switch (item) {
                            case 'push':
                                for (let i = 0; i < arguments.length; i++) {
                                    args.push(arguments[i]);
                                }
                                break;
                            case 'unshift':
                                for (let i = 0; i < arguments.length; i++) {
                                    args.push(arguments[i]);
                                }
                                break;
                            case 'splice':
                                if (arguments.length > 2) {
                                    for (let i = 2; i < arguments.length; i++) {
                                        args.push(arguments[i]);
                                    }
                                }
                                break;
                            case 'pop':
                                break;
                            case 'shift':
                                break;
                        }
                        this.update(data);
                        Array.prototype[item].apply(data, arguments);
                        args.forEach((arg) => {
                            if (nodom.Util.isObject(arg) || nodom.Util.isArray(arg)) {
                                new Model(arg, nodom.ModuleFactory.get(this.moduleName));
                            }
                        });
                    };
                });
                data.forEach((item) => {
                    if (nodom.Util.isObject(item) || nodom.Util.isArray(item)) {
                        new Model(item, nodom.ModuleFactory.get(this.moduleName));
                    }
                });
            }
        }
        defineProp(data, p) {
            Object.defineProperty(data, p, {
                set: (v) => {
                    if (this.fields[p] === v) {
                        return;
                    }
                    this.update(p, v);
                    data[p] = v;
                },
                get: () => {
                    if (this.fields[p] !== undefined) {
                        return this.fields[p];
                    }
                }
            });
        }
        query(name) {
            let data = this.data;
            let fa = name.split(".");
            for (let i = 0; i < fa.length && null !== data && typeof data === 'object'; i++) {
                if (data === undefined) {
                    return;
                }
                if (fa[i].charAt(fa[i].length - 1) === ']') {
                    let f = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    f.forEach((istr) => {
                        let ind = istr.substr(0, istr.length - 1);
                        data = data[parseInt(ind)];
                    });
                }
                else {
                    data = data[fa[i]];
                }
            }
            return data;
        }
    }
    nodom.Model = Model;
})(nodom || (nodom = {}));
//# sourceMappingURL=model.js.map