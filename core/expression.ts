// / <reference path="nodom.ts" />
namespace nodom {
	/**
	 * 表达式类
	 */
    export class Expression {
		/**
		 * 表达式id
		 */
		id:number;

		/**
		 * 字段数组
		 */
		fields:Array<string>;

        /**
         * 执行函数
         */
        execFunc:Function;

        //替代串
        static REP_STR:string='$$NODOM_TMPSTR';
        
        /**
         * 字符串替换map
         */
        replaceMap:Map<string,string> = new Map();
		
        /**
         * @param exprStr	表达式串
         */
        constructor(exprStr?:string) {
            this.fields = []; // 字段数组
            this.id = Util.genId();
            let execStr:string;
            if (exprStr) {
                execStr = this.compile(exprStr);
            }
            
            if(execStr){
                let v:string = this.fields.length>0?','+this.fields.join(','):'';
                execStr = 'function($module' + v + '){return ' + execStr + '}';
                this.execFunc = eval('('+ execStr +')');
            }
        }

        /**
         * 克隆
         */
        clone(){
            return this;
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
            let index:number = 0;
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
         * @returns             指令执行字符串
         */
        private genExecStr(arrOperator:string[],arrOperand:string[]):string{
            let retStr:string = '';
            for(;arrOperator.length>1;){
                //操作数
                let opr:string = arrOperator.pop();
                //操作符
                let opd:string = arrOperand.pop();
                
                let r:string;
                let handled:boolean = false;
                if(opd === '('){
                    r = this.judgeAndHandleFunc(arrOperator);
                    if(r !== undefined){
                        //模块方法,挨着方法名的那个括号不需要
                        if (r.startsWith('$module')) {
                            opd = '';
                        }
                        if (opr !== '' && !this.addField(opr)) {
                            opr = this.recoveryString(opr);
                        }

                        retStr = r + opd + opr + retStr;
                        
                        //函数作为一个整体操作数，把前一个操作符补上
                        if(arrOperand.length>0){
                            retStr = arrOperand.pop() + retStr;
                        }
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
            return retStr;    
        }

         /**
         * 还原字符串
         * 从$$NODOM_TMPSTR还原为源串
         * @param str   待还原字符串
         * @returns     还原后的字符串
         */
        private recoveryString(str:string):string{
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
         * @returns             转换后的串
         */
        private judgeAndHandleFunc(arrOperator:string[]):string{
            let sp:string = arrOperator[arrOperator.length-1];
            if(sp && sp!==''){
                //字符串阶段
                arrOperator.pop();
                //module 函数
                if(sp.startsWith('$')){
                    return '$module.methodFactory.get("' + sp.substr(1) + '").call($module,';
                }else{
                    return sp;
                }
            }
        }

        /**
         * 判断并处理过滤器
         * @param arrOperator   操作数数组
         * @param arrOperand    操作符数组
         * @param srcOp         前操作数
         * @returns             过滤器串
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
                    v = this.recoveryString(v);
                    if(!Util.isNumberString(v)){
                        sa[i] = '"' + v + '"';
                    }
                });

                //过滤器参数串
                let paramStr:string = sa.length>0?','+sa.join(','):'';
                
                //过滤器待处理区域
                let filterValue:string = '';
                let opr:string = arrOperator[arrOperator.length-1];
                if(opr!==''){ //过滤字段或常量
                    if(!this.addField(opr)){
                        opr = this.recoveryString(opr);
                    }
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
                            //函数名
                            a1.unshift(arrOperator.pop());
                            break;
                        }
                    }
                    filterValue = this.genExecStr(a1,a2);
                }
                return 'nodom.FilterManager.exec($module,"'+ ftype + '",' + filterValue + paramStr + ')';
            }
        }
        
        /**
         * 表达式计算
         * @param model 	模型 或 fieldObj对象 
		 * @returns 		计算结果
         */
        val(model:Model) {
            if (!model || !model.data) { 
				return ''; 
			}
            let module:Module = ModuleFactory.get(model.moduleId);
            let fieldObj:object = model.data;
            
            let valueArr = [];
            this.fields.forEach((field) => {
                valueArr.push(getFieldValue(module,fieldObj,field));
            });
            //module作为第一个参数
            valueArr.unshift(module);
            
            try{
                return this.execFunc.apply(null,valueArr);
            }catch(e){
                console.log(e);
            }
            
            /**
             * 获取字段值
             * @param module    模块
             * @param dataObj   数据对象 
             * @param field     字段名
             * @return          字段值
             */
            function getFieldValue(module:Module,dataObj:object,field:string){
                if(dataObj.hasOwnProperty(field)){
                    return dataObj[field];
                }
                //$开头，则从根开始找
                if(field.startsWith('$$')){
                    return module.model.query(field.substr(2));
                }
            }
        }

        /**
         * 添加字段到fields
         * @param field 	字段
         * @returns         true/false
         */
        private addField(field:string):boolean{
            //js 保留字
            const jsKeyWords = ['true','false','undefined','null','typeof',
                    'Object','Function','Array','Number', 'Date',
                    'instanceof','NaN'];
            
            if(field === '' || jsKeyWords.includes(field) || field.startsWith(Expression.REP_STR) || Util.isNumberString(field)){
                return false;
            }
            //多级字段只保留第一级，如 x.y只保留x
            let ind:number;
            if((ind=field.indexOf('.')) !== -1){
                field = field.substr(0,ind);
            }
            if (!this.fields.includes(field)) {
                this.fields.push(field);
            }
            return true;
        }
    }
}