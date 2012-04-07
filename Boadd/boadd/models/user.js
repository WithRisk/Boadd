var config = require('./Config'),db = config.db;

exports.save_user = function (_sex,_birthday,_stu_id,_phone,_address,_p_name,_p_phone,_remark,userid){
	db.query("SET NAMES utf8");
	db.query('UPDATE user SET sex = ?, birthday = ?, sut_id = ?, phone = ?,  address = ?, p_name = ?, p_phone = ?, remark = ?  where id ='+userid+' ',[''+_sex+'', ''+_birthday+'', ''+_stu_id+'', ''+_phone+'', ''+_address+'', ''+_p_name+'', ''+_p_phone+'', ''+_remark+''], function(err, info) {
		console.log(info.affectedRows);
	 	if(err) return next(err);
	});
	
};


exports.exit = function(){
	console.log('123');
};
exports.signout = function(req, res, next){
		console.log('我要退出');
	req.session.destroy();
	res.clearCookie();
	res.redirect(req.headers.referer || '/');
};


exports.edit_userbg = function(req, res, next){
	if (req.session.name && req.session.name !== '') {
		res.render('edit_userbg',{userid:req.session.userid});
	}
	
};
