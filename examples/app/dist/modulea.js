/**
 * 模块A
 */
class ModuleA extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            template: `
                <button e-click='addData'>添加</button>
                <ul>
                    <li x-repeat='foods'>{{name}}</li>
                </ul>
            `,
            methods: {
                addData: function (dom,model) {
                    console.log(model);
                    model.data.foods.push({ id: 4, name: '烤羊蹄', price: '58' });
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=modulea.js.map