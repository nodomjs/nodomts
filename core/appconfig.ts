namespace nodom{
    /**
     * app 配置
     */
    export let AppConfig = {
        /**
         * 
         */
        renderTick:50,								//渲染时间间隔
        /**
         * 
         */
        appPath:'/',							//应用加载默认路径,
        
        deviceType:'ontouchend' in document?1:2,	//设备类型  1:触屏，2:非触屏	
        routerPrePath:'/webroute'						//路由前置路径
    }
}