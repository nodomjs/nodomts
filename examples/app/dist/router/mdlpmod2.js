/**
 * 路由主模块
 */
class MdlPMod2 extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            name: 'r_pmod2',
            template: 'router/router2.html',
            delayInit: true,
            data: {
                routes: [{
                        title:'首页2',
                        path: '/router/route2/rparam/home/1',
                        active: true
                    },
                    {
                        title: '列表2',
                        path: '/router/route2/rparam/list/2',
                        active: false
                    },
                    {
                        title: '数据2',
                        path: '/router/route2/rparam/data/3',
                        active: false
                    }
                ]
            }
        });
        super(config);
    }
}
//# sourceMappingURL=mdlpmod2.js.map