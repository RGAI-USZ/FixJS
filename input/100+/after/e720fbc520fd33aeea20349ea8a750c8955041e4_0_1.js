function() {

			var content_template = TapAPI.templateManager.get('audio-stop');
			var contentContainer = this.$el.find(":jqmData(role='content')");

			contentContainer.append(content_template({
				tourStopTitle: this.model.get('title')
			}));

			var assets = this.model.getAssets();

			if (assets) {
				var audioPlayer = this.$el.find('#audio-player');
				var videoPlayer = this.$el.find('#video-player');
				var videoAspect;

				_.each(assets, function(asset) {
					var sources = asset.get('source');

					sources.each(function(source){
						var source_str = "<source src='" + source.get('uri') + "' type='" + source.get('format') + "' />";

						switch(source.get('format').substring(0,5)) {
							case 'audio':
								audioPlayer.append(source_str);
								break;
							case 'video':
								videoPlayer.append(source_str);
								
								break;
							default:
								console.log('Unsupported format for audio asset:', assetSource);
						}
					});
				});

				var mediaOptions = {};
				var mediaElement = null;
				// If there are video sources and no audio sources, switch to the video element
				if (videoPlayer.find('source').length && !audioPlayer.find('source').length) {
					audioPlayer.remove();
					videoPlayer.show();
					mediaOptions.defaultVideoWidth = '100%';
					// mediaOptions.defaultVideoHeight = 270;

					mediaElement = videoPlayer;
				} else {
					videoPlayer.remove();
					mediaOptions.defaultAudioWidth = '100%';
					//mediaOptions.defaultAudioHeight = 270;

					mediaElement = audioPlayer;
				}
				mediaElement.mediaelementplayer(mediaOptions);
			}

			return this;
		}