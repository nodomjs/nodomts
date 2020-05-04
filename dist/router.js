var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var nodom;
(function (nodom) {
    class Router {
        static addPath(path) {
            for (let i = 0; i < this.waitList.length; i++) {
                let li = this.waitList[i];
                if (li === path) {
                    return;
                }
                if (li.indexOf(path) === 0 && li.substr(path.length + 1, 1) === '/') {
                    return;
                }
            }
            this.waitList.push(path);
            this.load();
        }
        static load() {
            if (this.loading || this.waitList.length === 0) {
                return;
            }
            let path = this.waitList.shift();
            this.loading = true;
            this.start(path);
        }
        static start(path) {
            return __awaiter(this, void 0, void 0, function* () {
                let diff = this.compare(this.currentPath, path);
                let parentModule = diff[0] === null ? nodom.ModuleFactory.getMain() : nodom.ModuleFactory.get(diff[0].module);
                for (let i = diff[1].length - 1; i >= 0; i--) {
                    const r = diff[1][i];
                    if (!r.module) {
                        continue;
                    }
                    let module = nodom.ModuleFactory.get(r.module);
                    if (nodom.Util.isFunction(this.onDefaultLeave)) {
                        this.onDefaultLeave(module.model);
                    }
                    if (nodom.Util.isFunction(r.onLeave)) {
                        r.onLeave(module.model);
                    }
                    module.unactive();
                }
                let showPath;
                if (this.startStyle !== 2 && showPath) {
                    if (this.showPath && showPath.indexOf(this.showPath) === 0) {
                        history.replaceState(path, '', nodom.Application.routerPrePath + showPath);
                    }
                    else {
                        history.pushState(path, '', nodom.Application.routerPrePath + showPath);
                    }
                    this.showPath = showPath;
                }
                if (diff[2].length === 0) {
                    let route = diff[0];
                    if (route !== null) {
                        setRouteParamToModel(route);
                        if (!route.useParentPath) {
                            showPath = route.fullPath;
                        }
                        route.setLinkActive(true);
                    }
                }
                else {
                    for (let i = 0; i < diff[2].length; i++) {
                        let route = diff[2][i];
                        if (!route || !route.module) {
                            continue;
                        }
                        if (!route.useParentPath) {
                            showPath = route.fullPath;
                        }
                        if (!parentModule.routerKey) {
                            throw new nodom.NodomError('notexist', nodom.TipWords.routeView);
                        }
                        let module = nodom.ModuleFactory.get(route.module);
                        module.containerParam = {
                            module: parentModule.name,
                            selector: "[key='" + parentModule.routerKey + "']"
                        };
                        module.addBeforeFirstRenderOperation(function () {
                            nodom.Util.empty(module.container);
                        });
                        yield module.init();
                        route.setLinkActive(true);
                        setRouteParamToModel(route);
                        if (nodom.Util.isFunction(this.onDefaultEnter)) {
                            this.onDefaultEnter(module.model);
                        }
                        if (nodom.Util.isFunction(route.onEnter)) {
                            route.onEnter(module.model);
                        }
                        parentModule = module;
                    }
                }
                this.currentPath = path;
                this.loading = false;
                this.load();
                Router.startStyle = 0;
                function setRouteParamToModel(route) {
                    if (!route) {
                        return;
                    }
                    const module = nodom.ModuleFactory.get(route.module);
                    let model = module.model;
                    let o = {
                        path: route.path
                    };
                    if (!nodom.Util.isEmpty(route.data)) {
                        o['data'] = route.data;
                    }
                    if (!model) {
                        module.model = new nodom.Model({ $route: o }, module);
                    }
                    else {
                        model.data['$route'] = o;
                    }
                    nodom.Renderer.add(module);
                }
            });
        }
        static redirect(path) {
            this.addPath(path);
        }
        static addRoute(route, parent) {
            if (RouterTree.add(route, parent) === false) {
                throw new nodom.NodomError("exist1", nodom.TipWords.route, route.path);
            }
            this.routes.set(route.id, route);
        }
        static getRoute(path, last) {
            if (!path) {
                return null;
            }
            let routes = RouterTree.get(path);
            if (routes === null || routes.length === 0) {
                return null;
            }
            if (last) {
                return [routes[routes.length - 1]];
            }
            else {
                return routes;
            }
        }
        static compare(path1, path2) {
            let arr1 = null;
            let arr2 = null;
            if (path1) {
                arr1 = this.getRoute(path1);
            }
            if (path2) {
                arr2 = this.getRoute(path2);
            }
            let len = 0;
            if (arr1 !== null) {
                len = arr1.length;
            }
            if (arr2 !== null) {
                if (arr2.length < len) {
                    len = arr2.length;
                }
            }
            else {
                len = 0;
            }
            let retArr1 = [];
            let retArr2 = [];
            let i = 0;
            for (i = 0; i < len; i++) {
                if (arr1[i].id === arr2[i].id) {
                    if (JSON.stringify(arr1[i].data) !== JSON.stringify(arr2[i].data)) {
                        i++;
                        break;
                    }
                }
                else {
                    break;
                }
            }
            if (arr1 !== null) {
                for (let j = i; j < arr1.length; j++) {
                    retArr1.push(arr1[j]);
                }
            }
            if (arr2 !== null) {
                for (let j = i; j < arr2.length; j++) {
                    retArr2.push(arr2[j]);
                }
            }
            let p1 = null;
            let p2 = null;
            if (arr1 !== null && i > 0) {
                for (let j = i - 1; j >= 0 && (p1 === null || p2 === null); j--) {
                    if (arr1[j].module !== undefined) {
                        if (p1 === null) {
                            p1 = arr1[j];
                        }
                        else if (p2 === null) {
                            p2 = arr1[j];
                        }
                    }
                }
            }
            return [p1, retArr1, retArr2, p2];
        }
        static changeActive(module, path) {
            if (!module || !path || path === '') {
                return;
            }
            let domArr = Router.activeDomMap.get(module.name);
            if (!domArr) {
                return;
            }
            domArr.forEach((item) => {
                let dom = module.renderTree.query(item);
                if (!dom) {
                    return;
                }
                let domPath = dom.props['path'];
                if (dom.exprProps.hasOwnProperty('active')) {
                    let model = module.modelFactory.get(dom.modelId);
                    if (!model) {
                        return;
                    }
                    let expr = module.expressionFactory.get(dom.exprProps['active'][0]);
                    if (!expr) {
                        return;
                    }
                    let field = expr.fields[0];
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        model.data[field] = true;
                    }
                    else {
                        model.data[field] = false;
                    }
                }
                else if (dom.props.hasOwnProperty('active')) {
                    if (path === domPath || path.indexOf(domPath + '/') === 0) {
                        dom.props['active'] = true;
                    }
                    else {
                        dom.props['active'] = false;
                    }
                }
            });
        }
    }
    Router.loading = false;
    Router.routes = new Map();
    Router.currentPath = '';
    Router.showPath = '';
    Router.waitList = [];
    Router.currentIndex = 0;
    Router.moduleRouteMap = new Map();
    Router.startStyle = 0;
    Router.activeDomMap = new Map();
    nodom.Router = Router;
    class Route {
        constructor(config) {
            this.params = [];
            this.data = {};
            this.children = [];
            this.onEnter = config.onEnter;
            this.onLeave = config.onLeave;
            this.useParentPath = config.useParentPath;
            this.path = config.path;
            this.module = config.module instanceof nodom.Module ? config.module.name : config.module;
            if (config.path === '') {
                return;
            }
            this.id = nodom.Util.genId();
            if (!config.notAdd) {
                Router.addRoute(this, config.parent);
            }
            if (nodom.Util.isArray(config.routes)) {
                config.routes.forEach((item) => {
                    item.parent = this;
                    new Route(item);
                });
            }
        }
        setLinkActive(ancestor) {
            let path = this.fullPath;
            let module = nodom.ModuleFactory.get(this.module);
            if (module && module.containerParam) {
                let pm = nodom.ModuleFactory.get(module.containerParam['module']);
                if (pm) {
                    Router.changeActive(pm, path);
                }
            }
            if (ancestor && this.parent) {
                this.parent.setLinkActive(true);
            }
        }
    }
    nodom.Route = Route;
    class RouterTree {
        static add(route, parent) {
            if (!this.root) {
                this.root = new Route({ path: "", notAdd: true });
            }
            let pathArr = route.path.split('/');
            let node = parent || this.root;
            let param = [];
            let paramIndex = -1;
            let prePath = '';
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    pathArr.splice(i--, 1);
                    continue;
                }
                if (v.startsWith(':')) {
                    if (param.length === 0) {
                        paramIndex = i;
                    }
                    param.push(v.substr(1));
                }
                else {
                    paramIndex = -1;
                    param = [];
                    route.path = v;
                    let j = 0;
                    for (; j < node.children.length; j++) {
                        let r = node.children[j];
                        if (r.path === v) {
                            node = r;
                            break;
                        }
                    }
                    if (j === node.children.length) {
                        if (prePath !== '') {
                            node.children.push(new Route({ path: prePath, notAdd: true }));
                            node = node.children[node.children.length - 1];
                        }
                        prePath = v;
                    }
                }
                if (paramIndex === -1) {
                    route.params = [];
                }
                else {
                    route.params = param;
                }
            }
            if (node !== undefined && node !== route) {
                route.path = prePath;
                node.children.push(route);
            }
            return true;
        }
        static get(path) {
            if (!this.root) {
                throw new nodom.NodomError("notexist", nodom.TipWords.root);
            }
            let pathArr = path.split('/');
            let node = this.root;
            let paramIndex = 0;
            let retArr = [];
            let fullPath = '';
            let preNode = this.root;
            for (let i = 0; i < pathArr.length; i++) {
                let v = pathArr[i].trim();
                if (v === '') {
                    continue;
                }
                let find = false;
                for (let j = 0; j < node.children.length; j++) {
                    if (node.children[j].path === v) {
                        if (preNode !== this.root) {
                            preNode.fullPath = fullPath;
                            preNode.data = node.data;
                            retArr.push(preNode);
                        }
                        node = node.children[j];
                        node.data = {};
                        preNode = node;
                        find = true;
                        break;
                    }
                }
                fullPath += '/' + v;
                if (!find) {
                    if (paramIndex < node.params.length) {
                        node.data[node.params[paramIndex++]] = v;
                    }
                }
            }
            if (node !== this.root) {
                node.fullPath = fullPath;
                retArr.push(node);
            }
            return retArr;
        }
    }
    window.addEventListener('popstate', function (e) {
        const state = history.state;
        if (!state) {
            return;
        }
        Router.startStyle = 2;
        Router.addPath(state);
    });
    nodom.DirectiveManager.addType('route', {
        init: (directive, dom, module) => {
            let value = directive.value;
            if (nodom.Util.isEmpty(value)) {
                return;
            }
            if (dom.tagName === 'A') {
                dom.props['href'] = 'javascript:void(0)';
            }
            if (value && value.substr(0, 2) === '{{' && value.substr(value.length - 2, 2) === '}}') {
                let expr = new nodom.Expression(value.substring(2, value.length - 2), module);
                dom.exprProps['path'] = expr;
                directive.value = expr;
            }
            else {
                dom.props['path'] = value;
            }
            let method = '$nodomGenMethod' + nodom.Util.genId();
            module.methodFactory.add(method, (e, module, view, dom) => {
                let path = dom.props['path'];
                if (nodom.Util.isEmpty(path)) {
                    return;
                }
                Router.addPath(path);
            });
            dom.events['click'] = new nodom.NodomEvent('click', method);
        },
        handle: (directive, dom, module, parent) => {
            if (dom.props.hasOwnProperty('active')) {
                let domArr = Router.activeDomMap.get(module.name);
                if (!domArr) {
                    Router.activeDomMap.set(module.name, [dom.key]);
                }
                else {
                    if (!domArr.includes(dom.key)) {
                        domArr.push(dom.key);
                    }
                }
                let route = Router.getRoute(dom.props['path'], true);
                if (route === null) {
                    return;
                }
            }
            let path = dom.props['path'];
            if (path === Router.currentPath) {
                return;
            }
            if (dom.props.hasOwnProperty('active') && dom.props['active'] !== 'false' && (!Router.currentPath || path.indexOf(Router.currentPath) === 0)) {
                Router.addPath(path);
            }
        }
    });
    nodom.DirectiveManager.addType('router', {
        init: (directive, dom, module) => {
            module.routerKey = dom.key;
        },
        handle: (directive, dom, module, parent) => {
            return;
        }
    });
})(nodom || (nodom = {}));
//# sourceMappingURL=router.js.map