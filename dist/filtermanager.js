var nodom;
(function (nodom) {
    class FilterManager {
        static addType(name, handler) {
            if (!/^[a-zA-Z]+$/.test(name)) {
                throw new nodom.NodomError('namedinvalid', nodom.TipWords.filterType, name);
            }
            if (this.filterTypes.has(name)) {
                throw new nodom.NodomError('exist1', nodom.TipWords.filterType, name);
            }
            if (!nodom.Util.isFunction(handler)) {
                throw new nodom.NodomError('invoke', 'FilterManager.addType', '1', 'Function');
            }
            this.filterTypes.set(name, handler);
        }
        static removeType(name) {
            if (this.cantEditTypes.indexOf(name) !== -1) {
                throw new nodom.NodomError('notupd', nodom.TipWords.system + nodom.TipWords.filterType, name);
            }
            if (!this.filterTypes.has(name)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, name);
            }
            this.filterTypes.delete(name);
        }
        static hasType(name) {
            return this.filterTypes.has(name);
        }
        static exec(module, type) {
            let params = new Array();
            for (let i = 2; i < arguments.length; i++) {
                params.push(arguments[i]);
            }
            if (!FilterManager.filterTypes.has(type)) {
                throw new nodom.NodomError('notexist1', nodom.TipWords.filterType, type);
            }
            return nodom.Util.apply(FilterManager.filterTypes.get(type), module, params);
        }
        static explain(src) {
            let startStr;
            let startObj = false;
            let strings = "\"'`";
            let splitCh = ':';
            let retArr = new Array();
            let tmp = '';
            for (let i = 0; i < src.length; i++) {
                let ch = src[i];
                if (strings.indexOf(ch) !== -1) {
                    if (ch === startStr) {
                        startStr = undefined;
                    }
                    else {
                        startStr = ch;
                    }
                }
                else if (startStr === undefined) {
                    if (ch === '}' && startObj) {
                        startObj = false;
                    }
                    else if (ch === '{') {
                        startObj = true;
                    }
                }
                if (ch === splitCh && startStr === undefined && !startObj && tmp !== '') {
                    retArr.push(handleObj(tmp));
                    tmp = '';
                    continue;
                }
                tmp += ch;
            }
            if (tmp !== '') {
                retArr.push(handleObj(tmp));
            }
            return retArr;
            function handleObj(s) {
                s = s.trim();
                if (s.charAt(0) === '{') {
                    s = eval('(' + s + ')');
                }
                return s;
            }
        }
    }
    FilterManager.filterTypes = new Map();
    FilterManager.cantEditTypes = ['date', 'currency', 'number', 'tolowercase', 'touppercase', 'orderBy', 'filter'];
    nodom.FilterManager = FilterManager;
})(nodom || (nodom = {}));
//# sourceMappingURL=filtermanager.js.map