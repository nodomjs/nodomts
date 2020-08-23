/**
 * 路由主模块
 */
class MdlRouteDir extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'tdir_router',
            template: 'router/router.html',
            data: {
                routes: [{
                        title: '路由用法1-基本用法',
                        path: '/router/route1',
                        active: true
                    },
                    {
                        title: '路由用法2-路由参数用法',
                        path: '/router/route2',
                        active: false
                    },
                    {
                        title: '路由用法3-路由嵌套用法',
                        path: '/router/route3',
                        active: false
                    }
                ]
            }
        });
        super(config);
    }
}