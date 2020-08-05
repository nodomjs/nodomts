/**
 * 路由主模块
 */
class MdlRouteMain extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            template:'router/index.html',
            data: {
                page1: true,
                page2: false,
                date1: (new Date()).getTime()
            }
        });
        super(config);
    }
}