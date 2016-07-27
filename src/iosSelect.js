(function() {
	iosSelectUtil = {
		isArray: function(arg1) {
			return Object.prototype.toString.call(arg1) === '[object Array]';
		},
		isFunction: function(arg1) {
			return typeof arg1 === 'function';
		},
		attrToData: function(dom, index) {
			var obj = {};
			for (var p in dom.dataset) {
				obj[p] = dom.dataset[p];
			}
			obj['dom'] = dom;
			obj['atindex'] = index;
			return obj;
		},
		attrToHtml: function(obj) {
			var html = '';
			for (var p in obj) {
				html += 'data-' + p + '="' + obj[p] + '"';
			}
			return html;
		}
	};


	// Layer
	function Layer(html, opts) {
		if (!(this instanceof Layer)) {
			return new Layer(html, opts);
		}
		this.html = html;
		this.opts = opts;
		var el = document.createElement('div');
		el.className = 'olay';
		// var layer_el = $('<div class="layer"></div>');
		var layer_el = document.createElement('div');
		layer_el.className = 'layer';
		this.el = el;
		this.layer_el = layer_el;
		this.init();
	}
	Layer.prototype = {
		init: function() {
			this.layer_el.innerHTML = this.html;
			document.body.appendChild(this.el);
			this.el.appendChild(this.layer_el);
			this.el.style.height = Math.max(document.documentElement.getBoundingClientRect().height, window.innerHeight);
			if (this.opts.className) {
				this.el.className += ' ' + this.opts.className;
			}
			this.bindEvent();
		},
		bindEvent: function() {
			var sureDom = this.el.querySelectorAll('.sure');
			var closeDom = this.el.querySelectorAll('.close');
			var self = this;
			for (var i = 0, len = sureDom.length; i < len; i++) {
				sureDom[i].addEventListener('click', function(e) {
					self.close();
				});
			}
			for (var i = 0, len = closeDom.length; i < len; i++) {
				closeDom[i].addEventListener('click', function(e) {
					self.close();
				});
			}
		},
		close: function() {
			if (this.el) {
				this.el.parentNode.removeChild(this.el);
				this.el = null;
			}
		}
	}
	/*
	 level: 选择的层级 1 2 3 最多支持3层
	 data: [oneLevelArray[, twoLevelArray[, threeLevelArray]]]
	 options:
	     callback: 选择完毕后的回调函数
	     title: 选择框title
	     itemHeight: 每一项的高度，默认 35px
	     headerHeight: 组件标题栏高度 默认 44px
	     addClassName: 组件额外类名 用于自定义样式
	     oneTwoRelation: 第一列和第二列是否通过parentId关联
	     twoThreeRelation: 第二列和第三列是否通过parentId关联
	     oneLevelId: 第一级选中id
	     twoLevelId: 第二级选中id
	     threeLevelId: 第三级选中id
	     fourLevelId: 第三级选中id
	 */
		function IosSelect(level, data, options) {
		// if (!iosSelectUtil.isArray(data) || data.length === 0) {
		// 	return;
		// }
		// this.data = data;
		this.level = level || 1;

		this.options = options;
		this.typeBox = this.level === 1 ? 'one-level-box' : (this.level === 2 ? 'two-level-box':(this.level=== 3 ? 'three-level-box': 'fourth-level-box'));
		this.callback = options.callback;
		this.title = options.title || '';
		this.itemHeight = options.itemHeight || 35;
		this.headerHeight = options.headerHeight || 44;
		this.init();
	};

	IosSelect.prototype = {
		init: function() {
			this.initLayer();
			// 选中元素的信息
			this.selectOneObj = {};
			this.selectTwoObj = {};
			this.selectThreeObj = {};
			this.selectFourObj = {};
			this.setOneLevel(this.options.oneLevelId, this.options.twoLevelId, this.options.threeLevelId,this.options.fourLevelId);
		},
		initLayer: function() {
			var self = this;
			var all_html = [
				'<header class="iosselect-header">',
				'<h2 id="iosSelectTitle"></h2>',
				'<a href="javascript:void(0)" class="close">取消</a>',
				'<a href="javascript:void(0)" class="sure">确定</a>',
				'</header>',
				'<section class="iosselect-box">',
				'<div class="one-level-contain" id="oneLevelContain">',
				'<ul class="select-one-level">',
				'</ul>',
				'</div>',

				'<div class="two-level-contain" id="twoLevelContain">',
				'<ul class="select-two-level">',
				'</ul>',
				'</div>',

				'<div class="three-level-contain" id="threeLevelContain">',
				'<ul class="select-three-level">',
				'</ul>',
				'</div>',

				'<div class="fourth-level-contain" id="fourLevelContain">',
				'<ul class="select-four-level">',
				'</ul>',
				'</div>',

				'</section>',
				'<hr class="cover-area1"/>',
				'<hr class="cover-area2"/>'
			].join('\r\n');
			this.iosSelectLayer = new Layer(all_html, {
				className: 'ios-select-widget-box ' + this.typeBox + (this.options.addClassName? ' ' + this.options.addClassName: '')
			});

			this.iosSelectTitleDom = document.querySelector('#iosSelectTitle');
			if (this.options.title) {
				this.iosSelectTitleDom.innerHTML = this.options.title;
			}

			if (this.options.headerHeight && this.options.itemHeight) {
				this.coverArea1Dom = document.querySelector('.cover-area1');
				this.coverArea1Dom.style.top = this.headerHeight + this.itemHeight * 3 + 'px';

				this.coverArea2Dom = document.querySelector('.cover-area2');
				this.coverArea2Dom.style.top = this.headerHeight + this.itemHeight * 4 + 'px';
			}





			this.oneLevelContainDom = document.querySelector('#oneLevelContain');
			this.twoLevelContainDom = document.querySelector('#twoLevelContain');
			this.threeLevelContainDom = document.querySelector('#threeLevelContain');
			this.fourthLevelContainDom = document.querySelector('#fourLevelContain');


			this.oneLevelUlContainDom = document.querySelector('.select-one-level');
			this.twoLevelUlContainDom = document.querySelector('.select-two-level');
			this.threeLevelUlContainDom = document.querySelector('.select-three-level');
			this.fourthUlLevelContainDom = document.querySelector('.select-four-level');



			this.iosSelectLayer.el.querySelector('.layer').style.height = this.itemHeight * 7 + this.headerHeight + 'px';

			this.oneLevelContainDom.style.height = this.itemHeight * 7 + 'px';
			this.scrollOne = new IScroll('#oneLevelContain', {
				probeType: 3,
				bounce: false
			});




			//一级数据
			this.scrollOne.on('scrollStart', function() {
				Array.prototype.slice.call(self.oneLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
					if (v.classList.contains('at')) {
						v.classList.remove('at');
					} else if (v.classList.contains('side1')) {
						v.classList.remove('side1');
					} else if (v.classList.contains('side2')) {
						v.classList.remove('side2');
					}
				});
			});



			this.scrollOne.on('scroll', function() {
				var pa = Math.abs(this.y) / self.itemHeight;
				var plast = 1;

				plast = Math.round(pa) + 1;
				Array.prototype.slice.call(self.oneLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
					if (v.classList.contains('at')) {
						v.classList.remove('at');
					} else if (v.classList.contains('side1')) {
						v.classList.remove('side1');
					} else if (v.classList.contains('side2')) {
						v.classList.remove('side2');
					}
				});

				var pdom = self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');
				pdom.classList.add('at');

				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');
			});



			this.scrollOne.on('scrollEnd', function() {
				var pa = Math.abs(this.y) / self.itemHeight;
				var plast = 1;
				var to = 0;
				if (Math.ceil(pa) === Math.round(pa)) {
					to = Math.ceil(pa) * self.itemHeight;
					plast = Math.ceil(pa) + 1;
				} else {
					to = Math.floor(pa) * self.itemHeight;
					plast = Math.floor(pa) + 1;
				}
				self.scrollOne.scrollTo(0, -to, 0);

				var pdom = self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

				Array.prototype.slice.call(self.oneLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
					if (v.classList.contains('at')) {
						v.classList.remove('at');
					} else if (v.classList.contains('side1')) {
						v.classList.remove('side1');
					} else if (v.classList.contains('side2')) {
						v.classList.remove('side2');
					}
				});

				pdom.classList.add('at');

				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
				self.oneLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');

				self.selectOneObj = iosSelectUtil.attrToData(pdom, plast);

				if (self.level > 1 && self.options.oneTwoRelation === 1) {
					self.setTwoLevel(self.selectOneObj.id);
				}
			});


			//二级数据
			if (this.level >= 2) {

				this.twoLevelContainDom.style.height = this.itemHeight * 7 + 'px';
				this.scrollTwo = new IScroll('#twoLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.scrollTwo.on('scrollStart', function() {
					Array.prototype.slice.call(self.twoLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});
				});
				this.scrollTwo.on('scroll', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 0;
					plast = Math.round(pa) + 1;

					var cdom = self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.twoLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					cdom.classList.add('at');

					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');
				});
				this.scrollTwo.on('scrollEnd', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.itemHeight;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.itemHeight;
						plast = Math.floor(pa) + 1;
					}
					self.scrollTwo.scrollTo(0, -to, 0);

					var cdom = self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.twoLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					cdom.classList.add('at');

					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.twoLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');

					self.selectTwoObj = iosSelectUtil.attrToData(cdom, plast);

					if (self.level > 2 && self.options.twoThreeRelation === 1) {
						self.setThreeLevel(self.selectOneObj.id, self.selectTwoObj.id);
					}
				});
			}




			//三级数据
			if (this.level >= 3) {
				this.threeLevelContainDom.style.height = this.itemHeight * 7 + 'px';
				this.scrollThree = new IScroll('#threeLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.scrollThree.on('scrollStart', function() {
					Array.prototype.slice.call(self.threeLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});
				});
				this.scrollThree.on('scroll', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 0;
					plast = Math.round(pa) + 1;

					var ddom = self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.threeLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					ddom.classList.add('at');

					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');
				});
				this.scrollThree.on('scrollEnd', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.itemHeight;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.itemHeight;
						plast = Math.floor(pa) + 1;
					}
					self.scrollThree.scrollTo(0, -to, 0);

					var ddom = self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.threeLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					ddom.classList.add('at');

					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.threeLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');

					self.selectThreeObj = iosSelectUtil.attrToData(ddom, plast);

					if (self.level > 3 && self.options.ThreeFourRelation === 1) {
						self.setFourLevel(self.selectOneObj.id, self.selectTwoObj.id,self.selectThreeObj.id);
					}



				});
			}



			//四级数据
			if(this.level===4){

				this.fourthLevelContainDom.style.height = this.itemHeight * 7 + 'px';
				var a=$('#fourthLevelContain');
				this.scrollFour = new IScroll('#fourLevelContain', {
					probeType: 3,
					bounce: false
				});
				this.scrollFour.on('scrollStart', function() {
					Array.prototype.slice.call(self.fourthLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});
				});
				this.scrollFour.on('scroll', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 0;
					plast = Math.round(pa) + 1;

					var ddom = self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.fourthLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					ddom.classList.add('at');

					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');
				});
				this.scrollFour.on('scrollEnd', function() {
					var pa = Math.abs(this.y) / self.itemHeight;
					var plast = 1;
					var to = 0;
					if (Math.ceil(pa) === Math.round(pa)) {
						to = Math.ceil(pa) * self.itemHeight;
						plast = Math.ceil(pa) + 1;
					} else {
						to = Math.floor(pa) * self.itemHeight;
						plast = Math.floor(pa) + 1;
					}
					self.scrollFour.scrollTo(0, -to, 0);

					var ddom = self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 3) + ')');

					Array.prototype.slice.call(self.fourthLevelContainDom.querySelectorAll('li')).forEach(function(v, i, o) {
						if (v.classList.contains('at')) {
							v.classList.remove('at');
						} else if (v.classList.contains('side1')) {
							v.classList.remove('side1');
						} else if (v.classList.contains('side2')) {
							v.classList.remove('side2');
						}
					});

					ddom.classList.add('at');

					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 2) + ')').classList.add('side1');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 1) + ')').classList.add('side2');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 4) + ')').classList.add('side1');
					self.fourthLevelContainDom.querySelector('li:nth-child(' + (plast + 5) + ')').classList.add('side2');

					self.selectFourObj = iosSelectUtil.attrToData(ddom, plast);
				});
			}


			this.selectBtnDom = this.iosSelectLayer.el.querySelector('.sure');
			this.selectBtnDom.addEventListener('click', function(e) {
				self.callback && self.callback(self.selectOneObj, self.selectTwoObj, self.selectThreeObj,self.selectFourObj);
				self.iosSelectLayer.close();
			});
		},

		getOneLevel: function() {

			return getOneLevelData();


			// console.log("返回的一级数据:"+this.data[0]);
            //
			// if (iosSelectUtil.isArray(this.data[0])){
			// 	return this.data[0];
			// }
			// else if (iosSelectUtil.isFunction(this.data[0])) {
			// 	return this.data[0]();
			// }
			// else {
			// 	throw new Error('data format error');
			// }
		},

		setOneLevel: function(oneLevelId, twoLevelId, threeLevelId,fourLevelId) {

			console.log("一级setOneLevel()被调用。。。")

			var oneLevelData = this.getOneLevel();
			if (!oneLevelId) {
				oneLevelId = oneLevelData[0]['id'];
			}
			var oneHtml = '';
			var self = this;
			var atIndex = 0;
			oneHtml += '<li></li>';
			oneHtml += '<li></li>';
			oneHtml += '<li></li>';
			oneLevelData.forEach(function(v, i, o) {
				if (v.id === oneLevelId) {
					oneHtml += '<li ' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					atIndex = i + 1 + 3;
				} else {
					oneHtml += '<li ' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			});
			oneHtml += '<li></li>';
			oneHtml += '<li></li>';
			oneHtml += '<li></li>';
			this.oneLevelUlContainDom.innerHTML = oneHtml;

			this.scrollOne.refresh();
			this.scrollOne.scrollToElement('li:nth-child(' + (atIndex - 3) + ')', 0);
			if (this.level >= 2) {
				this.setTwoLevel(oneLevelId, twoLevelId, threeLevelId,fourLevelId);
			}

			var pdom = this.oneLevelContainDom.querySelector('.at');
			this.oneLevelContainDom.querySelector('li:nth-child(' + (atIndex - 1) + ')').classList.add('side1');
			this.oneLevelContainDom.querySelector('li:nth-child(' + (atIndex - 2) + ')').classList.add('side2');
			this.oneLevelContainDom.querySelector('li:nth-child(' + (atIndex + 1) + ')').classList.add('side1');
			this.oneLevelContainDom.querySelector('li:nth-child(' + (atIndex + 2) + ')').classList.add('side2');

			this.selectOneObj = iosSelectUtil.attrToData(pdom, atIndex);
		},

		getTwoLevel: function(oneLevelId) {
			var twoLevelData=getTwoLevelData();
			console.log("传入的one:"+oneLevelId);



			for(i=0;i<twoLevelData.length;i++){
				 if(twoLevelData[i]['parentId']==130000){
					console.log(twoLevelData[i].value);
					console.log(twoLevelData[i]);
					return twoLevelData[i];
				}
			}


			// var twoLevelData = [];
			// if (iosSelectUtil.isArray(this.data[1])) {
			// 	if (this.options.oneTwoRelation === 1) {
			// 		this.data[1].forEach(function(v, i, o) {
			// 			if (v['parentId'] === oneLevelId) {
			// 				twoLevelData.push(v);
			// 				console.log("返回的二级数据:"+v['parentId']+v.value+v['id']);
			// 			}
			// 		});
			// 	} else {
			// 		twoLevelData = this.data[1];
			// 	}
            //
			// 	// console.log("返回的二级数据:"+twoLevelData);
			// 	return twoLevelData;
			// }
			// else if (iosSelectUtil.isFunction(this.data[1])) {
			// 	return this.data[1](oneLevelId);
			// }
			// else {
			// 	throw new Error('data format error');
			// }
		},

		setTwoLevel: function(oneLevelId, twoLevelId, threeLevelId,fourLevelId) {
			console.log("二级setTwoLevel()被调用。。。");
			var twoLevelData = this.getTwoLevel(oneLevelId);
			console.log("二级收到的数据:"+twoLevelData);


			var atIndex=0;
			if(!twoLevelId){
				twoLevelId=twoLevelData['id'];
			}

			// var atIndex = 0;
			// if (!twoLevelId) {
			// 	twoLevelId = twoLevelData[0]['id'];
			// }


			var twoHtml = '';
			var self = this;
			twoHtml += '<li></li>';
			twoHtml += '<li></li>';
			twoHtml += '<li></li>';
			twoLevelData.forEach(function(v, i, o) {
				if (v.id === twoLevelId) {
					twoHtml += '<li ' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					atIndex = i + 1 + 3;
				} else {
					twoHtml += '<li ' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			});
			twoHtml += '<li></li>';
			twoHtml += '<li></li>';
			twoHtml += '<li></li>';
			this.twoLevelUlContainDom.innerHTML = twoHtml;
			this.scrollTwo.refresh();
			this.scrollTwo.scrollToElement(':nth-child(' + (atIndex - 3) + ')', 0);
			if (this.level >= 3) {
				this.setThreeLevel(oneLevelId, twoLevelId, threeLevelId,fourLevelId);
			}

			var cdom = self.twoLevelContainDom.querySelector('li:nth-child(' + atIndex + ')');
			cdom.classList.add('at');
			self.twoLevelContainDom.querySelector('li:nth-child(' + (atIndex - 1) + ')').classList.add('side1');
			self.twoLevelContainDom.querySelector('li:nth-child(' + (atIndex - 2) + ')').classList.add('side2');
			self.twoLevelContainDom.querySelector('li:nth-child(' + (atIndex + 1) + ')').classList.add('side1');
			self.twoLevelContainDom.querySelector('li:nth-child(' + (atIndex + 2) + ')').classList.add('side2');

			self.selectTwoObj = iosSelectUtil.attrToData(cdom, atIndex);
		},

		getThreeLevel: function(oneLevelId, twoLevelId) {
			var threeLevelData = [];

			if (iosSelectUtil.isArray(this.data[2])) {
				if (this.options.twoThreeRelation === 1) {
					this.data[2].forEach(function(v, i, o) {
						if (v['parentId'] === twoLevelId) {
							threeLevelData.push(v);
							console.log("返回三级数据:"+v['parentId']+v.value+v['id']);
						}
					});
				} else {
					threeLevelData = this.data[2];
				}
				// console.log("返回三级数据:"+threeLevelData);
				return threeLevelData;
			}
			else if (iosSelectUtil.isFunction(this.data[2])) {
				return this.data[2](oneLevelId, twoLevelId);
			}
			else {
				throw new Error('data format error');
			}
		},

		setThreeLevel: function(oneLevelId, twoLevelId, threeLevelId,fourLevelId) {
			console.log("三级setThreeLevel()被调用。。。");
			console.log(oneLevelId+", "+twoLevelId);

			var threeLevelData = this.getThreeLevel(oneLevelId, twoLevelId);


			var atIndex = 0;
			if (!threeLevelId) {
				threeLevelId = threeLevelData[0]['id'];
			}
			var threeHtml = '';
			var self = this;
			threeHtml += '<li></li>';
			threeHtml += '<li></li>';
			threeHtml += '<li></li>';
			threeLevelData.forEach(function(v, i, o) {
				if (v.id === threeLevelId) {
					threeHtml += '<li ' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					atIndex = i + 1 + 3;
				} else {
					threeHtml += '<li ' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			});
			threeHtml += '<li></li>';
			threeHtml += '<li></li>';
			threeHtml += '<li></li>';
			this.threeLevelUlContainDom.innerHTML = threeHtml;
			this.scrollThree.refresh();
			this.scrollThree.scrollToElement(':nth-child(' + (atIndex - 3) + ')', 0);

			if (this.level === 4) {
				this.setFourLevel(oneLevelId, twoLevelId, threeLevelId,fourLevelId);
			}

			var ddom = self.threeLevelContainDom.querySelector('li:nth-child(' + atIndex + ')');
			ddom.classList.add('at');
			self.threeLevelContainDom.querySelector('li:nth-child(' + (atIndex - 1) + ')').classList.add('side1');
			self.threeLevelContainDom.querySelector('li:nth-child(' + (atIndex - 2) + ')').classList.add('side2');
			self.threeLevelContainDom.querySelector('li:nth-child(' + (atIndex + 1) + ')').classList.add('side1');
			self.threeLevelContainDom.querySelector('li:nth-child(' + (atIndex + 2) + ')').classList.add('side2');

			self.selectThreeObj = iosSelectUtil.attrToData(ddom, atIndex);
		},

		getFourLevel:function (oneLevelId, twoLevelId, threeLevelId) {
			var fourLevelData = [];

			if (iosSelectUtil.isArray(this.data[3])) {
				if (this.options.twoThreeRelation === 1) {
					this.data[3].forEach(function(v, i, o) {
						if (v['parentId'] === threeLevelId) {
							fourLevelData.push(v);
							console.log("返回的四级数据:"+v['parentId']+v.value+v['id']);
						}
					});
				} else {
					fourLevelData = this.data[3];
				}
				// console.log("返回的四级数据:"+fourLevelData);
				return fourLevelData;
			}
			else if (iosSelectUtil.isFunction(this.data[3])) {
				return this.data[3](oneLevelId, twoLevelId,threeLevelId);
			}
			else {
				throw new Error('data format error');
			}
		},

		setFourLevel:function(oneLevelId, twoLevelId, threeLevelId,fourLevelId){
			console.log("四级setFourLevel()被调用。。。");

			var fourLevelData = this.getFourLevel(oneLevelId, twoLevelId,threeLevelId);
			var atIndex = 0;
			if (!fourLevelId) {
				fourLevelId = fourLevelData[0]['id'];
			}
			var fourHtml = '';
			var self = this;
			fourHtml += '<li></li>';
			fourHtml += '<li></li>';
			fourHtml += '<li></li>';
			fourLevelData.forEach(function(v, i, o) {
				if (v.id === fourLevelId) {
					fourHtml += '<li ' + iosSelectUtil.attrToHtml(v) + ' class="at">' + v.value + '</li>';
					atIndex = i + 1 + 3;
				} else {
					fourHtml += '<li ' + iosSelectUtil.attrToHtml(v) + '>' + v.value + '</li>';
				}
			});
			fourHtml += '<li></li>';
			fourHtml += '<li></li>';
			fourHtml += '<li></li>';
			this.fourthUlLevelContainDom.innerHTML = fourHtml;
			this.scrollFour.refresh();
			this.scrollFour.scrollToElement(':nth-child(' + (atIndex - 3) + ')', 0);

			var ddom = self.threeLevelContainDom.querySelector('li:nth-child(' + atIndex + ')');
			ddom.classList.add('at');
			self.fourthLevelContainDom.querySelector('li:nth-child(' + (atIndex - 1) + ')').classList.add('side1');
			self.fourthLevelContainDom.querySelector('li:nth-child(' + (atIndex - 2) + ')').classList.add('side2');
			self.fourthLevelContainDom.querySelector('li:nth-child(' + (atIndex + 1) + ')').classList.add('side1');
			self.fourthLevelContainDom.querySelector('li:nth-child(' + (atIndex + 2) + ')').classList.add('side2');

			self.selectFourObj = iosSelectUtil.attrToData(ddom, atIndex);
		}

	}
	if (typeof module != 'undefined' && module.exports) {
		module.exports = IosSelect;
	} else if (typeof define == 'function' && define.amd) {
		define(function() {
			return IosSelect;
		});
	} else {
		window.IosSelect = IosSelect;
	}
})();