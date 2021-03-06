function(){
    /**
     * Boolean to deter if Dom has loaded
     * @private
    */
    var readyLoad_ = false;


    /**
     * @constructor
    */
    var HOAPlayer = function()
    {
        /**
         * Configuration Stack, can be modified by the main window
        */
        this.config = {
            defaultWidth : 560,
            defaultHeight : 315,
            playerFrameBorder : 0,
            allowFullScreen : true
        };

        /**
         * Merge the configuration object with any potential overwrites
        */
        this.config = this.mergeObjects(this.config, window["_hoa_config"] || {});

        /**
         * Bind documentReady event
        */
        this.bindOnload(this.onDomLoaded.bind(this));
    };

    /**
     * Callback fired when DOM is ready
    */
    HOAPlayer.prototype.onDomLoaded = function(e)
    {
        /**
         * Scan the DOM for all the elements that have the classname onair
        */
        var targets = document.getElementsByClassName('onair'), i;

        /**
         * Loop the targets and draw a video feed
        */
        for(i = 0; i < targets.length; i++)
        {
            /**
             * only apply the player if there is a data-uid attribute
            */
            if(targets[i].getAttribute('data-uid'))
            {
                var uid = targets[i].getAttribute('data-uid');
                var width = targets[i].getAttribute('data-width') || this.config.defaultWidth;
                var height = targets[i].getAttribute('data-height') || this.config.defaultHeight;

                /**
                 * Start the call for this element
                */
                this.loadVideoPlayer(targets[i], uid, width, height);
            }
        }
    }

    /**
     * Loads a video player form feed
     * @param target {Element} Target Element.
     * @param uid {String} Username of the feed
     * @param width {Number} width of the player
     * @param height {Number} height of the player
    */
    HOAPlayer.prototype.loadVideoPlayer = function(target, uid, width, height)
    {
        /**
         * Fetch the latest json feed for the current user
        */
        this.fetchUserFeed(uid, 0, function(err, feed){

            /**
             * Get the last entry of the feed
            */
            var feed = feed.feed.entry;
            if(feed){
                for(var i = 0 ; i < feed.length; i++){
                    if(feed[i]["yt$status"]["$t"] == "active"){
                        var entry = feed[i];
                    }
                }
                /**
                 * If there is an entry, parse the required information
                */
                if(entry && entry.content)
                {
                    /**
                     * Parse the URL and split it into segments to get the last entity
                    */
                    var UrlParts = entry.content.src.split("/");

                    /**
                     * Create an iframe
                    */
                    var iframe = document.createElement('iframe');

                    /**
                     * Assign the param to the iframe
                    */
                    iframe.src = 'http://www.youtube.com/embed/' + UrlParts[UrlParts.length-1].split("?")[0];
                    iframe.width = width;
                    iframe.height = height;
                    iframe.setAttribute("frameborder", this.config.playerFrameBorder);
                    iframe.setAttribute("allowfullscreen", this.config.allowFullScreen);

                    /**
                     * Replace the target node with the iframe node
                    */
                    target.parentNode.replaceChild(iframe, target);
                }
            }else{
                this.fetchUserFeed(uid, 1, function(err, feed){
                    
                    var entry = feed.feed.entry;
                   // console.log(feed);
                    /**
                     * If there is an entry, parse the required information
                    */
                    if(entry)
                    {   
                        console.log(entry[0].id["$t"]);
                        /**
                         * Parse the URL and split it into segments to get the last entity
                        */
                        var UrlParts = entry[0].id["$t"].split("/");
                        /**
                         * Create an iframe
                        */
                        var iframe = document.createElement('iframe');

                        /**
                         * Assign the param to the iframe
                        */
                        iframe.src = 'http://www.youtube.com/embed/' + UrlParts[5];
                        iframe.width = width;
                        iframe.height = height;
                        iframe.setAttribute("frameborder", this.config.playerFrameBorder);
                        iframe.setAttribute("allowfullscreen", this.config.allowFullScreen);

                        /**
                         * Replace the target node with the iframe node
                        */
                        target.parentNode.replaceChild(iframe, target);
                    }
                }.bind(this));
            }
        }.bind(this));
    }
    
    /**
     * Fetches a JSON Object from youtube for a specified uid
     * @param uid {String} Username of the feed
     * @param callback {Function(e, feed)} callback to be called
    */
    HOAPlayer.prototype.fetchUserFeed = function(uid, flag, callback)
    {
        /**
         * Create a random function to assign to the global scope
        */
        var magic = '__YTLiveStreams_' + uid + "_" + Math.floor(Math.random() * 1000001);
        /**
         * Apply the callback to the root object (window)
        */
        this.awaitLoadResonse(magic, callback);

        /**
         * Build the URL
        */
        if(flag == 0){
            var URL = "https://gdata.youtube.com/feeds/api/users/" + uid + "/live/events?v=2&alt=json&status=active&callback=" + magic;
            //console.log(URL);
        }
        if(flag == 1){
            var URL = "http://gdata.youtube.com/feeds/users/" + uid + "/uploads?alt=json&max-results=1&callback=" + magic;
            //console.log(URL);
        }
        /**
         * Create an script element to append to the head
        */
        var re = document.createElement('script');
        re.type = 'text/javascript';
        re.async = true;
        re.src = URL;

        /**
         * Prepend the element to the head of the document.
        */
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(re, s);
    }

    HOAPlayer.prototype.awaitLoadResonse = function(magic, callback)
    {
        window[magic] = function(payload)
        {
            /**
             * Here, I would like to do some error checking but not required
            */
            callback(null, payload);
        }
    }

    /**
     * Bind DOMReady callbacks to the dom (cross-browser)
     * @param callback {Function}, callback to be fired
     * @see https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
     * @see http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
    */
    HOAPlayer.prototype.bindOnload = function(callback)
    {
        /**
         * If the dom is already laoded just call the callback inline
        */
        if(readyLoad_ == true)
        {
            callback();
        }

        //Mozzilla, Opera and webkit support addEventListener
        if(document.addEventListener)
        {
            document.addEventListener( "DOMContentLoaded", function(){
                callback();
                readyLoad_ = true;
            }, false);

            return;
        }

        //IE
        if(document.attachEvent)
        {
            document.attachEvent("onreadystatechange", function(){
                if (document.readyState === "complete" ) {
                    callback();
                    readyLoad_ = true;
                }
            });

            return;
        }

        //Fallback to window.onload
        window.onload = callback;
    }

    /**
     * Merges {n} objects into a new object, i
     * @param * {Object}, Objects to be merged
    */
    HOAPlayer.prototype.mergeObjects = function()
    {
        var buildObject = {}, i, e;

        /**
         * Loop arguments, {obj1, obj2, obj3, ...}
        */
        for(i = 0; i < arguments.length; i++)
        {
            /**
             * Loop attributes of the current object
            */
            for(e in arguments[i])
            {
                /**
                 * Pass the key and value of the current object into the builldObject
                */
                buildObject[e] = arguments[i][e];
            }
        }

        return buildObject;
    }

    /**
     * Export an instantiated instance
    */
    window["_hoa_instance_"] = new HOAPlayer();
}