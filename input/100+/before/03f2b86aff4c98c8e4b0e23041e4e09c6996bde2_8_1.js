function progressbar(currentTime, totalTime, timeDisplay) {

    var _selector = $('#progress');



    //Repaints the progress bar's filled-in amount based on the % of time elapsed for current song.

    var _repaint = function(){

        var elapsedTime = _selector.val();

        var totalTime = _selector.prop('max');



        //Don't divide by 0.

        var fill = totalTime != 0 ? elapsedTime / totalTime : 0;

        var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop('+ fill +',#ccc), color-stop('+ fill+',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';

        _selector.css('background-image', backgroundImage)

    }



    //If a song is currently playing when the GUI opens then initialize with those values.

    if(currentTime && totalTime){

        _selector.prop('max', totalTime);

        _selector.val(currentTime);

        _repaint();

    }



    //Keep track of when the user is changing the value so that our update interval does not conflict.

    var _userChangingValue = false;

    _selector.mousedown(function(){

        _userChangingValue = true;

    })



    //Bind to selector mouse-up to support dragging as well as clicking.

    //I don't want to send a message until drag ends, so mouseup works nicely.

    _selector.mouseup(function(){

        Player.seekTo(_selector.val());



        //Once the user has seeked to the new value let our update function run again.

        //Wrapped in a set timeout because there is some delay before the seekTo and the equivalent of flickering happens.

        setTimeout(function(){

            _userChangingValue = false;

        }, 1500);

    })



    _selector.change(function(){

        _repaint();

        //TODO: Decouple timeDisplay from progressBar if possible.

        timeDisplay.update(_selector.val());

    })



    //A nieve way of keeping the progress bar up to date. 

    var _timeMonitorInterval = setInterval(function () { return _update(); }, 500);



    //Pause the GUI's refreshes for updating the timers while the user is dragging the song time slider around.

    var _update = function(){

        if(!_userChangingValue) {

            var currentTime = Player.getCurrentTime();

            progressbar.setElapsedTime(currentTime);



            var totalTime = Player.getTotalTime();

            progressbar.setTotalTime(totalTime);

        }

    }



    var progressbar = {

        setElapsedTime: function (value) {

            _selector.val(value);

            _repaint();

        },



        setTotalTime: function (maxValue) {

            _selector.prop('max', maxValue);

            _repaint();

        }

    };



    return progressbar;

}