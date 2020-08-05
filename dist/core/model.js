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
             * 每个字段对象结构为{value:值[,handlers:观察器，观察器为模块方法名或函数]}
             */
            this.fields = {};
            this.fields = {};
            // modelId
            this.id = nodom.Util.genId();
            //添加到model工厂
            if (module) {
                this.moduleId = module.id;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id, this);
                }
            }
            //如果data不存在，则初始化为空object
            if (!data || !nodom.Util.isObject(data) && !nodom.Util.isArray(data)) {
                data = {};
            }
            // 给data设置modelid
            data['$modelId'] = this.id;
            this.addSetterGetter(data);
            this.data = data;
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
                let module = nodom.ModuleFactory.get(this.moduleId);
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
            let module = nodom.ModuleFactory.get(this.moduleId);
            //对象设置值
            if (nodom.Util.isString(field)) {
                let fieldObj = this.fields[field];
                if (!fieldObj) {
                    fieldObj = {};
                    this.fields[field] = fieldObj;
                }
                if (fieldObj.value !== value) {
                    fieldObj.value = value;
                    //观察器执行
                    if (fieldObj.handlers && fieldObj.handlers.length > 0) {
                        for (let f of fieldObj.handlers) {
                            //可能包括字符串和函数   
                            if (nodom.Util.isFunction(f)) {
                                nodom.Util.apply(f, this, [module, field, value]);
                            }
                            else if (nodom.Util.isString(f)) {
                                let foo = module.methodFactory.get(f);
                                if (nodom.Util.isFunction(foo)) {
                                    nodom.Util.apply(foo, this, [module, field, value]);
                                }
                            }
                        }
                    }
                    change = true;
                }
            }
            //添加到模块数据改变
            if (change) {
                module.dataChange();
            }
        }
        /**
         * 获取所有数据
         * @param dirty   是否获取脏数据（带$数据，该数据由框架生成）
         */
        getData(dirty) {
            // dirty，直接返回数据
            if (dirty) {
                return this.data;
            }
            return copy(this.data);
            function copy(src) {
                let dst;
                if (nodom.Util.isObject(src)) { //object
                    dst = new Object();
                    Object.getOwnPropertyNames(src).forEach((prop) => {
                        if (prop.startsWith('$')) {
                            return;
                        }
                        dst[prop] = copy(src);
                    });
                }
                else if (nodom.Util.isMap(src)) { //map
                    dst = new Map();
                    src.forEach((value, key) => {
                        if (key.startsWith('$')) {
                            return;
                        }
                        dst.set(key, copy(value));
                    });
                }
                else if (nodom.Util.isArray(src)) { //array
                    dst = new Array();
                    src.forEach(function (item, i) {
                        dst[i] = copy(item);
                    });
                }
                else { //common value
                    dst = src;
                }
                return dst;
            }
        }
        /**
         * 观察(取消观察)某个数据项
         * @param key       数据项名
         * @param operate   变化时执行方法名(在module的methods中定义)
         * @param cancel    取消观察
         */
        watch(key, operate, cancel) {
            let fieldObj = this.fields[key];
            if (!fieldObj) {
                fieldObj = {};
                this.fields[key] = fieldObj;
            }
            if (!fieldObj.handlers) {
                fieldObj.handlers = [];
            }
            ;
            let ind = fieldObj.handlers.indexOf(operate);
            if (cancel) { //取消watch方法
                if (ind !== -1) {
                    fieldObj.handlers.splice(ind, 1);
                }
            }
            else { //添加watch
                if (ind === -1) {
                    fieldObj.handlers.push(operate);
                }
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
                        new Model(v, nodom.ModuleFactory.get(this.moduleId));
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
                let module = nodom.ModuleFactory.get(this.moduleId);
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
                        nodom.Renderer.add(nodom.ModuleFactory.get(me.moduleId));
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
                    if (this.fields[p] && this.fields[p].value === v) {
                        return;
                    }
                    this.update(p, v);
                    data[p] = v;
                },
                get: () => {
                    if (this.fields[p] !== undefined) {
                        return this.fields[p].value;
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