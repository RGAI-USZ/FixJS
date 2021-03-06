function AgendaDayViewMultipleSources(element, calendar) {
	var t = this;
	
	// exports
	t.render = render;
	t.seperateEventSources = 1;
	
	
	// imports
	AgendaView.call(t, element, calendar, 'agendaDayMultipleSources');
	var opt = t.opt;
	var renderAgenda = t.renderAgenda;
	var formatDate = calendar.formatDate;
	
	
	
	function render(date, delta) {
		if (delta) {
			addDays(date, delta);
			if (!opt('weekends')) {
				skipWeekend(date, delta < 0 ? -1 : 1);
			}
		}
		var start = cloneDate(date, true);
		var end = addDays(cloneDate(start), 1);
		t.title = formatDate(date, opt('titleFormat'));
		t.start = t.visStart = start;
		t.end = t.visEnd = end;
		
		renderAgenda(1);
		
	}
	

}