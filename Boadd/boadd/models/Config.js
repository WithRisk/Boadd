exports.port = 8080;
exports.site_name= '博+教育系统';

var database_options = {
	host: 'localhost',
	port: 3306,
	user:'root',
	password:'',
	database:'boadd'
}
var mysql = new require('mysql'),db = null;
if(mysql.createClient){
	db = mysql.createClient(database_options);
}else{
	db = new mysql.Client(database_options);
	db.connect(function(err){
		if(err){
			console.error('connect db ' + db.host + ' error: ' + err);
		    process.exit();
		}
	});
}
exports.db = db;