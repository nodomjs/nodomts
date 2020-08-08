/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 插件，插件为自定义元素方式实现
     */
    class Plugin {
        /**
         * 编译时执行方法
         * @param el    待编译html element
         */
        init(el) { }
        /**
         * 前置渲染方法(dom render方法中获取modelId和parentKey后执行)
         * @param module    模块
         * @param uidom     虚拟dom
         */
        beforeRender(module, uidom) {
            if (uidom.key !== this.key) {
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
        clone() {
            let ele = Reflect.construct(this.constructor, []);
            //不拷贝属性
            let excludeProps = ['key'];
            nodom.Util.getOwnProps(this).forEach((prop) => {
                if (excludeProps.includes(prop)) {
                    return;
                }
                ele[prop] = nodom.Util.clone(this[prop]);
            });
            return ele;
        }
    }
    nodom.Plugin = Plugin;
})(nodom || (nodom = {}));
//# sourceMappingURL=plugin.js.map