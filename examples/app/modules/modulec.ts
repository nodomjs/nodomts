/**
 * 模块A
 */
class ModuleC extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            template:'c.html',
            data:{
                from:'',
                msg:'发送消息',
                msg1:'',
            },
            methods:{
                sendMsg:function(dom,model,module){
                    module.broadcast(model.data.msg);
                }
            }
        });
        super(config);
    }
}