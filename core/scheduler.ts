// / <reference path="nodom.ts" />
namespace nodom{
	/**
	 * 调度器，用于每次空闲的待操作序列调度
	 */
	export class Scheduler{
		static tasks:Array<any> = [];
		static dispatch(){
			Scheduler.tasks.forEach((item)=>{
				if(Util.isFunction(item.func)){
					if(item.thiser){
						item.func.call(item.thiser);
					}else{
						item.func();
					}
				}
			});
		}

		/**
		 * 启动调度器
		 * @param scheduleTick 	渲染间隔
		 */
		static start(scheduleTick?:number){
			Scheduler.dispatch();
			if(window.requestAnimationFrame){
				window.requestAnimationFrame(Scheduler.start);
			}else{
				window.setTimeout(Scheduler.start,scheduleTick||50);
			}		
		}

		/**
		 * 添加任务
		 * @param foo 		任务和this指向
		 * @param thiser 	this指向
		 */
		static addTask(foo:Function,thiser?:any){
			if(!Util.isFunction(foo)){
				throw new NodomError("invoke","Scheduler.addTask","0","function");
			}
			
			Scheduler.tasks.push({func:foo,thiser:thiser});
		}

		/**
		 * 移除任务
		 * @param foo 	任务
		 */
		static removeTask(foo){
			if(!Util.isFunction(foo)){
				throw new NodomError("invoke","Scheduler.removeTask","0","function");
			}
			let ind = -1;
			if((ind = Scheduler.tasks.indexOf(foo)) !== -1){
				Scheduler.tasks.splice(ind,1);
			}	
		}
	}
}