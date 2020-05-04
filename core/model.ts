/// <reference path="nodom.ts" />
namespace nodom {
    /**
     * 模型类
     */
    export class Model {
        /**
         * 模型id（唯一）
         */
        id: number;
        /**
         * 模型对应的模块名
         */
        moduleName: string;

        /**
         * 模型对应数据
         */
        data: object;
        /**
         * 模型字段集
         */
        fields: object = {};

        /**
         * @param data 		数据
         * @param module 	模块对象
         */
        constructor(data: any, module: Module) {
            this.data = data;
            this.fields = {};
            // modelId
            this.id = nodom.Util.genId();
            //添加到model工厂
            if (module) {
                this.moduleName = module.name;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id+'',this);
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
        set(key:string, value:any) {
            let fn, data;
            let index:number = key.lastIndexOf('.');
            if (index !== -1) { //key中有“.”
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                data = this.query(key);
            } else {
                fn = key;
                data = this.data;
            }

            //数据不存在
            if (data === undefined) {
                throw new NodomError('notexist1', TipWords.dataItem, key);
            }

            if (data[fn] !== value) {
                let module:Module = ModuleFactory.get(this.moduleName);
                // object或array需要创建新model
                if (Util.isObject(value) || Util.isArray(value)) {
                    new Model(value, module);
                }
                let model:Model = module.modelFactory.get(data.$modelId);
                if (model) {
                    //如果不存在，则需要定义 set 方法
                    if (data[fn] === undefined) {
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
        update(field:string, value?:any) {
            let change = false;

            //对象设置值
            if (Util.isString(field)) {
                if (this.fields[field] !== value) {
                    this.fields[field] = value;
                    change = true;
                }
            }
            //添加到模块数据改变
            if (change) {
                ModuleFactory.get(this.moduleName).dataChange();
            }
        }
        /**
         * 为对象添加setter
         */
        addSetterGetter(data:any) {
            if (Util.isObject(data)) {
                Util.getOwnProps(data).forEach((p)=>{
                    let v = data[p];
                    if (Util.isObject(v) || Util.isArray(v)) {
                        new Model(v, ModuleFactory.get(this.moduleName));
                    } else {
                        this.update(p, v);
                        this.defineProp(data, p);
                    }
                });
            } else if (Util.isArray(data)) {
                //监听数组事件
                let watcher:Array<string> = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module:Module = ModuleFactory.get(this.moduleName);
                //添加自定义事件，绑定改变事件
                watcher.forEach((item) => {
                    data[item] = ()=> {
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
                            // module.deleteData(data[data.length - 1].$modelId);
                            break;
                        case 'shift':
                            // module.deleteData(data[0].$modelId);
                            break;
                        }
                        this.update(data);
                        Array.prototype[item].apply(data, arguments);
                        //递归创建新model
                        args.forEach((arg) => {
                            if (Util.isObject(arg) || Util.isArray(arg)) {
                                new Model(arg, ModuleFactory.get(this.moduleName));
                            }
                        });
                    }
                });

                //设置model
                data.forEach((item) => {
                    if (Util.isObject(item) || Util.isArray(item)) {
                        new Model(item, ModuleFactory.get(this.moduleName));
                    }
                });
            }
        }

        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性
         */
        defineProp(data:any, p:string) {
            Object.defineProperty(data, p, {
                set: (v)=> {
                    if (this.fields[p] === v) {
                        return;
                    }
                    this.update(p, v);
                    data[p] = v;
                },
                get: ()=> {
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
        query(name:string) {
            let data:any = this.data;
            let fa:Array<string> = name.split(".");
            for (let i = 0; i < fa.length && null !== data && typeof data === 'object'; i++) {
                if (data === undefined) {
                    return;
                }
                //是数组
                if (fa[i].charAt(fa[i].length - 1) === ']') {
                    let f:Array<string> = fa[i].split('[');
                    data = data[f[0]];
                    f.shift();
                    //处理单重或多重数组
                    f.forEach((istr) => {
                        let ind = istr.substr(0, istr.length - 1);
                        data = data[parseInt(ind)];
                    });
                } else {
                    data = data[fa[i]];
                }
            }
            return data;
        }
    }
}