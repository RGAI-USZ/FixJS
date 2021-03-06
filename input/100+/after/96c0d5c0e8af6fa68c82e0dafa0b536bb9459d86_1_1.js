function() {
			var content_template = TapAPI.templateManager.get('tour-details');

			$(":jqmData(role='content')", this.$el).append(content_template({
				tour_id: this.model.id,
				publishDate: this.model.get('publishDate') ? this.model.get('publishDate')[0].value : undefined,
				description: this.model.get('description') ? this.model.get('description')[0].value : undefined,
				stopCount: tap.tourStops.length,
				assetCount: tap.tourAssets.length
			}));

		}