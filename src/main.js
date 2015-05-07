(function(win,doc,unde){


//timeline
	win.Timeline = function(opts){
		this.init();
	};
	var tlFn = win.Timeline.prototype;

	tlFn.init = function(){
		this.$ = $('.timeline .timeline-list');
		this.initPlugins();
	};

	tlFn.initPlugins = function(){
		//highcharts
		Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
	        return {
	            radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
	            stops: [
	                [0, color],
	                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
	            ]
	        };
	    });

	    var color = Highcharts.getOptions().colors[0];
	    Highcharts.getOptions().colors[0] = Highcharts.getOptions().colors[2];
	    Highcharts.getOptions().colors[2] = color;
	    //other plugins
	};
	tlFn.addItem = function(data){
		var tlItem = new TimelineItem(data);

		this.$.prepend(tlItem.$);
		tlItem.show();

	};



//timelineItem
	var TimelineItem = function(json){
		this.json = json || {}; //缓存data

		this.init(json);
	};
	var tlItemFn = TimelineItem.prototype;
	tlItemFn.init = function(json){
		
		this.createTemplate(json);

	};
	tlItemFn.show = function(){
		var $icon = this.$icon,
			$time = this.$time,
			$cont = this.$cont,
			self = this;

		$(window).scrollTop(0);

		TweenLite.set($icon, {css:{y:'-50%', alpha:0}});
		TweenLite.to($time, 0.2, {css:{alpha:1}});
		TweenLite.to($icon, 0.6, {css:{y:'0%', alpha:1},onComplete:function(){
			self.$.addClass('role_'+self.json.role+'__animate');
		}});
		TweenLite.to($cont, 0.25, {delay:0.8,css:{scale:1, alpha:1}});

	};

	tlItemFn.createTemplate = function(json){
		var role = json.role || 'machine',
			type = json.type || 'table',
			timestamp = Util.toAppDateString(new Date(json.timestamp)),
			date = timestamp.split(' ')[0],
			time = timestamp.split(' ')[1],
			icon = role == 'user' ? APPLICATION.info.wxheadurl : ('assets/images/icon-'+role+'.png');

		this.$ = $('<div class="timeline-item"><div class="timeline-content"><div class="content-body clearfix"></div></div></div>');
		this.$icon = $('<div class="timeline-icon"><div class="icon-bubble"></div><div class="icon-mask"></div><img class="icon-pic" src="'+ icon +'"></div>');	
		this.$time = $('<div class="timeline-time"><i class="fa fa-clock-o"></i><span>'+date+'</span><time>'+time+'</time></div>');
		this.$.append(this.$icon).append(this.$time);	
		this.$.addClass('role_'+role);
		this.$cont = this.$.find('.content-body');
		this['create$'+type](json);
	};
	//图片
	tlItemFn.create$picture = function(json){
		var picurl = json.data.url,
			pictitle = json.data.title;
		this.$picture = $('<div class="picture"><img src="'+picurl+
						'"><h2>'+pictitle+'</h2></div>');
		this.$cont.prepend(this.$picture);

		this.$picture.find('img').on('load',function(){
			var $this = $(this);
			if($this.width()>$this.height()){
				$this.parent('.picture').addClass('picture_h');
			}
		});

		/*{
			"timestamp": "2014-04-03 ",
			"type": "picture", //图片
			"role": "user", //user:用户，machine:机器，artificial:人工
			"data": {
				"title": "张三 身份证照片",
				"url": "http://www.example.com/test.png"
			}
		}*/
	};

	//地图
	tlItemFn.create$map = function(json){
		var address = json.data.address,
			title = json.data.title;

		this.$map = $('<div class="map"></div>');
		this.$cont.prepend(this.$map);
		
		var map = new BMap.Map(this.$map[0]);
		var point = new BMap.Point(121.53927,31.224103);
		map.centerAndZoom(point,12);
		map.addControl(new BMap.NavigationControl({type: BMAP_NAVIGATION_CONTROL_SMALL}));
		map.addControl(new BMap.OverviewMapControl({size:new BMap.Size(100,100),/*isOpen:true,*/ anchor: BMAP_ANCHOR_BOTTOM_RIGHT}));              //添加缩略地图控件
		
		map.enableAutoResize(); //太关键了，解决了一个页面多个地图除第一个外显示不正常的问题
		// 创建地址解析器实例
		var myGeo = new BMap.Geocoder();
		// 将地址解析结果显示在地图上,并调整地图视野
	
		myGeo.getPoint(address, function(point){
			if (point) {
				map.centerAndZoom(point, 14);
				var marker = new BMap.Marker(point);
				map.addOverlay(marker);

				var label = new BMap.Label('<h2>'+title+'</h2><address style="font-size:14px">'+address+'</address>');
				label.setStyle({
					fontSize: '16px',
					borderRadius: '3px',
					backgroundColor: 'rgba(255,255,255,0.8)',
					border: 'none',
					boxShadow: '0 0 5px 2px rgba(255,0,0,0.5) ',
					transform: 'translate(-50%,-105%)'
				});
				marker.setLabel(label);
			}else{
				console.log("您选择地址没有解析到结果!");
			}
		});

		/*{
			"timestamp": "2014-04-03 ",
			"type": "map", //地图
			"role": "machine", //user:用户，machine:机器，artificial:人工
			"data": {
				"title": "张三 现住址",
				"address": "南通市崇川区杨舍镇上进路69号6室"
			}
		}*/
	};

	//表格
	tlItemFn.create$table = function(json){
		var title = json.data.title,
			results = json.data.results,
			tablehtml = '';


		this.$table = $('<div class="table"></div>')
					.append('<h2>'+title+'</h2>');

		for (var i = 0,l = results.length,result=null; i < l; i++) {
			result = results[i];
			tablehtml += '<tr class="status-'+result.status+'"><td class="key">'+result.key+'</td><td class="value">'+result.value+'</td></tr>';
		}

		$('<table></table>').append(tablehtml).appendTo(this.$table);

		this.$cont.append(this.$table);

		/*{	
			"timestamp":"2015-03-30 15:32:33",
			"type": "table", //表格
			"role": "user", //user:用户，machine:机器，artificial:人工
			"data": {
				"title": "用户扫码（微信申请信息）",
				"results": [
					{
						"key":"微信用户名",
						"value": "海贼王一样的男人",
						"status": -1 //-1:default(normal),0:success,1:warning,2:danger
					},
					{
						"key":"分期开始时间",
						"value": "2015-03-14 16:11:35",
						"status": -1 //-1:default(normal),0:success,1:warning,2:danger
					},
					{
						"key":"同意协议时间",
						"value": "2015-03-14 16:22:35",
						"status": -1 //-1:default(normal),0:success,1:warning,2:danger
					}
				]
			}
		}*/
	};

	//审核列表
	tlItemFn.create$checklist = function(json){
		var title = json.data.title,
			results = json.data.results,
			listhtml = '',
			status_arr = {
				'-1': 'fa-question-circle',
				'0': 'fa-check-circle',
				'1': 'fa-exclamation-circle',
				'2': 'fa-times-circle'
			};

		this.$checklist = $('<div class="checklist"></div>')
						.append('<h2>'+title+'</h2>');

		for (var i = 0,l = results.length,result=null; i < l; i++) {
			result = results[i];

			listhtml += '<tr><td class="status"><i class="fa '+status_arr[result.status]+'"></i></td><td class="cont">'+result.key+'</td></tr>';
		}
		
		$('<table></table>').append(listhtml).appendTo(this.$checklist);	
		this.$cont.prepend(this.$checklist);

		/*{	
			"timestamp":"2015-03-30 15:32:33",
			"type": "checklist", //审核列表
			"role": "user", //user:用户，machine:机器，artificial:人工
			"data": {
				"title": "审核信息",
				"results": [
					{
						"key":"个人信息审核",
						"status": 0 //0:success,1:warning,2:danger
					},
					{
						"key":"银行卡审核",
						"status": 0 //0:success,1:warning,2:danger
					},
					{
						"key":"捷信和被执行审核",
						"status": 0 //0:success,1:warning,2:danger
					},
					{
						"key":"客户电话审核",
						"status": 0 //0:success,1:warning,2:danger
					}
				]
			}
		}*/
	};

	//饼图
	tlItemFn.create$piechart = function(json){
		var title = json.data.title,
			results = json.data.results,
			total = 0;

		for (var i = 0,l = results.length; i < l; i++) {
			total += results[i].y;
		}

		this.$chart = $('<div class="piechart"></div>');
		this.$cont.append(this.$chart);

		//var colors = Highcharts.getOptions().colors;
		var highchartsOption = {
	        chart: {
	        	backgroundColor: 'transparent',
	            width: 400,
	            height: 300
	        },
	        title: {
	            text: title+'(至今提交<b>'+total+'</b>单)'
	        },
	        tooltip: {
	            pointFormat: '{series.name}: <b>{point.y}单</b>'
	        },
	        plotOptions: {
	            pie: {
	                allowPointSelect: true,
	                cursor: 'pointer',
	                dataLabels: {
	                    enabled: true,
	                    format: '<b>{point.name}</b>: {point.percentage:.2f} %',
	                    style: {
	                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
	                    }
	                }
	            }
	        },
	        series: [{
	            type: 'pie',
	            name: title,
	            data: results
	        }]
	    };



		this.$chart.highcharts(highchartsOption);

/*{	
	"timestamp":"2015-03-30 15:32:33",
	"type": "piechart", //饼图
	"role": "machine", //user:用户，machine:机器，artificial:人工
	"data": {
		"title": "南通盛达手机连锁旗舰店",
		//"unit": "单", //数据单位，多少个订{单}，多少{件}产品，待定
		"results": [
			{
				"name": "成功",
				"y": 15
			},
			{
				"name": "拒绝",
				"y": 8
			},
			{
				"name": "逾期",
				"y": 3
			}
		]
	}
}*/

	};

