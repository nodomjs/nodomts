/**
 * 路由主模块
 */
class MdlMod1 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod1',
            template: "<div>这是首页,路径是{{$route.path}}</div>"
        });
        super(config);
    }
}