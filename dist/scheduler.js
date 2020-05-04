var nodom;
(function (nodom) {
    class Scheduler {
        static dispatch() {
            Scheduler.tasks.forEach((item) => {
                if (nodom.Util.isFunction(item.func)) {
                    if (item.thiser) {
                        item.func.call(item.thiser);
                    }
                    else {
                        item.func();
                    }
                }
            });
        }
        static start() {
            Scheduler.dispatch();
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(Scheduler.start);
            }
            else {
                window.setTimeout(Scheduler.start, nodom.Application.renderTick);
            }
        }
        static addTask(foo, thiser) {
            if (!nodom.Util.isFunction(foo)) {
                throw new nodom.NodomError("invoke", "Scheduler.addTask", "0", "function");
            }
            Scheduler.tasks.push({ func: foo, thiser: thiser });
        }
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