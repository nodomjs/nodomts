/**
 * 路由主模块
 */
class MdlPMod2 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_pmod2',
            template: 'router/router2.html',
            delayInit:true,
            data: {
                routes: [{
                        title: '首页',
                        path: '/router/directive/route2/rparam/home/1',
                        useParentPath:true,
                        active: true
                    },
                    {
                        title: '列表',
                        path: '/router/directive/route2/rparam/list/2',
                        useParentPath:true,
                        active: false
                    },
                    {
                        title: '数据',
                        path: '/router/directive/route2/rparam/data/3',
                        useParentPath:true,
                        active: false
                    }
                ]
            }
        });
        super(config);
    }
}