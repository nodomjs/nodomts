/// <reference path="nodom.ts" />
namespace nodom {
    /**
     * 事件类
     * @remarks
     * 事件分为自有事件和代理事件
     * 自有事件绑定在view上
     * 代理事件绑定在父view上，存储于事件对象的events数组中
     * 如果所绑定对象已存在该事件名对应的事件，如果是代理事件，则添加到子事件队列，否则替换view自有事件
     * 事件执行顺序，先执行代理事件，再执行自有事件
     * 
     * @author      yanglei
     * @since       1.0
     */
    export class NodomEvent {
        /**
         * 事件名
         */
        name: string;
        /**
         * 子事件数组
         */
        events: Map<string,Array<NodomEvent>>;
        /**
         * 事件处理函数名(需要在模块methods中定义)
         */
        handler: string;
        /**
         * 代理到父对象
         */
        delg: boolean;
        /**
         * 禁止冒泡
         */
        nopopo: boolean;
        /**
         * 只执行一次
         */
        once: boolean;
        /**
         * 使用 capture
         */
        capture: boolean;
        /**
         * 模块名
         */
        moduleName:string;

        /**
         * 事件所属虚拟dom的key
         */
        domKey:string;

        /**
         * 事件监听器
         */
        handleListener:EventListenerObject;
        /**
         * 触屏监听器
         */
        touchListeners:Map<string,NodomEvent>;

        /**
         * 附加参数
         */
        extParams:any;
        /**
         * @param eventName     事件名
         * @param eventStr      事件串,以“:”分割,中间不能有空格,结构为: 方法名[:delg(代理到父对象):nopopo(禁止冒泡):once(只执行一次):capture(useCapture)]
         */
        constructor(eventName: string, eventStr?: string) {
            this.name = eventName;

            //如果事件串不为空，则不需要处理
            if (eventStr) {
                eventStr.split(':').forEach((item, i) => {
                    item = item.trim();
                    if (i === 0) { //事件方法
                        this.handler = item;
                    } else { //事件附加参数
                        switch (item) {
                        case 'delg':
                            this.delg = true;
                            break;
                        case 'nopopo':
                            this.nopopo = true;
                            break;
                        case 'once':
                            this.once = true;
                            break;
                        case 'capture':
                            this.capture = true;
                            break;
                        }
                    }
                });
            }
            //设备类型  1:触屏，2:非触屏	
            let dtype: number = 'ontouchend' in document ? 1 : 2
            //触屏事件根据设备类型进行处理
            if (dtype) { //触屏设备
                switch (this.name) {
                case 'click':
                    this.name = 'tap';
                    break;
                case 'mousedown':
                    this.name = 'touchstart';
                    break;
                case 'mouseup':
                    this.name = 'touchend';
                    break;
                case 'mousemove':
                    this.name = 'touchmove';
                    break;
                }
            } else { //转非触屏
                switch (this.name) {
                case 'tap':
                    this.name = 'click';
                    break;
                case 'touchstart':
                    this.name = 'mousedown';
                    break;
                case 'touchend':
                    this.name = 'mouseup';
                    break;
                case 'touchmove':
                    this.name = 'mousemove';
                    break;
                }
            }

        }

