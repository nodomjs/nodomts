var nodom;
(function (nodom) {
    class Expression {
        constructor(exprStr, module) {
            this.modelMap = {};
            this.fields = [];
            this.id = nodom.Util.genId();
            if (module) {
                this.moduleName = module.name;
                module.expressionFactory.add(this.id, this);
            }
            if (exprStr) {
                this.stack = this.init(exprStr);
            }
        }
        init(exprStr) {
            let startStr;
            let type = 0;
            let strings = "'`\"";
            let operand = "()!|*/+-><=&%";
            let spaceChar = " 	";
            let stack = [];
            let sTmp = '';
            for (let i = 0; i < exprStr.length; i++) {
                let c = exprStr[i];
                if ((type !== 1) && spaceChar.indexOf(c) !== -1) {
                    continue;
                }
                switch (type) {
                    case 1:
                        if (strings.indexOf(c) !== -1) {
                            if (c === startStr) {
                                this.addStr(sTmp + c, stack);
                                startStr = undefined;
                                sTmp = '';
                                type = 0;
                                continue;
                            }
                        }
                        break;
                    case 2:
                        if (operand.indexOf(c) !== -1) {
                            if (c === '(') {
                                type = 3;
                            }
                            else {
                                this.addVar(sTmp, stack);
                                sTmp = '';
                                type = 0;
                            }
                        }
                        break;
                    case 3:
                        if (c === ')') {
                            let a = sTmp.trim().split('(');
                            let fn = a[0];
                            let pa = a[1].split(',');
                            for (let j = 0; j < pa.length; j++) {
                                let field = pa[j].trim();
                                pa[j] = field;
                                this.addField(field);
                            }
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
                        if (strings.indexOf(c) !== -1) {
                            startStr = c;
                            type = 1;
                        }
                        else if (operand.indexOf(c) === -1) {
                            type = 2;
                            if (sTmp !== '') {
                                this.addStr(sTmp, stack);
                                sTmp = '';
                            }
                        }
                }
                let isFilter = false;
                if (c === '|') {
                    let j = i + 1;
                    let nextc = exprStr[j];
                    if (nextc >= 'a' && nextc <= 'z') {
                        let strCh = '';
                        for (; j < exprStr.length; j++) {
                            let ch = exprStr[j];
                            if (strings.indexOf(ch) !== -1) {
                                if (ch === strCh) {
                                    strCh = '';
                                }
                                else {
                                    strCh = ch;
                                }
                            }
                            if (strCh === '' && operand.indexOf(ch) !== -1) {
                                break;
                            }
                        }
                    }
                    if (j > i) {
                        let s = exprStr.substring(i + 1, j);
                        if (s !== '') {
                            let filterArr = nodom.FilterManager.explain(s);
                            if (nodom.FilterManager.hasType(filterArr[0])) {
                                this.addFilter(filterArr, stack);
                                c = '';
                                exprStr = '';
                                isFilter = true;
                            }
                        }
                    }
                }
                if (!isFilter && type !== 1 && type !== 3 && operand.indexOf(c) !== -1) {
                    this.addOperand(c, stack);
                }
                else {
                    sTmp += c;
                }
            }
            if (type === 2) {
                this.addVar(sTmp, stack);
            }
            else if (type === 0 && sTmp !== '') {
                this.addStr(sTmp, stack);
            }
            else if (type !== 0) {
                throw new nodom.NodomError('invoke', 'expression', '0', 'Node');
            }
            return stack;
        }
        val(model, modelId) {
            if (!model) {
                return '';
            }
            if (this.stack === null) {
                return '';
            }
            let fieldObj;
            if (model instanceof nodom.Model) {
                modelId = model.id;
                fieldObj = Object.create(null);
                this.fields.forEach((field) => {
                    fieldObj[field] = this.getFieldValue(model, field);
                });
            }
            else {
                fieldObj = model;
            }
            let newFieldValue = '';
            this.fields.forEach((field) => {
                newFieldValue += fieldObj[field];
            });
            if (this.modelMap[modelId] === undefined) {
                this.modelMap[modelId] = Object.create(null);
            }
            if (this.modelMap[modelId].fieldValue !== newFieldValue) {
                this.modelMap[modelId].value = this.cacStack(this.stack, fieldObj, modelId);
            }
            this.modelMap[modelId].fieldValue = newFieldValue;
            return this.modelMap[modelId].value;
        }
        addVar(field, stack) {
            let values = ['null', 'undefined', 'true', 'false', 'NaN'];
            let addFlag = values.indexOf(field) === -1 ? false : true;
            addFlag = addFlag || nodom.Util.isNumberString(field);
            if (addFlag) {
                this.addStr(field, stack);
            }
            else {
                stack.push({
                    val: field.trim(),
                    type: 'field'
                });
                this.addField(field);
            }
        }
        addStr(str, stack) {
            if (stack.length > 0 && stack[stack.length - 1].type === "string") {
                stack[stack.length - 1].val += str;
            }
            else {
                stack.push({
                    val: str,
                    type: 'string'
                });
            }
        }
        addOperand(str, stack) {
            stack.push({
                val: str,
                type: 'operand'
            });
        }
        addFilter(filterArr, stack) {
            let module = nodom.ModuleFactory.get(this.moduleName);
            if (stack.length > 0) {
                let filterStack = [];
                let pre = stack[stack.length - 1];
                let type = pre.type;
                if (type === 'field' || type === 'function' || type === 'string') {
                    filterStack.push(stack.pop());
                }
                else if (type === 'operand' && pre.val === ')') {
                    let cnt = 1;
                    let j = stack.length - 2;
                    for (; j >= 0; j--) {
                        if (stack[j].val === '(') {
                            if (--cnt === 0) {
                                break;
                            }
                        }
                        else if (stack[j].val === ')') {
                            cnt++;
                        }
                    }
                    filterStack = stack.slice(j, stack.length);
                    stack.splice(j, stack.length - j);
                }
                let expr = new Expression(null, module);
                expr.stack = filterStack;
                expr.fields = this.fields;
                if (!this.pre) {
                    this.pre = [];
                }
                this.pre.push(expr.id);
                stack.push({
                    type: 'filter',
                    filter: new nodom.Filter(filterArr),
                    val: expr.id
                });
            }
        }
        cacStack(stack, fieldObj, modelId) {
            let retStr = '';
            let needEval = false;
            let module = nodom.ModuleFactory.get(this.moduleName);
            stack.forEach((item) => {
                let value = '';
                switch (item.type) {
                    case 'string':
                        retStr += item.val;
                        break;
                    case 'operand':
                        retStr += item.val;
                        needEval = true;
                        break;
                    case 'field':
                        value = fieldObj[item.val];
                        if (nodom.Util.isString(value)) {
                            value = nodom.Util.addStrQuot(value);
                        }
                        retStr += value;
                        break;
                    case 'function':
                        let foo = module.methodFactory.get(item.val);
                        let param = [];
                        if (item.params.length > 0) {
                            item.params.forEach((p) => {
                                let pv = fieldObj[p];
                                let isVal = false;
                                if (nodom.Util.isString(pv) && pv !== '') {
                                    pv = nodom.Util.addStrQuot(pv);
                                }
                                param.push(pv);
                            });
                        }
                        if (foo !== undefined && nodom.Util.isFunction(foo)) {
                            value = foo.apply(module.model, param);
                        }
                        else {
                            value = item.val + '(' + param.join(',') + ')';
                            needEval = true;
                        }
                        retStr += value;
                        break;
                    case 'filter':
                        value = module.expressionFactory.get(item.val).val(fieldObj, modelId);
                        value = item.filter.exec(value, module);
                        if (typeof value === 'object') {
                            retStr = value;
                        }
                        else {
                            if (nodom.Util.isString(value) && value !== '') {
                                value = nodom.Util.addStrQuot(value);
                            }
                            retStr += value;
                        }
                }
            });
            if (needEval) {
                try {
                    retStr = eval(retStr);
                }
                catch (e) {
                }
            }
            else if (nodom.Util.isString(retStr) && retStr.charAt(0) === '"') {
                retStr = retStr.substring(1, retStr.length - 1);
            }
            if (retStr === undefined) {
                retStr = '';
            }
            return retStr;
        }
        addField(field) {
            if (this.fields.indexOf(field) === -1) {
                this.fields.push(field);
            }
        }
        getFieldValue(model, field) {
            let module = nodom.ModuleFactory.get(this.moduleName);
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
    nodom.Expression = Expression;
})(nodom || (nodom = {}));
//# sourceMappingURL=expression.js.map