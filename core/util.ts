// / <reference path="nodom.ts" />
namespace nodom{
    /**
     * @description 基础服务库
     * @author      yanglei
     * @since       1.0.0
     * @create      2016-09-28
     */
    export class Util{
        static generatedId:number=1;
        //唯一主键
        static genId(){
            return this.generatedId++;
        }
        
        /******对象相关******/

        /**
         * 对象复制
         * @param srcObj    源对象
         * @param expKey    不复制的键正则表达式或名
         * @returns         复制的对象
         */

        clone(srcObj:object,expKey?:string|RegExp):object{
            let map = new WeakMap();
            let retObj = clone(srcObj);
            map = null;
            return retObj;

            /**
             * clone对象
             * @param src   待clone对象
             * @returns     克隆后的对象
             */
            function clone(src){
                let dst;
                if(this.isObject(src)){
                    dst = new Object();
                    //把对象加入map，如果后面有新克隆对象，则用新克隆对象进行覆盖
                    map.set(src,dst);
                    Object.getOwnPropertyNames(src).forEach((prop)=>{
                        //不克隆的键
                        if(expKey){
                            if(expKey.constructor === RegExp && (<RegExp>expKey).test(prop)       //正则表达式匹配的键不复制
                                || expKey.constructor === String && expKey === prop     //被排除的键不复制
                                ){
                                return;
                            }
                        }
                        //数组或对象继续克隆
                        if(this.isObject(src[prop]) || this.isArray(src[prop])){
                            let co = null;
                            if(!map.has(src[prop])){  //clone新对象
                                co = clone(src[prop]);
                                //存储已克隆对象，避免重复创建或对象相互引用带来的溢出
                                map.set(src[prop],co);
                            }else{                    //从map中获取对象
                                co = map.get(src[prop]);
                            }
                            dst[prop] = co;
                        }else{  //直接复制
                            dst[prop] = src[prop];
                        }
                    });
                } else if(this.isArray(src)){
                    dst = new Array();
                    //把对象加入map，如果后面有新克隆对象，则用新克隆对象进行覆盖
                    map.set(src,dst);
                
                    src.forEach(function(item,i){
                    if(this.isObject(item) || this.isArray(item)){
                            dst[i] = clone(item);
                        }else{  //直接复制
                            dst[i] = item;
                        } 
                    });
                }
                return dst;
            }
        }
        /**
         * 合并多个对象并返回
         * @param   参数数组
         * @returns 返回对象
         */
        static merge(){
            for(let i=0;i<arguments.length;i++){
                if(!this.isObject(arguments[i])){
                    throw new NodomError('invoke','this.merge',i+'','object');    
                }
            }

            let retObj = Object.assign.apply(null,arguments);
            
            subObj(retObj);
            return retObj;
            //处理子对象
            function subObj(retObj){
                for(let o in retObj){
                    if(this.isObject(retObj[o]) || this.isArray(retObj[o])){ //对象或数组
                        retObj[o] = retObj[o].clone();
                    }
                }
            }
        }

        
        /**
         * 把obj2对象所有属性赋值给obj1
         */
        static assign(obj1,obj2){
            if(Object.assign){
                Object.assign(obj1,obj2);
            }else{
                this.getOwnProps(obj2).forEach(function(p){
                    obj1[p] = obj2[p];
                });    
            }
            return obj1;
        }

        /**
         * 获取对象自有属性
         */
        static getOwnProps(obj):Array<string>{
            if(!obj){
                return [];
            }
            return Object.getOwnPropertyNames(obj);
        }
        /**************对象判断相关************/
        /**
         * 是否为函数
         * @param foo   检查的对象
         * @returns     true/false
         */
        static isFunction(foo):boolean{
            return foo !== undefined && foo !== null && foo.constructor === Function;
        }
        /**
         * 是否为数组
         * @param obj   检查的对象
         * @returns     true/false
         */
        static isArray(obj) :boolean{
            return Array.isArray(obj);
        }

        /**
         * 是否为对象
         * @param obj   检查的对象
         * @returns true/false
         */
        static isObject(obj):boolean {
            return obj !== null && obj !== undefined && obj.constructor === Object;
        }

        /**
         * 判断是否为整数
         * @param v 检查的值
         * @returns true/false
         */
        static isInt(v):boolean {
            return Number.isInteger(v);
        }
        /**
         * 判断是否为number
         * @param v 检查的值
         * @returns true/false
         */
        static isNumber(v):boolean{
            return typeof v === 'number';
        }

