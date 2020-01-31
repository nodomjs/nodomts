namespace nodom{
	/**
	 * 调度器，用于每次空闲的待操作序列调度
	 */
	export class Scheduler{
		static tasks:Array<Function> = [];
		static dispatch(){
			Scheduler.tasks.forEach((foo)=>{
				if(Util.isFunction(foo)){
					foo();	
				}
			});
		}

		static start(){
			Scheduler.dispatch();
			if(window.requestAnimationFrame){
				window.requestAnimationFrame(Scheduler.start);
			}else{
				window.setTimeout(Scheduler.start,Application.renderTick);
			}		
		}

		/**
		 * 添加任务
		 * @param foo 	任务
		 */
		static addTask(foo){
			if(!Util.isFunction(foo)){
				throw new NodomError("invoke","Scheduler.addTask","0","function");
			}
			if(Scheduler.tasks.indexOf(foo) !== undefined){
				Scheduler.tasks.push(foo);	
			}
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

