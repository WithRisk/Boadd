//========================变量定义===============================
/**
 * modules引入
 */


var express = require('express'),
	Client=require('mysql'),
	sio = require('socket.io'),
	fs=require('fs'),
	path = require('path')
	url = require('url'),
	parseCookie = require('connect').utils.parseCookie,
	MemoryStore = require('connect/lib/middleware/session/memory');

/**
 * 私人聊天使用session
 */
var usersWS = {}, //私人聊天用的websocket
	storeMemory = new MemoryStore({
		reapInterval: 60000 * 10
	});//session store
//=========================app配置=============================	
/**
 * app配置
 */
var app = module.export = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'boadd',
		store:storeMemory 
	}));
	app.use(express.methodOverride());
	app.use(app.router);//要放在bodyParser之后，处理post
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
});
//=================配置socket.io=========================
/**
 * 配置socket.io
 * 
 */	
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
//=========================URL=============================
/**
 * url处理开始鸟~
 * @param {Object} req
 * @param {Object} res
 */
app.get('/',function(req,res){
	if( req.session.name && req.session.name!==''){
		//需要判断下是否已经登录
		res.redirect('/desktop');
	}else{
		//读取登录页面，要求登录
		var realpath = __dirname + '/views/' + url.parse('index_login.html').pathname;
		var txt = fs.readFileSync(realpath);
		res.end(txt);
	
	}
});
app.get('/Contacts',function(req,res){
    if (req.session.name && req.session.name !== '') {
		//需要判断下是否已经登录
            res.render('Contacts',{
                _name:req.session.name, //名字
                _userid:req.session.userid,//设置session中的Id
                _usertype:req.session.usertype,//用户类型
                _sex:req.session.sex,//性别
                _birthday:req.session.birthday,//生日
                _email:req.session.email,//用户邮箱
                _avatar:req.session.user_avatar,//用户头像
                _class:req.session.class,//班级
                _sut_id:req.session.sut_id,//学号 
                _sut_name:req.session.sut_name,//学校名称
                _phone:req.session.phone,//联系电话
                _address:req.session.address,//地址
                _p_name:req.session.p_name,//家长姓名
                _p_phone:req.session.p_phone,//家长电话
                _remark:req.session.remark//备注
             });
	
	}else{
		res.redirect('/');
	}
})
app.get('/Bulletinboard',function(req,res){
	if (req.session.name && req.session.name !== '') {
		//需要判断下是否已经登录
	
		var client = Client.createClient({
			  user: 'root',
			  password: '',
		});
		client.query("SET NAMES utf8");
		var Boadd_DATABASE='boadd';
		var Boadd_Table='Announcement';



		client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
			  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
			    throw err;
			  }
		});

		client.query('USE '+Boadd_DATABASE); 


	 	client.query(
			  'SELECT id,username,userId,messagetype,schoolid,message,message_id,img_url,video_url,created  FROM '+Boadd_Table+' where messagetype="0" and schoolid="'+req.session.schoolid+'"',
		function selectCb(err, results, fields) {
			if (err) {
				//console.log('我出错了');
			    throw err;
			}
			if(results.length!==0){
				
				var list = JSON.stringify(results); 
				html='';
				for(i=0;i<results.length;i++){
                                   html+='<dl><dt class="face"><img src="http://tp3.sinaimg.cn/2150636602/50/5601859611/0"></dt><dd class="content"><p class="feed_list_content" ><span class="s_nam">'+results[i].username+'</span><em>'+results[i].message+'</em></p><p style="margin-top:40px;"><span>'+results[i].created.toLocaleString()+'</span><span class="rel">回复(10)</span></p></dd></dl>';
				}
			
				res.render('Bulletinboard',{name:html});
			}
		});
		client.end();
	
	}else{
		res.redirect('/');
	}
});
app.get('/Bulletinboard/:id',function(req,res){
    var id = req.params.id;
    
    console.log(id);
    if (req.session.name && req.session.name !== '') {
		//需要判断下是否已经登录
               if(id!==null){
		var client = Client.createClient({
			  user: 'root',
			  password: '',
		});
		client.query("SET NAMES utf8");
		var Boadd_DATABASE='boadd';
		var Boadd_Table='Announcement';



		client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
			  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
			    throw err;
			  }
		});

		client.query('USE '+Boadd_DATABASE); 


	 	client.query(
			  'SELECT id,username,userId,messagetype,schoolid,message,message_id,img_url,video_url,created  FROM '+Boadd_Table+' where messagetype="'+id+'" and schoolid="'+req.session.schoolid+'"',
		function selectCb(err, results, fields) {
			if (err) {
				//console.log('我出错了');
			    throw err;
			}
			if(results.length!==0){
				
				var list = JSON.stringify(results); 
				html='';
				for(i=0;i<results.length;i++){
                                console.log(results[i].created.toTimeString());
                                   html+='<dl><dt class="face"><img src="http://tp3.sinaimg.cn/2150636602/50/5601859611/0"></dt><dd class="content"><p class="feed_list_content" ><span class="s_nam">'+results[i].username+'</span><em>'+results[i].message+'</em></p><p style="margin-top:40px;"><span>'+results[i].created.toLocaleString()+'</span><span class="rel">回复(10)</span></p></dd></dl>';
				}
			
				res.render('Bulletinboard',{name:html});
			}
		});
		client.end();
                }
	
	}else{
		res.redirect('/');
	}
})
app.post('/Bulletinboard',function(req,res){
	 var userName =req.session.name;//当前用户
	 var Message=req.body.Message.toString();//信息
	 var Message=req.body.MessageId.toString();//信息Id
	
});
app.get('/desktop',function(req,res){
	if (req.session.name && req.session.name !== '') {
		//需要判断下是否已经登录
		res.render('desktop',{name:req.session.name});
	
	}else{
		res.redirect('/');
	}
});
app.post('/desktop',function(req,res){
	//获取post过来的用户名和密码
	var username = req.body.username.toString();
  	var password = req.body.password.toString();
	
		var client = Client.createClient({
		  user: 'root',
		  password: '',
		});
	

		var Boadd_DATABASE='boadd';
		var Boadd_Table='user';

		client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
		  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
		    throw err;
		  }
		});
		client.query('USE '+Boadd_DATABASE);  
		
		client.query(
		  'SELECT id,username,usertype,sex,birthday,email,pass_word,user_avatar,user_bg,class,sut_id,schoolid,sut_name,phone,address,p_name,p_phone,remark  FROM '+Boadd_Table+' where email="'+ username+'"and pass_word="'+password+'"',
		  function selectCb(err, results, fields) {
		    if (err) {
			  //console.log('我出错了');
		      throw err;
		    }

		    //console.log(results.length+'你阿妈');
			//记录
			//backtype=results.length;
			//console.log(backtype+'你阿妈');
			client.end();
		    //判断如果计数器不等于0，那么代表有用户，不然就是用户名或密码错误
			if(results.length!==0){
				req.session.userid = results[0].id;//设置session中的Id
				req.session.name = results[0].username;//设置session
                                req.session.usertype = results[0].usertype//用户类型
                                req.session.sex = results[0].sex;//性别
                                req.session.birthday  = results[0].birthday;//生日
                                req.session.email = results[0].email;//用户邮箱
                                req.session.user_avatar = results[0].user_avatar;//用户头像
                                req.session.user_bg = results[0].user_bg;//用户背景
                                req.session.class = results[0].class;//班级
                                req.session.sut_id = results[0].sut_id;//学号 
				req.session.schoolid = results[0].schoolid;//设置学校Id
                                req.session.sut_name = results[0].sut_name;//学校名称
                                req.session.phone = results[0].phone;//联系电话
                                req.session.address = results[0].address//地址
                                req.session.p_name = results[0].p_name;//家长姓名
                                req.session.p_phone = results[0].p_phone;//家长电话
                                req.session.remark = results[0].remark//备注
                                
				res.render('desktop',{name:results[0].username});
                                

			}else{
				res.end('用户名或者密码错误');
				return;
			}
		   // console.log(fields);
		  }
		);

	
	
	//mysql 查询 返回json数据

