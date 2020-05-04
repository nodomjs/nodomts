var nodom;
(function (nodom) {
    class Serializer {
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
            function addClsName(obj) {
                if (typeof obj !== 'object') {
                    return;
                }
                obj.className = obj.constructor.name;
                nodom.Util.getOwnProps(obj).forEach((item) => {
                    if (nodom.Util.isArray(obj[item])) {
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
        static deserialize(jsonStr, module) {
            let jsonArr = JSON.parse(jsonStr);
            let arr = [];
            let vdom;
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
                    switch (cls) {
                        case 'Directive':
                            param = [jsonObj['type'], jsonObj['value'], vdom, module];
                            break;
                        case 'Event':
                            param = [jsonObj['name']];
                            break;
                    }
                    let clazz = eval(cls);
                    if (cls === 'Element') {
                        vdom = retObj;
                    }
                }
                else {
                    retObj = {};
                }
                let objArr = [];
                let arrArr = [];
                nodom.Util.getOwnProps(jsonObj).forEach((item) => {
                    if (nodom.Util.isObject(jsonObj[item])) {
                        objArr.push(item);
                    }
                    else if (nodom.Util.isArray(jsonObj[item])) {
                        arrArr.push(item);
                    }
                    else {
                        if (item !== 'className') {
                            retObj[item] = jsonObj[item];
                        }
                    }
                });
                objArr.forEach((item) => {
                    retObj[item] = handleCls(jsonObj[item]);
                });
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