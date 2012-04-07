//声明desktop空间,封装相关操作
myLib.NS("desktop");
myLib.desktop={
	winWH:function(){
		$('body').data('winWh',{'w':$(window).width(),'h':$(window).height()});
 	},
	desktopPanel:function(){
		$('body').data('panel',{
					   'taskBar':{
					   '_this':$('#taskBar'),
					   'task_lb':$('#task_lb')
										},
					   'lrBar':{
					   '_this':$('#lr_bar'),	   
					   'default_app':$('#default_app'),
					   
				       'start_block':$('#start_block'),
				       'start_btn':$('#start_btn'),
					   'start_item':$('#start_item'),
					   'default_tools':$('#default_tools')
							},				
						'deskIcon':{
							'_this':$('#deskIcon'),
							'icon':$('li.desktop_icon')
							},
						'powered_by':$('a.powered_by')
						});
		},
	getMydata:function(){
		return $('body').data();
		},
	mouseXY:function(){
		var mouseXY=[];
		$(document).bind('mousemove',function(e){ 
			mouseXY[0]=e.pageX;
			mouseXY[1]=e.pageY;
           });
		return mouseXY;
		},	
	contextMenu:function(jqElem,data,menuName,textLimit){
		  var _this=this
		      ,mXY=_this.mouseXY();
		  
          jqElem
		  .smartMenu(data,{
            name: menuName,
			textLimit:textLimit,
			afterShow:function(){
				var menu=$("#smartMenu_"+menuName);
				var myData=myLib.desktop.getMydata(),
		            wh=myData.winWh;//获取当前document宽高
 				var menuXY=menu.offset(),menuH=menu.height(),menuW=menu.width();
				if(menuXY.top>wh['h']-menuH){
					menu.css('top',mXY[1]-menuH-2);
					}
				if(menuXY.left>wh['w']-menuW){
					menu.css('left',mXY[0]-menuW-2);
					}	
				}
           });
		  $(document.body).click(function(event){
			event.preventDefault(); 			  
			$.smartMenu.hide();
						  });
		}	
	}
	
