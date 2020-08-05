/**
 * 路由主模块
 */
class MdlMod4 extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            name: 'r_mod4',
            data: {
                routes: [{
                        title: '商品详情',
                        path: '/router/directive/route2/rparam/home/1/desc',
                        useParentPath: true,
                        active: true
                    },
                    {
                        title: '评价',
                        path: '/router/directive/route2/rparam/home/1/comment',
                        useParentPath: true,
                        active: false
                    }
                ]
            },
            template: `<div test='1'>这是{{$route.data.page}}页,编号是{{$route.data.id}}
                <a x-repeat='routes' x-route='{{path}}'  x-class="{colorimp:'active'}" active='{{active}}'  style='margin:10px'>{{title}}</a>&nbsp;
                <div x-router></div>
                </div>`
        });
        super(config);
    }
}
//# sourceMappingURL=mdlmod4.js.map