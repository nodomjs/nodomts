/**
 * 路由主模块
 */
class MdlPMod3 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_pmod3',
            template: 'router/router3.html'
        });
        super(config);
    }
}