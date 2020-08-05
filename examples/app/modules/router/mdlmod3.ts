/**
 * 路由主模块
 */
class MdlMod3 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod3',
            template: "<div>这是数据页,路径是{{$route.path}}</div>"
        });
        super(config);
    }
}