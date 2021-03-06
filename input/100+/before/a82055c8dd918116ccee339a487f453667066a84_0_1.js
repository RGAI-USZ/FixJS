function(self, Candy, $) {
	/** Object: about
	 * About Game API
	 *
	 * Contains:
	 *   (String) name - Candy Plugin Available Rooms
	 *   (Float) version - andy Plugin Available Rooms version
	 */
	self.about = {
		name: 'Candy Plugin Available Rooms',
		version: '1.0.1'
	};
	
	/** Function: init
	 * Initializes the available-rooms plugin with the default settings.
	 */
	self.init = function(){
		// Add Handler
		 $(Candy.View.Pane).bind('candy:view.message.beforeSend', function(e, args) {
			// (strip colors)
			// if it matches '/list', show rooms and don't send anything
			if (args.message.replace(/\|c:\d+\|/, '').toLowerCase() == '/list') {
				self.showRooms();
				args.message = '';
			}
		});
		$(Candy.View.Pane).bind('candy:view.room.afterAdd', function(e, args) {
			if($('#add-room').length > 0) {
				$('#add-room').parent().remove();
			}
			$('#chat-tabs').children().last().after('<li class="roomtype-add"><a id="add-room" href="javascript:;" class="label" style="padding-right: 10px;">+</a></li>');
			$('#add-room').click(function(e) {
				self.showRooms();
			});
		});
	};
	
	/** Function: showRooms
	 * Show all public rooms
	 */
	self.showRooms = function() {
		Candy.Core.getConnection().muc.listRooms('conference.' + Candy.Core.getConnection().domain, function(roomsData) {
			var rooms = new Array();
			$.each($(roomsData).find('item'), function(item, room) {
				var allreadyIn = false;
				$.each(Candy.Core.getRooms(), function(item, roomSearch) {
					if(roomSearch.getJid() == $(room).attr('jid')) {
						allreadyIn = true;
						return false;
					}
				});
				if(!allreadyIn) {
					rooms.push({
							jid: $(room).attr('jid'),
							name: $(room).attr('name').substr(0, $(room).attr('name').indexOf('(') - 1),
							people: $(room).attr('name').substr($(room).attr('name').indexOf('(') + 1, $(room).attr('name').length - $(room).attr('name').indexOf('(') - 2)
					});
				}
			});
			
			rooms = rooms.sort(function(a, b) {
				if(a.people == b.people) {
					return a.name < b.name ? -1 : 1;
				} else {
					return a.people < b.people ? 1 : -1;
				}
			});
			
			// get the element
			elem = $('#add-room');

			// blur the field
			elem.blur();

			// get the necessary items
			var menu = $('#context-menu'),
				content = $('ul', menu);

			// clear the content if needed
			content.empty();

			// add the matches to the list
			for(var i in rooms) {
				content.append('<li class="available-room-option" data-jid="'+ rooms[i].jid +'">' + rooms[i].name + ' (' + rooms[i].people + ' Personen)</li>');
			}
			
			content.find('li').click(self.joinChanel);
			
			var pos = elem.offset(),
				posLeft = Candy.Util.getPosLeftAccordingToWindowBounds(menu, pos.left + 7),
				posTop = Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);
			
			menu.css({'left': posLeft.px, 'top': '7px', backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
			menu.fadeIn('fast');
		});
	};
	
	/** Function: joinChanel
	 * Show all public rooms
	 * 
	 * Parameters:
	 *   (Event) e
	 */
	self.joinChanel = function(e) {
		$('#context-menu').hide();
		Candy.Core.Action.Jabber.Room.Join($(e.currentTarget).attr('data-jid'));
		e.preventDefault();
	};
	
	return self;
}(CandyShop.GameAPI || {}