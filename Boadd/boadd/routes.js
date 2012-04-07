fs=require('fs'),
path = require('path'),
url = require('url'),
config = require('./models/Config'),
index = require('./models/Index'),
Contacts = require('./models/Contacts'),
Bulletinboard = require('./models/Bulletinboard'),
webIM = require('./models/webIM'),
user = require('./models/user');
ted = require('./models/ted');


exports = module.exports = function(app) {
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

app.get('/desktop',index.index);

app.post('/desktop',index.desktop);

app.get('/Contacts',Contacts.Contacts);

app.get('/Bulletinboard',Bulletinboard.Bulletinboard);

app.get('/Bulletinboard/:id',Bulletinboard.Bull_view);

app.get('/index_chat',webIM.index);

app.get('/edit_user',Contacts.edit_user);

app.get('/edit_userbg',user.edit_userbg);

app.post('/file-upload',Contacts.upload_img);

app.post('/insert_bull',Bulletinboard.Bull_insert)

app.post('/insert_bull_re',Bulletinboard.insert_bull_re);

app.get('/signout',user.signout);

app.get('/ted',ted.index);



}