        /**
         * 判断是否为boolean
         * @param v 检查的值
         * @returns true/false
         */
        static isBoolean(v):boolean{
            return typeof v === 'boolean';
        }
        /**
         * 判断是否为字符串
         * @param v 检查的值
         * @returns true/false
         */
        static isString(v):boolean{
            return typeof v === 'string';
        }

        /**
         * 是否为数字串
         * @param v 检查的值
         * @returns true/false
         */
        static isNumberString(v):boolean{
            return /^\d+\.?\d*$/.test(v);
        }

        /**
         * 对象/字符串是否为空
         * @param obj   检查的对象
         * @returns     true/false
         */
        static isEmpty(obj):boolean{
            if(obj === null || obj === undefined)
                return true;
            let tp = typeof obj;
            if(this.isObject(obj)){
                let keys = Object.keys(obj);
                if(keys !== undefined){
                    return keys.length === 0;
                }
            }else if(tp === 'string'){
                return obj === '';
            }
            return false;
        }


        /***********************对象相关******************/

        /**
         * 找到符合符合属性值条件的对象（深度遍历）
         * @param obj       待查询对象
         * @param props     属性值对象
         * @param one       是否满足一个条件就可以，默认false
         */ 
        static findObjByProps(obj:object,props:object,one:boolean):Array<object>|object{
            if(!this.isObject(obj)){
                throw new NodomError('invoke','this.findObjByProps','0','Object');
            }

            //默认false
            one = one || false;
            let ps:Array<string> = this.getOwnProps(props);
            let find:boolean = false;
            if(one === false){  //所有条件都满足
                find = true;
                for(let i=0;i<ps.length;i++){
                    let p = ps[i];
                    if(obj[p] !== props[p]){
                        find = false;
                        break;
                    }
                }
            }else{              //一个条件满足
                for(let i=0;i<ps.length;i++){
                    let p = ps[i];
                    if(obj[p] === props[p]){
                        find = true;
                        break;
                    }
                }
            }
            if(find){
                return obj;
            }


            //子节点查找
            for(let p in obj){
                let o = obj[p];
                if(o !== null){
                    if(this.isObject(o)){      //子对象
                        //递归查找
                        let oprops = this.getOwnProps(o);
                        for(let i=0;i<oprops.length;i++){
                            let item = o[oprops[i]];
                            if(item !== null && this.isObject(item)){
                                let r = this.findObjByProps(item,props,one);
                                if(r !== null){
                                    return r;
                                }           
                            }
                        }
                    }else if(this.isArray(o)){ //数组对象
                        for(let i=0;i<o.length;i++){
                            let item = o[i];
                            if(item !== null && this.isObject(item)){
                                let r = this.findObjByProps(item,props,one);
                                if(r !== null){
                                    return r;
                                }
                            }
                        }
                    }
                }
            }
            return null;
        }

        /**********dom相关***********/
        /**
         * 获取dom节点
         * @param selector  选择器
         * @param findAll   是否获取所有，默认为false
         * @param pview     父html element
         * @returns         html element/null 或 nodelist或[]
         */
        static get(selector:string,findAll?:boolean,pview?:HTMLElement|Document):Node|NodeList{
            pview = pview || document;
            if(findAll === true){
                return pview.querySelectorAll(selector);
            }
            return pview.querySelector(selector);
        }

        /**
         * 追加子节点
         * @param el    父element
         * @param dom   要添加的dom节点或dom串
         */
        static append(el:HTMLElement,dom:Node|string){
            if(this.isNode(dom)){
                el.appendChild(<Node>dom);
            }else if(this.isString(dom)){
                let div:HTMLElement = this.newEl('div');
                div.innerHTML = <string>dom;
            }
        }
        /**
         * 是否为element
         * @param el    传入的对象
         * @returns     true/false
         */
        static isEl(el:any):boolean{
            return el instanceof HTMLElement;
        }

        /**
         * 是否为node
         * @param node 传入的对象
         * @returns true/false
         */
        static isNode(node:any):boolean{
            return node !== undefined && node !== null && (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE);  
        }
        
