// / <reference path="nodom.ts" />
namespace nodom{
	/**
	 *  编译器
	 *  描述：用于进行预编译和预编译后的json串反序列化，处理两个部分：虚拟dom树和表达式工厂
	 *  版本2.1预留
	 */
	export class Serializer{
		/**
		 * 序列化，只序列化virtualDom
		 * @param module 	模块
		 * @return   		jsonstring
		 */
		static serialize(module:Module){
			let dom = module.virtualDom;
			addClsName(dom);
			return JSON.stringify(dom);

			/**
			 * 为对象添加class name（递归执行）
			 * @param obj 	对象
			 */
			function addClsName(obj:any){
				if(typeof obj !== 'object'){
					return;
				}

				obj.className = obj.constructor.name;
				
				Util.getOwnProps(obj).forEach((item)=>{
					if(Util.isArray(obj[item])){
						//删除空数组
						if(obj[item].length === 0){
							delete obj[item];
						}else{
							obj[item].forEach((item1)=>{
								addClsName(item1);
							});	
						}
					}else if(typeof obj[item] === 'object'){
						//删除空对象
						if(Util.isEmpty(obj[item])){
							delete obj[item];
						}else{
							addClsName(obj[item]);	
						}
					}
				});
			}
		}

		/**
		 * 反序列化
		 * @param jsonStr 	json串
		 * @param module 	模块
		 * @returns 		 virtualDom	
		 */
		static deserialize(jsonStr:string):Element{
			let jObj = JSON.parse(jsonStr);
			return handleCls(jObj);

			function handleCls(jsonObj):Element{
				if(!Util.isObject(jsonObj)){
					return jsonObj;
				}

				let retObj;
				if(jsonObj.hasOwnProperty('className')){
					const cls:string = jsonObj['className'];
					let param = [];
					//指令需要传入参数
					switch(cls){
						case 'Directive':
							param = [jsonObj['type']];
							break;
						case 'Expression':
							param = [jsonObj['execString']];
							break;
						case 'Element':
							param = [];
							break;
						case 'NodomEvent':
							param = [jsonObj['name']];
							break;
					}
					let clazz:any = eval(cls);
					retObj = Reflect.construct(clazz,param);
				}else{
					retObj = {};
				}

				//子对象可能用到父对象属性，所以子对象要在属性赋值后处理
				let objArr = [];  //子对象
				let arrArr = [];  //子数组
				Util.getOwnProps(jsonObj).forEach((item)=>{
					//子对象
					if(Util.isObject(jsonObj[item])){
						objArr.push(item);
					}else if(Util.isArray(jsonObj[item])){ //子数组
						arrArr.push(item);
					}else{  //普通属性
						//className 不需要复制
						if(item !== 'className'){
							retObj[item] = jsonObj[item];
						}
					}
				});

				//子对象处理
				objArr.forEach((item)=>{
					retObj[item] = handleCls(jsonObj[item]);
				});

				//子数组处理
				arrArr.forEach(item=>{
					retObj[item] = [];
					jsonObj[item].forEach((item1)=>{
						retObj[item].push(handleCls(item1));
					});
				});
				return retObj;
			}
		}
	}	
}