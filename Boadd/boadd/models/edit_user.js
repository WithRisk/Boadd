var config = require('./Config'),db = config.db;
exports.edit_user =  function (req, res, next){
    if (req.session.name && req.session.name !== '') {
		//需要判断下是否已经登录
            res.render('edit_user',{
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
}

exports.edit_avg = function (_src,_user_id,socket){
        console.log('牛逼啊，开始保存了');
        
         //需要判断下是否已经登录
     
        db.query("SET NAMES utf8");
        db.query('UPDATE user SET  user_avatar = ?  where id ='+_user_id+' ',[''+_src+''], function(err, info) {
                console.log(info.affectedRows);
                if(err) return next(err);
                if(info.affectedRows!==0){
                  socket.emit('save avg',_src);
                }else{
                  socket.emit('save avg','error');     
                }
        });
      
};