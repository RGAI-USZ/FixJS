function(songId, callback) {

    "use strict";



    var self = this;

    $.getJSON('http://gdata.youtube.com/feeds/api/videos/' + songId + '?v=2&alt=json-in-script&callback=?', function (data) {

        //Generate a unique ID for the song.

        self.id = Helpers.generateGuid();

        //The youtube song ID.

        self.songId = songId;

        //Short URL

        self.url = "http://youtu.be/" + songId;

        self.name = data.entry.title.$t;

        self.totalTime = data.entry.media$group.yt$duration.seconds;

        callback();

    });

}