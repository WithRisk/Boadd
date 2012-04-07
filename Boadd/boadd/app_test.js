/**
 * modules引入
 */
var express = require('express'),
	sio = require('socket.io'),
	fs=require('fs'),
	path = require('path'),
	url = require('url'),
	ejs = require('ejs'),
	routes = require('./routes'),
	config = require('./models/Config'),
	mysql_index = require('./models/Index'),
	mysql_Contacts = require('./models/Contacts'),
	mysql_Bulletinboard = require('./models/Bulletinboard'),
	mysql_user = require('./models/user'),
	mysql_chat = require('./models/webIM'),
	mysql_edit = require('./models/edit_user'),
	parseCookie = require('connect').utils.parseCookie,
	MemoryStore = require('connect/lib/middleware/session/memory');

/**
 * 私人聊天使用session
 */
var usersWS = {}, //私人聊天用的websocket
	storeMemory = new MemoryStore({
		reapInterval: 60000000 * 10
	});//session store
//app配置
var app = module.export = express.createServer();

app.configure(function(){
	app.use(express.bodyParser({uploadDir:'/Users/chengjiao/Desktop/Boadd/boadd/uploads/'}));
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'boadd',
		store:storeMemory 
	}));
	app.use(express.methodOverride());
	app.use(app.router);//要放在bodyParser之后，处理post
	app.set('view engine', 'html');
	app.set('views', __dirname + '/views');
	app.register("html", ejs);
	app.set('view options', {layout: false});
	app.use(express.static(__dirname + '/public', {maxAge: 3600000 * 24 * 30}));
});
//配置socket.io
var io = sio.listen(app);
//设置session
io.set('authorization', function(handshakeData, callback){
	// 通过客户端的cookie字符串来获取其session数据
	handshakeData.cookie = parseCookie(handshakeData.headers.cookie)
	var connect_sid = handshakeData.cookie['connect.sid'];
	
	if (connect_sid) {
		storeMemory.get(connect_sid, function(error, session){
			if (error) {
				// if we cannot grab a session, turn down the connection
				callback(error.message, false);
			}
			else {
				// save the session data and accept the connection
				handshakeData.session = session;
				callback(null, true);
			}
		});
	}
	else {
		callback('nosession');
	}
});
//URL 处理
routes(app);

//socket监听
io.sockets.on('connection', function (socket){
	var session = socket.handshake.session;//session
	var name = session.name;//用户名称
	var schoolid = session.schoolid;//学校Id
	var usertype = session.usertype;//用户等级
    var userid = session.userid;//用户ID

	usersWS[name] = socket;
	
	var refresh_online = function(){
		var n = [];
		for (var i in usersWS){
			n.push(i);
		}
		io.sockets.emit('online list', n);//所有人广播
		//console.log(n);
	}
	refresh_online();


	//搜索联系人
	socket.on('search Contact', function(searchv_al){
	    mysql_chat.search(searchv_al,socket);
	})
	//保存用户信息
	socket.on('save User',function(_sex,_birthday,_stu_id,_phone,_address,_p_name,_p_phone,_remark){
		mysql_user.save_user(_sex,_birthday,_stu_id,_phone,_address,_p_name,_p_phone,_remark,userid);
		socket.emit('save User');
	})
	//更改用户头像
	socket.on('save avg',function(_src,_user_id){
		console.log('开始更新数据库');
		mysql_edit.edit_avg(_src,_user_id,socket);
	})
	//查询公告版
	socket.on('select Bulletinboard',function(){
		select_Bulletinboard(schoolid);
		//mysql_Bulletinboard.Bull_select(schoolid);
		socket.emit('select Bulletinboard');
	})
	//添加新公告
	socket.on('insert Bulletinboard',function(msg){
		mysql_Bulletinboard.Bull_insert(msg,name,userid,schoolid,usertype);
	//	socket.emit('insert Bulletinboard', name, msg);
	});
	//私人信息
	socket.on('private message',function(to, msg,to_id){
		var target = usersWS[to];
		if (target) {
			target.emit('private message', name, msg ,userid);
		}
		else {
			//不在线处理
			mysql_chat.Offline(userid,name,to,msg,to_id);
			socket.emit('message error', to, msg, to_id);
		}
	});
	
	//退出
	socket.on('exit',function(){
		delete usersWS;
		//session.name=null;
		session = null;

				
		console.log('xxx');
		//socket.emit('exit');
		
	});
	//掉线，断开链接处理
	socket.on('disconnect', function(){
		delete usersWS[name];
		session = null;
		//socket.broadcast.emit('system message', '【'+name + '】无声无息地离开了。。。');
		refresh_online();
	});
	
});

//开始监听
app.listen(config.port);

	