var config = require('./Config'),db = config.db,fs=require('fs'),path = require('path');

exports.index = function (req, res, next){
		if (req.session.name && req.session.name !== '') {
			//需要判断下是否已经登录
			res.render('desktop',{
				name:req.session.name,
				avg:req.session.user_avatar
			});

		}else{
			res.redirect('/');
		}
}

exports.desktop = function (req, res, next){
	//获取post过来的用户名和密码
	var username = req.body.username.toString();
  	var password = req.body.password.toString();
	db.query("SET NAMES utf8");
    db.query(
		  'SELECT id,username,usertype,sex,birthday,email,pass_word,user_avatar,user_bg,class,sut_id,schoolid,sut_name,phone,address,p_name,p_phone,remark  FROM user where email="'+ username+'"and pass_word="'+password+'"',
		  function selectCb(err, results, fields) {
		    if (err) {
				//console.log(err);
			 	return next(err);
			}
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
			}else{
				res.end('用户名或者密码错误');
				return;
			}
		 	res.render('desktop', {
					name:results[0].username,
					avg:results[0].user_avatar
			});
		  }
	);
}
