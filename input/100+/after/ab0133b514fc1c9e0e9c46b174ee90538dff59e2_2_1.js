function() {


    var Op = function() {
        this.initialize();
    };

    var p = Op.prototype;

    p.initialize = function() {
        this.socket = io.connect(window.location.href.substring(0, window.location.href.lastIndexOf('/')));
        this.options = {
            country: "FR"
        };
    };

    p.templates = {
        trackInSearch: _.template('<tr><td><i class="icon-music icon-white"></i></td><td><%= name %></td><td><%= artists %></td><td><%= album%></td><td><button class="btn fnct_plus <%= disabled%>"><i class="icon-plus"></i></button></td></tr>'),

        trackInAlbum: _.template('<tr><td><i class="icon-music icon-white"></i></td><td><%= number %></td><td><%= name %></td><td><%= artists %></td><td><button class="btn fnct_plus <%= disabled%>"><i class="icon-plus"></i></button></td></tr>'),

        album: _.template('<tr><td><i class="icon-book icon-white"></i></td><td><%= name %></td><td><%= year %></td></tr>'),

        currentlyPlaying: _.template('<h5><%= name %></h5><p><%= artists %></p>'),

        trackInQueue: _.template('<tr><td><i class="icon-music icon-white"></i></td><td><%= name %></td><td><%= artists %></td><td><button class="btn fnct_rm"><i class="icon-remove"></i></button></td></tr>')
    };

    p.fetchQueue = function() {
        $.ajax({
            url: "/api/queue",
        }).done(function(data) {
            _.each(data,
            function(t, i) {
                $('#playlist_next').append(OpenSpice.templates.trackInQueue({
                    name: t.name,
                    artists: _.pluck(t.artists, 'name').join(', ')
                }));
            });
        $('.fnct_rm').click(OpenSpice.ask_rm_this).removeClass('fnct_rm');
        });
    };

    p.volumeUP = function() {
        OpenSpice.socket.emit('ask_volume_up', {});
    };

    p.volumeDOWN = function() {
        OpenSpice.socket.emit('ask_volume_down', {});
    };

     p.ask_flush = function(pass) {
        OpenSpice.socket.emit('require_flush', {'pass':pass});
    };

    p.ask_next = function(pass) {
        OpenSpice.socket.emit('require_next', {'pass':pass});
    };

    p.fetchCurrentTrack = function() {
        $.ajax({
            url: "/api/playing",
        }).done(this.displayCurrentTrack);
    };

    p.fetchCountry = function() {
        $.ajax({
            url: "/api/country",
        }).done(_.bind(function(d) {
            this.options.country = d.country;
        },
        this));
    };

    p.displayCurrentTrack = function(t) {
        if (!_.isEmpty(t)) {
            $('#playing').html(OpenSpice.templates.currentlyPlaying({
                name: t.name,
                artists: _.pluck(t.artists, 'name').join(', ')
            }));
        }
    };



    p.updateDisplayedQueue = function(added) {
        if (_.isArray(added)) {
            _.each(added,
            function(track) {
                $('#playlist_next').append(OpenSpice.templates.trackInQueue({
                    name: track.name,
                    artists: _.pluck(track.artists, 'name').join(', ')
                }));
            });
        } else {
            $('#playlist_next').append(OpenSpice.templates.trackInQueue({
                name: added.name,
                artists: _.pluck(added.artists, 'name').join(', ')
            }));
        }
        $('.fnct_rm').click(OpenSpice.ask_rm_this).removeClass('fnct_rm');
    };

    p.ask_rm_this = function(e){
        console.log($(e.target).parents('tr').prevAll('tr').size());
    }

    p.updateRecentQueries = function(newQuery) {
        $('<li class="recentqueryitem">' + newQuery + '</li>').click(function(e) {
            this.performSearch($(e.target).text());
        }).insertAfter('#recent_query');
        $('li.recentqueryitem:gt(5)').remove();
    };




    p.clearSearchArea = function() {
        $('#result').empty();
        $('.pagination').empty();
        $('.controls').empty();
    };

    p.performSearch = function(qq, pagenum) {
        var pagenum = (typeof pagenum == "undefined" ? 1: pagenum);

        this.clearSearchArea();
        $('h3').text(qq);
        $.ajax({
            url: "http://ws.spotify.com/search/1/track.json",
            data: {
                'q': qq,
                'page': pagenum
            },
            dataType: 'json'
        }).done(function(data) {
            $('h3').text(data.info.query);

            var di = data.info;
            $('h3').text(di.query);

            if (di.num_results > di.limit) {
                if (di.page > 1) {
                    $('<li><a href="#"><i class="icon-arrow-left"></i></a></li>')
                    .click(_.bind(OpenSpice.performSearch, this, di.query, di.page - 1))
                    .appendTo('.pagination');
                }
                var maxpages = Math.ceil(di.num_results / di.limit);
                var brokepagination = maxpages > 6;
                var pageid = (brokepagination ? (di.page > 4 ? di.page - 2: 1) : 1);
                if (pageid > 1) {
                    $('<li><a href="#">1</a></li>')
                    .click(_.bind(OpenSpice.performSearch, this, di.query, 1))
                    .appendTo('.pagination');
                    $('<li><a class=".disabled" href="#">...</a></li>').appendTo('.pagination');
                }
                for (var i = 0; (i < 6 && pageid <= maxpages); i++) {
                    $('<li' + (pageid == di.page ? ' class="active"': '') + '><a href="#">' + pageid + '</a></li>')
                    .click(_.bind(OpenSpice.performSearch, this, di.query, pageid))
                    .appendTo('.pagination');
                    pageid++;
                }
                if (pageid < maxpages) {
                    $('<li><a class=".disabled" href="#">...</a></li>').appendTo('.pagination');
                }
                if (pageid <= maxpages) {
                    $('<li><a href="#">' + maxpages + '</a></li>')
                    .click(_.bind(OpenSpice.performSearch, this, di.query, maxpages))
                    .appendTo('.pagination');
                }
                if (di.page < maxpages) {
                    $('<li><a href="#"><i class="icon-arrow-right"></i></a></li>')
                    .click(_.bind(OpenSpice.performSearch, this, di.query, di.page + 1))
                    .appendTo('.pagination');
                }
            }

            $('<tr><td></td><th>Name</th><th>Artist</th><th>Album</th><td></td></tr>').appendTo('#result');
            _.each(data.tracks,
            function(t, i) {
                $(OpenSpice.templates.trackInSearch({
                    name: t.name,
                    artists: _.map(t.artists,
                    function(a) {
                        return '<a href="#" data-spuri="' + a.href + '" class="artist">' + a.name + '</a>';
                    }).join(", "),
                    album: '<a href="#" data-spuri="' + t.album.href + '" class="album">' + t.album.name + '</a>',
                    disabled: !OpenSpice.isAvailable(t.album) ? "disabled": ""
                })).data('trackdata', t).appendTo('#result');
            });
            $('#result button.fnct_plus:not(.disabled)').click(function(e) {
                OpenSpice.socket.emit('add_queue', $(e.target).parents('tr').data('trackdata'));
            });
            $('#result a.album').click(function(e) {
                OpenSpice.showAlbum($(e.target).attr("data-spuri"));
                return false;
            });
            $('#result a.artist').click(function(e) {
                OpenSpice.showArtist($(e.target).attr("data-spuri"));
                return false;
            });

        });
    };

    p.performLookup = function(uri, extras, callback) {
        $.ajax({
            url: "http://ws.spotify.com/lookup/1/.json",
            data: {
                'uri': uri,
                'extras': extras.join(",")
            },
            dataType: 'json'
        }).done(callback);
    };

    p.showAlbum = function(albumURI) {
        OpenSpice.clearSearchArea();
        $('h3').text("Chargement");
        OpenSpice.performLookup(albumURI, ['trackdetail'],
        function(data) {
            $('h3').text(data.album.artist + ' - ' + data.album.name);
            var disabled = !OpenSpice.isAvailable(data.album) ? "disabled": "";
            $('<tr><td></td><th>#</th><th>Name</th><th>Artist</th><td></td></tr>').appendTo('#result');
            _.each(data.album.tracks,
            function(t) {
                $(OpenSpice.templates.trackInAlbum({
                    number: t['track-number'],
                    name: t.name,
                    artists: _.map(t.artists,
                    function(a) {
                        return '<a href="#" data-spuri="' + a.href + '" class="artist">' + a.name + '</a>';
                    }).join(", "),
                    disabled: disabled
                })).data('trackdata', t).appendTo('#result');
            });

            $('<button class="btn btn-success add-all"><i class="icon-plus icon-white"></i>Add everything</button>').appendTo('.controls');

            $('.add-all').click(function(e) {
                OpenSpice.socket.emit('add_queue', _.map($('#result tr+tr'),
                function(row) {
                    return $(row).data('trackdata');
                }));;
            });

            $('#result button.fnct_plus:not(.disabled)').click(function(e) {
                OpenSpice.socket.emit('add_queue', $(e.target).parents('tr').data('trackdata'));
            });

            $('#result a.artist').click(function(e) {
                OpenSpice.showArtist($(e.target).attr("data-spuri"));
                return false;
            });
        });

    };

    p.showArtist = function(artistURI) {
        OpenSpice.clearSearchArea();
        $('h3').text("Chargement");
        OpenSpice.performLookup(artistURI, ['albumdetail'],
        function(data) {
            $('h3').text(data.artist.name);
            _.each(data.artist.albums,
            function(a) {
                var disabled = !OpenSpice.isAvailable(a.album) ? true: false;
                $(OpenSpice.templates.album({
                    name: (disabled ? a.album.name: '<a href="#" class="album">' + a.album.name + '</a>'),
                    year: a.album.released
                })).data('albumdata', a).appendTo('#result');
            });

            $('#result a.album').click(function(e) {
                OpenSpice.showAlbum($(e.target).parents('tr').data("albumdata").album.href);
                return false;
            });
        });
    };

    p.isAvailable = function(albumData) {
        return albumData.availability.territories === "worldwide" ||
        _.include(albumData.availability.territories.split(" "), OpenSpice.options.country);
    };

    p.manageTrackProgression = function(e) {
        if (!_.isEmpty(e)) {
            var elem = $('#playing_box .progress .bar');
            elem.stop(true, true);
            elem.css({
                'width': '0%',
                '-webkit-transition': 'none',
                '-ms-transition': 'none',
                '-moz-transition': 'none',
                '-o-transition': 'none',
                'transition': 'none'
            });
            elem.animate({
                'width': '100%'
            },
            (e.length * 1000));
        }
    }


    return new Op();
}