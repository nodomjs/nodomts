/// <reference path="nodom.ts" />
namespace nodom {
	/**
	 * 堆栈Item
	 */
	interface IStatckItem{
		/**
		 * item类型
         * 包括：field(字段),string(字符串),operand(操作符),function(函数),filter(过滤器)
		 */
		type: string,

		/**
		 * 值
		 */
		val: any,

		/**
		 * 参数数组
		 */
		params?: Array<any>;

		/**
		 * 过滤器
		 */
        filter?:Filter;
        
        /**
         * 附加值，不通类型不同
         */
        extra?:any;
	}

	/**
	 * 表达式类
	 */
    export class Expression {
		/**
		 * 表达式id
		 */
		id:number;

		/**
		 * 模块名
		 */
		moduleName:string;

		/**
		 * 堆栈数组
		 */
		// stack:Array<IStatckItem>;

		/**
		 * 字段数组
		 */
		fields:Array<string>;

        /**
         * 执行函数
         */
        execFunc:Function;
		/**
		 * 一个expression可能被多次使用，以modelid进行区分，针对不同的模型id构建对象{modelId:{fieldValue:,value:}
		 */
		modelMap:object={};

		/**
		 * 前置expressionId数组
		 */
		// pre:Array<number>;

        /**
         * @param exprStr	表达式串
		 * @param module 	模块
         */
        constructor(exprStr:string, module:Module) {
            //旧值
            this.fields = []; // 字段数组
            this.id = Util.genId();
            if (module) {
                this.moduleName = module.name;
                module.expressionFactory.add(this.id, this);
            }

            if (exprStr) {
                this.init(exprStr);
            }
        }

        /**
         * 初始化，把表达式串转换成堆栈
         * @param exprStr 	表达式串
         */
        init(exprStr:string):void {
            //字符串开始
            let startStr:string;
            let type:number = 0; // 1字符串 2变量 3函数 4过滤器
            //字符串开始结束符
            let strings:string = "'`\"";
            //运算符
            let operand:string = "()!|*/+-><=&%";
            let spaceChar:string = " 	";
            
            //堆栈
			let stack:Array<IStatckItem>=[];
			let sTmp:string = '';
            for (let i = 0; i < exprStr.length; i++) {
                let c:string = exprStr[i];
                //变量和函数的空格不处理
                if ((type !== 1) && spaceChar.indexOf(c) !== -1) {
                    continue;
                }
                switch (type) {
                case 1: //当前为字符串
                    //字符串标识
                    if (strings.indexOf(c) !== -1) {
                        if (c === startStr) {
                            this.addStr(sTmp + c,stack);
                            startStr = undefined;
                            sTmp = '';
                            type = 0;
                            continue;
                        }
                    }
                    break;
                case 2: //当前为变量
                    if (operand.indexOf(c) !== -1) {
                        //转为函数
                        if (c === '(') {
                            type = 3;
                        } else { //变量结束
                            if(this.addField(sTmp)){
                                stack.push({
                                    val:sTmp,
                                    type:'field'
                                });
                            }else{
                                this.addStr(sTmp,stack);
                                
                            }
                            
                            
                            sTmp = '';
                            type = 0;
                        }
                    }
                    break;
                case 3: //当前为函数
                    if (c === ')') {
                        let a:Array<string> = sTmp.trim().split('(');
                        //函数名
                        let fn:string = a[0];

                        //参数
                        let pa = a[1].split(',');
                        for (let j = 0; j < pa.length; j++) {
                            let field = pa[j].trim();
                            pa[j] = field;

                            // 添加字段到集合 
                            this.addField(field);
                        }

                        //函数入栈
                        stack.push({
                            val: fn,
                            params: pa,
                            type: 'function'
                        });
                        sTmp = '';
                        type = 0;
                        continue;
                    }
                    break;
                default:
                    //字符串开始
                    if (strings.indexOf(c) !== -1) {
                        startStr = c;
                        type = 1;
                    } else if (operand.indexOf(c) === -1) { //变量开始
                        type = 2;
                        if (sTmp !== '') {
                            this.addStr(sTmp, stack);
                            sTmp = '';
                        }
                    }
                }

                //过滤器标志
                let isFilter:boolean = false;
                //过滤器
                if (c === '|') {
                    let j = i + 1;
                    let nextc:string = exprStr[j];
                    if (nextc >= 'a' && nextc <= 'z') {
                        let strCh = '';
                        for (; j < exprStr.length; j++) {
                            let ch = exprStr[j];
                            if (strings.indexOf(ch) !== -1) {
                                if (ch === strCh) { //字符串结束
                                    strCh = '';
                                } else {
                                    strCh = ch;
                                }

                            }
                            //遇到操作符且不在字符串内
                            if (strCh === '' && operand.indexOf(ch) !== -1) {
                                break;
                            }
                        }
                    }

                    if (j > i) {
                        let s:string = exprStr.substring(i + 1, j);
                        if (s !== '') {
                            // 过滤器串处理
                            let filterArr:string[] = FilterManager.explain(s);
                            //过滤器
                            if (FilterManager.hasType(filterArr[0])) {
                                this.addFilter(filterArr, stack);
                                c = '';
                                exprStr = '';
                                isFilter = true;
                            }
                        }
                    }
                }

                //操作符
                if (!isFilter && type !== 1 && type !== 3 && operand.indexOf(c) !== -1) {
                    this.addOperand(c, stack);
                } else {
                    sTmp += c;
                }
            }
            if (type === 2) { //变量处理
                this.addVar(sTmp, stack);
            } else if (type === 0 && sTmp !== '') { //字符串
                this.addStr(sTmp, stack);
            } else if (type !== 0) {
                //抛出表达式错误
                throw new NodomError('invoke', 'expression', '0', 'Node');
            }

            let bodyStr:string = this.genExprFuncStr(stack);
            let funcStr = '(function ($module,' + this.fields.join(',') + '){ return ' + bodyStr + '})';
            console.log(funcStr);
            this.execFunc = eval(funcStr);

        }