        /**
         * 新建dom
         * @param tagName   标签名
         * @param config    属性集合
         * @param text      innerText
         * @returns         新建的elelment
         */
        static newEl(tagName:string,config?:object,text?:string):HTMLElement{
            if(!this.isString(tagName) || this.isEmpty(tagName)){
                throw new NodomError('invoke','this.newEl','0','string');   
            }
            let el = document.createElement(tagName);
            if(this.isObject(config)){
                this.attr(el,config);
            }else if(this.isString(text)){
                el.innerHTML = text;
            }
            return el;
        }
        /**
         * 新建svg element
         * @param tagName   标签名
         * @returns         svg element
         */
        static newSvgEl(tagName):HTMLElement{
            return document.createElementNS("http://www.w3.org/2000/svg",tagName);
        }
        /**
         * 把srcNode替换为nodes
         * @param srcNode       源dom
         * @param nodes         替换的dom或dom数组
         */
        static replaceNode(srcNode:Node,nodes:Node|Array<Node>){
            if(!this.isNode(srcNode)){
                throw new NodomError('invoke','this.replaceNode','0','Node');
            }
            
            if(!this.isNode(nodes) && !this.isArray(nodes)){
                throw new NodomError('invoke1','this.replaceNode','1','Node','Node Array');
            }
            let pnode:Node = srcNode.parentNode;
            let bnode:Node = srcNode.nextSibling;
            if(pnode === null){
                return;
            }
            pnode.removeChild(srcNode);
            const nodeArr:Array<Node> = this.isArray(nodes)?<Node[]>nodes:[<Node>nodes];
            nodeArr.forEach(function(node){
                if(bnode === undefined || bnode === null){
                    pnode.appendChild(node);
                }else{
                    pnode.insertBefore(node,bnode);
                }
            });
        }
        /**
         * 在srcNode后面插入newNode,如果srcNode无效，则插入到第一个
         * @param newNode   新节点或数组
         * @param oldNode   旧节点
         */
        static insertAfter(newNode:Node|Array<Node>,srcNode:Node,pNode:Node){
            if(!this.isNode(newNode)){
                throw new NodomError('invoke','this.insertAfter','0','Node');
            }
            if(!this.isNode(srcNode) && !this.isNode(pNode)){
                throw new NodomError('invoke2','this.insertAfter','1','2','Node');
            }
            let bNode=null;
            //如果srcNode不存在，则添加在第一个位置
            if(srcNode === undefined || srcNode === null){
                bNode = pNode.firstChild;
            }else{
                pNode = srcNode.parentNode;
                bNode = srcNode.nextSibling;
            }
            if(!this.isNode(pNode)){
                return;
            }
            if(bNode === null){
                if(this.isArray(newNode)){
                    for(let n of <Array<Node>>newNode){
                        if(this.isEl(n)){
                            pNode.appendChild(n);
                        }
                    }
                }else{
                    pNode.appendChild(<Node>newNode);
                }
            }else{
                if(this.isArray(newNode)){
                    for(let n of <Array<Node>>newNode){
                        if(this.isEl(n)){
                            pNode.insertBefore(n,bNode);
                        }
                    }
                }else{
                    pNode.insertBefore(<Node>newNode,bNode);
                }
            }
        }

        /**
         * 清空子节点
         * @param el
         */
        static empty(el:HTMLElement){
            const me = this;
            if(!me.isEl(el)){
                throw new NodomError('invoke','this.empty','0','Element');
            }
            let nodes:NodeList = el.childNodes;
            for(let i=nodes.length-1;i>=0;i--){
                el.removeChild(nodes[i]);
            }
        }
        /**
         * 删除节点
         * @param node html node
         */
        static remove(node:Node){
            const me = this;
            if(!me.isNode(node)){
                throw new NodomError('invoke','this.remove','0','Node');
            }

            if(node.parentNode !== null){
                node.parentNode.removeChild(node);
            }
        }

        
        /**
         * 获取／设置属性
         * @param el    element
         * @param param 属性名，设置多个属性时用对象
         * @param value 属性值，获取属性时不需要设置
         * @returns     属性值
         */
        static attr(el:HTMLElement,param:string|object,value?:any):any{
            const me = this;
            if(!me.isEl(el)){
                throw new NodomError('invoke','this.attr','0','Element');
            }
            if(this.isEmpty(param)){
                throw new NodomError('invoke','this.attr','1','string','object');   
            }
            if(value === undefined || value === null){
                if(this.isObject(param)){ //设置多个属性
                    this.getOwnProps(param).forEach(function(k){
                        if(k === 'value'){
                            el[k] = param[k];
                        }else{
                            el.setAttribute(k,param[k]);
                        }
                    });
                }else if(this.isString(param)){ //获取属性
                    if(param === 'value'){
                        return param[value];
                    }
                    return el.getAttribute(<string>param);
                }
            }else { //设置属性
                if(param === 'value'){
                        el[param] = value;
                }else{
                    el.setAttribute(<string>param,value);
                }
            }
        }
        

