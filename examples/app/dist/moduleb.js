/**
 * 模块A
 */
class ModuleB extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            template: 'b.html',
            data: {
                from: '',
                msg: '发送消息',
                msg1: ''
            },
            methods: {
                sendMsg: function (dom, model, module) {
                    console.log(model.data);
                    module.broadcast(model.data.msg);
                },
                onReceive:function(model,from,msg){
                    model.set('msg1',msg);
                    model.set('from',from);
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=moduleb.js.map