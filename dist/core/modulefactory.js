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
     * 过滤器工厂，存储模块过滤器
     */
    class ModuleFactory {
        /**
         * 添加模块到工厂
         * @param id    模块id
         * @param item  模块存储对象
         */
        static add(item) {
            this.modules.set(item.id, item);
        }
        /**
         * 获得模块
         * @param id    模块id
         */
        static get(id) {
            return this.modules.get(id);
        }
        /**
         * 获取模块实例（通过类名）
         * @param className     模块类名
         * @param moduleName    模块名
         * @param data          数据或数据url
         */
        static getInstance(className, moduleName, data) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.classes.has(className)) {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.moduleClass, className);
                }
                let cfg = this.classes.get(className);
                if (!cfg.instance) {
                    yield this.initModule(cfg);
                }
                if (cfg.instance) {
                    if (cfg.singleton) {
                        return cfg.instance;
                    }
                    else {
                        let mdl = cfg.instance.clone(moduleName);
                        //处理数据
                        if (data) {
                            //如果为url，则设置dataurl和loadnewdata标志
                            if (typeof data === 'string') {
                                mdl.dataUrl = data;
                                mdl.loadNewData = true;
                            }
                            else { //数据模型化
                                mdl.model = new nodom.Model(data, mdl);
                            }
                        }
                        return mdl;
                    }
                }
                return null;
            });
        }
        /**
         * 从工厂移除模块
         * @param id    模块id
         */
        static remove(id) {
            this.modules.delete(id);
        }
        /**
         * 设置主模块
         * @param m 	模块
         */
        static setMain(m) {
            this.mainModule = m;
            m.isMain = true;
        }
        /**
         * 获取主模块
         * @returns 	应用的主模块
         */
        static getMain() {
            return this.mainModule;
        }
        /**
         * 初始化模块类
         * @param modules
         */
        static init(modules) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let cfg of modules) {
                    if (!cfg.path) {
                        throw new nodom.NodomError("paramException", 'modules', 'path');
                    }
                    if (!cfg.class) {
                        throw new nodom.NodomError("paramException", 'modules', 'class');
                    }
                    //lazy默认true
                    if (cfg.lazy === undefined) {
                        cfg.lazy = false;
                    }
                    //singleton默认true
                    if (cfg.singleton === undefined) {
                        cfg.singleton = true;
                    }
                    if (!cfg.lazy) {
                        yield this.initModule(cfg);
                    }
                    //存入class工厂
                    this.classes.set(cfg.class, cfg);
                }
            });
        }
        /**
         * 出事化模块
         * @param cfg 模块类对象
         */
        static initModule(cfg) {
            return __awaiter(this, void 0, void 0, function* () {
                //增加 .js后缀
                let path = cfg.path;
                if (!path.endsWith('.js')) {
                    path += '.js';
                }
                //加载模块类js文件
                let url = nodom.Util.mergePath([nodom.Application.getPath('module'), path]);
                yield nodom.ResourceManager.getResources([{ url: url, type: 'js' }]);
                let cls = eval(cfg.class);
                if (cls) {
                    let instance = Reflect.construct(cls, [{
                            data: cfg.data,
                            lazy: cfg.lazy
                        }]);
                    //模块初始化
                    yield instance.init();
                    cfg.instance = instance;
                    //单例，则需要保存到modules
                    if (cfg.singleton) {
                        this.modules.set(instance.id, instance);
                    }
                }
                else {
                    throw new nodom.NodomError('notexist1', nodom.TipWords.moduleClass, cfg.class);
                }
            });
        }
    }
    /**
     * 模块对象工厂 {moduleId:{key:容器key,className:模块类名,instance:模块实例}}
     */
    ModuleFactory.modules = new Map();
    /**
     * 模块类集合
     */
    ModuleFactory.classes = new Map();
    nodom.ModuleFactory = ModuleFactory;
})(nodom || (nodom = {}));
//# sourceMappingURL=modulefactory.js.map