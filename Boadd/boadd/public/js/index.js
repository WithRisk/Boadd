!function(win, doc, $, io){

	var socket = io.connect('http://192.168.0.108');
	// 显示一条消息
	var showmessage = function(from, msg, type){
		var from = formatHTML(from);
		var msg = formatHTML(msg);
		type = !type ? '' : 'type-' + type;
		form = type==='private'?form+'[私聊]':from;
		var html = '<li style="background-image:none;margin-top:20px;">'+msg+'</li>';


		$('#message_list').append(html).scrollTop(+1000);
	}
	// 显示在线列表
	var showonline = function(n){
		var html = '';
		n.forEach(function(v){
			html += '<li style="background-image:none;z-index:97;position:relative;" onclick="private_message(\'' + v + '\')">' + v + '></li>';
		});
		$('#nicknames').html(html);
	}
	
	// 清空所有消息
	var clearmessage = function(){
		$('#lines .line').remove();
	}
	
	
	
	// 在输入框中@某人
	var private_message = function(n){
		var $m = $('#message');
		var $list = $("#message_name");
		$m.val('@' + n + ' ' + $m.val()).focus();
		var html='';
		html+='<li style="background-image:none;">'+n+'</li>';
		$list.html(html);
	//	$m.focus();
		setCaretPosition('message');
	}
	function setCaretPosition(elemId){
		var elem = document.getElementById(elemId);
		var caretPos = elem.value.length;
		if (elem != null) {
			if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.move('character', caretPos);
				range.select();
			}
			else {
				elem.setSelectionRange(caretPos, caretPos);
				elem.focus();
				//空格键
				var evt = document.createEvent("KeyboardEvent");
				evt.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, 32);
				elem.dispatchEvent(evt);
				// 退格键
				evt = document.createEvent("KeyboardEvent");
				evt.initKeyEvent("keypress", true, true, null, false, false, false, false, 8, 0);
				elem.dispatchEvent(evt);
			}
		}
	}
	
	var _showmessage=function(from, msg){
			var from = formatHTML(from);
			var msg = formatHTML(msg);
			var html = '<li style="background-image:none;margin-top:20px;">'+msg+'</li>';
			
		   $('#message_list').append(html).scrollTop(+1000);
	}
	
	var sendmessage = function(){
		var msg = $.trim($('#message').val());
		if(msg.length===0){
			return;
		}
		// 如果以@开头，则为私人信息
		if (msg.substr(0, 1) == '@') {
			var p = msg.indexOf(' ');
			if (p > 0) {
				// 发送私人消息
				var to = msg.substr(1, p - 1);
				msg = msg.substr(p + 1);
				socket.emit('private message', to, msg, function(ok){
					if (ok) {
						showmessage(userName, msg, 'own');
						$('#message').val('');
					}
				});
				return;
			}
		}
		
		// 发送公共消息
		socket.emit('public message', msg, function(ok){
			if (ok) {
				$('#message').val('');
					showmessage(userName, msg, 'own');
			}
		});
	}
	var listener = function(){
		socket.on('connect', function(){
			$('.room #connecting').fadeOut();
			$('.room #chat').fadeIn();
			clearmessage();
			showmessage('系统', '已进入房间!在发送的消息前面加”@对方名字“+空格+消息可以给某人发送私信。', 'system');
		});
		
		// 接收到公共消息
		socket.on('public message', function(from, msg){
			showmessage(from, msg);
		});
		
		// 接收到私人信息
		socket.on('private message', function(from, msg){
			showmessage(from, msg);
		});
		
		// 接收到系统信息
		socket.on('system message', function(msg){
			showmessage('系统', msg, 'system');
		});
		
		// 刷新在线列表
		socket.on('online list', function(ns){
			showonline(ns);
		});
		
		// 发送消息失败
		socket.on('message error', function(to, msg){
			showmessage('系统', '刚才发送给“' + to + '”的消息“' + msg + '”不成功！', 'error');
		});
	};

	var init = function(){
		listener();
		$('#btn').click(sendmessage());
		$('#message').keypress(function(e){
			if (e.keyCode === 13) {
				alert(1);
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
	win.private_message = private_message;
}(window,document,jQuery,io);