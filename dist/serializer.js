/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     *  编译器
     *  描述：用于进行预编译和预编译后的json串反序列化，处理两个部分：虚拟dom树和表达式工厂
     */
    class Serializer {
        /**
         * 序列化，只序列化 virtualDom、expressionFactory
         * @param module 	模块
         * @return   		jsonstring
         */
        static serialize(module) {
            let props = ['virtualDom', 'expressionFactory'];
            let jsonStr = '[';
            props.forEach((p, i) => {
                addClsName(module[p]);
                let s = JSON.stringify(module[p]);
                jsonStr += s;
                if (i < props.length - 1) {
                    jsonStr += ',';
                }
                else {
                    jsonStr += ']';
                }
            });
            return jsonStr;
            /**
             * 为对象添加class name（递归执行）
             * @param obj 	对象
             */
            function addClsName(obj) {
                if (typeof obj !== 'object') {
                    return;
                }
                obj.className = obj.constructor.name;
                nodom.Util.getOwnProps(obj).forEach((item) => {
                    if (nodom.Util.isArray(obj[item])) {
                        //删除空数组
                        if (obj[item].length === 0) {
                            delete obj[item];
                        }
                        else {
                            obj[item].forEach((item1) => {
                                addClsName(item1);
                            });
                        }
                    }
                    else if (typeof obj[item] === 'object') {
                        //删除空对象
                        if (nodom.Util.isEmpty(obj[item])) {
                            delete obj[item];
                        }
                        else {
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
         * @returns 		[virtualDom,expressionFactory]
         */
        static deserialize(jsonStr, module) {
            let jsonArr = JSON.parse(jsonStr);
            let arr = [];
            let vdom; //虚拟dom
            jsonArr.forEach((item) => {
                arr.push(handleCls(item));
            });
            return arr;
            function handleCls(jsonObj) {
                if (!nodom.Util.isObject(jsonObj)) {
                    return jsonObj;
                }
                if (jsonObj.moduleName) {
                    jsonObj.moduleName = module.name;
                }
                let retObj;
                if (jsonObj.hasOwnProperty('className')) {
                    const cls = jsonObj['className'];
                    let param = [];
                    //指令需要传入参数
                    switch (cls) {
                        case 'Directive':
                            param = [jsonObj['type'], jsonObj['value'], vdom, module];
                            break;
                        case 'Event':
                            param = [jsonObj['name']];
                            break;
                    }
                    let clazz = eval(cls);
                    // retObj = new .newInstance(cls,param);
                    if (cls === 'Element') {
                        vdom = retObj;
                    }
                }
                else {
                    retObj = {};
                }
                //子对象可能用到父对象属性，所以子对象要在属性赋值后处理
                let objArr = []; //子对象
                let arrArr = []; //子数组
                nodom.Util.getOwnProps(jsonObj).forEach((item) => {
                    //子对象
                    if (nodom.Util.isObject(jsonObj[item])) {
                        objArr.push(item);
                    }
                    else if (nodom.Util.isArray(jsonObj[item])) { //子数组
                        arrArr.push(item);
                    }
                    else { //普通属性
                        if (item !== 'className') {
                            retObj[item] = jsonObj[item];
                        }
                    }
                });
                //子对象处理
                objArr.forEach((item) => {
                    retObj[item] = handleCls(jsonObj[item]);
                });
                //子数组处理
                arrArr.forEach(item => {
                    retObj[item] = [];
                    jsonObj[item].forEach((item1) => {
                        retObj[item].push(handleCls(item1));
                    });
                });
                return retObj;
            }
        }
    }
    nodom.Serializer = Serializer;
})(nodom || (nodom = {}));
//# sourceMappingURL=serializer.js.map