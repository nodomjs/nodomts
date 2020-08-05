NodomConfig = {
    renderTick:50,
    path:{
        app:'/examples/app',
        template:'view',
        css:'css',
        preRoute:'route',
        module:'dist'
    },
    modules:[
        {class:'ModuleA',path:'modulea.js',singleton:false,lazy:true}
    ]
}