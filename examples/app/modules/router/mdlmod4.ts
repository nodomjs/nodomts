/**
 * 路由主模块
 */
class MdlMod4 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_mod4',
            data:{
                routes: [{
                        title: '商品详情',
                        path: '/router/route2/rparam/home/1/desc',
                        active: true
                    },
                    {
                        title: '评价',
                        path: '/router/route2/rparam/home/1/comment',
                        active: false
                    }
                ]    
            },
            template: `<div test='1'>这是{{$route.data.page}}页,编号是{{$route.data.id}}
                <div>
                <a x-repeat='routes' x-route='{{path}}'  activeClass='colorimp' activeName='active'  style='margin:10px'>{{title}}</a>&nbsp;
                <div x-router></div>
                </div>
                </div>`
        });
        super(config);
    }
}