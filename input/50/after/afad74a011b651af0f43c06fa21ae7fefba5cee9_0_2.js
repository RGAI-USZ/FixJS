function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="row-fluid"><div class="span3"><div class="well"><div align="center" class="media-grid"><a href="#"><img alt="" src="photo/public/', soy.$$escapeHtml(opt_data.id), '" class="thumbnail"></a></div><div id="notifications"></div><h5>Agenda</h5><ul class="agenda-short-list" id="agendaTask-list"></ul></div></div><div class="span6"><div class="content" id="multimenu"></div></div><div class="span3"><div class="well"><h5>Suggestions</h5><div id="contact-suggestion"></div><br><h5>Meetings</h5><div>Start a new meeting to organize an event</div><br><div id="meetings"><div><button class="btn btn-success" id="doMeeting-but">Create meeting</button></div><br><ul id="meeting-list"></ul><div><button id="allMeetings-but" class="btn btn-info small">All</button></div></div><br><h5>Find friends</h5><div>Send invitations to your friends or search them in other social networks</div><br><div><button class="btn btn-danger">Send invitations</button></div><br><div><button class="btn btn-primary">Search in other networks</button></div><br></div></div>');
  return opt_sb ? '' : output.toString();
}