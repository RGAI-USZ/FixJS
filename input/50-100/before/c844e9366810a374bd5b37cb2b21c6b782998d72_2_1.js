function( event, $uiConf, callback ){
		// Check if the kaltura ad plugin is enabled:
		if( embedPlayer.isPluginEnabled('vast') ){
			var loadingAdPlugin = true;
			// Load the Kaltura Ads and AdSupport Module:
			mw.load( [ "AdSupport", "mw.KAds" ], function(){
				// Add the ads to the player:
				mw.addKalturaAds( embedPlayer, function(){
					mw.log("AdPlugin ( done loading ads, run callback:");
					// Wait until ads are loaded before running callback
					// ( ie we don't want to display the player until ads are ready )
					callback();
				});
			});
			// wait for the vast loaded callback
			return ;
		}
		// Continue player build out for players without ads
		callback();
	}