//窗口相关操作
myLib.NS("desktop.win");
myLib.desktop.win={
	winHtml:function(title,url,id){
		return "<div class='windows corner rgba' id="
		+id
		+"><div class='win_title'><b>"
		+title
		+"</b><span class='win_btnblock'><a href='#' class='winMinimize' title='最小化'></a><a href='#' class='winMaximize' title='最大化'></a><a href='#' class='winHyimize' title='还原'></a><a href='#' class='winClose' title='关闭'></a></span></div><iframe frameborder='0' name='myFrame_"
		+id
		+"' id='myFrame_"
		+id
		+"' class='winframe' scrolling='auto' width='100%' src='"
		+url
		+"'></iframe></div>";
		},
	 //添加遮障层，修复iframe 鼠标经过事件bug	
	iframFix:function(obj){
		obj.each(function(){
		var o=$(this);								
		if(o.find('.zzDiv').size()<=0)
		o.append($("<div class='zzDiv' style='width:100%;height:"+(o.innerHeight()-26)+"px;position:absolute;z-index:900;left:0;top:26px;'></div>"));
				 })
		},	
	//获取当前窗口最大的z-index值
	maxWinZindex:function($win){
		   return Math.max.apply(null, $.map($win, function (e, n) {
           if ($(e).css('position') == 'absolute')
            return parseInt($(e).css('z-index')) || 1;
              }));
			},
	findTopWin:function($win,maxZ){
		var topWin;
		$win.each(function(index){
 						   if($(this).css("z-index")==maxZ){
							   topWin=$(this);
							   return false;
							   } 
 						   });
		return topWin;  
		},		
	//关闭窗口	
	closeWin:function(obj){
		var _this=this,$win=$('div.windows').not(":hidden"),maxZ,topWin;
 		myLib.desktop.taskBar.delWinTab(obj);
		obj.hide('slow',function(){
			$(this).remove();
				         });
		//当关闭窗口后寻找最大z-index的窗口并使其出入选择状态
		if($win.size()>1){
		maxZ=_this.maxWinZindex($win.not(obj));
		topWin=_this.findTopWin($win,maxZ);
		_this.switchZindex(topWin);
		}
		},
	minimize:function(obj){
		var _this=this,$win=$('div.windows').not(":hidden"),maxZ,topWin,objTab;
		obj.hide();
		//最小化窗口后，寻找最大z-index窗口至顶
		if($win.size()>1){
		maxZ=_this.maxWinZindex($win.not(obj));
		topWin=_this.findTopWin($win,maxZ);
		_this.switchZindex(topWin);
		}else{
			objTab=myLib.desktop.taskBar.findWinTab(obj);
			objTab.removeClass('selectTab').addClass('defaultTab');
			}
		},	
	//最大化窗口函数	
	maximizeWin:function(obj){
		var myData=myLib.desktop.getMydata(),
		    wh=myData.winWh;//获取当前document宽高
		obj
		.css({'width':wh['w'],'height':wh['h']-85,'left':0,'top':47})
		.draggable( "disable" )
		.resizable( "disable" )
		.fadeTo("fast",1)
		.find(".winframe")
		.css({'width':wh['w']-6,'height':wh['h']-64});
		},
	//还原窗口函数	
	hyimizeWin:function(obj){
		var myData=obj.data(),
		    winLocation=myData.winLocation;//获取窗口最大化前的位置大小
			
		obj.css({'width':winLocation['w'],'height':winLocation['h'],'left':winLocation['left'],'top':winLocation['top']})
		.draggable( "enable" )
		.resizable( "enable" ) 
		.find(".winframe")
		.css({'width':winLocation['w']-6,'height':winLocation['h']-29});
		},	
	//交换窗口z-index值		
	switchZindex:function(obj){
		var myData=myLib.desktop.getMydata()
		    ,$topWin=myData.topWin
			,$topWinTab=myData.topWinTab
		    ,curWinZindex=obj.css("z-index")
			,maxZ=myData.maxZindex
			,objTab=myLib.desktop.taskBar.findWinTab(obj);
			
		if(!$topWin.is(obj)){
			
		obj.css("z-index",maxZ);
		objTab.removeClass('defaultTab').addClass('selectTab');
		
		$topWin.css("z-index",curWinZindex);
		$topWinTab.removeClass('selectTab').addClass('defaultTab');
		this.iframFix($topWin);
		//更新最顶层窗口对象
		$('body').data("topWin",obj).data("topWinTab",objTab);
		}
		},
	//新建窗口实例	
    newWin:function(options){
		var _this=this;
		
		var myData=myLib.desktop.getMydata(),
		    wh=myData.winWh,//获取当前document宽高
			$windows=$("div.windows"),
			curwinNum=myLib._is(myData.winNum,"Number")?myData.winNum:0;//判断当前已有多少窗口
			_this.iframFix($windows);
		//默认参数配置
        var defaults = {
            WindowTitle:          null,
			WindowsId:            null,
            WindowPositionTop:    'center',                          /* Posible are pixels or 'center' */
            WindowPositionLeft:   'center',                          /* Posible are pixels or 'center' */
            WindowWidth:          Math.round(wh['w']*0.6),           /* Only pixels */
            WindowHeight:         Math.round(wh['h']*1),           /* Only pixels */
            WindowMinWidth:       250,                               /* Only pixels */
            WindowMinHeight:      250,                               /* Only pixels */
		    iframSrc:             null,                              /* 框架的src路径*/ 
            WindowResizable:      true,                              /* true, false*/
            WindowMaximize:       true,                              /* true, false*/
            WindowMinimize:       true,                              /* true, false*/
            WindowClosable:       true,                              /* true, false*/
            WindowDraggable:      true,                              /* true, false*/
            WindowStatus:         'regular',                         /* 'regular', 'maximized', 'minimized' */
            WindowAnimationSpeed: 500,
            WindowAnimation:      'none'
        };
		  
		var options = $.extend(defaults, options);
 		 
		//判断窗口位置，否则使用默认值
		var wLeft=myLib._is(options['WindowPositionLeft'],"Number")?options['WindowPositionLeft']:(wh['w']-options['WindowWidth'])/2;
		var wTop=myLib._is(options['WindowPositionTop'],"Number")?options['WindowPositionTop']:(wh['h']-options['WindowHeight'])/2;
 		 
		//给窗口赋予新的z-index值
		var zindex=curwinNum+100;
		var id="myWin_"+options['WindowsId'];//根据传来的id将作为新窗口id
 		$('body').data("winNum",curwinNum+1);//更新窗口数量
		
		//判断如果此id的窗口存在，则不创建窗口
		if($("#"+id).size()<=0){
			//在任务栏里添加tab
			myLib.desktop.taskBar.addWinTab(options['WindowTitle'],options['WindowsId']);
			//初始化新窗口并显示
			$("body").append($(_this.winHtml(options['WindowTitle'],options['iframSrc'],id)));
		
		var $newWin=$("#"+id)
		   ,$icon=$("#"+options['WindowsId'])
		   ,$iconOffset=$icon.offset()
		   ,$fram=$newWin.children(".winframe")
		   ,winMaximize_btn=$newWin.find('a.winMaximize')//最大化按钮
		   ,winMinimize_btn=$newWin.find('a.winMinimize')//最小化按钮
		   ,winClose_btn=$newWin.find('a.winClose')//关闭按钮
		   ,winHyimize_btn=$newWin.find('a.winHyimize');//还原按钮
		   
		   winHyimize_btn.hide();
		   if(!options['WindowMaximize']) winMaximize_btn.hide();
		   if(!options['WindowMinimize']) winMinimize_btn.hide();
		   if(!options['WindowClosable']) winClose_btn.hide();
		
		//存储窗口最大的z-index值,及最顶层窗口对象
		$('body').data({"maxZindex":zindex,"topWin":$newWin});
		
		//判断窗口是否启用动画效果
		if(options.WindowAnimation=='none'){
			//wTop
		 $newWin
		 .css({"width":options['WindowWidth'],"height":options['WindowHeight']+40,"left":wLeft,"top":'48',"z-index":zindex})
		 //.addClass("loading")
		 .show();
		 
			}else{
	 		
		 $newWin
		 .css({"left":$iconOffset.left,"top":$iconOffset.top,"z-index":zindex})
		 //.addClass("loading")
		 .show()
		 .animate({ 
            width: options['WindowWidth'], 
            height:options['WindowHeight']+40,
            top:48, 
            left: wLeft}, 500);
		 
				}
				
        $newWin
		.data('winLocation',{
			  'w':options['WindowWidth'],
			  'h':options['WindowHeight']+40,
			  'left':wLeft,
			  'top':48
			  })
		.find(".winframe")
		.css({"width":options['WindowWidth']-6,"height":options['WindowHeight']-29})
		
		//等待iframe加载完毕
		//.load(function(){
					   
 		   //调用窗口拖动,参数可拖动的范围上下左右，窗口id和，浏览器可视窗口大小
		   if(options['WindowDraggable']){
		   _this.drag([0,0,wh['w']-options['WindowWidth']-10,wh['h']-options['WindowHeight']-35],id,wh);
		   }
		   //调用窗口resize,传递最大最小宽度和高度，新窗口对象id，浏览器可视窗口大小
		   if(options['WindowResizable']){
		   _this.resize(options['WindowMinWidth'],options['WindowMinHeight'],wh['w']-wLeft,wh['h']-wTop-35,id,wh);
		   }
		   //当改变浏览器窗口大小时，更新其拖动和拖曳区域大小
		   $(window).wresize(function(){
 						_this.upWinDrag_block($newWin);
						_this.upWinResize_block($newWin);
										  });
		      
							//});
		
		//如果有多个窗口，当单击某个窗口，则使此窗口显示到最上面
		if(curwinNum){
			var $allwin=$("div.windows");
			$allwin.bind({
						 "mousedown":function(event){  
				                _this.switchZindex($(this));
									},
						 "mouseup":function(){
							 $(this).find('.zzDiv').remove();
							 }		
								});
			}
			
		//窗口最大化，最小化，及关闭
		winClose_btn.click(function(event){
					 event.stopPropagation();
 					 _this.closeWin($(this).parent().parent().parent());
									  });
		//最大化
		winMaximize_btn.click(function(event){
					 event.stopPropagation();			   
					 if(options['WindowStatus']=="regular"){								 
					 _this.maximizeWin($(this).parent().parent().parent());
					 $(this).hide();
					 winHyimize_btn.show();
					 options['WindowStatus']="maximized";
					 }
 						});
		//还原窗口
		winHyimize_btn.click(function(event){
					 event.stopPropagation();				  
					 if(options['WindowStatus']=="maximized"){								 
					 _this.hyimizeWin($(this).parent().parent().parent());
					 $(this).hide();
					 winMaximize_btn.show();
					 options['WindowStatus']="regular";
					 }		  
									  });
		//最小化窗口
		winMinimize_btn.click(function(){
						_this.minimize($(this).parent().parent().parent());		   
									   });
		             }else{//如果已存在此窗口，判断是否隐藏
					     var wins=$("#"+id),objTab=myLib.desktop.taskBar.findWinTab(wins);
						 if(wins.is(":hidden")){
							  wins.show();
							  objTab.removeClass('defaultTab').addClass('selectTab');//当只有一个窗口时
						      myLib.desktop.win.switchZindex(wins);
							 }
						
						 }
		},
	upWinResize_block:function(win){
		    
			//更新窗口可改变大小范围,wh为浏览器窗口大小
            var offset=win.offset();
		    win.resizable( "option" ,{'maxWidth':$(window).width()-offset.left-10,'maxHeight':$(window).height()-offset.top-35})
		},
	upWinDrag_block:function(win){
		   var h=win.innerHeight()
		      ,w=win.innerWidth();
			
			//更新窗口可拖动区域大小
		    win.draggable( "option", "containment", [10,10,$(window).width()-w-10,$(window).height()-h-35] )
		},	
	drag:function(arr,win_id,wh){
		var _this=this;
		$("#"+win_id)
		.draggable({ 
	    handle: "#"+win_id+' .win_title',
	    iframeFix:false,
	    containment:arr,
		delay: 50 ,
		distance: 30
		})
		.bind("dragstart",function(event,ui){
 					_this.iframFix($(this));	  
						  })
		.bind( "dragstop", function(event, ui) {
			var obj_this=$(this);	
			
			var offset=obj_this.offset();
			//计算可拖曳范围
			_this.upWinResize_block(obj_this);
			
		    obj_this
			//更新窗口存储的位置属性
			.data('winLocation',{
			'w':obj_this.width(),
			'h':obj_this.height(),
			'left':offset.left,
			'top':offset.top
			})
			.find('.zzDiv').remove();
         }); 
		
		   $("div.win_title").css("cursor","move");
		},
	resize:function(minW,minH,maxW,maxH,win_id,wh){
		var _this=this;
		$("#"+win_id)
		.resizable({
		minHeight:minH,
		minWidth:minW,
		containment:'document',
		maxWidth:maxW,
		maxHeight:maxH
		})
		.css("position","absolute")
		.bind( "resize", function(event, ui) {
			var h=$(this).innerHeight(),w=$(this).innerWidth(); 	
 			 _this.iframFix($(this));
			 
			//拖曳改变窗口大小，更新iframe宽度和高度，并显示iframe					 
			$(this).children(".winframe").css({"width":w-6,"height":h-29});
				
        })
	   .bind( "resizestop", function(event, ui) {					 
			var obj_this=$(this);
			var offset=obj_this.offset();
			var h=obj_this.innerHeight(),w=obj_this.innerWidth();
			
			//更新窗口可拖动区域大小
			_this.upWinDrag_block(obj_this);
			
		    obj_this
			//更新窗口存储的位置属性
			.data('winLocation',{
			'w':w,
			'h':h,
			'left':offset.left,
			'top':offset.top
			  })
			 //删除遮障iframe的层
			.find(".zzDiv").remove();
       });
		}
	}

