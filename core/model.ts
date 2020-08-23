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
         * 模型对应数据，初始化后，data会增加“$modelId”数据项
         */
        data: any;

        /**
         * 模型字段集
         * 每个字段对象结构为{value:值[,handlers:观察器，观察器为模块方法名或函数]} 
         */
        fields: object = {};

        /**
         * 父model
         */
        parent:Model;

        /**
         * 子model
         */
        children:object|Array<Model>;

        /**
         * @param data 		数据
         * @param module 	模块对象
         * @param parent    父model
         */
        constructor(data: any, module: Module,parent?:Model,key?:string) {
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
            this.data = data;
            this.addSetterGetter(data);
            
            //添加到父模块
            if(parent){
                this.parent = parent;
                if(Util.isArray(parent.data)){
                    if(!parent.children){
                        parent.children = [];
                    }
                    (<Model[]>parent.children).push(this);
                }else if(key){ //object
                    if(!parent.children){
                        parent.children = {};
                    }
                    parent.children[key] = this;
                }
            }
        }

        /**
         * 设置属性，可能属性之前不存在，用于在初始化不存在的属性增强model能力
         * @param key       键，可以带“.”，如a, a.b.c
         * @param value     对应值
         */
        set(key:string, value:any) {
            let fn;
            let index:number = key.lastIndexOf('.');
            let model:Model;
            if (index !== -1) { //key中有“.”
                fn = key.substr(index + 1);
                key = key.substr(0, index);
                model = this.get(key);
            } else {
                fn = key;
                model = this;
            }

            //数据不存在
            if (!model) {
                throw new NodomError('notexist1', TipMsg.TipWords['dataItem'], key);
            }

            let retMdl:Model;
            let data = model.data;

            if (data[fn] !== value) {
                let module:Module = ModuleFactory.get(this.moduleId);
                // object或array需要创建新model
                if (Util.isObject(value) || Util.isArray(value)) {
                    retMdl = new Model(value, module,model,fn);
                }    
                
                //如果未定义setter和getter，则需要定义
                let ds = Object.getOwnPropertyDescriptor(data,fn);
                if (ds === undefined || ds['writable']) {
                    model.defineProp(data, fn);
                }
                model.update(fn, value);
                data[fn] = value;
            }
            //如果产生新model，则返回新model，否则返回自己
            return retMdl || model;
        }

        /**
         * 获取子孙model
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        get(key:string|number):Model{
            if(typeof key === 'number'){
                if(Util.isArray(this.children)){
                    let arr:Model[] = <Model[]>this.children;
                    if(arr.length>key){
                        return arr[key];
                    }
                }
            }else{
                let arr = key.split('.');
                let mdl:Model = this;
                for(let i=0;i<arr.length && mdl;i++){
                    if(mdl.children){
                        mdl = mdl.children[arr[i]];
                    }else{
                        return;
                    }
                }    
                return mdl;
            }
        }

        /**
         * 删除属性
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        del(key:string|number) {
            let fn;
            let mdl:Model;
            //索引号
            if(typeof key === 'number'){
                if(Util.isArray(this.children)){
                    //从模型树删除
                    (<Model[]>this.children).splice(key,1);
                    //从数据删除
                    this.data.splice(key,1);
                }
            }else{ //带.的key
                let k1:string = <string>key;
                let index:number = k1.lastIndexOf('.');
                if(index === -1){
                    mdl = this;
                    fn = k1;
                }else{
                    mdl = this.get(k1.substr(0,index));
                    fn = k1.substr(index + 1);
                }
                //从模型树删除
                delete mdl.children[fn];
                // 从数据删除
                delete this.data[fn];
            }
        }
        /**
         * 更新字段值
         * @param field 	字段名或空(数组更新)
         * @param value 	字段对应的新值
         */
        private update(field:string, value?:any) {
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
         * 获取数据
         * @param key   键(对象)或index(数组)，键可以多级，如a.b.c
         */
        query(key:string){
            if(typeof key === 'number'){
                if(Util.isArray(this.data)){
                    return this.data[key];
                }
            }else{ //带.的key
                let k1:string = <string>key;
                let index:number = k1.lastIndexOf('.');
                let mdl:Model;
                let fn:string;
                if(index === -1){
                    mdl = this;
                    fn = k1;
                }else{
                    mdl = this.get(k1.substr(0,index));
                    fn = k1.substr(index + 1);
                }
                if(mdl && fn){
                    return mdl.data[fn];
                }
            }
        }

        /**
         * 获取所有数据
         * @param dirty   是否获取脏数据（"$"开头数据项，这类数据项由nodom生成）
         */
        getData(dirty?:boolean):any{
            // dirty，直接返回数据
            if(dirty){
                return this.data;
            }
            return Util.clone(this.data,/^\$\S+/);
        }

        /**
         * 观察(取消观察)某个数据项
         * @param key       数据项名    
         * @param operate   数据项变化时执行方法名(在module的methods中定义)
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
         * @param data  数据
         */
        private addSetterGetter(data:any) {
            let me = this;
            let module:Module = ModuleFactory.get(this.moduleId);
                
            if (Util.isObject(data)) {
                Util.getOwnProps(data).forEach((p)=>{
                    let v = data[p];
                    if (Util.isObject(v) || Util.isArray(v)) {
                        new Model(v, module,this,p);
                    } else {
                        this.update(p, v);
                        this.defineProp(data, p);
                    }
                });
            } else if (Util.isArray(data)) {
                //监听数组事件
                let watcher:Array<string> = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'];
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
                                new Model(arg, module,me);
                            }
                        });
                        //增加渲染
                        Renderer.add(ModuleFactory.get(me.moduleId));
                    }
                });

                //设置model
                data.forEach((item) => {
                    if (Util.isObject(item) || Util.isArray(item)) {
                        new Model(item, module,me);
                    }
                });
            }
        }

        /**
         * 定义属性set和get方法
         * @param data 	数据对象
         * @param p 	属性名
         */
        private defineProp(data:any, p:string) {
            Object.defineProperty(data, p, {
                configurable:true,
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
    }
}