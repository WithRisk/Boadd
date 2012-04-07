var config = require('./Config'),db = config.db;


exports.index = function(req, res, next){
	if (req.session.name && req.session.name !== '') {	
		db.query("SET NAMES utf8");
	 	db.query(
			  'SELECT id, title, pad_url, pc_url, remark, ted_type,created FROM ted  LIMIT 20',
		function selectCb(err, results, fields) {
			if (err) {
				//console.log('我出错了');
			   	return next(err);
			}	
			   // console.log(results);
				res.render('ted',{ted:results});
			
		});
	
	}else{
		res.redirect('/');
	}
};