myLib.NS("desktop.topBar");
myLib.desktop.topBar={
	init:function(){
		$("li").click(function(){
		 	
		});
		$(".bar_chat").click(function(){
			
		});
	}
}
//侧边工具栏
myLib.NS("desktop.lrBar");
myLib.desktop.lrBar={
	init:function(){
		//读取元素对象数据
		var myData=myLib.desktop.getMydata();
	    var $default_tools=myData.panel.lrBar['default_tools']
		    ,$def_tools_Btn=$default_tools.find('span')
			,$start_btn=myData.panel.lrBar['start_btn']
			,$start_item=myData.panel.lrBar['start_item']
			,$default_app=myData.panel.lrBar['default_app']
			,$lrBar=myData.panel.lrBar['_this']
			,wh=myData.winWh;
			
		//初始化侧栏位置
		var tops=Math.floor((wh['h']-$lrBar.height())/2)-50;
		$lrBar.css({'top':tops});
		//如果窗口大小改变，则更新侧边栏位置
		$(window).wresize(function(){
			var tops=Math.floor(($(window).height()-$lrBar.height())/2)-50;					  
			$lrBar.css({'top':tops});
								   });
		//任务栏右边默认组件区域交互效果	
		$def_tools_Btn.hover(function(){
							$(this).css("background-color","#999");	
								},function(){
									$(this).css("background-color","transparent");
									});	
		//默认应用程序区
		$default_app
		.find('li')
		.hover(function(){
						    $(this).addClass('btnOver');
								 },function(){
									$(this).removeClass('btnOver');		  
										})
		.find('img').click(function(){
						var title=$(this).attr('title'),wid=$(this).parent().attr('id'),bouri=$(this).parent().attr('bouri');		
								alert(bouri);
							myLib.desktop.win.newWin({
													 WindowTitle:title,
													 iframSrc:'http://192.168.0.108:8080'+bouri,
													 WindowsId:wid,
													 WindowAnimation:'easeInBack'
 													 });			
									})
		.end()
		.end()
		.sortable({
			revert: true
		});
		
		//开始按钮、菜单交互效果
		$start_btn.click(function(event){
								  event.preventDefault();
								  event.stopPropagation()
								  if($start_item.is(":hidden"))
								  $start_item.show();
								  else
								  $start_item.hide();
								  });
		$("body").click(function(event){
								 event.preventDefault();  
								 $start_item.hide();
									  });
		}
 	}
