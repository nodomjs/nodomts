/**
 * 路由主模块
 */
class MdlMod6 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod6',
            template: '<span>路由r2加载的模块</span>'
        });
        super(config);
    }
}