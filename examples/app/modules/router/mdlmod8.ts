/**
 * 路由主模块
 */
class MdlMod8 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod8',
            template: '<span>这是商品描述页</span>'
        });
        super(config);
    }
}