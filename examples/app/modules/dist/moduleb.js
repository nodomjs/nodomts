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
                    module.broadcast(model.data.msg);
                },
                sendParent: function (dom, model, module) {
                    module.send('modb1', model.data.msg,2);
                },
                onReceive: function (model, from, msg) {
                    console.log(this,msg,model);
                    model.set('msg1',msg);
                    model.set('from',from);
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=moduleb.js.map