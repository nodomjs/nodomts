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
                msg1: '',
            },
            methods: {
                sendMsg: function (dom, model, module) {
                    module.broadcast(model.data.msg);
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=moduleb.js.map