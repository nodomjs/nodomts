const path = require('path');
module.exports = {
    mode:'development',
    entry:[
        "./core/nodom.ts" ,
        "./core/application.ts" ,
        "./core/util.ts" ,
        "./core/compiler.ts" ,
        "./core/directive.ts" ,
        "./core/directivefactory.ts" ,
        "./core/directivemanager.ts" ,
        "./core/element.ts" ,
        "./core/nodomerror.ts" ,
        "./core/nodomevent.ts" ,
        "./core/expression.ts" ,
        "./core/expressionfactory.ts" ,
        "./core/factory.ts" ,
        "./core/filter.ts" ,
        "./core/filterfactory.ts" ,
        "./core/filtermanager.ts" ,
        "./core/linker.ts" ,
        "./core/messagequeue.ts" ,
        "./core/methodfactory.ts" ,
        "./core/model.ts" ,
        "./core/modelfactory.ts" ,
        "./core/module.ts" ,
        "./core/modulefactory.ts" ,
        "./core/renderer.ts" ,
        "./core/router.ts" ,
        "./core/scheduler.ts" ,
        "./core/serializer.ts" 
    ],
    output:{
        path:path.resolve(__dirname, "dist"),
        filename:"nodom.min.js",
        library:"nodom",
        libraryTarget:"umd"
    },
    module:{
        rules:[
            {
                test:/\.tsx?$/,
                use:["babel-loader","ts-loader"],
                exclude:[path.resolve(__dirname , "node_modules")]
            }
        ]
    },
    resolve:{
        extensions:[".ts",".js"]
    }
};