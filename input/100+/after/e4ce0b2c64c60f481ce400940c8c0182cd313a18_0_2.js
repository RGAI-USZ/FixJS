function(){this.onPlaying()});this.addPlayerEvent("playing",function(){this.onPlaying()});var a=false;this.addPlayerEvent("error",function(){if(!a){a=true;this.trigger("error","An error occured - "+this.player.error.code)}});this.addPlayerEvent("waiting",function(){this.onWaiting()});this.addPlayerEvent("durationchange",function(){this.duration.set(this.player.duration);this.trigger("durationchange",{duration:this.player.duration})}