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
         * 执行字符串，编译后生成
         */
        execString:string;
		/**
		 * 一个expression可能被多次使用，以modelid进行区分，针对不同的模型id构建对象{modelId:{fieldValue:,value:}
		 */
		modelMap:object={};

        //替代串
        static REP_STR:string='$$NODOM_TMPSTR';
        
        /**
         * 字符串替换map
         */
        replaceMap:Map<string,string> = new Map();
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
                this.execString = this.compile(exprStr);
            }
            if(this.execString){
                let v:string = this.fields.length>0?','+this.fields.join(','):'';
                console.log('(function($module' + v + '){return ' + this.execString + '})');
                this.execFunc = eval('(function($module' + v + '){return ' + this.execString + '})');
            }
        }

        /**
         * 初始化，把表达式串转换成堆栈
         * @param exprStr 	表达式串
         */
        compile(exprStr:string):string {
            
            //字符串正则表达式
            let stringReg:RegExp[] = [/\".*?\"/,/'.*?'/,/`.*?`/];
            let quotReg:RegExp[] = [/\\"/g,/\\'/g,/\\`/g];
            let quotStr = ['$$$$NODOM_QUOT1','$$$$NODOM_QUOT2','$$$$NODOM_QUOT3'];
            //字符串替换map {$$NODOM_TMPSTRn:str,...}
            let srcStr = exprStr;
            let replaceIndex:number = 0;
            //去掉内部 \" \' \`
            for(let i=0;i<3;i++){
                srcStr = srcStr.replace(quotReg[i],quotStr[i]);
            }

            //替换字符串
            for(;;){
                let r:RegExpExecArray;
                for(let reg of stringReg){
                    let r1:RegExpExecArray = reg.exec(srcStr);
                    if(!r1){
                        continue;
                    }
                    if(!r || r.index > r1.index){
                        r = r1;
                    }
                }
                if(!r){
                    break;
                }
                let sTmp = Expression.REP_STR + replaceIndex++;
                //存入map
                this.replaceMap.set(sTmp,r[0]);
                //用替代串替换源串内容srcStr
                srcStr = srcStr.substr(0,r.index) + sTmp + srcStr.substr(r.index + r[0].length);
            }

            //去掉空格
            srcStr = srcStr.replace(/\s+/g,'');

            //按操作符分组
            //操作数数组
            let arrOperator:Array<string> = srcStr.split(/[\(\)\!\|\*\/\+\-><=&%]/);
            //操作符数组
            let arrOperand:Array<string> = [];
            let index:number = arrOperator[0]===''? -1:0;
            for(let sp of arrOperator){
                index += sp.length;
                let ch:string = srcStr.charAt(index++);
                if(ch !== ''){
                    arrOperand.push(ch);
                }
            }
            return this.genExecStr(arrOperator,arrOperand);
        }

        /**
         * 生成执行串
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         */
        private genExecStr(arrOperator:string[],arrOperand:string[]):string{
            let retStr:string = '';
            for(;arrOperator.length>1;){
                //操作数
                let opr:string = arrOperator.pop();
                //操作符
                let opd = arrOperand.pop();
                
                if(opr === ''){
                    retStr = opd + retStr;
                    continue;
                }
                
                let r:string;
                let handled:boolean = false;
                if(opd === '('){
                    if(!this.addField(opr)){
                        //还原字符串
                        opr = this.recoveryString(opr);
                    }
                    r = this.judgeAndHandleFunc(arrOperator,arrOperand);
                    if(r !== undefined){
                        retStr = r + opd + opr + retStr;
                        handled = true;
                    }
                }else if(opd === '|'){
                    r = this.judgeAndHandleFilter(arrOperator,arrOperand,opr);
                    if(r !== undefined){
                        retStr = (arrOperand.length>0?arrOperand.pop():'') + r + retStr;
                        handled = true;
                    }
                }

                if(!handled){
                    if(!this.addField(opr)){
                        //还原字符串
                        opr = this.recoveryString(opr);
                    }
                    retStr = opd + opr + retStr;
                }
            }
            //第一个
            if(arrOperator.length>0){
                let opr:string = arrOperator.pop();
                if(opr !== ''){
                    if(!this.addField(opr)){
                        //还原字符串
                        opr = this.recoveryString(opr);
                    }
                    retStr = opr + retStr;
                }
                
            }
            console.log(retStr);
            return retStr;    
        }

         /**
         * 还原字符串
         * 从$$NODOM_TMPSTR还原为源串
         * @param str   待还原字符串
         * @returns     还原后的字符串
         */
        private recoveryString(str:string){
            if(str.startsWith(Expression.REP_STR)){
                if(this.replaceMap.has(str)){
                    str = this.replaceMap.get(str);
                    str = str.replace(/\$\$NODOM_QUOT1/g,'\\"');
                    str = str.replace(/\$\$NODOM_QUOT2/g,"\\'");
                    str = str.replace(/\$\$NODOM_QUOT3/g,'\\`');
                }
            }

            return str;
        }
        /**
         * 判断并处理函数
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         * @returns     转换后的串
         */
        private judgeAndHandleFunc(arrOperator:string[],arrOperand:string[]):string{
            let sp:string = arrOperator[arrOperator.length-1];
            
            if(sp && sp!==''){
                //字符串阶段
                arrOperator.pop();
                //module 函数
                if(sp.startsWith('$')){
                    return '$module.methodFactory.get("' + sp.substr(1) + '")';
                }else{
                    return sp;
                }
            }
        }

        /**
         * 判断并处理过滤器
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         * @returns     函数串
         */
        private judgeAndHandleFilter(arrOperator:string[],arrOperand:string[],srcOp:string):string{
            //判断过滤器并处理
            if(srcOp.startsWith(Expression.REP_STR) || Util.isNumberString(srcOp)){
                return;
            }
            let sa:string[] = FilterManager.explain(srcOp);
            //过滤器
            if(sa.length>1 || FilterManager.hasType(sa[0])){
                let ftype:string = sa[0];
                sa.shift();
                //参数如果不是数字，需要加上引号
                sa.forEach((v,i)=>{
                    if(!Util.isNumberString(v)){
                        sa[i] = '"' + v + '"';
                    }
                });

                //过滤器参数串
                let paramStr:string = sa.length>0?','+sa.join(','):'';
                
                //过滤器待处理区域
                let filterValue:string = '';
                let opr:string = arrOperator[arrOperator.length-1];
                if(opr!==''){
                    this.addField(opr);
                    filterValue = opr;
                    arrOperator.pop();
                }else if(arrOperand.length>2 && arrOperand[arrOperand.length-1] === ')'){ //过滤器待处理部分带括号
                    let quotNum:number = 1;
                    let a1:string[] = [arrOperator.pop()];
                    let a2:string[] = [arrOperand.pop()];
                    for(let i=arrOperand.length-1;i>=0;i--){
                        if(arrOperand[i] === '('){
                            quotNum--;
                        }else if(arrOperand[i] === ')'){
                            quotNum++;
                        }
                        a1.unshift(arrOperator.pop());
                        a2.unshift(arrOperand.pop());
                        if(quotNum === 0){
                            //函数
                            if(arrOperator[arrOperator.length-1] !== ''){
                                a1.unshift(arrOperator.pop());
                            }
                            break;
                        }
                    }
                    filterValue = this.genExecStr(a1,a2);

                }
                console.log('nodom.FilterManager.exec($module,"'+ ftype + '",' + filterValue + paramStr + ')');
                return 'nodom.FilterManager.exec($module,"'+ ftype + '",' + filterValue + paramStr + ')';
            }
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
                console.log(valueArr,this.execFunc);
                this.modelMap[model.id].value = this.execFunc.apply(null,valueArr);
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
            if(field === '' || field.startsWith(Expression.REP_STR) || Util.isNumberString(field)){
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