//		if(username && username!==''){
//				req.session.name = username;//设置session
//				res.render('chat',{name:username});
//		}else{
//				res.end('nickname cannot null');
//		}
	
});
/*
//其他内容监听，在router.json里面配置，例如help等页面
var routes=JSON.parse(fs.readFileSync('router.json','utf8'));
for(var r in routes){
	app.get(r,function(tmp){
		return function(req,res){
			var template = tmp.template,
				data = tmp.data,
				render = tmp.render;
			var realpath = __dirname + '/views/' + url.parse(template).pathname;
			if(path.existsSync(realpath)){
				var txt = fs.readFileSync(realpath);
			}else{
				
				res.end('404'+realpath);
				return;
			}
			
			if(render){
				res.render(txt,data);
			}else{
				res.end(txt);
			}
		}
	}(routes[r]));
}
*/
//===================socket链接监听=================
/**
 * 开始socket链接监听
 * @param {Object} socket
 */
io.sockets.on('connection', function (socket){
	var session = socket.handshake.session;//session
	var name = session.name;//用户名称
	var schoolid = session.schoolid;//学校Id
	var usertype = session.usertype;//用户等级
    var userid = session.userid;//用户ID
        
        console.log(userid);

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
	//广播
//	socket.broadcast.emit('system message', '【'+name + '】回来了，大家赶紧去找TA聊聊~~');
	//公共信息
//	socket.on('public message',function(msg, fn){
//		socket.broadcast.emit('public message', name, msg);
//		fn(true);
//		console.log('我草尼玛');
		
//	});
	//保存用户信息
	socket.on('save User',function(_sex,_birthday,_stu_id,_phone,_email,_address,_p_name,_p_phone,_remark){
		save_user(_sex,_birthday,_stu_id,_phone,_email,_address,_p_name,_p_phone,_remark,userid);
		socket.emit('save User');
	})
		
	
	//查询公告版
	socket.on('select Bulletinboard',function(){
		//select_Bulletinboard(schoolid);
		socket.emit('select Bulletinboard');
	})
	//插入数据库指令
	socket.on('insert Bulletinboard',function(msg){
		insert_Bulletinboard(msg,name,userid,schoolid,usertype);
		socket.emit('insert Bulletinboard', name, msg);
	});
	//私人信息
	socket.on('private message',function(to, msg, fn){
		var target = usersWS[to];
		if (target) {
			fn(true);
			target.emit('private message', name, msg);
		}
		else {
			fn(false)
			socket.emit('message error', to, msg);
		}
	});
	
	//退出
	socket.on('exit',function(){
		delete usersWS[name];
		session.name=null;
		session = null;
		console.log('session去死');
		socket.emit('exit');
	});
	//掉线，断开链接处理
	socket.on('disconnect', function(){
		delete usersWS[name];
		session = null;
		//socket.broadcast.emit('system message', '【'+name + '】无声无息地离开了。。。');
		refresh_online();
	});
	
});
//===========插入功能~==========
function insert_Bulletinboard(msg,user,userid,schoolid,usertype){
	var client = Client.createClient({
		  user: 'root',
		  password: '',
	});
	client.query("SET NAMES utf8");
	var Boadd_DATABASE='boadd';
	var Boadd_Table='Announcement';
	
	

	client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
		  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
		    throw err;
		  }
	});
	
	client.query('USE '+Boadd_DATABASE); 
	
	
 	client.query(
	  'INSERT INTO '+Boadd_Table+' '+'SET username = ?, userId = ?, messagetype = ?, schoolid = ?,message = ?, message_id = ?',[''+user+'',''+userid+'',''+usertype+'',''+schoolid+'',''+msg+'','']
	);
	client.end();
	
};
//==============更新功能================
function save_user(_sex,_birthday,_stu_id,_phone,_email,_address,_p_name,_p_phone,_remark,userid){
	var client = Client.createClient = function(){
		 var config = require('./mysql_Config');
	};
	client.query("SET NAMES utf8");
	var Boadd_DATABASE='boadd';
	var Boadd_Table='user';
	
	

	client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
		  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
		    throw err;
		  }
	});
	
	client.query('USE '+Boadd_DATABASE); 
	client.query('UPDATE user SET sex = ?, birthday = ?, sut_id = ?, phone = ?, email = ?, address = ?, p_name = ?, p_phone = ?, remark = ?  where id ='+userid+' ',[''+_sex+'', ''+_birthday+'', ''+_stu_id+'', ''+_phone+'', ''+_email+'', ''+_address+'', ''+_p_name+'', ''+_p_phone+'', ''+_remark+''], function(err, info) {
	  
	  console.log(err);
	});
	client.end();
}
//=============查询功能===============
function select_Bulletinboard(schoolid){
	var client = Client.createClient({
		  user: 'root',
		  password: '',
	});
	client.query("SET NAMES utf8");
	var Boadd_DATABASE='boadd';
	var Boadd_Table='Announcement';
	
	

	client.query('CREATE DATABASE '+Boadd_DATABASE, function(err) {
		  if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
		    throw err;
		  }
	});
	
	client.query('USE '+Boadd_DATABASE); 
	
	
 	client.query(
		  'SELECT id,username,userId,messagetype,schoolid,message,message_id,img_url,video_url,created  FROM '+Boadd_Table+' where messagetype="0" and schoolid="'+schoolid+'"',
	function selectCb(err, results, fields) {
		  if (err) {
			  //console.log('我出错了');
		      throw err;
		}
	});
	client.end();
		if(results.length!==0){
		var message_1=results[0].message;//设置session中的Id
		console.log(message_1);
		console.log(results.length);
		}else{
			res.end('用户名或者密码错误');
			return;
		}
}
//===============javascript日期格式化==============

//===========app listen 开始鸟~==========
app.listen(8080, function(){
	var addr = app.address();
	console.log('app listening on http://127.0.0.1：' + addr.port);
});
	