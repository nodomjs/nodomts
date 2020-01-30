module.exports = {
    mode:'development',
    entry:{
        index:"./src/index.ts",
        routetest:"./src/routetest.ts",
        decorator:"./src/decorator.ts"
        
    },
    output:{
        path:__dirname + "/dist",
        filename:"[name].js"
    },
    resolve:{
        extensions:[".ts",".tsx"]
    },
    module:{
        rules:[
            {
                test:/\.tsx?$/,
                loaders:["awesome-typescript-loader"]
            }
        ]
    }
}