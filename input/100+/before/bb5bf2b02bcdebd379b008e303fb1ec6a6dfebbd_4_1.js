function uiElements() {

    var _playerControls = playerControls();

    var _header = header();

    var _playlistList = playlistList();

    var _songList = songList();

    var _settings = settings();



    //No public methods so no object returned.    

    contentHeader('#CurrentSongDisplay');

    timeDisplay();

    urlInput(); 

    contentButtons();



    //Set currently loaded playlist title.

    var h1 = $('#CurrentSongDisplay').children()[0];

    $(h1).text(Player.getPlaylistTitle());



    var uiElements = {

        //Refereshes the visual state of the UI after the Player broadcasts a message.

        //This keeps the UI synced with the background.

        updateWithMessage: function (message) {

            var playerState = message.playerState;

            switch (playerState) {

                case PlayerStates.ENDED:

                case PlayerStates.VIDCUED:

                case PlayerStates.PAUSED:

                    _playerControls.setToggleMusicToPlay();

                    break;

                case PlayerStates.PLAYING:

                    //Volume only becomes available once a video has become cued or when popup reopens.

                    var volume = Player.getVolume();

                    _playerControls.setVolume(volume);

                    _playerControls.setToggleMusicToPause();

                    break;

            }



            var songs = message.songs;

            _playerControls.setEnableToggleMusicButton(songs.length > 0);

            _playerControls.setEnableSkipButton(songs.length > 1);

            _playerControls.setEnableShuffleButton(songs.length > 1);



            var currentSong = message.currentSong;

            _songList.reload(songs, currentSong);

            _header.updateTitle(currentSong);



            _playlistList.reload();

        }

    }



    return uiElements;

}