        /**
         * 生成表达式函数串
         * @param stack     操作堆栈
         * @param paramArr  参数数组
         * @returns         函数
         */
        private genExprFuncStr(stack:Array<IStatckItem>):string{
            //函数体串
            let bodyStr:string = '';

            stack.forEach((item) => {
                switch (item.type) {
                case 'string': //字符串
                    bodyStr += item.val;
                    break;
                case 'operand': //字符串
                    bodyStr += item.val;
                    break;
                case 'field': //变量
                    bodyStr += item.val;
                    break;
                case 'function': //函数
                    //函数名
                    let fName:string = item.val;
                    //模块方法以$开头
                    if (item.val.startsWith('$')) {
                        fName = '$module.methodFactory.get("' + item.val.substr(1) + '")';
                    }
                    bodyStr += fName + '(' + item.params.join(',') + ')';
                    break;
                case 'filter':
                    let arr = item.extra;
                    let ftype = arr.shift();
                    let v = '';
                    if(arr.length>0){
                        v = ',' + arr.join(',');
                    }
                    bodyStr += 'nodom.FilterManager.exec($module,'+ ftype + ',' + item.val + v + ')';
                }
            });
            
            return bodyStr;
        }
        /**
         * 表达式计算
         * @param model 	模型 或 fieldObj对象 
         * @param modelId 	模型id（model为fieldObj时不能为空）
		 * @returns 		计算结果
         */
        val(model:Model) {
            if (!model) { 
				return ''; 
			}
            let module:Module = ModuleFactory.get(model.moduleName);
            
            let fieldObj:object = model.data;
            let newFieldValue:string = '';
            let valueArr = [];
            this.fields.forEach((field) => {
                valueArr.push(fieldObj[field]);
            });
            //如果对应模型的值对象不存在，需要新建
            if (this.modelMap[model.id] === undefined) {
                this.modelMap[model.id] = Object.create(null);
            }
            newFieldValue = valueArr.join(',');
            //field值不一样，需要重新计算
            if (this.modelMap[model.id].fieldValue !== newFieldValue) {
                this.modelMap[model.id].fieldValue = newFieldValue;
                valueArr.unshift(module);
                this.modelMap[model.id].value = this.execFunc.apply(this,valueArr);
            }
            //返回实际计算值
            return this.modelMap[model.id].value;
        }

        /**
         * 添加变量
		 * @param field 	字段
		 * @param statc 	堆栈
         */
        private addVar(field:string, stack:Array<IStatckItem>) {
            let values:Array<string> = ['null', 'undefined', 'true', 'false', 'NaN'];
            //判断是否为值表达式 null undefined true false
            let addFlag:boolean = values.indexOf(field) === -1 ? false : true;
            addFlag = addFlag || Util.isNumberString(field);
            field = field.trim();
            //作为字符串处理   
            if(!this.addField(field)){
                stack.push({
                    val: field,
                    type: 'field'
                });
            } else {
                this.addStr(field, stack);
            }
        }

        /**
		 * 添加字符串
		 * @param str 		待添加字符串
		 * @param stack 	堆栈
		 */
        private addStr(str:string, stack:Array<IStatckItem>) {
            //如果前一个类型为字符串，则追加到前一个
            if (stack.length > 0 && stack[stack.length - 1].type === "string") {
                stack[stack.length - 1].val += str;
            } else {
                stack.push({
                    val: str,
                    type: 'string'
                });
            }
        }

		/**
		 * 添加操作符
		 * @param str 		操作符
		 * @param stack 	堆栈
		 */
        private addOperand(str:string, stack:Array<IStatckItem>) {
            stack.push({
                val: str, //去掉字符串两端的空格
                type: 'operand'
            });
        }

