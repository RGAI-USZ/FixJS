function() {
	var j = jQuery;

	var altajaxurl = '/wp-admin/admin-ajax.php';

	var onAutocompleteSelect = function(value, data) {
		j('#selection').html('<img src="\/global\/flags\/small\/' + data + '.png" alt="" \/> ' + value);
	//alert(data);
	}

	var options = {
		serviceUrl: altajaxurl,
		width: 300,
		delimiter: /(,|;)\s*/,
		onSelect: ia_on_autocomplete_select,
		deferRequestBy: 0, //miliseconds
		params: { action: 'invite_anyone_autocomplete_ajax_handler' },
		noCache: true //set to true, to disable caching
	};

	a = j('#send-invite-form #send-to-input').autocomplete(options);

	j("div#invite-anyone-member-list input").click(function() {
		var friend_id = j(this).val();

		if ( j(this).prop('checked') == true ) {
			var friend_action = 'invite';
		} else {
			var friend_action = 'uninvite';
		}

		j.post( altajaxurl, {
			action: 'openlab_ajax_invite_user',
			'friend_action': friend_action,
			'cookie': encodeURIComponent(document.cookie),
			'_wpnonce': j("input#_wpnonce_invite_uninvite_user").val(),
			'friend_id': friend_id,
			'group_id': j("input#group_id").val()
		},
		function(response)
		{
			if ( j("#message") )
				j("#message").hide();

			if ( friend_action == 'invite' ) {
				j('#invite-anyone-invite-list').append(response);
			} else if ( friend_action == 'uninvite' ) {
				j('#invite-anyone-invite-list li#uid-' + friend_id).remove();
			}
		});
	});

	j("#invite-anyone-invite-list li a.remove").live("click", function() {
		var friend_id = j(this).prop('id');

		friend_id = friend_id.split('-');
		friend_id = friend_id[1];

		j.post( altajaxurl, {
			action: 'openlab_ajax_invite_user',
			'friend_action': 'uninvite',
			'cookie': encodeURIComponent(document.cookie),
			'_wpnonce': j("input#_wpnonce_invite_uninvite_user").val(),
			'friend_id': friend_id,
			'group_id': j("input#group_id").val()
		},
		function(response)
		{
			j('#invite-anyone-invite-list li#uid-' + friend_id).remove();
			j('#invite-anyone-member-list input#f-' + friend_id).prop('checked', false);
		});

		return false;
	});

	j("#invite-anyone-link").click(
		function() {

			j('.ajax-loader').toggle();

			var friend_id = j(this).val();

			if ( j(this).prop('checked') == true ) {
				var friend_action = 'invite';
			} else {
				var friend_action = 'uninvite';
			}


			j.post( altajaxurl, {
				action: 'openlab_ajax_invite_user',
				'friend_action': friend_action,
				'cookie': encodeURIComponent(document.cookie),
				'_wpnonce': j("input#_wpnonce_invite_uninvite_user").val(),
				'friend_id': friend_id,
				'group_id': j("input#group_id").val()
			},
			function(response)
			{
				if ( j("#message") )
					j("#message").hide();

				j('.ajax-loader').toggle();

				if ( friend_action == 'invite' ) {
					j('#invite-anyone-member-list').append(response);
				} else if ( friend_action == 'uninvite' ) {
					j('#invite-anyone-member-list li#uid-' + friend_id).remove();
				}
			});
		}
	);
}