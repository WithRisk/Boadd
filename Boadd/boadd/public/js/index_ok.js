!
function(win, doc, $, io) {

	var socket = io.connect('http://192.168.0.108');
	// 显示一条消息
	var showmessage = function(from, msg, type) {
			var from = formatHTML(from);
			var msg = formatHTML(msg);
			type = !type ? '' : 'type-' + type;
			form = type === 'private' ? form : from;
			var html = '';

			//往发送人那里发送一个信息
			console.log(from);
			console.log(userName);
			console.log(form);

			if (form === userName) {
				html += '<dl><div class="chatline"><div class="comment-content chat_left">' + msg + '</div></div></dl>';
			} else {
				//IM 未完成的重点 这里收到的信息肯定是不一样的
				html += '<dl><div class="chatline"><div class="comment-content">' + msg + '</div></div></dl>';
			}

			$('#show_message').append(html).scrollTop(+1000);
		}
		// 显示在线列表
	var showonline = function(n) {
			var html = '';
			n.forEach(function(v) {
				//非当前用户才可以添加
				//	if(v!==userName){
				html += '<li style="background-image:none;" onclick="private_message(\'' + v + '\')">' + v + '</li>';
				//	}
			});
			$('#nicknames').html(html);
		}

		// 清空所有消息
	var clearmessage = function() {
			$('#lines .line').remove();
		}


		// 在输入框中@某人
	var private_message = function(n) {
			var $m = $('#message');
			var $list = $("#message_name"); //聊天人列表
			var $hidden_name = $("#private_name"); //聊天人对象
			var $show_message = $("#show_message"); //聊天窗口
			var name = 'pri_' + n
			var length = '';

			$hidden_name.val(n);
			//$m.val('@' + n + ' ' + $m.val()).focus();
			var html = ''; //聊天人列表代码
			var name_list = ''; //聊天窗口
			length = document.getElementById(name);
			if (length === null) { //如果聊天人没有被创建列表 那么创建 否则就是切换窗口
				$m.focus();
				html += '<dl><dd id="pri_' + n + '" style="background-image:none;" onclick="private_message(\'' + n + '\')">' + n + '</dd></dl>';
				name_list += '<dl id="list_' + n + '"></dl>';
				$show_message.append(name_list);
				$list.append(html);
			} else {
				//切换到窗口改变接受人
			}

			setCaretPosition('message');
		}

	function setCaretPosition(elemId) {
		var elem = document.getElementById(elemId);
		var caretPos = elem.value.length;
		if (elem != null) {
			if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.move('character', caretPos);
				range.select();
			} else {
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

	var sendmessage = function() {
			var msg = $.trim($('#message').val());
			if (msg.length === 0) {
				return;
			}
			var to = $("#private_name").val();
			socket.emit('private message', to, msg, function(ok) {
				if (ok) {
					showmessage(userName, msg, 'own');
					$('#message').val('');
				}
			});

			// 如果以@开头，则为私人信息
			//		if (msg.substr(0, 1) == '@') {
			//			var p = msg.indexOf(' ');
			//			if (p > 0) {
			// 发送私人消息
			//				var to = msg.substr(1, p - 1);
			//				msg = msg.substr(p + 1);
			//var to=$("#private_name").val();
			//				socket.emit('private message', to, msg, function(ok){
			//					if (ok) {
			//						console.log('我擦擦擦才');
			//						showmessage(userName, msg, 'own');
			//						$('#message').val('');
			//					}
			//				});
			//			return;
			//		}
			//		}
			// 发送公共消息
			//		socket.emit('public message', msg, function(ok){
			//			if (ok) {
			//				$('#message').val('');
			//				showmessage(userName, msg, 'own');
			//			}
			//		});
		}
	var listener = function() {
			socket.on('connect', function() {
				$('.room #connecting').fadeOut();
				$('.room #chat').fadeIn();
				clearmessage();
				//showmessage('系统', '已进入房间!在发送的消息前面加”@对方名字“+空格+消息可以给某人发送私信。', 'system');
			});

			// 接收到公共消息
			//		socket.on('public message', function(from, msg){
			//			showmessage(from, msg);
			//		});
			// 接收到私人信息
			socket.on('private message', function(from, msg) {
				showmessage(from, msg, 'private');
			});

			// 接收到系统信息
			//		socket.on('system message', function(msg){
			//			showmessage('系统', msg, 'system');
			//		});
			// 刷新在线列表
			socket.on('online list', function(ns) {
				showonline(ns);
			});

			socket.on('exit', function() {
				document.cookie = "";
				window.location.reload();
			});

			// 发送消息失败
			socket.on('message error', function(to, msg) {
				showmessage('系统', '刚才发送给“' + to + '”的消息“' + msg + '”不成功！', 'error');
			});
		};

	var init = function() {
			listener();
			$('#btn').click(sendmessage);
			$('#message').keypress(function(e) {
				if (e.keyCode === 13) {

					sendmessage();
					return false;
				}
			});

		};
	// 格式化消息 

	function formatHTML(html) {
		html = html.replace(/</g, '&lt;');
		html = html.replace(/>/g, '&gt;');
		return html;
	}

	init();
	win.private_message = private_message;
}(window, document, jQuery, io);
