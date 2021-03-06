function($) {
	$.sn.im = {
	    opts : {
	        _imCounter : 0,
	        _namesChat : 'sn-im-chatTimer',
	        _inCore : false,
	        _aExpMin : 24,
	        _aExpMax : 64,
	        _imMsgsh : null,
	        _imMsgss : null,

	        lastCheckTime : 0,
	        timersMin : 1,
	        timersMax : 60,
	        curPosit : 0,
	        sound : false,
	        linkNewWindow : false,
	        sendSequence : {
	            alt : false,
	            ctrl : false,
	            shift : false,
	            key : 13
	        },
	        closeSequence : {
	            alt : false,
	            ctrl : false,
	            shift : false,
	            key : 27
	        },
	        url : './socialnet/im.php',
	        rootPath : './socialnet/',
	        isOnline : false,
	        namesMe : 'My username',
	        newMessage : 'New message',
	        youAreOffline : 'You are offline',
	        pageTitle : 'page title',
	        hideButton : false
	    },

	    init : function(options) {
		    if (!$.sn._inited) { return false; }
		    if ($.sn.enableModules.im == undefined || !$.sn.enableModules.im) { return false; }
		    var opts = this.opts;
		    $.sn._settings(opts, options);

		    opts._imCounter = $.sn.getCookie('sn-im-curCheckTime', 1);
		    opts.curPosit = $.sn.getCookie('sn_im_curPosit', 0);
		    opts.pageTitle = $(document).attr('title');
		    opts.soundFile = $('#sn-im-msgArrived a').attr('href');
		    opts.soundFlashVars = $('#sn-im-msgArrived a').attr('title');

		    this._resize();

		    /** Bottom Button Click - NOT ONLINE LIST */
		    $('.sn-im-chatBoxes .sn-im-button').live('click', function() {
			    var self = this;
			    var cBlock = $(this).next('.sn-im-block');
			    var id = $(cBlock).attr('id');

			    $('.sn-im-chatBoxes .sn-im-button.sn-im-opener').each(function() {
				    if (self !== this) {
					    // $.sn.im._cwClose($(this).parents('.sn-im-chatBox'));
				    }
			    });

			    $.sn.im._cwToggle($(this).parents('.sn-im-chatBox'));

			    $(cBlock).find('.sn-im-message').focus();

		    });

		    /** Bottom Button Click - ONLINE LIST */
		    $('.sn-im-online.sn-im-button').live('click', function() {
			    $.sn.im._onlineListLoad();
			    $.sn.im._cwToggle($(this).parents('#sn-im-online'));
		    })

		    /** Title Click on UserName -> go to Profile * */
		    $('.sn-im-block .sn-im-title .sn-userName a').live('click', function() {
			    window.location = this.href;
			    return false;
		    });
		    /** Title Click - CLOSE */
		    $('.sn-im-block .sn-im-title .sn-userName').live('click', function() {
			    $.sn.im._cwClose($(this).parents('.sn-im-chatBox'));
		    });
		    $('.sn-im-online .sn-im-title').live('click', function() {
			    $.sn.im._cwClose($(this).parents('#sn-im-online'));
		    });

		    /** FOCUS ON CHATBOX */
		    $('.sn-im-msgs').live('click', function() {
			    $(this).next('.sn-im-textArea').find('.sn-im-message').focus();
		    });

		    
		    eval('var messages = ' + $.sn.getCookie('sn-im-textmessage', '{}') + ';');
		    if (!$.isEmptyObject(messages)) {
			    $.each(messages, function(idx, msg) {
				    $('#sn-im-chatBoxBlock' + idx).find('.sn-im-message').val(msg).trigger('focus');
			    });
		    }
		    /** TEXTAREA EXPANDER */
		    $('.sn-im-message').live('keyup', function(e) {
			    $.sn.im._messageKey(this, e);
		    }).TextAreaExpander($.sn.im.opts._aExpMin, $.sn.im.opts._aExpMax).bind('DOMSubtreeModified',function(){
		    	if ( $.sn.im.opts._imMsgsh != null){
		    		$(this).parents('.sn-im-textArea').prev('.sn-im-msgs').height($.sn.im.opts._imMsgsh + $.sn.im.opts._imMsgss - $(this).parents('.sn-im-textArea').height());
		    	}
		    });

		    /** LINK IN NEW WINDOW */
		    if (opts.linkNewWindow) {
			    $('.sn-im-msgs .sn-im-msgText a').live('click', function() {
			    	if ($(this).attr('onclick') != undefined){
			    		var expl = $(this).attr('onclick').replace('return false;','').replace(/(^\s+|\s+$)/i, '').split(';');
			    		for( i=0;i<expl.length;i++){
			    			eval(expl[i]+';');
			    		}
			    		return false;
			    	}
				    window.open(this.href);
				    return false;
			    });
		    }

		    /** OPEN CHAT BOX */
		    $('.sn-im-canchat').live('click', function() {
			    var uid = $.sn.getAttr($(this), 'user');

			    /*
				 * $('.sn-im-chatBox').each(function() {
				 * $.sn.im._cwClose($(this)); });
				 */

			    if ($('#sn-im-chatBox' + uid).size() > 0) {
				    $.sn.im._cwOpen($('#sn-im-chatBox' + uid));
			    } else {
				    $.sn.im._cwCreate(uid, $.sn.getAttr($(this), 'username'), true);
			    }
		    });

		    /** DESTROY CHAT BOX */
		    $('.sn-im-close').live('click', function() {
			    var cb = $(this).parents('.sn-im-chatBox');
			    $.sn.im._cwDestroy(cb);
			    return false;
		    });
		    $('.sn-im-cbClose').live('click', function() {
			    $(this).parents('.sn-im-chatBox').find('.sn-im-close').trigger('click');
			    return false;
		    });

		    /** IM LOGIN/LOGOUT */
		    $('.sn-im-loginlogout label').on('click', function() {
			    if ($(this).hasClass('sn-im-selected')) return;

			    var lMode = $.trim($(this).attr('class'));
			    var parent = $(this).parents('.sn-im-loginlogout');
			    parent.find('label').toggleClass('sn-im-selected');

			    $.ajax({
			        type : 'post',
			        cache : false,
			        async : true,
			        url : $.sn.im.opts.url,
			        data : {
				        mode : lMode
			        },
			        success : function(data) {
				        $.sn.im.opts.isOnline = (data.login != undefined && data.login == true);
				        var bgItem = $('#sn-im-onlineCount .label');
				        var bg = bgItem.css('background-image');
				        if ($.sn.im.opts.isOnline) {
					        bg = bg.replace(/offline\.png/i, 'online.png');
					        $.sn.im._startTimers();
				        } else {
					        bg = bg.replace(/online\.png/i, 'offline.png');
					        $('.sn-im-close').each(function() {
						        $.sn.im._cwDestroy($(this).parents('.sn-im-chatBox'));
						        return false;
					        });
					        $('#sn-im').stopTime($.sn.im.opts._namesChat);

				        }
				        bgItem.css('background-image', bg);
				        $.sn.im._onlineListLoad();
			        }
			    });
		    });

		    /** SOUND ON/OFF */
		    $('.sn-im-sound').on('click', function() {
			    var sA = $(this).hasClass('ui-icon-volume-on');
			    $.ajax({
			        type : 'post',
			        cache : false,
			        async : true,
			        url : $.sn.im.opts.url,
			        data : {
				        mode : 'snImSound' + (sA ? 'Off' : 'On')
			        },
			        success : function(data) {
				        if (data == null) return;
				        var $sound = $('.sn-im-sound.ui-icon');
				        $sound.toggleClass('ui-icon-volume-on ui-icon-volume-off');

				        // jQuery.ui.tooltip must exists
				        var descr = $sound.attr('aria-describedby');
				        var $soundT = $('#' + descr + ' .ui-tooltip-content');
				        if ($sound.hasClass('ui-icon-volume-on')) {
					        $sound.attr('title', $sound.attr('title').replace('OFF', 'ON'));
					        $soundT.html($soundT.html().replace('OFF', 'ON'));
				        } else {
					        $sound.attr('title', $sound.attr('title').replace('ON', 'OFF'));
					        $soundT.html($soundT.html().replace('ON', 'OFF'));
				        }
				        $.sn.im.opts.sound = data.sound;
			        }
			    });

		    });

		    /** HIDE/SHOW FRIENDS GROUP */
		    $('.sn-im-hideGroup').live('click', function() {
			    var gid = $.sn.getAttr($(this), 'gid');
			    var hidden = $(this).hasClass('ui-icon-arrowstop-1-n');

			    $.ajax({
			        type : 'post',
			        cache : false,
			        async : true,
			        url : $.sn.im.opts.url,
			        data : {
			            mode : 'snImUserGroup' + (hidden ? 'Show' : 'Hide'),
			            gid : gid
			        },
			        success : function(data) {
				        $('#sub_gid' + gid).toggle();
				        $('#gid_' + gid + ' .sn-im-hideGroup').toggleClass('ui-icon-arrowstop-1-n ui-icon-arrowstop-1-s');
			        }
			    });
		    });

		    /** SHOW SMILIES * */
		    $('.sn-im-smilies').live('click', function() {
			    var $smilieBox = $(this).parents('.sn-im-block').find('.sn-im-smiliesBox');
			    var self = this;

			    if (!$smilieBox.is('[aria-loaded="true"]')) {
				    $.ajax({
				        type : 'post',
				        cache : false,
				        async : true,
				        url : $.sn.im.opts.url,
				        data : {
					        mode : 'snImDisplaySmilies'
				        },
				        success : function(data) {
					        var position = $.extend({}, {
					            of : self,
					            at : 'center top',
					            my : 'center bottom',
					            offset : '0 -5'
					        });
					        $smilieBox.find('.sn-im-smiliesContent').html(data.content);
					        $smilieBox.show().attr('aria-loaded', 'true').position(position);
					        $.sn.dropShadow($smilieBox.find('.sn-im-smiliesContent'), {
					            opacity : 0.7,
					            size : 4
					        });

				        }
				    });
			    } else {
				    $($smilieBox).toggle();
				    return false;
			    }
		    });

		    /** INSERT SMILEY TO MESSAGE * */
		    $('.sn-im-smiley').live('click', function() {
			    $.sn.insertAtCaret($(this).parents('.sn-im-block').find(".sn-im-message"), ' ' + $.sn.getAttr($(this), 'code') + ' ');
			    $(this).parents('.sn-im-smiliesBox').hide();
			    return false;
		    });

		    /** CLOSE SMILEY BOX * */
		    $('.sn-im-title, .sn-im-msgs, .sn-im-textArea').live('click', function() {
			    $(this).parents('.sn-im-block').find('.sn-im-smiliesBox').hide();
		    });

		    /** MESSAGE TIME */
		    $('.sn-im-msg').live('mouseover', function() {
			    $(this).find('.sn-im-msgTime').show();

		    }).live('mouseout', function() {
			    $(this).find('.sn-im-msgTime').hide();
		    });
		    $('.sn-im-msgs').live('mouseout', function() {
			    $(this).find('.sn-im-msgTime').fadeOut(500);
		    });

		    /** Zobraz IM */
		    $('#sn-im').removeAttr('style');
		    this._scrollable();
		    $('.sn-im-nav.sn-im-prev').live('click', function() {
			    $.sn.im._scrollable(1);
		    });
		    $('.sn-im-nav.sn-im-next').live('click', function() {
			    $.sn.im._scrollable(2);
		    });

		    if ($('.sn-im-block .sn-im-msgs:visible').is(':visible')) {
			    var $block = $('.sn-im-block .sn-im-msgs:visible').parents('.sn-im-block');
			    this._cwClose($block);
			    this._cwOpen($block, false);
		    }
		    this._startTimers();
	    },
	    /** INIT END */

	    /** MESSAGE AREA - KEY UP */
	    _messageKey : function(obj, e) {
		    var code = (e.keyCode ? e.keyCode : e.which);

		    if ($.sn.isKey(e, $.sn.im.opts.closeSequence)) {
			    $.sn.im._cwDestroy($(obj).parents('.sn-im-chatBox'));
			    return false;
		    }
		    if ($.sn.isKey(e, $.sn.im.opts.sendSequence)) {
			    var msg = $(obj).val();
			    var getC = $.sn.getCaret(obj) + ($.browser.msie && $.browser.version < 9 ? 1 : 0);
			    if (getC != msg.length) {
				    msg = msg.substring(0, getC - 1) + msg.substring(getC);
			    }
			    msg = msg.replace(/\s*/i, '');
			    if (msg == '') return;

			    var msgs = $(obj).parents('.sn-im-block').find('.sn-im-msgs');
			    $.ajax({
			        type : 'post',
			        cache : false,
			        async : true,
			        url : $.sn.im.opts.url,
			        data : {
			            mode : 'sendMessage',
			            uid : $.sn.getAttr($(obj), 'uid'),
			            pp : $.sn.getAttr($(msgs).find('.sn-im-msg:last'), 'from'),
			            message : msg
			        },
			        success : function(data) {
				        msgs.append(data.message);
				        msgs.scrollTop(99999);
				        $.sn.im._onlineUsersCB(data.onlineUsers);
				        $.sn.im._startTimers(true);
			        }
			    });
			    $(obj).val('').css('height', $.sn.im.opts._aExpMin).parents('.sn-im-block').find('.sn-im-smiliesBox').hide();

		    }

	    },

	    /** CHECK - NEW MESSAGES */
	    _core : function() {
		    if ($.sn.im.opts._inCore) return;
		    $.sn.im.opts._inCore = true;

		    $.ajax({
		        type : 'post',
		        cache : false,
		        async : true,
		        url : $.sn.im.opts.url,
		        data : {
		            mode : 'coreIM',
		            lastCheckTime : $.sn.im.opts.lastCheckTime
		        },
		        success : function(data) {

			        if (data.message != undefined && data.message != null && data.message.length != 0) {
				        // MSG is unread
				        if (data.recd == false) {
					        // Play sound
					        if ($.sn.im.opts.sound) {
						        if ($.browser.msie) {
							        $('#sn-im-msgArrived').html('<object height="1" width="1" type="application/x-shockwave-flash" data="' + $.sn.im.opts.soundFile + '"><param name="movie" value="' + $.sn.im.opts.soundFile + '"><param name="FlashVars" value="' + $.sn.im.opts.soundFlashVars + '"></object>');
						        } else {
							        $('#sn-im-msgArrived').html('<embed src="' + $.sn.im.opts.soundFile + '" width="0" height="0" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" FlashVars="' + $.sn.im.opts.soundFlashVars + '"></embed>');
						        }
					        }
					        // Title Alert
					        $.titleAlert($.sn.im.opts.newMessage, {
					            requireBlur : true,
					            stopOnFocus : true,
					            duration : 0,
					            interval : 1500
					        });
				        }
				        $.each(data.message, function(i, message) {
					        var chatBox = '#sn-im-chatBox' + message.uid;
					        if (message.chatBox == false) {
						        $.sn.im._cwCreate(message.uid, message.userName, false);
						        if ($('#sn-im-chatBoxes .sn-im-chatBox').length > 1) {
							        $.sn.im._cwClose($(chatBox));
						        }
					        } else {
						        var $msgs = $(chatBox).find('.sn-im-msgs');
						        var $lmsg = $msgs.find('.sn-im-msg:last');
						        var from = $.sn.getAttr($lmsg, 'from');
						        if ($msgs.find('.sn-im-msg[class*="' + message.time + '"]').size() == 0) {
							        $msgs.append(message.message);
							        $msgs.scrollTop(99999);
							        if (from == message.uid) {
								        $msgs.find('.sn-im-msg:last').addClass('sn-im-noborderTop');
							        }
						        }
					        }
					        if ($(chatBox + ' .sn-im-block').is(':hidden')) {
						        $.sn.im._unRead($(chatBox), 1);
					        }
				        });
				        $.sn.im._startTimers(true);
			        }
			        $.sn.im.opts.lastCheckTime = data.lastCheckTime;

			        $.sn.im._onlineList(data);
			        $.sn.im._onlineUsersCB(data.onlineUsers);
			        $.sn.im.opts._inCore = false;
		        }
		    });

	    },

	    /** CASOVAC PRO CORE */
	    _startTimers : function(sh) {
		    var tHandler = $('#sn-im');
		    if (!$.sn.allow_load) {
			    tHandler.stopTime($.sn.im.opts._namesChat);
			    return;
		    }
		    if (typeof (sh) != 'undefined' && sh) {
			    $.sn.im.opts._imCounter = $.sn.im.opts.timersMin;
			    tHandler.stopTime($.sn.im.opts._namesChat);
		    } else {
			    $.sn.im.opts._imCounter++;
		    }

		    if ($.sn.im.opts._imCounter >= $.sn.im.opts.timersMax) {
			    $.sn.im.opts._imCounter = $.sn.im.opts.timersMax;
		    }
		    $.sn.setCookie('sn-im-curCheckTime', $.sn.im.opts._imCounter);

		    tHandler.oneTime($.sn.im.opts._imCounter * 1000, $.sn.im.opts._namesChat, function(i) {
			    $.sn.im._core();
			    $.sn.im._startTimers();
		    });
	    },

	    /**
		 * Nacteni online listu
		 * 
		 * @param {Integer}
		 *            i Pocet volani procedury, generovano z pluginu timers
		 */
	    _onlineListLoad : function(i) {
		    if ($.sn.im.opts.isOnline == true) {
			    $.ajax({
			        type : 'post',
			        cache : false,
			        async : true,
			        url : $.sn.im.opts.url,
			        data : {
				        mode : 'onlineUsers'
			        },
			        success : function(data) {
				        $.sn.im._onlineList(data);
				        $.sn.im._onlineUsersCB(data.onlineUsers);
			        }
			    });
		    } else {
			    $('#sn-im-onlineList').html('<div class="sn-im-userLine">' + $.sn.im.opts.youAreOffline + '</div>');
		    }
	    },

	    _onlineList : function(data) {
		    $('#sn-im-onlineCount span.count').html('(' + data.onlineCount + ')');
		    $('#sn-im-onlineList').html(data.onlineList);
		    // $('.sn-im-userLine').textOverflow('...', false);
	    },

	    /**
		 * ONLINE check for chatbox
		 */
	    _onlineUsersCB : function(users) {
		    if (users == undefined) return;
		    $.each($('#sn-im-chatBoxes').children('.sn-im-chatBox'), function(idx, o) {
		    	var st =users[$.sn.getAttr($(o), 'uid')]; 
			    if ( st !== undefined) {
			    	if ( st.status == 0){
			    		$(o).find('.sn-im-status').removeClass('sn-im-away sn-im-online').addClass('sn-im-offline');			    		
			    	} else if ( st.status == 1){
			    		$(o).find('.sn-im-status').removeClass('sn-im-offline sn-im-online').addClass('sn-im-away');			    		
			    		
			    	} else if ( st.status == 2){
					    $(o).find('.sn-im-status').removeClass('sn-im-offline sn-im-away').addClass('sn-im-online');
			    	}
			    } else {
			    	$(o).find('.sn-im-status').removeClass('sn-im-away sn-im-online').addClass('sn-im-offline');
			    }
		    });
	    },

	    _cwOpen : function(obj, focus) {
		    if (typeof focus == 'undefined') {
			    focus = true;
		    }
		    var id = obj.attr('id');
		    var im_button = obj.find('.sn-im-button');
		    im_button.addClass('sn-im-opener');
		    obj.find('.sn-im-block').show();
		    if ( $.sn.im.opts._imMsgsh == null){
		    	$.sn.im.opts._imMsgsh = obj.find('.sn-im-msgs').height();
		    	$.sn.im.opts._imMsgss = obj.find('.sn-im-textArea').height();
		    }
		    if (focus) {
			    obj.find('.sn-im-message').focus();
		    }
		    obj.find('.sn-im-msgs').scrollTop(99999);

		    $.sn.setCookie(id, true);

		    $.sn.im._unRead(obj, 0);
		    $.sn.im._scrollable(obj);
	    },

	    _cwClose : function(obj) {
		    var id = obj.attr('id');
		    var im_button = obj.find('.sn-im-button');
		    im_button.removeClass('sn-im-opener');
		    obj.find('.sn-im-block').hide();

		    $.sn.setCookie(id, false);
		    $.sn.im._unRead(obj, 0);
		    $.sn.im._scrollable();
	    },

	    _cwToggle : function(obj) {
		    if (obj.find('.sn-im-button').hasClass('sn-im-opener')) $.sn.im._cwClose(obj);
		    else $.sn.im._cwOpen(obj);
	    },

	    _cwDestroy : function(obj) {
		    var id = obj.attr('id');
		    var uidTo = $.sn.getAttr(obj, 'uid');
		    $.ajax({
		        type : 'post',
		        cache : false,
		        async : true,
		        url : $.sn.im.opts.url,
		        data : {
		            mode : 'closeChatBox',
		            uid : uidTo
		        }
		    });
		    obj.remove();
		    $.sn.setCookie(id, null);
		    $.sn.setCookie(id + 'Unread', null);
		    $.sn.im._scrollable(10);
	    },

	    _cwCreate : function(uid, userName, bAsync) {
		    if ($.sn.im.opts.isOnline == 0 || $('#sn-im-chatBox' + uid).size() != 0) return;

		    if (bAsync == undefined) bAsync = false;

		    $.ajax({
		        type : 'post',
		        cache : false,
		        url : $.sn.im.opts.url,
		        async : bAsync,
		        data : {
		            mode : 'openChatBox',
		            userTo : uid,
		            usernameTo : userName
		        },
		        success : function(data) {
			        if ($('#sn-im-chatBox' + uid).size() != 0) return;
			        $('#sn-im-chatBoxes').append(data.html);
			        var cb = $('#sn-im-chatBox' + uid);
			        cb.find('.sn-im-message').TextAreaExpander($.sn.im.opts._aExpMin, $.sn.im.opts._aExpMax);
			        $.sn.im._cwOpen(cb);
			        $.sn.im._scrollable(20);
		        }
		    });
	    },

	    _unRead : function(chatBox, c) {
		    if ($.sn.getAttr($(chatBox), 'uid') == false) { return; }

		    var $snImUnread = $(chatBox).find('.sn-im-unRead');
		    var endValue = parseInt(endValue) || 0;
		    if (c == 0) {
			    endValue = 0;
			    $snImUnread.hide();
		    } else {
			    endValue += c;
			    $snImUnread.show();
		    }
		    $snImUnread.html(endValue);
		    $.sn.setCookie('sn-im-chatBox' + $.sn.getAttr($(chatBox), 'uid') + 'Unread', endValue);

	    },

	    /**
		 * Posouvani chat boxiku
		 * 
		 * @param {Integer}
		 *            m operace pro scroll 10 - zavreni chat boxiku 20 -
		 *            vytvoreni chat boxiku 1 - posun vpravo 2 - posun vlevo 0 -
		 *            zaciname
		 */
	    _scrollable : function(m) {
		    if ($('.sn-im-dockWrapper').is('[style]')) { return; }

		    var $nav = $('#sn-im-chatBoxes');
		    var Calc = totalWidth = 0;
		    var dWoffset = $('.sn-im-dockWrapper').offset();
		    var dWright = $('body').width() - dWoffset.left - $('.sn-im-dockWrapper').outerWidth();

		    totalWidth = $('body').width() - ($.sn.rtl ? dWoffset.left : dWright) - parseInt($('#sn-im-online').outerWidth(true)) - parseInt($('.sn-im-nav.sn-im-prev').outerWidth(true));
		    // parseInt($('.sn-im-nav.sn-im-next').outerWidth(true));

		    $nav.css({
			    'width' : totalWidth + 'px'
		    });
		    totalWidth = 0;
		    $nav.children('.sn-im-chatBox').each(function() {
			    $(this).show();
			    totalWidth += $(this).outerWidth(true);
		    })

		    var navWidth = $nav.width();
		    if (navWidth < totalWidth) {
			    switch (m) {
				    case 10:
					    if (this.opts.curPosit === 0) {
						    this.opts.curPosit--;
					    }
					    break;
				    case 20:
					    this.opts.curPosit++;
					    break;
				    case 1:
					    this.opts.curPosit--;
					    break;
				    case 2:
					    this.opts.curPosit++;
					    break;
				    /*
					 * case 0: default: break;
					 */
			    }
			    $.sn.setCookie('sn_im_curPosit', this.opts.curPosit);

			    $nav.children('.sn-im-chatBox:lt(' + this.opts.curPosit + ')').hide();

			    totalWidth = 0;
			    for (i = this.opts.curPosit; i <= $nav.children('.sn-im-chatBox').length; i++) {
				    totalWidth += $nav.children('.sn-im-chatBox:eq(' + i + ')').outerWidth(true);
				    if (totalWidth > navWidth) {
					    $nav.children('.sn-im-chatBox:eq(' + i + ')').hide();
				    }
			    }
			    var bw = 0;
			    if (totalWidth < navWidth) {
				    for (i = this.opts.curPosit - 1; i >= 0; i--) {
					    bw = $nav.children('.sn-im-chatBox:eq(' + i + ')').outerWidth(true);
					    if (totalWidth + bw < navWidth) {
						    $nav.children('.sn-im-chatBox:eq(' + i + ')').show();
						    totalWidth += bw;
						    this.opts.curPosit--;
						    $.sn.setCookie('sn_im_curPosit', this.opts.curPosit);
					    }
				    }
			    }

			    if (typeof m == 'object') {
				    if ($(m).is(':hidden')) {
					    $.sn.im._scrollable(2);
				    }
			    }

			    totalWidth = 0;
			    $nav.children('.sn-im-chatBox:visible').each(function() {
				    totalWidth += $(this).outerWidth(true);
			    });
			    $nav.width(totalWidth);

			    /*
				 * for (i = 0; i < this.opts.maxChatBoxes; i++) {
				 * $nav.children(this.opts.curPosit + i).show(); }
				 * 
				 * 
				 * $nav.children(':lt(' + this.opts.curPosit +
				 * '):visible').hide(); $nav.children(':gt(' +
				 * (this.opts.curPosit + this.opts.maxChatBoxes - 1) +
				 * '):visible').hide();
				 */
		    } else {
			    $nav.removeAttr('style').children('.sn-im-chatBox').show();

		    }

		    if ($nav.children(':first').is(':visible')) {
			    $('.sn-im-prev:visible').hide();
		    } else {
			    $('.sn-im-prev:hidden').show();
		    }

		    if ($nav.children(':last').is(':visible')) {
			    $('.sn-im-next:visible').hide();
		    } else {
			    $('.sn-im-next:hidden').show();
		    }
		    if ($nav.children('.sn-im-chatBox').length === 0) {
			    $('.sn-im-nav').hide();
		    }
	    },

	    /**
		 * Resize bloku, ktere si to zadazi pri zmene okna
		 */
	    _resize : function() {
		    $('#sn-im #sn-im-onlineList').css('max-height', ($(window).height() - 100 > 50 ? $(window).height() - 100 : 50) + 'px');
		    $.sn.im._scrollable();
	    },

	    _documentClick : function(event) {
		    // ZAVRIT ONLINE LIST PRI KLIKNUTI MIMO
		    if ($('#sn-im-onlineCount').hasClass('sn-im-opener')) {
		    	var s_obj = 'sn-im';
			    if (!$(event.target).closest('#' + s_obj).size()) {
				    $('#sn-im-onlineCount').trigger('click');
			    }
		    }

	    },

	    _unload : function() {
		    if ($('.sn-im-message').size() == 0) { return; }
		    var messages = {};

		    $('.sn-im-message').each(function(idx, t) {
			    messages[$.sn.getAttr($(this), 'uid')] = $(this).val();
		    });
		    $.sn.setCookie('sn-im-textmessage', $.sn.serializeJSON(messages));

	    }

	}

}