//baseinfo
	win.APPLICATION = {
		Status: {
			"-1": "申请已取消",		//Canceled
			"0": "开始申请",			//Started
			"10": "申请已提交",		//Submited
			"23": "预批准",			//PreApproved
			"29": "所有文件已上传",	//AllFileSubmited
			"30": "正式批准",			//Approved
			"35": "商户批准",			//MerchantApproved
			"40": "已拒绝",			//Rejected
			"100": "还款中",			//Completed
			"200": "已逾期",			//Delayed
			"500": "分期已结束",		//Closed
			"600": "提前还款"	,		//ClosedInAdvanced
			"done": ["-1","40","100","200","500","600"]
		},
		Estimate: 30,

		//动态
		info: {
			username: "买单侠",
			wxheadurl: "assets/images/icon-default.png",
			starttime: "",
			endtime: ""
		},
		currentstatus: 0,
		timeline_messages: []
	};


})(window,document,undefined);


$(function(){

//debug
	$('<button  style="position:fixed; right:10px;top:70px;z-index:100; background:#fff;">emit appinfo</button>').prependTo('body').on('click',function(){
		var now = new Date();
		var data = {
			"timestamp": Util.toAppDateString(now), //服务器消息发送时间
			"data":{
				"username": "张三", //申请人
				"wxheadurl": "assets/images/icon-user.png", //申请人微信头像
				"starttime": Util.toAppDateString(Util.DateOperate('m',-15,now)), //申请开始时间
				"endtime": Util.toAppDateString(Util.DateOperate('m',30,now)), //申请完成时间, *在申请过程中无此字段*
			}
		};
		socket.emit('appinfo',data);
	});

	$('<button  style="position:fixed; right:10px;top:100px;z-index:130; background:#fff;">emit status</button>').prependTo('body').on('click',function(){
		var now = new Date(),
			status = [
				"-1",		//Canceled
				"0",			//Started
				"10",		//Submited
				"23",			//PreApproved
				"29",	//AllFileSubmited
				"30",			//Approved
				"35",			//MerchantApproved
				"40",			//Rejected
				"100",			//Completed
				"200",			//Delayed
				"500",		//Closed
				"600"		//ClosedInAdvanced
			],
			code = status[parseInt(status.length*Math.random())];

		var data = {
			"timestamp": Util.toAppDateString(now), //服务器消息发送时间
			"data":{
				"key": code, //状态码
				"value": APPLICATION.Status[code] //状态描述
			}
		};
		socket.emit('status',data);
	});
	$('<button  style="position:fixed; right:10px;top:130px;z-index:100; background:#fff;">emit timeline</button>').prependTo('body').on('click',function(){
		var types = ['table','checklist','map','picture','piechart'];
		var roles = ['user','machine','artificial'];
		var datas = {
			'picture': {
				"timestamp": "2014-04-03 15:32:33",
				"type": "picture", //图片
				"role": "user", //user:用户，machine:机器，artificial:人工
				"data": {
					"title": "张三 身份证照片",
					"url": "assets/images/pic-2.png"
				}
			},
			'map': {
				"timestamp": "2014-04-03 15:32:33",
				"type": "map", //地图
				"role": "machine", //user:用户，machine:机器，artificial:人工
				"data": {
					"title": "张三 现住址",
					"address": "南通市崇川区杨舍镇上进路69号6室"
				}
			},
			'table': {	
				"timestamp":"2015-03-30 15:32:33",
				"type": "table", //表格
				"role": "user", //user:用户，machine:机器，artificial:人工
				"data": {
					"title": "用户扫码（微信申请信息）",
					"results": [
						{
							"key":"微信用户名",
							"value": "海贼王一样的男人",
							"status": -1 //-1:default(normal),0:success,1:warning,2:danger
						},
						{
							"key":"身份信息",
							"value": "男，28岁",
							"status": 0 //-1:default(normal),0:success,1:warning,2:danger
						},
						{
							"key":"常住地址",
							"value": "京都一号",
							"status": -1 //-1:default(normal),0:success,1:warning,2:danger
						},
						
					]
				}
			},
			'checklist': {	
				"timestamp":"2015-03-30 15:32:33",
				"type": "checklist", //审核列表
				"role": "user", //user:用户，machine:机器，artificial:人工
				"data": {
					"title": "审核信息",
					"results": [
						{
							"key":"个人信息审核",
							"status": 0 //0:success,1:warning,2:danger
						},
						{
							"key":"银行卡审核",
							"status": 1 //0:success,1:warning,2:danger
						},
						{
							"key":"捷信和被执行审核",
							"status": 1 //0:success,1:warning,2:danger
						},
						{
							"key":"客户电话审核",
							"status": 0 //0:success,1:warning,2:danger
						}
					]
				}
			},
			'piechart': {	
				"timestamp":"2015-03-30 15:32:33",
				"type": "piechart", //饼图
				"role": "machine", //user:用户，machine:机器，artificial:人工
				"data": {
					"title": "秦淮八艳",
					//"unit": "单", //数据单位，多少个订{单}，多少{件}产品，待定
					"results": [
						{
							"name": "成功",
							"y": 30
						},
						{
							"name": "拒绝",
							"y": 30
						},
						{
							"name": "逾期",
							"y": 30
						}
					]
				}
			}
		};
		var type = types[parseInt(types.length*Math.random())],
			role = roles[parseInt(roles.length*Math.random())],
			data = $.extend({},datas[type],{'role':role});
		socket.emit('timeline',[data]);
	});

	io = function(){};
	io.connect = function(url){
		var socket = function(){
			this.listener = {};
		};
		socket.prototype = {
			on: function(event,handler){
				this.listener[event] = handler;
			},
			emit: function(event,data){
				this.listener[event](data);
			}
		};
		return new socket();
	};

	var socket = initApplication();

});