        /**
         * 获取或设置宽度
         * @param el        elment
         * @param value     如果为false，则获取外部width(含padding)，否则获取内部width，如果为数字，则设置width=value + px
         */
        static width(el:HTMLElement,value?:number|boolean){
            if(!this.isEl(el)){
                throw new NodomError('invoke','nodom.width','0','Element');
            }
            if(this.isNumber(value)){
                el.style.width = value + 'px';
            }else{
                let compStyle;
                //ie 9+ firefox chrome safari
                if(window.getComputedStyle){
                    compStyle = window.getComputedStyle(el,null);
                }
                if(!compStyle){
                    return null;
                }
                let w = parseInt(compStyle['width']);
                if(value === true){
                    let pw = parseInt(compStyle['paddingLeft'])+parseInt(compStyle['paddingRight']);
                    w -= pw;    
                }
                return w;
            }
        }

        /**
         * 获取或设置高度
         * @param el        elment
         * @param value     如果为false，则获取外部height(含padding)，否则获取内部height，如果为数字，则设置height=value + px
         */
        static height(el:HTMLElement,value:number|boolean){
            if(!this.isEl(el)){
                throw new NodomError('invoke','this.height','0','Element');
            }
            if(this.isNumber(value)){
                el.style.height = value + 'px';
            }else{
                let compStyle;
                //ie 9+ firefox chrome safari
                if(window.getComputedStyle){
                    compStyle = window.getComputedStyle(el,null);
                }
                if(!compStyle){
                    return null;
                }
                let w = parseInt(compStyle['height']);
                if(value === true){
                    let pw = parseInt(compStyle['paddingTop'])+parseInt(compStyle['paddingBottom']);
                    w -= pw;    
                }
                return w;
            }
        }
        /******日期相关******/
        /**
         * 日期格式化
         * @param srcDate   时间戳串
         * @param format    日期格式
         * @returns          日期串
         */
        static formatDate(srcDate:string|number,format:string):string{
            //时间戳
            let timeStamp:number;
            if(this.isString(srcDate)){
                //排除日期格式串,只处理时间戳
                let reg = new RegExp(/^\d+$/);
                if(reg.test(<string>srcDate) === true){
                    timeStamp = parseInt(<string>srcDate);
                }
            }else if(this.isNumber(srcDate)){
                timeStamp = <number>srcDate;
            }else{
                throw new NodomError('invoke','this.formatDate','0','date string','date');
            }
                
            //得到日期
            let date:Date = new Date(timeStamp);
            // invalid date
            if(isNaN(date.getDay())){
                return '';
            }

            let o = {
                "M+" : date.getMonth()+1, //月份
                "d+" : date.getDate(), //日
                "h+" : date.getHours()%12 === 0 ? 12 : date.getHours()%12, //小时
                "H+" : date.getHours(), //小时
                "m+" : date.getMinutes(), //分
                "s+" : date.getSeconds(), //秒
                "q+" : Math.floor((date.getMonth()+3)/3), //季度
                "S" : date.getMilliseconds() //毫秒
            };
            let week = {
                "0" : "日",
                "1" : "一",
                "2" : "二",
                "3" : "三",
                "4" : "四",
                "5" : "五",
                "6" : "六"
            };

            //年
            if(/(y+)/.test(format)){
                format=format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            //月日
            this.getOwnProps(o).forEach(function(k){
                if(new RegExp("("+ k +")").test(format)){
                    format = format.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            });

            //星期
            if(/(E+)/.test(format)){
                format=format.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "") + week[date.getDay() + ""]);
            }
            return format;
        }

        /******字符串相关*****/
        /**
         * 编译字符串，把{n}替换成带入值
         * @param str 待编译的字符串
         * @param args1,args2,args3,... 待替换的参数
         * @returns 转换后的消息
         */
        static compileStr(src:string,p1?:any,p2?:any,p3?:any,p4?:any,p5?:any):string{
            let reg:RegExp;
            let args = arguments;
            let index = 0;
            for(;;){
                if(src.indexOf('\{' + index + '\}') !== -1){
                    reg = new RegExp('\\{' + index + '\\}','g');
                    src = src.replace(reg,args[index+1]);
                    index++;
                }else{
                    break;
                }
            }
            return src;
        }
        
        /**
         * 函数调用
         * @param foo   函数
         * @param obj   this指向
         * @param args  参数数组
         */
        static apply(foo:Function,obj:any,args?:Array<any>):any{
            if(!foo){
                return;
            }
            return Reflect.apply(foo,obj||null,args);
        }
    }
}