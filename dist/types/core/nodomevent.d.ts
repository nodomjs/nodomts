/// <reference path="nodom.d.ts" />
declare namespace nodom {
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
    class NodomEvent {
        id: number;
        /**
         * 事件名
         */
        name: string;
        /**
         * 子事件数组
         */
        events: Map<string, Array<NodomEvent>>;
        /**
         * 事件处理函数名(需要在模块methods中定义)
         */
        handler: string | Function;
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
        moduleName: string;
        /**
         * 事件所属虚拟dom的key
         */
        domKey: string;
        /**
         * 事件监听器
         */
        handleListener: any;
        /**
         * 触屏监听器
         */
        touchListeners: Map<string, NodomEvent>;
        /**
         * 附加参数
         */
        extParams: any;
        /**
         * @param eventName     事件名
         * @param eventStr      事件串或事件处理函数,以“:”分割,中间不能有空格,结构为: 方法名[:delg(代理到父对象):nopopo(禁止冒泡):once(只执行一次):capture(useCapture)]
         *                      如果为函数，则替代第三个参数
         * @param handler       事件执行函数，如果方法不在module methods中定义，则可以直接申明，eventStr第一个参数失效，即eventStr可以是":delg:nopopo..."
         */
        constructor(eventName: string, eventStr?: string | Function, handler?: Function);
        /**
         * 事件触发
         * @param e     事件
         * @param el    html element
         */
        fire(e: Event, el?: HTMLElement): void;
        /**
         * 绑定事件
         * @param module    模块
         * @param dom       虚拟dom
         * @param el        html element
         */
        bind(module: Module, dom: Element, el: HTMLElement): void;
        /**
         *
         * 事件代理到父对象
         * @param module    模块
         * @param vdom      虚拟dom
         * @param el        事件作用的html element
         * @param parent    父虚拟dom
         * @param parentEl  父element
         */
        delegateTo(module: Module, vdom: Element, el: HTMLElement, parent?: Element, parentEl?: HTMLElement): void;
        /**
         * 添加子事件
         * @param ev    事件
         */
        addChild(ev: any): void;
        /**
         * 移除子事件
         * @param ev    子事件
         */
        removeChild(ev: any): void;
        clone(): NodomEvent;
    }
    /****************扩展事件*********************/
    class ExternalEvent {
        /**
         * 触屏事件
         */
        static touches: any;
        /**
         * 注册事件
         * @param evtObj    event对象
         */
        static regist(evtObj: NodomEvent, el: HTMLElement): void;
        /**
         * 取消已注册事件
         * @param evtObj    event对象
         * @param el        事件绑定的html element
         */
        static unregist(evtObj: NodomEvent, el?: HTMLElement): void;
    }
}
