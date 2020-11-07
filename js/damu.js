+(function(w) {

	/*
		{
			translateX: val,
			translateY: val,
			scale: val,
			rotate: val
		}
	 */
	w.damu = {};
	w.damu.css = function css(node, type, val) {
		if (typeof node["transform"] === "undefined") {
			node["transform"] = {}
		}
		// arguments: 对应于传递给函数的参数的类数组对象
		if (arguments.length >= 3) {
			// 设置
			let text = "";
			node["transform"][type] = val;

			for (item in node["transform"]) {
				if (node["transform"].hasOwnProperty(item)) {
					switch (item) {
						case "translateX":
						case "translateY":
						case "translateZ":
							text += item + "(" + node["transform"][item] + "px)";
							break;
						case "scale":
							text += item + "(" + node["transform"][item] + ")";
							break;
						case "rotate":
							text += item + "(" + node["transform"][item] + "deg)";
							break;
					}
				}
			}
			node.style.transform = node.style.webkitTransform = text;
		} else if (arguments.length == 2) {
			// 读取
			val = node["transform"][type];
			if (typeof val === "undefined") {
				switch (type) {
					case "translateX":
					case "translateY":
					case "translateZ":
					case "rotate":
						val = 0;
						break;
					case "scale":
						val = 1;
						break;
				}
			}
			return val;
		}
	}
	w.damu.carousel = function(arr) {
		// 布局相关
		let carouselWrap = document.querySelector(".carousel-wrap");
		if (carouselWrap) {
			let pointslength = arr.length;
	
			// 无缝
			var needCarousel = carouselWrap.getAttribute("needCarousel");
			needCarousel = needCarousel == null ? false : true;
			if (needCarousel) {
				arr = arr.concat(arr);
			}
	
			let ulNode = document.createElement("ul");
			damu.css(ulNode,"translateZ",0);
			let styleNode = document.createElement("style");
			ulNode.classList.add("list");
			for (let i = 0; i < arr.length; i++) {
				ulNode.innerHTML += '<li><a href="javascript:;"><img src="' + arr[i] + '" ></a></li>'
			}
			styleNode.innerHTML = '.carousel-wrap > .list{width: ' + arr.length + '00%;}.carousel-wrap > .list > li{width: ' +
				(1 / arr.length * 100) + '%;}'
			carouselWrap.appendChild(ulNode);
			document.head.appendChild(styleNode);
	
			let imgNodes = document.querySelector(".carousel-wrap > .list > li > a >img")
			// offsetHeight:返回该元素的像素高度，
			/* 
			   高度包含该元素的垂直内边距和边框，且是一个整数
				 延迟执行,否则在还没渲染完就获取图片高度 
			*/
			setTimeout(function() {
				carouselWrap.style.height = imgNodes.offsetHeight + "px";
			}, 100)
	
			// 小圆点
			let pointsWrap = document.querySelector(".carousel-wrap > .points-wrap");
			if (pointsWrap) {
				for (let i = 0; i < pointslength; i++) {
					if (i == 0) {
						pointsWrap.innerHTML += '<span class="active"></span>';
					} else {
						pointsWrap.innerHTML += '<span></span>';
					}
				}
				var pointsSpan = document.querySelectorAll(".carousel-wrap > .points-wrap > span");
			}
	
			/* 
				滑屏
				 1.拿到元素一开始的位置
				 2.拿到手指一开始点击的位置
				 3.拿到手指move时的实时距离
				 4.将手指移动的距离加给元素
			*/
	
			/* 
				防抖动
				
				1.判断用户首次滑屏的方向
				2.如果是X轴:
					以后不管用户怎么滑都会抖动
					如果是Y轴:
					以后不管用户怎么话都不会抖动
			*/
	
			let index = 0;
			// 手指一开始的位置
			let startX = 0;
			let startY = 0;
			// 元素一开始的位置
			let elementX = 0;
			let elementY = 0;
			// let translateX = 0;
			let disX = 0;
			let disY = 0;
	
			// 首次滑屏的方向
			let isX = true;
			let isFirst = true;
	
			carouselWrap.addEventListener("touchstart", function(ev) {
				ev = ev || event;
				// 只认第一根手指
				let TouchC = ev.changedTouches[0];
				ulNode.style.transition = "none";
	
				/* 
					无缝
					点击第一组的第一张时,瞬间跳到第二组的第一张
					点击第二组的最后一张时,瞬间跳到第一组的最后一张
				*/
				// index代表ul的位置
				if (needCarousel) {
					let index = damu.css(ulNode, "translateX") / (document.documentElement.clientWidth);
					if (-index === 0) {
						index = -pointslength;
					} else if (-index == (arr.length - 1)) {
						index = -(pointslength - 1)
					}
					damu.css(ulNode, "translateX", index * (document.documentElement.clientWidth));
				}
	
				startX = TouchC.clientX;
				startY = TouchC.clientY;
				/* 
					offsetLeft:返回当前元素左上角
					相对于  HTMLElement.offsetParent 节点的左边界偏移的像素值
				*/
				// elementX = ulNode.offsetLeft;
				// elementX = translateX;
				elementX = damu.css(ulNode, "translateX");
				elementY = damu.css(ulNode, "translateY");
	
				// 清除定时器
				clearInterval(timer);
				
				isX = true;
				isFirst = true;
	
			})
	
			carouselWrap.addEventListener("touchmove", function(ev) {
				// 看门狗 二次以后的防抖动
				if(!isX){
					// 咬住
					return;
				}
				ev = ev || event;
				let TouchC = ev.changedTouches[0];
				// 手指的实时位置
				let nowX = TouchC.clientX;
				let nowY = TouchC.clientY;
				disX = nowX - startX;
				disY = nowY - startY;
				
				// 首次判断用户的滑动方向
				if(isFirst){
					isFirst = false;
					// 判断用户的滑动方向
					// x --> 放行
					// y --> 首次狠狠地咬住,并且告诉兄弟下次也咬住
					if(Math.abs(disY) > Math.abs(disX)){
						// y轴上滑
						isX = false;
						// 首次防抖动
						return;
					}
				}
				
				// translateX = elementX + disX;
				// ulNode.style.left = elementX + disX + "px";
				// ulNode.style.transform = 'translateX(' + translateX + 'px)';
				damu.css(ulNode, "translateX", elementX + disX);
			})
	
			carouselWrap.addEventListener("touchend", function(ev) {
				ev = ev || event;
				// index抽象了ul的实时位置
				// let index = ulNode.offsetLeft / document.documentElement.clientWidth;
				// let index = translateX / document.documentElement.clientWidth;
				index = damu.css(ulNode, "translateX") / (document.documentElement.clientWidth);
	
				// 二分之一跳转
				// 返回一个数字四舍五入后最接近的整数
				// index = Math.round(index);
	
				if (disX > 0) {
					index = Math.ceil(index);
				} else if (disX < 0) {
					index = Math.floor(index);
				}
	
				// 超出控制
				if (index > 0) {
					index = 0;
				} else if (index < 1 - arr.length) {
					index = 1 - arr.length;
				}
	
				littledot(index);
	
				ulNode.style.transition = ".5s transform";
				// 控制动画速度
				// ulNode.style.left = index * (document.documentElement.clientWidth) + "px";
				// translateX = index * (document.documentElement.clientWidth);
				// ulNode.style.transform = 'translateX(' + translateX + 'px)';
				damu.css(ulNode, "translateX", index * (document.documentElement.clientWidth));
				// 开启自动轮播
				if (needAuto) {
					auto();
				}
			})
	
			// 自动轮播
			let timer = 0;
	
			let needAuto = carouselWrap.getAttribute("needAuto");
			needAuto = needAuto == null ? false : true;
			if (needAuto) {
				auto();
			}
	
			function auto() {
				// 清除定时器
				clearInterval(timer);
				timer = setInterval(function() {
					if (index == 1 - arr.length) {
						ulNode.style.transition = "none";
						index = 1 - arr.length / 2;
						damu.css(ulNode, "translateX", index * (document.documentElement.clientWidth));
					}
					setTimeout(function() {
						index--;
						ulNode.style.transition = "1s transform"
						littledot(index);
						damu.css(ulNode, "translateX", index * (document.documentElement.clientWidth));
					}, 50)
				}, 2000)
			}
	
			function littledot(index) {
				if (!pointsWrap) {
					return;
				}
				for (let i = 0; i < pointsSpan.length; i++) {
					pointsSpan[i].classList.remove("active");
				}
				pointsSpan[-index % pointslength].classList.add("active");
			}
		}
	}
	w.damu.dragNav = function() {

		// 滑屏区域
		let wrap = document.querySelector(".damu-nav-drag-wrapper");
		// 滑屏元素
		let item = document.querySelector(".damu-nav-drag-wrapper .list");

		// 元素一开始的位置 手指一开始的位置
		let startX = 0;
		let elementX = 0;
		// 滑动最大区域
		const minX = wrap.clientWidth - item.offsetWidth;
		// 快速滑屏的必要元素
		let lastTime = 0;
		let lastPoint = 0;
		let timeDis = 1;
		let pointDis = 0;
		wrap.addEventListener("touchstart", function(ev) {
			ev = ev || event;
			let touchC = ev.changedTouches[0];

			startX = touchC.clientX;
			elementX = damu.css(item, "translateX");
			item.style.transition = "none";

			lastTime = new Date().getTime();
			lastPoint = touchC.clientX;
			// lastPoint = damu.css(item,"translateX");

			// 清除速度的残留
			pointDis = 0;
			item.handMove = false;
		})
		wrap.addEventListener("touchmove", function(ev) {
			ev = ev || event;
			let touchC = ev.changedTouches[0];

			// 导航栏移动的距离
			let nowX = touchC.clientX;
			// 手指运动的距离,touchmove真正的有效距离
			let disX = nowX - startX;
			let translateX = elementX + disX;

			let nowTime = new Date().getTime();
			let nowPoint = touchC.clientX;
			// let nowPoint = damu.css(item,"translateX");
			timeDis = nowTime - lastTime;
			pointDis = nowPoint - lastPoint;

			lastTime = nowTime;
			lastPoint = nowPoint;

			/* 手动橡皮筋效果
				 在move的过程中,每一次手指touchmove真正的有效距离变小,
			   元素的滑动距离还是在变大 
				
				 scale: 慢慢变小的比例 比例的范围控制在了(0,0.5)之间
				 elementX: 元素在touchstart时的位置
			   disX: 整个move过程的实际距离
			   pointDis: 整个手指touchmove的有效距离 
			   translateX = damu.css(item,"translateX") + pointDis * scale ;!!!
			*/

			if (translateX > 0) {
				item.handMove = true;
				// translateX = 0;
				// 橡皮筋降速比例
				// let scale = 1 - translateX/document.documentElement.clientWidth;
				// (0,0.5)
				const scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateX) * 1.5);
				// translateX = elementX + disX * scale;
				translateX = damu.css(item, "translateX") + pointDis * scale;
			} else if (translateX < minX) {
				item.handMove = true;
				// translateX = minX;
				let over = minX - translateX;
				const scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + over) * 1.5);
				// translateX = elementX + disX * scale;
				translateX = damu.css(item, "translateX") + pointDis * scale;
			}
			damu.css(item, "translateX", translateX);
		})

		wrap.addEventListener("touchend", function(ev) {
			let translateX = damu.css(item, "translateX");
			if (!item.handMove) {
				// 快速滑屏
				// 速度越大,位移越远
				let speed = pointDis / timeDis;
				speed = Math.abs(speed) < 0.5 ? 0 : speed;
				let targetX = translateX + speed * 200;

				let time = Math.abs(speed) * 0.2;
				time = time < 0.8 ? 0.8 : time;
				time = time > 2 ? 2 : time;
				// 快速滑屏的橡皮筋效果
				let bsr = "";
				if (targetX > 0) {
					targetX = 0;
					bsr = "cubic-bezier(.26,1,.68,1.54)";
					// translateX = 0;
					// damu.css(item,"translateX",translateX);
				} else if (targetX < minX) {
					targetX = minX;
					bsr = "cubic-bezier(.26,1,.68,1.54)";
					// translateX = minX;
					// damu.css(item,"translateX",translateX);
				}

				item.style.transition = time + "s " + bsr + " transform";
				damu.css(item, "translateX", targetX);
			} else {
				// 手动橡皮筋效果
				item.style.transition = "1s transform";
				if (translateX > 0) {
					translateX = 0;
					damu.css(item, "translateX", translateX);
				} else if (translateX < minX) {
					translateX = minX;
					damu.css(item, "translateX", translateX);
				}

			}
		})


	}
	// 防抖动 即点即停
	/* 
		transition的问题
		1.元素没有渲染完成时,无法触发过渡的
		2.在transform切换上,如果前后transform属性值 交换函数的位置分数不一样 无法触发过渡的
		3.我们没有办法拿到transition中任何一帧的状态
										-->Tween算法
	*/
	w.damu.vMove=function(wrap,callBack){
		//滑屏区域
		//滑屏元素
		let item = wrap.children[0];
		damu.css(item,"translateZ",0.1);
		
		//元素一开始的位置  手指一开始的位置
		let start={};
		let element ={};
		let minY = wrap.clientHeight - item.offsetHeight;
		//快速滑屏的必要参数
		let lastTime =0;
		let lastPoint =0;
		let timeDis =1 ;
		let pointDis =0;
		
		let isY =true;
		let isFirst = true;
		
		//即点即停
		let cleartime =0;
		let Tween = {
			Linear: function(t,b,c,d){ return c*t/d + b; },
			back: function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	      	}
		}
		wrap.addEventListener("touchstart",function(ev){
			ev=ev||event;
			let touchC = ev.changedTouches[0];
			
			// 重置minY
			minY = wrap.clientHeight - item.offsetHeight;
			
			start = {clientX:touchC.clientX,clientY:touchC.clientY};
			element.y = damu.css(item,"translateY");
			element.x= damu.css(item,"translateX");
			
			item.style.transition="none";
			
			lastTime = new Date().getTime();
			lastPoint = touchC.clientY;
			//lastPoint = damu.css(item,"translateY");
			
			//清除速度的残留
			pointDis=0;
			item.handMove = false;
			
			
			isY =true;
			isFirst = true;
			
			//即点即停
			clearInterval(cleartime);
			
			
			if(callBack&&typeof callBack["start"] === "function"){
				callBack["start"].call(item);
			}
		})
		
		wrap.addEventListener("touchmove",function(ev){
			if(!isY){
				return;
			}
			
			ev=ev||event;
			let touchC = ev.changedTouches[0];
			/*let nowY = touchC.clientY;
			let disY = nowY - startY;
			let translateY = elementY+disY;*/
			let now = touchC;
			let dis = {};
			dis.y = now.clientY - start.clientY;
			dis.x = now.clientX - start.clientX;
			let translateY = element.y+dis.y;
			
			if(isFirst){
				isFirst = false;
				if(Math.abs(dis.x)>Math.abs(dis.y)){
					isY = false;
					return;
				}
			}
			
			
			
			let nowTime =new Date().getTime();
			let nowPoint = touchC.clientY;
			timeDis = nowTime - lastTime;
			pointDis = nowPoint - lastPoint;
			
			lastTime = nowTime;
			lastPoint = nowPoint;
			
			/*手动橡皮筋效果
			 * 
			 * 在move的过程中，每一次手指touchmove真正的有效距离慢慢变小，元素的滑动距离还是在变大
			 * 
			 * pointDis：整个手指touchmove真正的有效距
			 * 
			 * translateY = damu.css(item,"translateY") + pointDis*scale;!!!
			 * 
			 * */
			if(translateY>0){
				item.handMove = true;
				let scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*1.5);
				translateY = damu.css(item,"translateY") + pointDis*scale;
			}else if(translateY<minY){
				item.handMove = true;
				let over = minY - translateY;
				let scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.5);
				translateY = damu.css(item,"translateY") + pointDis*scale;
			}
			damu.css(item,"translateY",translateY);
			
			if(callBack&&typeof callBack["move"] === "function"){
				callBack["move"].call(item);
			}
		})
		
		wrap.addEventListener("touchend",function(ev){
			let translateY = damu.css(item,"translateY");
			if(!item.handMove){
				//快速滑屏
				//速度越大  位移越远
				let speed = pointDis/timeDis;
				speed = Math.abs(speed)<0.5?0:speed;
				let targetY = translateY + speed*200;
				let time = Math.abs(speed)*0.2;
				time = time<0.8?0.8:time;
				time = time>2?2:time;
				//快速滑屏的橡皮筋效果
				// console.log(targetY,time);
				//let bsr="";
				let type = "Linear";
				if(targetY>0){
					targetY=0;
					type = "back";
					//bsr = "cubic-bezier(.26,1.51,.68,1.54)";
				}else if(targetY<minY){
					targetY = minY;
					type = "back";
					//bsr = "cubic-bezier(.26,1.51,.68,1.54)";
				}
				/*item.style.transition=time+"s "+bsr+" transform";
				damu.css(item,"translateY",targetY);*/
				bsr(type,targetY,time);
			}else{
				//手动橡皮筋效果
				item.style.transition="1s transform";
				if(translateY>0){
					translateY=0;
					damu.css(item,"translateY",translateY);
				}else if(translateY<minY){
					translateY = minY;
					damu.css(item,"translateY",translateY);
				}
				if(callBack&&typeof callBack["end"] === "function"){
					callBack["end"].call(item);
				}
			}
		})
		
		
		function bsr(type,targetY,time){
			clearInterval(cleartime);
			//当前次数
			let t=0;
			//初始位置
			let b = damu.css(item,"translateY");
			//最终位置 - 初始位置
			let c = targetY -b;
			//总次数
			let d = time*1000 / (1000/60);
			cleartime = setInterval(function(){
				t++;
				
				if(callBack&&typeof callBack["move"] === "function"){
					callBack["move"].call(item);
				}
				
				if(t>d){
					clearInterval(cleartime);
					
					if(callBack&&typeof callBack["end"] === "function"){
						callBack["end"].call(item);
					}
				}
				let point = Tween[type](t,b,c,d);
				damu.css(item,"translateY",point);
			},1000/60);
		}
	}
	
})(window)
