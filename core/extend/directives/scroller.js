/**
 * scroller 指令
 */
DirectiveManager.addType('scroller',{
	init:(directive,dom,module)=>{
		let newView = new Element('div');
		let topMargin = new Element('div');  	//顶部margin
		let bottomMargin = new Element('div');  //底部margin
		let leftMargin = new Element('div'); 	//左部margin
		let rightMargin = new Element('div');	//右部margin
		
		module.addBeforeFirstRenderOperation(()=>{
			dom.children.forEach((item)=>{
				newView.add(item);
			});
			dom.add(topMargin);
			dom.add(bottomMargin);
			dom.add(newView);
			dom.add(leftMargin);
			dom.add(rightMargin);
		});		
		
		new nodom.Event({
			view:newView,
			eventName:'transitionend',
			handler:function(e,d,v){
				pullBack(v);
				stopMoving(v);
				// moveObject.backFlag=false;
			}
		});
		//点击停止事件,拖动启动
		new nodom.Event({
			view:newView,
			eventName:'touchstart',
			handler:function(e,d,v){
				handleStop(e,d,v);
				startDrag(e,d,v);
			}
		});
		new nodom.Event({
			view:newView,
			eventName:'touchmove',
			handler:function(e,d,v){
				e.preventDefault();
				dragView(e,d,v);
			}
		});

		new nodom.Event({
			view:newView,
			eventName:'touchend',
			handler:function(e,d,v){
				freeDrag(e,d,v);
			}
		});

		new nodom.Event({
			view:newView,
			eventName:'moveout',
			handler:function(e,d,v){
				freeDrag(e,d,v);
			}
		});

		//横向
		if(value === 'horizontal'){
			css = {
				'overflow-x':'hidden'
			};
			css1 = {
				'overflow-x':'auto',
				'overflow-y':'inherit'
			};
			//事件
			new nodom.Event({
				view:newView,
				eventName:'swipeleft',
				handler:handleLeft
			});
			new nodom.Event({
				view:newView,
				eventName:'swiperight',
				handler:handleRight
			});
		}else if(value === 'verticle') { //纵向
			css = {
				'overflow-y':'hidden'
			};
			css1={
				'overflow-y':'visible',
				'overflow-x':'inherit'
			};
			//事件
			new nodom.Event({
				view:newView,
				eventName:'swipeup',
				handler:handleUp
			});
			new nodom.Event({
				view:newView,
				eventName:'swipedown',
				handler:handleDown
			});
		}else{
			css = {
				'overflow':'hidden'
			};
			css1 = {
				'overflow':'auto'
			};
		}
		
		//修改overflow
		nodom.css(view,css);
		nodom.css(newView,css1);
		nodom.css(scrollY,{
			width:'0.3rem',
			opacity:0,
			display:'block',
			borderRadius:'1px',
			background:'#333',
			zIndex:10,
			position:'absolute',
			right:'1px',
			transition:'opacity 5s linear',
			top:0
		});
	},
	handler:function(){
		let view = this;
		if(!scrollBar.y){
			let bars = nodom.get("[role='scrollbar']",true,view);
			scrollBar.x = bars[0];
			scrollBar.y = bars[1];	
		}
	}
});


/**
 * 停止
 */
function handleStop(event,data,view){
	if(!moveObject.moving){
		return;
	}
	//清除动画
	nodom.css(view,'transition','');
	let t = Date.now();
	let height = nodom.height(view);
	let pheight = nodom.height(view.parentNode);
	//需要重设置transform
	if(t<moveObject.t1){
		t -= moveObject.t0;
		let loc = nodom.getTranslate(view);
		let s = (moveObject.v0 * t - moveObject.a * t * t / 2)|0;
			
		let arr = moveObject.loc;
		let x=arr[0];
		let y=arr[1];
		let z=arr[2];
		switch(moveObject.dir){
			case 0:
				y -= s;
				if(y < pheight - height){
					y = pheight - height;
				}
				break;
			case 1:

				break;
			case 2:
				y += s;
				if(y>0){
					y=0;
				}
				break;
			default:
		}
		nodom.css(view,'transform','translate3d(' + x + 'px,' + y + 'px,' + z + 'px)');
	}
	stopMoving(view);
	
}
/**
 * 上滑
 */
