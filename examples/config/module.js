NodomConfig = {
    /**调度器执行周期，支持requestAnimation时无效 */
    scheduleCircle:50,
    /**全局路径 */
    path:{
        app:'/examples/app',
        template:'view',
        css:'css',
        preRoute:'route',
        module:'dist'
    },
    /**模块配置 */
    modules:[
        {class:'ModuleA',path:'modulea',singleton:false,lazy:true}
    ],
    /**路由配置 */
    routes:[
        {path:''}
    ]
}