/*----------------------------------------------------------------------------------	
//声明任务栏空间，任务栏相关js操作
----------------------------------------------------------------------------------*/
myLib.NS("desktop.taskBar");
myLib.desktop.taskBar={
	timer:function(obj){
		 var curDaytime=new Date().toLocaleString().split(" ");
		 obj.innerHTML=curDaytime[1];
		 obj.title=curDaytime[0];
		 setInterval(function(){obj.innerHTML=new Date().toLocaleString().split(" ")[1];},1000);
		},
	upTaskWidth:function(){
		var myData=myLib.desktop.getMydata()
		    ,$task_bar=myData.panel.taskBar['_this'];
		var maxHdTabNum=Math.floor($(window).width()/100);
		    //计算任务栏宽度
		    $task_bar.width(maxHdTabNum*100);	
			//存储活动任务栏tab默认组数
			$('body').data("maxHdTabNum",maxHdTabNum-2);
		},	
	init:function(){
		//读取元素对象数据
		var myData=myLib.desktop.getMydata();
 		var $task_lb=myData.panel.taskBar['task_lb']
		    ,$task_bar=myData.panel.taskBar['_this']
			,wh=myData.winWh;
 
		 var _this=this;
		 _this.upTaskWidth();
		 //当改变浏览器窗口大小时，重新计算任务栏宽度
		 $(window).wresize(function(){
						_this.upTaskWidth();   
								   });
  		 
 		},
	contextMenu:function(tab,id){
		var _this=this;
		 //初始化任务栏Tab右键菜单
		 var data=[
					[{
					text:"最大化",
					func:function(){
 						$("#myWin_"+tab.data('win')).find('a.winMaximize').trigger('click');
						}
					  },{
					text:"最小化",
					func:function(){
						myLib.desktop.win.minimize($("#myWin_"+tab.data('win')));
						}
						  }]
					,[{
					  text:"关闭",
					  func:function(){
						  $("#smartMenu_taskTab_menu"+id).remove();
 						  myLib.desktop.win.closeWin($("#myWin_"+tab.data('win')));
						  } 
					  }]
					];
		 myLib.desktop.contextMenu(tab,data,"taskTab_menu"+id,10);
		},
	addWinTab:function(text,id){
		var myData=myLib.desktop.getMydata();
 		var $task_lb=myData.panel.taskBar['task_lb']
		    ,$task_bar=myData.panel.taskBar['_this']
		    ,tid="myWinTab_"+id
			,allTab=$task_lb.find('a')
			,curTabNum=allTab.size()
		    ,docHtml="<a href='#' id='"+tid+"'><img src='#' style='vertical-align:middle;margin-right:2px;'>"+text+"</a>";
			
			//添加新的tab
		    $task_lb.append($(docHtml));
			var $newTab=$("#"+tid);
			//右键菜单
			this.contextMenu($newTab,id);
			
			$task_lb
			.find('a.selectTab')
			.removeClass('selectTab')
			.addClass('defaultTab');
			 
			$newTab
			.data('win',id)
			.addClass('selectTab')
			.click(function(){
					var win=$("#myWin_"+$(this).data('win'));	
					
					if(win.is(":hidden")){
						win.show();
 						$(this).removeClass('defaultTab').addClass('selectTab');//当只有一个窗口时
						myLib.desktop.win.switchZindex(win);
  						}else{
							if($(this).hasClass('selectTab')){
							myLib.desktop.win.minimize(win);
  							}else{
								myLib.desktop.win.switchZindex(win);
								} 
							  }
 							});
			
			$('body').data("topWinTab",$newTab);
			
			//当任务栏活动窗口数超出时
			if(curTabNum>myData.maxHdTabNum-1){
				var LeftBtn=$('#leftBtn')
				    ,rightBtn=$('#rightBtn')
					,bH;
				
                LeftBtn
				.show()
				.find("a")
				.click(function(){
							        var pos=$task_lb.position();
									if(pos.top<0){
										$task_lb.animate({
                                                  "top":pos.top+40
                                                      }, 50);
										}
									 });
				
				rightBtn
				.show()
				.find("a")
				.click(function(){
									var pos=$task_lb.position(),h=$task_lb.height(),row=h/40;
									if(pos.top>(row-1)*(-40)){
									$task_lb.animate({
                                                  "top": pos.top-40
                                                      }, 50);   
									}
									   });
				
				$task_lb.parent().css("margin","0 100");
				}
	 
		},
	delWinTab:function(wObj){
		var myData=myLib.desktop.getMydata()
 		    ,$task_lb=myData.panel.taskBar['task_lb']
			,$task_bar=myData.panel.taskBar['_this']
			,LeftBtn=$('#leftBtn')
			,rightBtn=$('#rightBtn')
		    ,pos=$task_lb.position();
			
		this.findWinTab(wObj).remove();
		
		var newH=$task_lb.height();
		if(Math.abs(pos.top)==newH){
			LeftBtn.find('a').trigger("click");
			}
		if(newH==40){
			LeftBtn.hide();
			rightBtn.hide();
			$task_lb.parent().css("margin",0);
			}	
		},
	findWinTab:function(wObj){
		var myData=myLib.desktop.getMydata(),
		    $task_lb=myData.panel.taskBar['task_lb'],
		    objTab;
		    $task_lb.find('a').each(function(index){
								var id="#myWin_"+$(this).data("win");		 
								if($(id).is(wObj)){
									objTab=$(this);
									}		 
 										 });
		    return objTab;
		}	
	}
	
