/**
 * 路由主模块
 */
class MdlMod7 extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            name: 'r_mod7',
            template: '<span>这是商品详情页</span>'
        });
        super(config);
    }
}
//# sourceMappingURL=mdlmod7.js.map