/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 应用类
     */
    class Application {
        /**
         * 获取路径
         * @param type  路径类型 app,template,css,js,module,route
         */
        static getPath(type) {
            if (!this.path) {
                return '';
            }
            let appPath = this.path.app || '';
            if (type === 'app') {
                return appPath;
            }
            else if (type === 'route') {
                return this.path.route || '';
            }
            else {
                let p = this.path[type] || '';
                if (appPath !== '') {
                    if (p !== '') {
                        return appPath + '/' + p;
                    }
                    else {
                        return appPath;
                    }
                }
                return p;
            }
        }
        /**
         * 设置path 对象
         */
        static setPath(pathObj) {
            this.path = pathObj;
        }
    }
    nodom.Application = Application;
})(nodom || (nodom = {}));
//# sourceMappingURL=application.js.map