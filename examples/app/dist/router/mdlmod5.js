/**
 * 路由主模块
 */
class MdlMod5 extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            name: 'r_mod5',
            template: "<div class='code1'>路由r1加载的模块<dir x-router></div></div>"
        });
        super(config);
    }
}
//# sourceMappingURL=mdlmod5.js.map