!function(win, doc, $, io){

	var socket = io.connect('http://192.168.0.108');

	var sendmessage = function(){
		console.log(1234);
		var msg = $.trim($('#message_gg').val());
		var msg_=$('#message_gg').val();
		if(msg.length===0){
			return;
		}
		// 发送插入消息
		socket.emit('insert Bulletinboard', msg, function(ok){
		//插入了,你懂的
		});
	}
	var listener = function(){		
		socket.on('insert Bulletinboard',function(){
			alert("插入成功");
			console.log("插入成功");
		})
		// 接收到私人信息
		socket.on('private message', function(from, msg){
			showmessage(from, msg);
		});
		// 发送消息失败
		socket.on('message error', function(to, msg){
			showmessage('系统', '刚才发送给“' + to + '”的消息“' + msg + '”不成功！', 'error');
		});
	};

	var init = function(){
		listener();
		$('#send').bind('click',sendmessage);
		$('#message_gg').keypress(function(e){
		if (e.keyCode === 13) {
			sendmessage();
			return false;
		}
		});
		
	};
	// 格式化消息 
	function formatHTML(html){
		html = html.replace(/</g, '&lt;');
		html = html.replace(/>/g, '&gt;');
		return html;
	}
	init();
	//win.private_message = private_message;
}(window,document,jQuery,io);