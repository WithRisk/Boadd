var config = require('./Config'),db = config.db,fs = require('fs'),path = require('path');
;

exports.Contacts =  function (req, res, next){
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
}

exports.edit_user =  function (req, res, next){
    if (req.session.name && req.session.name !== '') {
        db.query(
          'SELECT id,username,usertype,sex,birthday,email,user_avatar,user_bg,class,sut_id,schoolid,sut_name,phone,address,p_name,p_phone,remark  FROM user where email="'+ req.session.email+'"',
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
                }

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
        });





	
	
	}else{
		res.redirect('/');
	}
}


exports.upload_img =  function (req, res, next){
    // 获得文件的临时路径
    var tmp_path = req.files.thumbnail.path;

    // 指定文件上传后的目录 - 示例为"images"目录。 
    var target_path ='/Users/chengjiao/Desktop/Boadd/boadd/public/uploads/' + req.files.thumbnail.name;
    
    var show_path = '/uploads/'+ req.files.thumbnail.name;
    console.log(show_path);
    // 移动文件
    fs.rename(tmp_path, target_path, function(err) {
    if (err) throw err;
   //    删除临时文件夹文件, 
    fs.unlink(tmp_path, function() {
       if (err) throw err;
       //完整路径 target_path
       res.render('edit_user',{
                _name:req.session.name, //名字
                _userid:req.session.userid,//设置session中的Id
                _usertype:req.session.usertype,//用户类型
                _sex:req.session.sex,//性别
                _birthday:req.session.birthday,//生日
                _email:req.session.email,//用户邮箱
                _avatar:show_path,//用户头像
                _class:req.session.class,//班级
                _sut_id:req.session.sut_id,//学号 
                _sut_name:req.session.sut_name,//学校名称
                _phone:req.session.phone,//联系电话
                _address:req.session.address,//地址
                _p_name:req.session.p_name,//家长姓名
                _p_phone:req.session.p_phone,//家长电话
                _remark:req.session.remark//备注
             });
    });
    });

}