function initApplication(){
	var socket = io.connect(''),
		timeline = new Timeline(),
		tllite = new TimelineLite({align:'sequence'}),
		$app_username = $('#applicationPro-username'),
		$app_status = $('#applicationPro-status'),
		$app_starttime = $('#applicationPro-starttime'),
		$app_endtime = $('#applicationPro-endtime'),
		$progressbar = $('.progress-bar div');

	

	socket.on('connect',function(e){
		socket.emit('join',{'appid':Util.getUrlParam('appid')});
	});
	socket.on('appinfo',function(appinfo){

		console.log('appinfo:',appinfo);

		$.each(appinfo.data, function(key,val){
			if(val !== '' && val !== null && val !== undefined){
				APPLICATION.info[key] = val;
			}
		});

		if(appinfo.data.endtime === undefined || APPLICATION.info.endtime === undefined || APPLICATION.info.endtime === ''){
			APPLICATION.info.endtime = Util.DateOperate('m',APPLICATION.Estimate,new Date(APPLICATION.info.starttime));
		}


		APPLICATION.info.starttime = Util.toAppDateString(new Date(APPLICATION.info.starttime));
		APPLICATION.info.endtime = Util.toAppDateString(new Date(APPLICATION.info.endtime));

		$app_username.text(APPLICATION.info.username);
		$app_starttime.html(APPLICATION.info.starttime.split(' ')[0] + ' <time>'+APPLICATION.info.starttime.split(' ')[1]+'</time>');
		$app_endtime.html(APPLICATION.info.endtime.split(' ')[0] + ' <time>'+APPLICATION.info.endtime.split(' ')[1]+'</time>');
		
/*	appinfo = {
		"timestamp": "2015.02.26 16:40:32", //服务器消息发送时间
		"data":{
			"username": "张三", //申请人
			"wxheadurl": "assets/images/icon-default.png", //申请人微信头像
			"starttime": "2015.02.16 16:34:55", //申请开始时间
			"endtime": "2015.02.16 17:04:55", //申请完成时间, *在申请过程中无此字段*
		}
	}*/
	});
	socket.on('status',function(status){

		console.log('status:',status);

		var starttime = new Date(APPLICATION.info.starttime),
			currenttime = new Date(status.timestamp),
			endtime = new Date(APPLICATION.info.endtime),
			gap = currenttime - starttime,
			isDone = APPLICATION.Status.done.indexOf(status.data.key)>=0 ? true : false,
			percent = isDone ? 100 : gap/(endtime-starttime)*100;


		percent = percent > 100 ? 100 : percent;

		
		tllite.add(function(){
			$progressbar.css({'width':percent+'%'}).attr({'class':'progress-status-'+status.data.key});
			$app_status.text(status.data.value);
		},"+=0.1");
	});
	socket.on('timeline',function(timelineItems){

		console.log('timeline:',timelineItems);
		//APPLICATION.timeline_messages.concat(arr);
		timelineItems.forEach(function(item,i){
			tllite.add(function(){
				timeline.addItem(item);
			},"+=1.2");
		});
		
	});
	//debug
	return socket;
}





























