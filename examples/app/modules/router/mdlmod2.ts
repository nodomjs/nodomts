/**
 * 路由主模块
 */
class MdlMod2 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod2',
            template: "<div>这是商品列表页,路径是{{$route.path}}</div>"
        });
        super(config);
    }
}