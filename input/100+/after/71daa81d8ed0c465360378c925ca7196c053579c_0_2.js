function() {
			if (WDN.hasDocumentClass('no-placeholder')) {
				WDN.loadJS(WDN.getTemplateFilePath('scripts/plugins/placeholder/jquery.placeholder.min.js'), function() {
					WDN.jQuery('#wdn_feedback_comments').find('[placeholder]').placeholder();
				});
			}

			WDN.jQuery('#wdn_feedback_comments textarea').attr('x-webkit-speech', 'x-webkit-speech').keyup(
				function(event) {
					if (this.value.length > 0) {
						// Add the submit button
						WDN.jQuery('.wdn_comment_email,.wdn_comment_name,#wdn_feedback_comments input').slideDown();
					}
				}
			);
			WDN.jQuery('#wdn_feedback_comments').submit(
				function(event) {
					var comments = WDN.jQuery('#wdn_feedback_comments textarea').val();
					if (comments.split(' ').length < 4) {
						// Users must enter in at least 4 words.
						alert('Please enter more information, give me at least 4 words!');
						return false;
					}
					WDN.jQuery('#wdn_feedback_comments form input[type="submit"]').attr('disabled', 'disabled');
					WDN.post(
						'http://www1.unl.edu/comments/',
						WDN.jQuery('#wdn_feedback_comments').serialize()
					);
					WDN.jQuery('#wdn_feedback_comments').hide();
					WDN.jQuery('#wdn_footer_feedback').append('<h4>Thanks!</h4>');
					event.stopPropagation();
					return false;
				}
			);
		}