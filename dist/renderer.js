/// <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 渲染器
     */
    class Renderer {
        /**
         * 添加到渲染列表
         * @param module 模块
         */
        static add(module) {
            //非激活状态
            if (module.state !== 3) {
                return;
            }
            //如果已经在列表中，不再添加
            if (this.waitList.indexOf(module.name) === -1) {
                //计算优先级
                this.waitList.push(module.name);
            }
        }
        //从列表移除
        static remove(module) {
            let ind;
            if ((ind = this.waitList.indexOf(module.name)) !== -1) {
                this.waitList.splice(ind, 1);
            }
        }
        /**
         * 队列渲染
         */
        static render() {
            //调用队列渲染
            for (let i = 0; i < this.waitList.length; i++) {
                let m = nodom.ModuleFactory.get(this.waitList[i]);
                if (!m || m.render()) {
                    this.waitList.splice(i--, 1);
                }
            }
        }
    }
    /**
     * 等待渲染列表（模块名）
     */
    Renderer.waitList = [];
    nodom.Renderer = Renderer;
})(nodom || (nodom = {}));
//# sourceMappingURL=renderer.js.map