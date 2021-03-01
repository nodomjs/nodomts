/**
 * 模块A
 */
class ModuleA extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            template: `
                <button e-click='sendMsg'>发送</button>
                <button e-click='addData'>添加</button>
                <ul>
                    <li x-repeat='foods' class='item'>{{name}}</li>
                </ul>
            `,
            requires:[{type:'css',url:'index.css'}],
            methods: {
                addData: function (dom,model) {
                    console.log(model.data);
                    model.data.foods.push({ id: 4, name: '烤羊蹄', price: '58' });
                },
                sendMsg: function (dom, model, module) {
                    module.send('modb1', 'hello',1);
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=modulea.js.map