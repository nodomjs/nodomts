/**
 * 模块A
 */
class ModuleA extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            template:`
                <button e-click='sendMsg'>发送</button>
                <button e-click='addData'>添加</button>
                <ul>
                    <li x-repeat='foods'>{{name}}</li>
                </ul>
            `,
            methods:{
                addData:function(model){
                    model.data.foods.push({id:4,name:'烤羊蹄',price:'58'});
                },
                sendMsg:function(dom, model, module){
                    module.send('modb1','hello');
                }
            }
        });
        super(config);
    }
}