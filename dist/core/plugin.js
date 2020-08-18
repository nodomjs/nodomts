/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 插件，插件为自定义元素方式实现
     */
    class Plugin {
        constructor(params) { }
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module, uidom) {
            this.element = uidom;
            this.moduleId = module.id;
            if (uidom.key !== this.key) {
                this.modelId = uidom.modelId;
                this.key = uidom.key;
                //添加到模块
                if (uidom.hasProp('name')) {
                    module.addPlugin(uidom.getProp('name'), this);
                }
                this.needPreRender = true;
            }
            else {
                this.needPreRender = false;
            }
        }
        /**
         * 后置渲染方法(dom render结束后，选到html之前)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        afterRender(module, uidom) { }
        /**
         * 克隆
         */
        clone(dst) {
            let plugin = Reflect.construct(this.constructor, []);
            //不拷贝属性
            let excludeProps = ['key'];
            nodom.Util.getOwnProps(this).forEach((prop) => {
                if (excludeProps.includes(prop)) {
                    return;
                }
                plugin[prop] = nodom.Util.clone(this[prop]);
            });
            if (dst) {
                plugin.element = dst;
            }
            return plugin;
        }
    }
    nodom.Plugin = Plugin;
})(nodom || (nodom = {}));
//# sourceMappingURL=plugin.js.map