function handleUp(event,data,view){
	handleVerticle(view,0);
}

/**
 * 下滑
 */
function handleDown(event,data,view){
	handleVerticle(view,2);
}


	/**
	 * 左滑
	 */
function handleLeft(event){

}

/**
 * 右滑
 */
function handleRight(event){

}

/**
 * 处理纵向滑动
 * @param view
 * @param dir 	方向 0 2
 */
function handleVerticle(view,dir){
	if(!checkNeedMove(view)){
		return;
	}
	let v0 = Math.abs(event.v0);
	let a = moveObject.a;
	let t = Math.abs(v0/a);
	let s = (v0*t - a*t*t/2)|0;
	
	if(dir === 0){
		s = -s;
	}
	//shezhi
	moveObject.dir = dir;

	scrollBar.y.style.transition = 'opacity 5s linear';
	scrollBar.y.style.opacity = '0.5';
	scrollBar.x.style.opacity = '0.5';
	//检查回拉
	s = checkPull(view,s);
	//如果存在回拖，则需要重新计算时间
	if(moveObject.backFlag){
		t = Math.abs(2*s/v0);
	}
	
	let trs = 'transform '+ t/1000 +'s cubic-bezier(0.333333,0.666667,0.666667,1)';
	//设置移动动画
	nodom.css(view,'transition',trs);
	nodom.css(scrollBar.y,'transition',trs);
	
	//修改moveObject参数
	moveObject.t0 = Date.now();
	moveObject.t1 = moveObject.t0 + t;
	moveObject.moving = true;
	moveObject.v0 = v0;
	
	let arr = nodom.getTranslate(view);
	//保存初始数字
	for(let i=0;i<arr.length;i++){
		moveObject.loc[i] = arr[i];
	}
	
	let scrollData = cacScroll(view,0,arr[1] + s);
	arr[0] = arr[0] + 'px';
	arr[1] = (arr[1] + s) + 'px';
	arr[2] = arr[2] + 'px';
	
	nodom.css(view,'transform','translate3d(' + arr.join(',') + ')');
	scrollBar.y.style.transform = 'translate3d(0px,' + scrollData[1] + 'px,0px)';
}

/**
 * 检查是否回拉
 * @param view 	视图
 * @param dis 	移动距离
 * @return dis 	计算后的距离
 */
function checkPull(view,dis){
	let arr = nodom.getTranslate(view);
	let ph = nodom.height(view.parentNode);
	let mh = nodom.height(view);
	let sh = moveObject.sideHeight;
	switch(moveObject.dir){
		case 0:
			//已到底部
			if(arr[1] + dis + mh < ph){
				moveObject.backFlag = true;
				//超出最大值，如果dis不为0，则需要重新计算dis
				if(dis != 0 && dis + arr[1] +  mh < ph + sh){
					dis = ph - sh - mh - arr[1];
				}
			}
			moveObject.overHeight = -(dis + mh + arr[1] - ph);
			if(ph > mh){
				moveObject.overHeight = 0;
			}
			break;
		case 1:
			break;
		case 2:
			//已到顶部
			if(arr[1] + dis > 0){
				moveObject.backFlag = true;
			}
			//超出最大值
			if(arr[1] + dis > sh){
				//如果dis不为0，则需要重新计算dis
				if(dis != 0){
					dis = sh - arr[1];	
				}
			}

			moveObject.overHeight = dis - arr[1];
			if(ph > mh){
				moveObject.overHeight = 0;
			}
			break;
		default:
	}
	return dis;
}

/**
 * 回拉
 */
