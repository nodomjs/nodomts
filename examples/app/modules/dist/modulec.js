/**
 * 模块A
 */
class ModuleC extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            template: 'c.html',
            data: {
                from: '',
                msg: '发送消息',
                msg1: '',
            },
            methods: {
                sendMsg: function (dom, model, module) {
                    console.log(model.data);
                    module.broadcast(model.data.msg);
                },
                sendParent: function (dom, model, module) {
                    module.send('modb1', model.data.msg,2);
                },
                onReceive: function (model, from, msg) {
                    console.log(model);
                    model.set('msg1', msg);
                    model.set('from', from);
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=modulec.js.map