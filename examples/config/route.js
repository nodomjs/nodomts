NodomConfig = {
    /**调度器执行周期，支持requestAnimation时无效 */
    scheduleCircle:50,
    /**全局路径 */
    path:{
        app:'/examples/app',
        template:'view',
        css:'css',
        route:'/route',
        module:'modules/dist'
    },
    /**模块配置 */
    modules:[
        {class:'MdlRouteMain',path:'router/mdlroutemain',singleton:true,lazy:false},
        {class:'MdlRouteDir',path:'router/mdlroutedir',singleton:true},
        {class:'MdlPMod1',path:'router/mdlpmod1',singleton:true},
        {class:'MdlPMod2',path:'router/mdlpmod2',singleton:true},
        {class:'MdlPMod3',path:'router/mdlpmod3',singleton:true},
        {class:'MdlMod1',path:'router/mdlmod1',singleton:true},
        {class:'MdlMod2',path:'router/mdlmod2',singleton:true},
        {class:'MdlMod3',path:'router/mdlmod3',singleton:true},
        {class:'MdlMod4',path:'router/mdlmod4',singleton:true},
        {class:'MdlMod5',path:'router/mdlmod5',singleton:true},
        {class:'MdlMod6',path:'router/mdlmod6',singleton:true},
        {class:'MdlMod7',path:'router/mdlmod7',singleton:true},
        {class:'MdlMod8',path:'router/mdlmod8',singleton:true}
    ],
    /**路由配置 */
    routes:[{
        path: '/router',
        module: 'MdlRouteDir',
        routes: [
            {
                path: '/route1',
                module: 'MdlPMod1',
                moduleName:'r_mod1',
                routes: [{
                    path: '/home',
                    module: 'MdlMod1'
                }, {
                    path: '/list',
                    module: 'MdlMod2'
                }, {
                    path: '/data',
                    module: 'MdlMod3'
                }],
                onLeave:function(model){
                    // console.log(this,model);
                }
            },
            {
                path: '/route2',
                module: 'MdlPMod2',
                onEnter: function () {
                    // console.log('route2');
                },
                routes: [{
                    path: '/rparam/:page/:id',
                    module: 'MdlMod4',
                    // useParentPath:true,
                    onEnter: function () {
                        // console.log('route2/rparam');
                    },
                    routes:[{
                        path:'/desc',
                        module:'MdlMod7',
                        // useParentPath:true
                    },{
                        path:'/comment',
                        module:'MdlMod8',
                        // useParentPath:true
                    }]
                }]
            }, 
            {
                path: '/route3',
                module: 'MdlPMod3',
                routes: [{
                    path: '/r1',
                    module: 'MdlMod5',
                    routes: [{
                        path: '/r2',
                        module: 'MdlMod6'
                    }]
                }]
            }
        ]
    }]
}