        /**
         * 添加过滤器
         * @param filterArr	过滤器数组
         * @param stack 	堆栈
         */
        private addFilter(filterArr:Array<string>, stack:Array<IStatckItem>) {
            if (stack.length > 0) {
                let filterStack:Array<IStatckItem> = []; //过滤器堆栈
                let pre = stack[stack.length - 1];
                let type = pre.type;

                //字段、函数、不带括号的字符串
                if (type === 'field' || type === 'function' || type === 'string') {
                    filterStack.push(stack.pop());
                } else if (type === 'operand' && pre.val === ')') { //括号操作符
                    //匹配括号对
                    let cnt = 1;
                    let j = stack.length - 2;
                    for (; j >= 0; j--) {
                        // filterStack.unshift(stack[j].pop);
                        if (stack[j].val === '(') {
                            if (--cnt === 0) {
                                break;
                            }
                        } else if (stack[j].val === ')') {
                            cnt++;
                        }
                    }
                    //拷贝堆栈元素
                    filterStack = stack.slice(j, stack.length);
                    //删除堆栈元素
                    stack.splice(j, stack.length - j);
                }
                let valStr = this.genExprFuncStr(filterStack);
                //加上字符串标识
                for(let i=0;i<filterArr.length;i++){
                    let f = filterArr[i];
                    if(!Util.isNumberString(f)){
                        filterArr[i] = Util.addStrQuot(f);        
                    }
                }
                // 过滤器入栈
                stack.push({
                    type: 'filter',
                    extra:filterArr,
                    val: valStr
                });

            }
        }

        /**
         * 计算堆栈
         * @param stack 	堆栈
         * @param fieldObj 	字段对象
		 * @param modelId 	模型id
		 * @returns 		计算结果
         */
        cacStack(stack:Array<IStatckItem>, fieldObj:any, modelId?:number):string{
            let retStr:string = '';
            let needEval:boolean = false;
            let module:Module = ModuleFactory.get(this.moduleName);

            stack.forEach((item) => {
                let value:string = '';
                switch (item.type) {
                case 'string': //字符串
                    retStr += item.val;
                    break;
                case 'operand': //字符串
                    retStr += item.val;
                    needEval = true;
                    break;
                case 'field': //变量
                    value = fieldObj[item.val];
                    //字符串需要处理
                    if (Util.isString(value)) {
                        value = Util.addStrQuot(value);
                    }
                    retStr += value;
                    break;
                case 'function': //函数
                    let foo:Function = module.methodFactory.get(item.val);
                    let param:Array<any> = [];
                    if (item.params.length > 0) {
                        item.params.forEach((p) => {
                            let pv = fieldObj[p];
                            let isVal = false;
                            //非数字和值，字符串两边添加引号
                            if (Util.isString(pv) && pv !== '') {
                                pv = Util.addStrQuot(pv);
                            }
                            param.push(pv);
                        });
                    }
                    if (foo !== undefined && Util.isFunction(foo)) {
                        value = foo.apply(module.model, param);
                    } else { //系统函数
                        value = item.val + '(' + param.join(',') + ')';
                        needEval = true;
                    }
                    retStr += value;
                    break;
                case 'filter':
                    // 作为前一轮已经计算
                    value = module.expressionFactory.get(item.val).val(fieldObj, modelId);
                    value = item.filter.exec(value, module);
                    if (typeof value === 'object') { //对象，直接赋值，不做加法
                        retStr = value;
                    } else {
                        //字符串
                        if (Util.isString(value) && value !== '') {
                            value = Util.addStrQuot(value);
                        }
                        retStr += value;
                    }
                }
            });
            if (needEval) {
                try {
                    retStr = eval(retStr);
                } catch (e) {

                }
            } else if (Util.isString(retStr) && retStr.charAt(0) === '"') { //字符串去掉两边的"
                retStr = retStr.substring(1, retStr.length - 1);
            }
            //替换所有undefined为空
            if (retStr === undefined) {
                retStr = '';
            }
            return retStr;
        }

        /**
         * 添加字段到fields
         * @param field 	字段
         * @returns         true/false
         */
        addField(field:string):boolean{
            if(Util.isNumberString(field)){
                return false;
            }
            if (!this.fields.includes(field)) {
                this.fields.push(field);
            }
            return true;
        }
        /**
         * 获取field值
         * @param model 	模型，可为空
         * @param field 	字段，可以带.
		 * @returns 		字段值
         */
        getFieldValue(model:Model, field:string):any {
            let module:Module = ModuleFactory.get(this.moduleName);
            if (!model && module) {
                model = module.model;
            }
            if (!model) {
                return undefined;
            }
            let v = model.query(field);
            if (v === undefined && model !== module.model) {
                v = module.model.query(field);
            }
            return v;
        }
    }
}