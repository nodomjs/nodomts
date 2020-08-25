/// <reference path="../nodom.ts" />
/*
 * 消息js文件 中文文件
 */
var nodom;
(function (nodom) {
    nodom.TipMsg_en = {
        /**
         * tip words
         */
        TipWords: {
            application: "Application",
            system: "System",
            module: "Module",
            moduleClass: 'ModuleClass',
            model: "Model",
            directive: "Directive",
            directiveType: "Directive-type",
            expression: "Expression",
            event: "Event",
            method: "Method",
            filter: "Filter",
            filterType: "Filter-type",
            data: "Data",
            dataItem: 'Data-item',
            route: 'Route',
            routeView: 'Route-container',
            plugin: 'Plugin',
            resource: 'Resource',
            root: 'Root',
            element: 'Element'
        },
        /**
         * error info
         */
        ErrorMsgs: {
            unknown: "unknown error",
            paramException: "{0} '{1}' parameter error，see api",
            invoke: "method {0} parameter {1} must be {2}",
            invoke1: "method {0} parameter {1} must be {2} or {3}",
            invoke2: "method {0} parameter {1} or {2} must be {3}",
            invoke3: "method {0} parameter {1} not allowed empty",
            exist: "{0} is already exist",
            exist1: "{0} '{1}' is already exist",
            notexist: "{0} is not exist",
            notexist1: "{0} '{1}' is not exist",
            notupd: "{0} not allow to change",
            notremove: "{0} not allow to delete",
            notremove1: "{0} {1} not allow to delete",
            namedinvalid: "{0} {1} name error，see name rules",
            initial: "{0} init parameter error",
            jsonparse: "JSON parse error",
            timeout: "request overtime",
            config: "{0} config parameter error",
            config1: "{0} config parameter '{1}' error"
        },
        /**
         * form info
         */
        FormMsgs: {
            type: "please input valid {0}",
            unknown: "input error",
            required: "is required",
            min: "min value is {0}",
            max: "max value is {0}"
        }
    };
})(nodom || (nodom = {}));
//# sourceMappingURL=msg_en.js.map