//桌面图标
myLib.NS("desktop.deskIcon");
myLib.desktop.deskIcon={
	//桌面图标排列
	arrangeIcons:function(){
		 var myData=myLib.desktop.getMydata()
		    ,winWh=myData.winWh
			,$deskIconBlock=myData.panel.deskIcon['_this']
			,$icon=myData.panel.deskIcon['icon'];
			
		 //设置桌面图标容器元素区域大小
		 $deskIconBlock.css({"width":(winWh['w']-75)+"px","height":(winWh['h']-75)+"px","margin-top":"10px",'margin-left':'35px'});
		 //对图标定位
		 var iconNum=$icon.size();
		 //存储当前总共有多少桌面图标
		 $('body').data('deskIconNum',iconNum);
		 var gH=110;//一个图标总高度，包括上下margin
		 var gW=120;//图标总宽度,包括左右margin
		 var rows=Math.floor((winWh['h']-75)/gH);
		 var cols=Math.ceil(iconNum/rows);
		 var curcol=0,currow=0;
		 //alert(rows);
		 $icon.css({
				   "position":"absolute",
				   "margin":0,
				   "left":function(index,value){
					       var v=curcol*gW+30;
					           if((index+1)%rows==0){
							       curcol=curcol+1;
					              }
						   return v;	 
 						},
					"top":function(index,value){
 							var v=(index-rows*currow)*gH+20;
								if((index+1)%rows==0){
									 currow=currow+1;
									}
						    return v;
							}});
 		return $icon;
		},
	init:function(){
		 //将当前窗口宽度和高度数据存储在body元素上
		 myLib.desktop.winWH();
		 var _this=this;//调用父级对象
		 var $icon=_this.arrangeIcons();
		 //如果窗口大小改变，则重新排列图标
		 $(window).wresize(function(){
							myLib.desktop.winWH();//更新窗口大小数据
							_this.arrangeIcons();
 								   });
		 //图标鼠标经过效果
		 $icon.hover(function(){
						 $(this).addClass("desktop_icon_over");
						 },
						 function(){
							  $(this).removeClass("desktop_icon_over");
							 })
		//单击图标打开窗口
		 .click(function(){
							var title=$(this).children("div.text").text(),wid=this.id,bouri=$(this).attr('bouri');
							myLib.desktop.win.newWin({
													 WindowTitle:title,
													 iframSrc:'http://192.168.0.108:8080'+bouri,
													 WindowsId:wid,
													 WindowAnimation:'easeInBack'
 													 });
							})
		 .draggable({
					revert: true,
					helper: "clone",
					opacity: 0.7,
					start: function(event, ui) {
						var offset=$(this).offset();
						$('body').data("curDragIcon",$(this));
						}
					})
		 .droppable({
                drop: function() {
					var curDragIcon=$('body').data("curDragIcon");
					curDragIcon.insertAfter($(this));
					var l=$(this).css('left'),t=$(this).css('top');
					$(this).css({'left':curDragIcon.css('left'),'top':curDragIcon.css('top')});
					curDragIcon.css({'left':l,'top':t});
					},
           });
		 
		 //初始化桌面右键菜单
		 var data=[
					[{
					text:"显示桌面",
					func:function(){
					//这里自定义右键菜单菜单的方法
					}
						}]
					,[{
					text:"系统设置",
					func:function(){}
					  },{
					text:"主题设置",
					func:function(){}
						  }]
					,[{
					  text:"退出系统",
					  func:function(){} 
					  }]
					,[{
					  text:"关于ß道",
					  func:function(){} 
					  }]
					];
		 myLib.desktop.contextMenu($(document.body),data,"body",10);
		}
	}

//当页面加载完毕执行
$(function(){
		   //存储桌面布局元素的jquery对象
		   myLib.desktop.desktopPanel();
		   //初始化任务栏
		   myLib.desktop.taskBar.init();
		   //初始化桌面图标
		   myLib.desktop.deskIcon.init();
		   //初始化侧边栏
		   //myLib.desktop.lrBar.init();
		   //初始化上边栏
		   myLib.desktop.topBar.init();
		   });

	
