var config = require('./Config'),db = config.db;

exports.index =  function (req, res, next){
    if (req.session.name && req.session.name !== '') {
		//登陆过后要把所有联系人都查找出来
		var _schoolid = req.session.schoolid;//学校ID
		var _class = req.session.class;//班级
		var _usertype = req.session.usertype;//用户类型
		var _userId = req.session.userid;//用户Id
		//查询所有的联系人
		db.query('SELECT id,username,user_avatar,schoolid,class,usertype FROM user where  schoolid="'+ _schoolid+'" ', function(err, rows) {
	        if(err) return next(err);
			var _infos,_offline_message,_offline_name;
			_infos = rows;
			db.query('SELECT u.user_avatar,o.sender_id,o.sender_name,o.recipient_id,o.recipient_name,o.message,o.type, o.created, DATE_FORMAT(o.created,"%h:%i:%s") as created  from offline_message o,user u  where  u.id=o.sender_id  and o.type=0 and o.recipient_id="'+_userId+'" ', function(err ,rows){
	    	if(err) return next(err);
	    	 _offline_message = rows;
	    	db.query('SELECT u.user_avatar,o.sender_id,o.sender_name,o.recipient_id,o.recipient_name,o.message,type,o.created, DATE_FORMAT(o.created,"%h:%i:%s") as created from offline_message o,user u where u.id=o.sender_id and o.type=0  and o.recipient_id="'+_userId+'" group by o.sender_id ', function(err ,rows) {
	    	if(err) return next(err);
	    	_offline_name = rows;

	    	res.render('index_chat',{
			infos: _infos,
			userName: req.session.name,
			offline_message: _offline_message,
			offline_name:  _offline_name,
			});	
	    });
	   	});
	    });
		db.query('UPDATE offline_message SET  type = ?  where recipient_id ='+_userId+' ',['1'], function(err, info) {
                if(err) return next(err);
                
        });
	}else{
		res.redirect('/');
	}
}
//离线消息处理
exports.Offline = function (userid,name,to,msg,to_id){
	var sender_id = userid;//当前用户Id
	var sender_name = name;//当前用户名称
	db.query("SET NAMES utf8");
	db.query(
	  'INSERT INTO offline_message SET sender_id = ?, sender_name = ?, recipient_id = ?, recipient_name = ?,message = ?, type = ?,created = now() ',[''+sender_id+'',''+sender_name+'',''+to_id+'',''+to+'',''+msg+'','0'],function(err, info) {
		 	if(err) return next(err);
	});
}
//搜索联系人
exports.search = function (sea_val,socket){
	db.query("SET NAMES utf8");
	db.query('SELECT id,username,usertype,sex,birthday,email,user_avatar,user_bg,class,sut_id,schoolid,sut_name,phone,address,p_name,p_phone,remark  FROM user where username  like "%'+sea_val+'%"',
		function selectCb(err, results, fields) {
		if (err) {
				//console.log(err);
			return next(err);
		}	
		if(results.length!==0){
			socket.emit('search Contact',results);
		}else{
			socket.emit('search Contact',0);
		}
});







}