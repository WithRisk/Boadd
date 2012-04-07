var config = require('./Config'),db = config.db;


exports.Bulletinboard =  function (req, res, next){
	if (req.session.name && req.session.name !== '') {	
		var school_id =	req.session.schoolid;
		db.query("SET NAMES utf8");
	 	db.query(
			  'SELECT a.id, a.username, a.userId, a.messagetype, a.schoolid, a.message, a.message_id, a.img_url, a.video_url, a.created, DATE_FORMAT(a.created,"%Y年%y月%d日 %h:%i") as created  , u.user_avatar  FROM Announcement a,user u   where u.id=a.userId  and a.schoolid="'+school_id+'" order by a.created DESC, a.id DESC limit 150 ',
		function selectCb(err, results, fields) {
			if (err) {
				//console.log('我出错了');
			   	return next(err);
			}	
				res.render('Bulletinboard',{
							name:results,
							_name:req.session.name,
							_avatar:req.session.user_avatar
				});
			
		});
	
	}else{
		res.redirect('/');
	}
}

exports.Bull_view = function (req, res, next){
	var id = req.params.id;
	if (req.session.name && req.session.name !== '') {
		var school_id =	req.session.schoolid;
		  if(id!==null){
			db.query('SELECT a.id, a.username, a.userId, a.messagetype, a.schoolid, a.message, a.message_id, a.img_url, a.video_url, a.created, u.user_avatar  FROM Announcement a,user u  where u.id=a.userId and a.messagetype="'+id+'" and a.schoolid="'+school_id+'" order by created  ',
				function selectCb(err, results, fields){
						if (err) {
							//console.log('我出错了');
						    throw err;
						}
						res.render('Bulletinboard',{
							name:results,
							_name:req.session.name,
							_avatar:req.session.user_avatar
						});
						}
						
			);
			
			}
		
	}else{
				res.redirect('/');
	}
	
}


exports.Bull_insert = function (req, res, next){
	//msg,name,userid,schoolid,usertype
	var msg =  req.body.message;
	var name = req.session.name;
	var userid = req.session.userid;
	var schoolid = req.session.schoolid;
	var usertype = req.session.usertype;
	console.log(name);
	db.query("SET NAMES utf8");
	db.query(
	  'INSERT INTO Announcement SET username = ?, userId = ?, messagetype = ?, schoolid = ?,message = ?, message_id = ?, created = now()',[''+name+'',''+userid+'',''+usertype+'',''+schoolid+'',''+msg+'',''], function(err, info) {
	  	if (err) {
				  //console.log('我出错了');
			     return next(err);
		}
 		res.redirect('/Bulletinboard');
	}
	);
}
exports.insert_bull_re = function (req, res, next){
	var message_id = req.body.re_id;
	var msg =  req.body.re_message;
	console.log(message_id);
	console.log(msg);
	var name = req.session.name;
	var userid = req.session.userid;
	var schoolid = req.session.schoolid;
	var usertype = req.session.usertype;
	console.log(name);
	db.query("SET NAMES utf8");
	db.query(
	  'INSERT INTO Announcement SET username = ?, userId = ?, messagetype = ?, schoolid = ?,message = ?, message_id = ?, created = now()',[''+name+'',''+userid+'',''+usertype+'',''+schoolid+'',''+msg+'',''+message_id+''], function(err, info) {
	  	if (err) {
				  //console.log('我出错了');
			     return next(err);
		}
	}
	);


}
exports.Bull_select = function(schoolid){
		db.query("SET NAMES utf8");
		db.query(
			'SELECT id,username,userId,messagetype,schoolid,message,message_id,img_url,video_url,created  FROM Announcement where messagetype="0" and schoolid="'+schoolid+'"',
		function selectCb(err, results, fields) {
			  if (err) {
				  //console.log('我出错了');
			     return next(err);
			  }
			  if(results.length!==0){
			  var message_1=results[0].message;//设置session中的Id
			  }else{
				res.redirect('/');
				return;
			  } 
		});		
}