// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 模型类
     */
    class Model {
        /**
         * @param data 		数据
         * @param module 	模块对象
         */
        constructor(data, module) {
            /**
             * 模型字段集
             */
            this.fields = {};
            this.data = data;
            this.fields = {};
            // modelId
            this.id = nodom.Util.genId();
            //添加到model工厂
            if (module) {
                this.moduleName = module.name;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id, this);
                }
            }
            // 给data设置modelid
            data['$modelId'] = this.id;
            this.addSetterGetter(data);
        }
        /**
         * 设置属性，可能属性之前不存在，用于在初始化不存在的属性创建和赋值
         * @param key       键，可以带“.”，如a, a.b.c
         * @param value     对应值
         */
        set(key, value) {
            let fn, data;
            let index = key.lastIndexOf('.');
            if (index !== -1) { //key中有“.”
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                data = this.query(key);
            }
            else {
                fn = key;
                data = this.data;
            }
            //数据不存在
            if (data === undefined) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.dataItem, key);
            }
            if (data[fn] !== value) {
                let module = nodom.ModuleFactory.get(this.moduleName);
                // object或array需要创建新model
                if (nodom.Util.isObject(value) || nodom.Util.isArray(value)) {
                    new Model(value, module);
                }
                let model = module.modelFactory.get(data.$modelId);
                if (model) {
                    //如果未定义setter和getter，则需要定义
                    let ds = Object.getOwnPropertyDescriptor(data, fn);
                    if (ds === undefined || ds['writable']) {
                        this.defineProp(data, fn);
                    }
                    model.update(fn, value);
                }
                data[fn] = value;
            }
        }
        /**
         * 更新字段值
         * @param field 	字段名或空(数组更新)
         * @param value 	字段对应的新值
         */
        update(field, value) {
            let change = false;
            //对象设置值
            if (nodom.Util.isString(field)) {
                if (this.fields[field] !== value) {
                    this.fields[field] = value;
                    change = true;
                }
            }
            //添加到模块数据改变
            if (change) {
                nodom.ModuleFactory.get(this.moduleName).dataChange();
            }
        }
        /**
         * 为对象添加setter
         */
        addSetterGetter(data) {
            let me = this;
            const excludes = ['$modelId'];
            if (nodom.Util.isObject(data)) {
                nodom.Util.getOwnProps(data).forEach((p) => {
                    let v = data[p];
                    if (nodom.Util.isObject(v) || nodom.Util.isArray(v)) {
                        new Model(v, nodom.ModuleFactory.get(this.moduleName));
                    }
                    else {
                        this.update(p, v);
                        if (!excludes.includes(p)) {
                            this.defineProp(data, p);
                        }
                    }
                });
            }
            else if (nodom.Util.isArray(data)) {
                //监听数组事件
                let watcher = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module = nodom.ModuleFactory.get(this.moduleName);
                //添加自定义事件，绑定改变事件
                watcher.forEach((item) => {
                    data[item] = function () {
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
                                //插入新元素
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
                        Array.prototype[item].apply(data, arguments);
                        //递归创建新model
                        args.forEach((arg) => {
                            if (nodom.Util.isObject(arg) || nodom.Util.isArray(arg)) {
                                new Model(arg, module);
                            }
                        });
                        //增加渲染
                        nodom.Renderer.add(nodom.ModuleFactory.get(me.moduleName));
                    };
                });
                //设置model
                data.forEach((item) => {
                    if (nodom.Util.isObject(item) || nodom.Util.isArray(item)) {
                        new Model(item, module);
                    }
                });
            }
        }
        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性
         */
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
        /**
         * 查询字段值
         * @param name 		字段名，可以是多段式 如 a.b.c
         */
        query(name) {
            let data = this.data;
            let fa = name.split(".");
            for (let i = 0; i < fa.length && null !== data && typeof data === 'object'; i++) {
                if (data === undefined) {
                    return;
                }
                //是数组
                if (fa[i].charAt(fa[i].length - 1) === ']') {
                    let f = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    //处理单重或多重数组
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