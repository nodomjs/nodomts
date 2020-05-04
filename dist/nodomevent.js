var nodom;
(function (nodom) {
    class NodomEvent {
        constructor(eventName, eventStr) {
            this.name = eventName;
            if (eventStr) {
                eventStr.split(':').forEach((item, i) => {
                    item = item.trim();
                    if (i === 0) {
                        this.handler = item;
                    }
                    else {
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
            let dtype = 'ontouchend' in document ? 1 : 2;
            if (dtype === 1) {
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
            }
            else {
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
        fire(e, el, dom) {
            const module = nodom.ModuleFactory.get(this.moduleName);
            if (!module.hasContainer()) {
                return;
            }
            if (!dom) {
                dom = module.renderTree.query(this.domKey);
            }
            if (!el) {
                el = module.container.querySelector("[key='" + this.domKey + "']");
            }
            const model = module.modelFactory.get(dom.modelId);
            if (this.capture) {
                handleSelf(this, e, model, module, el, dom);
                handleDelg(this, e, model, module, el, dom);
            }
            else {
                if (handleDelg(this, e, model, module, el, dom)) {
                    handleSelf(this, e, model, module, el, dom);
                }
            }
            if (this.events !== undefined && this.events[this.name].length === 0 && this.handler === undefined) {
                if (ExternalEvent.touches[this.name]) {
                    ExternalEvent.unregist(this, el);
                }
                else {
                    if (el !== null) {
                        el.removeEventListener(this.name, this.handleListener);
                    }
                }
            }
            function handleDelg(eObj, e, model, module, el, dom) {
                if (eObj.events === undefined) {
                    return true;
                }
                let arr = eObj.events[eObj.name];
                if (nodom.Util.isArray(arr)) {
                    if (arr.length > 0) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].el && arr[i].el.contains(e.target)) {
                                arr[i].fire(e);
                                if (arr[i].once) {
                                    eObj.removeSubEvt(arr[i]);
                                }
                                if (arr[i].nopopo) {
                                    return false;
                                }
                            }
                        }
                    }
                    else {
                        eObj.events.delete(eObj.name);
                    }
                }
                return true;
            }
            function handleSelf(eObj, e, model, module, el, dom) {
                let foo = module.methodFactory.get(eObj.handler);
                if (nodom.Util.isFunction(foo)) {
                    if (eObj.nopopo) {
                        e.stopPropagation();
                    }
                    nodom.Util.apply(foo, model, [e, module, el, dom]);
                    if (eObj.once) {
                        delete eObj.handler;
                    }
                }
            }
        }
        bind(module, dom, el) {
            this.moduleName = module.name;
            this.domKey = dom.key;
            if (ExternalEvent.touches[this.name]) {
                ExternalEvent.regist(this, el);
            }
            else {
                this.handleListener = (e) => {
                    this.fire(e, el, dom);
                };
                el.addEventListener(this.name, this.handleListener, this.capture);
            }
        }
        delegateTo(module, vdom, el, parent, parentEl) {
            this.domKey = vdom.key;
            this.moduleName = module.name;
            if (!parentEl) {
                parentEl = document.body;
            }
            if (!parent.events.hasOwnProperty(this.name)) {
                let ev = new NodomEvent(this.name);
                ev.bind(module, parent, parentEl);
                parent.events[this.name] = ev;
            }
            parent.events[this.name].addSubEvt(this);
        }
        addSubEvt(ev) {
            if (!this.events) {
                this.events = new Map();
            }
            if (!this.events.has(this.name)) {
                this.events.set(this.name, new Array());
            }
            this.events.get(this.name).push(ev);
        }
        removeSubEvt(ev) {
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
            let evt = new NodomEvent(this.name);
            let arr = ['delg', 'once', 'nopopo', 'useCapture', 'handler', 'handleEvent', 'module'];
            arr.forEach((item) => {
                evt[item] = this[item];
            });
            return evt;
        }
    }
    nodom.NodomEvent = NodomEvent;
    class ExternalEvent {
        static regist(evtObj, el) {
            let touchEvts = ExternalEvent.touches[evtObj.name];
            if (!nodom.Util.isEmpty(evtObj.touchListeners)) {
                this.unregist(evtObj);
            }
            if (!el) {
                const module = nodom.ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }
            evtObj.touchListeners = new Map();
            if (touchEvts && el !== null) {
                nodom.Util.getOwnProps(touchEvts).forEach(function (ev) {
                    evtObj.touchListeners[ev] = function (e) {
                        touchEvts[ev](e, evtObj);
                    };
                    el.addEventListener(ev, evtObj.touchListeners[ev], evtObj.capture);
                });
            }
        }
        static unregist(evtObj, el) {
            const evt = ExternalEvent.touches[evtObj.name];
            if (!el) {
                const module = nodom.ModuleFactory.get(evtObj.moduleName);
                el = module.container.querySelector("[key='" + evtObj.domKey + "']");
            }
            if (evt) {
                if (el !== null) {
                    nodom.Util.getOwnProps(evtObj.touchListeners).forEach(function (ev) {
                        el.removeEventListener(ev, evtObj.touchListeners[ev]);
                    });
                }
            }
        }
    }
    ExternalEvent.touches = {};
    nodom.ExternalEvent = ExternalEvent;
    ExternalEvent.touches = {
        tap: {
            touchstart: function (e, evtObj) {
                let tch = e.touches[0];
                evtObj.extParams = {
                    pos: { sx: tch.pageX, sy: tch.pageY, t: Date.now() }
                };
            },
            touchmove: function (e, evtObj) {
                let pos = evtObj.extParams.pos;
                let tch = e.touches[0];
                let dx = tch.pageX - pos.sx;
                let dy = tch.pageY - pos.sy;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    pos.move = true;
                }
            },
            touchend: function (e, evtObj) {
                let pos = evtObj.extParams.pos;
                let dt = Date.now() - pos.t;
                if (pos.move === true || dt > 200) {
                    return;
                }
                evtObj.fire(e);
            }
        },
        swipe: {
            touchstart: function (e, evtObj) {
                let tch = e.touches[0];
                let t = Date.now();
                evtObj.extParams = {
                    swipe: {
                        oldTime: [t, t],
                        speedLoc: [{ x: tch.pageX, y: tch.pageY }, { x: tch.pageX, y: tch.pageY }],
                        oldLoc: { x: tch.pageX, y: tch.pageY }
                    }
                };
            },
            touchmove: function (e, evtObj) {
                let nt = Date.now();
                let tch = e.touches[0];
                let mv = evtObj.extParams['swipe'];
                if (nt - mv.oldTime > 50) {
                    mv.speedLoc[0] = { x: mv.speedLoc[1].x, y: mv.speedLoc[1].y };
                    mv.speedLoc[1] = { x: tch.pageX, y: tch.pageY };
                    mv.oldTime[0] = mv.oldTime[1];
                    mv.oldTime[1] = nt;
                }
                mv.oldLoc = { x: tch.pageX, y: tch.pageY };
            },
            touchend: function (e, evtObj) {
                let mv = evtObj.extParams['swipe'];
                let nt = Date.now();
                let ind = (nt - mv.oldTime[1] < 30) ? 0 : 1;
                let dx = mv.oldLoc.x - mv.speedLoc[ind].x;
                let dy = mv.oldLoc.y - mv.speedLoc[ind].y;
                let s = Math.sqrt(dx * dx + dy * dy);
                let dt = nt - mv.oldTime[ind];
                if (dt > 300 || s < 10) {
                    return;
                }
                let v0 = s / dt;
                if (v0 > 0.05) {
                    let sname = '';
                    if (dx < 0 && Math.abs(dy / dx) < 1) {
                        e.v0 = v0;
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
    };
    ExternalEvent.touches['swipeleft'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swiperight'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipeup'] = ExternalEvent.touches['swipe'];
    ExternalEvent.touches['swipedown'] = ExternalEvent.touches['swipe'];
})(nodom || (nodom = {}));
//# sourceMappingURL=nodomevent.js.map