function pullBack(view){
	if(!moveObject.backFlag){
		return;
	}
	let tr;
	let arr = nodom.getTranslate(view);
	let x = arr[0];
	let y = arr[1];
	let evts = view.parentNode.$events;
	let mh = nodom.height(view);
			
	switch(moveObject.dir){
		case 0:
			//触底事件
			if(evts.scrolltobottom instanceof nodom.Event){
				evts.scrolltobottom.fire();
			}
			y = arr[1] + moveObject.overHeight;
			break;
		case 1:
			break;
		case 2:
			y = 0;
			//触顶事件
			if(evts.scrolltotop instanceof nodom.Event){
				evts.scrolltotop.fire();
			}
			//重新计算y
			break;
		default:
	}

	moveObject.backFlag=false;
	nodom.css(view,'transition','transform 0.5s ease-out');
	nodom.css(view,'transform','translate3d(' + x + 'px,' + y + 'px,0px)');
}

/**
 * 停止移动
 */
function stopMoving(view){
	moveObject = {
		dir:0, 
		v0:0,
		a:0.001,
		loc:[0,0,0],
		t0:0,		
		t1:0,		
		moving:false,
		backFlag:false,
		sideHeight:100,
		overHeight:0
	};
	// 隐藏滚动条
	scrollBar.x.style.opacity = '0';
	scrollBar.y.style.opacity = '0';
}

/**
 * 计算滚动条xy
 */
function cacScroll(view,tox,toy){
	let x=0,y=0;
	if(moveObject.dir===0 || moveObject.dir === 2){ //纵向
		let ph = view.parentNode.offsetHeight;
		let mh = view.offsetHeight;
		let height = ph*ph/mh|0;
		nodom.height(scrollBar.y,height);
		y = Math.abs(toy)*ph/mh|0;
	}else{  //横向

	}
	return[x,y];
}

function startDrag(event,data,view){
	dragObject.draging = true;
	dragObject.loc = [event.touches[0].clientX,event.touches[0].clientY];
}

function dragView(event,data,view){
	if(!dragObject.draging){
		return;
	}
	let evts = view.parentNode.$events;
	let ph = nodom.height(view.parentNode);
	let mh = nodom.height(view);
	let tch = event.touches[0];
	let dx = tch.clientX - dragObject.loc[0];
	let dy = tch.clientY - dragObject.loc[1];
	let arr = nodom.getTranslate(view);
	let x=arr[0];
	let y=arr[1];

	let trans = nodom.getTranslate(view);
	if(trans[1] > 0 && evts.topdrag && evts.topdrag instanceof nodom.Event){
		evts.topdrag.fire();
	}

	moveObject.dir = dy>0?2:0;
	switch(moveObject.dir){
		case 0:
			if(y + dy + mh > ph - moveObject.sideHeight){
				y += dy;
			}
			break;
		case 1:
			x += dx;
			break;
		case 2:
			if(y + dy < moveObject.sideHeight){
				y += dy;
			}
			break;
		default:
			x += dx;
	}
	
	nodom.css(view,{
		transition:'',
		transform:'translate3d(' + arr[0] + 'px,' + y + 'px,0px)'
	});
	dragObject.loc = [tch.clientX,tch.clientY];
	dragObject.hasMove = true;
}

/**
 * 拖动释放
 */ 
function freeDrag(event,data,view){
	dragObject.draging = false;
	let evts = view.parentNode.$events;
	if(!checkNeedMove(view)){
		return;
	}

	//下拉可触发事件
	let trans = nodom.getTranslate(view);

	if(trans[1] > 0 && evts.topfree && evts.topfree instanceof nodom.Event){
		evts.topfree.fire();
		moveObject.dir = 2;
	}
	
	if(dragObject.hasMove){
		checkPull(view,0);
		if(moveObject.backFlag){
			pullBack(view);
		}
	}

	dragObject.hasMove = false;
}

/**
 * 判断是否需要滑动
 */
function checkNeedMove(view){
	let height = nodom.height(view);
	let pheight = nodom.height(view.parentNode);
	if(height < pheight && moveObject.dir === 0 || moveObject.dir === 1){
		return false;
	}
	return true;
}

	},
	handle:(directive,dom,module,parent)=>{

	}
});
	
	
	nodom.Directive.create({
		name:'scroller',
		proOrder:1,
		init:function(value){
			
	