        /**
         * 事件触发
         * @param e  事件
         */
        fire(e:Event) {
            const module = ModuleFactory.get(this.moduleName);
            const dom = module.renderTree.query(this.domKey);
            if (!module.hasContainer()) {
                return;
            }
            const el:HTMLElement = module.container.querySelector("[key='" + this.domKey + "']");
            const model = module.modelFactory.get(dom.modelId);
            //如果capture为true，则先执行自有事件，再执行代理事件，否则反之
            if (this.capture) {
                handleSelf(e, model, module, el);
                handleDelg(e, model, module, el);
            } else {
                if (handleDelg(e, model, module, el)) {
                    handleSelf(e, model, module, el);
                }
            }

            //判断是否清除事件
            if (this.events !== undefined && this.events[this.name].length === 0 && this.handler === undefined) {
                if (ExternalEvent.touches[this.name]) {
                    ExternalEvent.unregist(this, el);
                } else {
                    if (el !== null) {
                        el.removeEventListener(this.name, this.handleListener);
                    }
                }
            }

            /**
             * 处理自有事件
             * @param model     模型
             * @param e         事件
             * @param module    模块
             * @param el        事件element
             */
            function handleDelg(e:Event, model:Model, module:Module, el:HTMLElement) {
                //代理事件执行
                if (this.events === undefined) {
                    return true;
                }
                let arr = this.events[this.name];
                if (Util.isArray(arr)) {
                    if (arr.length > 0) {
                        for (let i = 0; i < arr.length; i++) {
                            // 找到对应的子事件执行
                            if (arr[i].el && arr[i].el.contains(e.target)) {
                                //执行
                                arr[i].fire(e);
                                //执行一次，需要移除
                                if (arr[i].once) {
                                    this.removeSubEvt(arr[i]);
                                }
                                //禁止冒泡
                                if (arr[i].nopopo) {
                                    return false;
                                }
                            }
                        }
                    } else { //删除该事件
                        this.events.delete(this.name);
                    }
                }
                return true;
            }

            /**
             * 处理自有事件
             * @param model     模型
             * @param e         事件
             * @param module    模块
             * @param el        事件element
             */
            function handleSelf(e:Event, model:Model, module:Module, el:HTMLElement) {
                let foo:Function = module.methodFactory.get(this.handler);
                //自有事件
                if (Util.isFunction(foo)) {
                    //禁止冒泡
                    if (this.nopopo) {
                        e.stopPropagation();
                    }
                    Util.apply(foo, model, [e, module, el, dom]);
                    //事件只执行一次，则删除handler
                    if (this.once) {
                        delete this.handler;
                    }
                }
            }
        }

        /**
         * 绑定事件
         * @param module    模块
         * @param vdom      虚拟dom
         * @param el        element
         
         */
        bind(module, vdom, el) {
            const me = this;
            this.domKey = vdom.key;
            this.moduleName = module.name;
            //触屏事件
            if (ExternalEvent.touches[this.name]) {
                ExternalEvent.regist(me, el);
            } else {
                this.handleListener = el.addEventListener(this.name, function (e) {
                    this.fire(e);
                }, this.capture);
            }
        }

        /**
         * 
         * 事件代理到父对象
         * @param module    模块
         * @param vdom      虚拟dom
         * @param el        事件作用的html element 
         * @param parent    父虚拟dom
         * @param parentEl  父element
         */
        delegateTo(module:Module, vdom:Element, el:HTMLElement, parent?:Element, parentEl?:HTMLElement) {
            const me = this;
            this.domKey = vdom.key;
            this.moduleName = module.name;

            //如果不存在父对象，则用body
            if (!parentEl) {
                parentEl = document.body;
            }

            //父节点如果没有这个事件，则新建，否则直接指向父节点相应事件
            if (!parent.events.includes(this)) {
                let ev = new NodomEvent(this.name);
                ev.bind(module, parent, parentEl);
                parent.events.push(ev);
            }
            //添加子事件
            parent.events[parent.events.indexOf(this)].addSubEvt(me);
        }

        /**
         * 添加子事件
         * @param ev    事件
         */
        addSubEvt(ev) {
            if (!this.events) {
                this.events = new Map();
            }

            //事件类型对应的数组
            if (!this.events.has(this.name)) {
                this.events.set(this.name,new Array());
            }
            this.events.get(this.name).push(ev);
        }

        /**
         * 移除子事件
         * @param ev    子事件
         */
        removeSubEvt(ev) {
            const me = this;
            if (this.events === undefined || this.events[ev.name] === undefined) {
                return;
            }
            let ind = this.events[ev.name].indexOf(ev);
            if (ind !== -1) {
                this.events[ev.name].splice(ind, 1);
                if (this.events[ev.name].length === 0) {
                    this.events.delete(ev.name);
                }
            }
        }

        clone() {
            const me = this;
            let evt = new Event(this.name);
            let arr = ['delg', 'once', 'nopopo', 'useCapture', 'handler', 'handleEvent', 'module'];
            arr.forEach((item) => {
                evt[item] = me[item];
            });
            return evt;
        }
    }

    /****************扩展事件*********************/


    export class ExternalEvent {
        /**
         * 触屏事件
         */
        static touches:any = {};
        /**
         * 注册事件
         * @param evtObj    event对象
         */
        static regist(evtObj:NodomEvent, el:HTMLElement) {
            //触屏事件组
            let touchEvts:any = this.touches.get(evtObj.name);
            //如果绑定了，需要解绑
            if (!Util.isEmpty(evtObj.touchListeners)) {
                this.unregist(evtObj);
            }

            if (!el) {
                const module = ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }

            // el不存在
            evtObj.touchListeners = new Map();
            if (touchEvts && el !== null) {
                // 绑定事件组
                Util.getOwnProps(touchEvts).forEach(function (ev) {
                    //先记录下事件，为之后释放
                    evtObj.touchListeners[ev] = function (e) {
                        touchEvts[ev](e, evtObj);
                    }
                    el.addEventListener(ev, evtObj.touchListeners[ev], evtObj.capture);
                });
            }
        }

