/**
 * 路由主模块
 */
class MdlPMod1 extends nodom.Module{
    constructor(cfg:object){
        let config = nodom.Util.merge(cfg,{
            name: 'r_pmod1',
            template: 'router/router1.html',
            data: {
                home: true,
                list: false,
                data: false
            },
            methods:{
                onFirstRender:function(){
                    // console.log(this);
                }
            }
        });
        super(config);
    }
}