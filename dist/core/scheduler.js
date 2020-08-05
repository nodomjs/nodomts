var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// / <reference path="nodom.ts" />
var nodom;
(function (nodom) {
    /**
     * 调度器，用于每次空闲的待操作序列调度
     */
    class Scheduler {
        static dispatch() {
            Scheduler.tasks.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                if (nodom.Util.isFunction(item.func)) {
                    if (item.thiser) {
                        yield item.func.call(item.thiser);
                    }
                    else {
                        yield item.func();
                    }
                }
            }));
        }
        /**
         * 启动调度器
         * @param renderTick 	渲染间隔
         */
        static start(renderTick) {
            Scheduler.dispatch();
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(Scheduler.start);
            }
            else {
                window.setTimeout(Scheduler.start, this.renderTick || 50);
            }
        }
        /**
         * 添加任务
         * @param foo 		任务和this指向
         * @param thiser 	this指向
         */
        static addTask(foo, thiser) {
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError("invoke", "Scheduler.addTask", "0", "function");
            }
            Scheduler.tasks.push({ func: foo, thiser: thiser });
        }
        /**
         * 移除任务
         * @param foo 	任务
         */
        static removeTask(foo) {
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError("invoke", "Scheduler.removeTask", "0", "function");
            }
            let ind = -1;
            if ((ind = Scheduler.tasks.indexOf(foo)) !== -1) {
                Scheduler.tasks.splice(ind, 1);
            }
        }
    }
    Scheduler.tasks = [];
    nodom.Scheduler = Scheduler;
})(nodom || (nodom = {}));
//# sourceMappingURL=scheduler.js.map