        /**
         * 取消已注册事件
         * @param evtObj    event对象
         * @param el        事件绑定的html element
         */
        static unregist(evtObj:NodomEvent, el?:HTMLElement) {
            const evt = ExternalEvent.touches.get(evtObj.name);
            if (!el) {
                const module = ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }
            if (evt) {
                // 解绑事件
                if (el !== null) {
                    Util.getOwnProps(evtObj.touchListeners).forEach(function (ev) {
                        el.removeEventListener(ev, evtObj.touchListeners[ev]);
                    });
                }
            }
        }

    }

    /**
     * 触屏事件
     */
    ExternalEvent.touches={
        tap: {
            touchstart: function (e:TouchEvent, evtObj:NodomEvent) {
                let tch = e.touches[0];
                evtObj.extParams = {
                    pos: { sx: tch.pageX, sy: tch.pageY, t: Date.now() }
                }
            },
            touchmove: function (e:TouchEvent, evtObj:NodomEvent) {
                let pos = evtObj.extParams.pos;
                let tch = e.touches[0];
                let dx = tch.pageX - pos.sx;
                let dy = tch.pageY - pos.sy;
                //判断是否移动
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    pos.move = true;
                }
            },
            touchend: function (e:TouchEvent, evtObj:NodomEvent) {
                let pos = evtObj.extParams.pos;
                let dt = Date.now() - pos.t;
                //点下时间不超过200ms
                if (pos.move === true || dt > 200) {
                    return;
                }
                evtObj.fire(e);
            }
        },
        swipe: {
            touchstart: function (e:TouchEvent, evtObj:NodomEvent) {
                let tch = e.touches[0];
                let t = Date.now();
                evtObj.extParams = {
                    swipe: {
                        oldTime: [t, t],
                        speedLoc: [{ x: tch.pageX, y: tch.pageY }, { x: tch.pageX, y: tch.pageY }],
                        oldLoc: { x: tch.pageX, y: tch.pageY }
                    }
                }
            },
            touchmove: function (e:TouchEvent, evtObj:NodomEvent) {
                let nt = Date.now();
                let tch = e.touches[0];
                let mv = evtObj.extParams['swipe'];
                //50ms记录一次
                if (nt - mv.oldTime > 50) {
                    mv.speedLoc[0] = { x: mv.speedLoc[1].x, y: mv.speedLoc[1].y };
                    mv.speedLoc[1] = { x: tch.pageX, y: tch.pageY };
                    mv.oldTime[0] = mv.oldTime[1];
                    mv.oldTime[1] = nt;
                }
                mv.oldLoc = { x: tch.pageX, y: tch.pageY };
            },
            touchend: function (e:any, evtObj:NodomEvent) {
                let mv = evtObj.extParams['swipe'];
                let nt = Date.now();

                //取值序号 0 或 1，默认1，如果释放时间与上次事件太短，则取0
                let ind = (nt - mv.oldTime[1] < 30) ? 0 : 1;
                let dx = mv.oldLoc.x - mv.speedLoc[ind].x;
                let dy = mv.oldLoc.y - mv.speedLoc[ind].y;
                let s = Math.sqrt(dx * dx + dy * dy);
                let dt = nt - mv.oldTime[ind];
                //超过300ms 不执行事件
                if (dt > 300 || s < 10) {
                    return;
                }
                let v0 = s / dt;
                //速度>0.1,触发swipe事件
                if (v0 > 0.05) {
                    let sname = '';
                    if (dx < 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0; //添加附加参数到e
                        sname = 'swipeleft';
                    }
                    if (dx > 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0;
                        sname = 'swiperight';
                    }
                    if (dy > 0 && Math.abs(dx / dy) < 1) {
                        e.v0 = v0;
                        sname = 'swipedown';
                    }
                    if (dy < 0 && Math.abs(dx / dy) < 1) {
                        e.v0 = v0;
                        sname = 'swipeup';
                    }
                    if (evtObj.name === sname) {
                        evtObj.fire(e);
                    }
                }
            }
        }
    }

    //swipe事件
    ExternalEvent.touches['swipeleft'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swiperight'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipeup'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipedown'] = ExternalEvent.touches['swipe'];
}

