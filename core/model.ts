// / <reference path="nodom.ts" />
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
         * 模型对应的模块id
         */
        moduleId: number;

        /**
         * 模型对应数据
         */
        data: any;
        /**
         * 模型字段集
         * 每个字段对象结构为{value:值[,handlers:观察器，观察器为模块方法名或函数]} 
         */
        fields: object = {};

        /**
         * @param data 		数据
         * @param module 	模块对象
         */
        constructor(data: any, module: Module) {
            this.fields = {};
            // modelId
            this.id = Util.genId();
            //添加到model工厂
            if (module) {
                this.moduleId = module.id;
                if (module.modelFactory) {
                    module.modelFactory.add(this.id,this);
                }
            }

            //如果data不存在，则初始化为空object
            if(!data || !Util.isObject(data) && !Util.isArray(data)){
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
                let module:Module = ModuleFactory.get(this.moduleId);
                // object或array需要创建新model
                if (Util.isObject(value) || Util.isArray(value)) {
                    new Model(value, module);
                }
                let model:Model = module.modelFactory.get(data.$modelId);
                if (model) {
                    //如果未定义setter和getter，则需要定义
                    let ds = Object.getOwnPropertyDescriptor(data,fn);
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
        update(field:string, value?:any) {
            let change:boolean = false;
            let module:Module = ModuleFactory.get(this.moduleId);
            //对象设置值
            if (Util.isString(field)) {
                let fieldObj = this.fields[field];
                if (!fieldObj){
                    fieldObj = {};  
                    this.fields[field] = fieldObj;
                }
                if(fieldObj.value !== value){
                    fieldObj.value = value;
                    //观察器执行
                    if(fieldObj.handlers && fieldObj.handlers.length>0){
                        for(let f of fieldObj.handlers){
                            //可能包括字符串和函数   
                            if(Util.isFunction(f)){
                                Util.apply(f, this, [module,field,value]);
                            }else if(Util.isString(f)){
                                let foo = module.methodFactory.get(f);
                                if(Util.isFunction(foo)){
                                    Util.apply(foo, this, [module,field,value]);
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
        getData(dirty?:boolean):any{
            // dirty，直接返回数据
            if(dirty){
                return this.data;
            }
            return copy(this.data);
            
            function copy(src){
                let dst;
                if(Util.isObject(src)){ //object
                    dst = new Object();
                    Object.getOwnPropertyNames(src).forEach((prop)=>{
                        if(prop.startsWith('$')){
                            return;
                        }
                        dst[prop] = copy(src);
                    });
                } else if(Util.isMap(src)){  //map
                    dst = new Map();
                    src.forEach((value,key)=>{
                        if(key.startsWith('$')){
                            return;
                        }
                        dst.set(key,copy(value));
                    });
                }else if(Util.isArray(src)){ //array
                    dst = new Array();
                    src.forEach(function(item,i){
                        dst[i] = copy(item);
                    });
                }else{   //common value
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
        watch(key:string,operate:string|Function,cancel?:boolean){
            let fieldObj = this.fields[key];
            if(!fieldObj){
                fieldObj = {};
                this.fields[key] = fieldObj;
            }
            if(!fieldObj.handlers){
                fieldObj.handlers = [];
            };
            let ind:number = fieldObj.handlers.indexOf(operate);
            if(cancel){ //取消watch方法
                if(ind!==-1){
                    fieldObj.handlers.splice(ind,1);
                }
            }else{ //添加watch
                if(ind === -1){
                    fieldObj.handlers.push(operate);
                }
            }
        }
        /**
         * 为对象添加setter
         */
        addSetterGetter(data:any) {
            let me = this;
            const excludes = ['$modelId'];
            if (Util.isObject(data)) {
                Util.getOwnProps(data).forEach((p)=>{
                    let v = data[p];
                    if (Util.isObject(v) || Util.isArray(v)) {
                        new Model(v, ModuleFactory.get(this.moduleId));
                    } else {
                        this.update(p, v);
                        if(!excludes.includes(p)){
                            this.defineProp(data, p);
                        }
                    }
                });
            } else if (Util.isArray(data)) {
                //监听数组事件
                let watcher:Array<string> = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
                let module:Module = ModuleFactory.get(this.moduleId);
                //添加自定义事件，绑定改变事件
                watcher.forEach((item) => {
                    data[item] = function(){
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
                            if (Util.isObject(arg) || Util.isArray(arg)) {
                                new Model(arg, module);
                            }
                        });
                        //增加渲染
                        Renderer.add(ModuleFactory.get(me.moduleId));
                    }
                });

                //设置model
                data.forEach((item) => {
                    if (Util.isObject(item) || Util.isArray(item)) {
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
        defineProp(data:any, p:string) {
            Object.defineProperty(data, p, {
                set: (v)=> {
                    if (this.fields[p] && this.fields[p].value === v) {
                        return;
                    }
                    this.update(p, v);
                    data[p] = v;
                },
                get: ()=> {
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