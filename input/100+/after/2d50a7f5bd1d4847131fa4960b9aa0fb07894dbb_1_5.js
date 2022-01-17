function(e) {
			if (e.success) {
				// get user profile pic, username and other details
				var user = e.users[0];
				userName = user.last_name;
				displayName = user.first_name
				otherDetails = user.custom_fields.other_details;
				emailAdd = user.email;

				//dialog with the options of where to get an image from
				var dialog = Titanium.UI.createOptionDialog({
					title : 'Choose an image source...',
					options : ['Camera', 'Photo Gallery', 'Cancel'],
					cancel : 2
				});

				//add event listener - to show option dialog when profile pic is clicked
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
				});

				// profile pic - click to edit
				photoLogo = Titanium.UI.createImageView({
					image : image,
					//BRYAN: default photo added
					defaultImage : 'profile.png',
					width : '140dp',
					height : '133dp',
					left : '85dp',
					right : '85dp',
					top : '12dp'
				});
				winProfile.add(photoLogo);

				photoLogo.addEventListener('click', function(e) {
					dialog.show();
				});

				// instruction to direct user to click on photo to edit
				var photoInstruct = Titanium.UI.createLabel({
					width : 'auto',
					height : '15dp',
					top : '145dp',
					left : '90dp',
					color : '#D3D3D3',
					font : {
						fontSize : 10,
						fontFamily : 'Helvetica'
					},
					text : 'Click on photo to change it...'
				})
				winProfile.add(photoInstruct);

				//add event listener - camera
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
					if (e.index == 0) {
						//from the camera
						Titanium.Media.showCamera({
							success : function(event) {
								localImage = event.media;
								if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
									// display selected pic on profile window
									photoLogo.image = localImage;
									winProfile.add(photoLogo);
								}
							},
							cancel : function() {// having problems with this...will try to solve it
								//getting image from camera was cancelled
								winProfile.open();
							},
							error : function(error) {
								//create alert
								var a = Titanium.UI.createAlertDialog({
									title : 'Camera'
								});
								// set message
								if (error.code == Titanium.Media.NO_CAMERA) {
									a.setMessage('Device does not have image recording capabilities');
								} else {
									a.setMessage('Unexpected error: ' + error.code);
								}
								// show alert
								a.show();
							},
							allowImageEditing : true,
							saveToPhotoGallery : true
						});
					} else {
					}
				});

				//add event listener - choose from gallery
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
					if (e.index == 1) {
						//obtain an image from the gallery
						Titanium.Media.openPhotoGallery({
							success : function(event) {
								localImage = event.media;
								// set image view
								Ti.API.debug('Our type was: ' + event.mediaType);
								if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
									// display selected pic on profile window
									photoLogo.image = localImage;
									winProfile.add(photoLogo);
								}
							},
							cancel : function() {// having probles, will try to solve it
								//user cancelled the action from within the photo gallery
								winProfile.open();
							}
						});
					} else {
					}
				});

				//dialog with the options of where to get an image from
				var dialog = Titanium.UI.createOptionDialog({
					title : 'Choose an image source...',
					options : ['Camera', 'Photo Gallery', 'Cancel'],
					cancel : 2
				});

				//add event listener - to show option dialog when profile pic is clicked
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
				});

				// profile pic - click to edit
				photoLogo = Titanium.UI.createImageView({
					image : image,
					defaultImage : 'profile.png',
					width : '140dp',
					height : '133dp',
					left : '85dp',
					right : '85dp',
					top : '12dp'
				});
				winProfile.add(photoLogo);

				photoLogo.addEventListener('click', function(e) {
					dialog.show();
				});

				// instruction to direct user to click on photo to edit
				var photoInstruct = Titanium.UI.createLabel({
					width : 'auto',
					height : '15dp',
					top : '145dp',
					left : '90dp',
					color : '#D3D3D3',
					font : {
						fontSize : 10,
						fontFamily : 'Helvetica'
					},
					text : 'Click on photo to change it...'
				})
				winProfile.add(photoInstruct);

				//add event listener - camera
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
					if (e.index == 0) {
						//from the camera
						Titanium.Media.showCamera({
							success : function(event) {
								localImage = event.media;
								if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
									// display selected pic on profile window
									photoLogo.image = localImage;
									winProfile.add(photoLogo);
								}
							},
							cancel : function() {// having problems with this...will try to solve it
								//getting image from camera was cancelled
								winProfile.open();
							},
							error : function(error) {
								//create alert
								var a = Titanium.UI.createAlertDialog({
									title : 'Camera'
								});
								// set message
								if (error.code == Titanium.Media.NO_CAMERA) {
									a.setMessage('Device does not have image recording capabilities');
								} else {
									a.setMessage('Unexpected error: ' + error.code);
								}
								// show alert
								a.show();
							},
							allowImageEditing : true,
							saveToPhotoGallery : true
						});
					} else {
					}
				});

				//add event listener - choose from gallery
				dialog.addEventListener('click', function(e) {
					Ti.API.info('You selected ' + e.index);
					if (e.index == 1) {
						//obtain an image from the gallery
						Titanium.Media.openPhotoGallery({
							success : function(event) {
								localImage = event.media;
								// set image view
								Ti.API.debug('Our type was: ' + event.mediaType);
								if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
									// display selected pic on profile window
									photoLogo.image = localImage;
									winProfile.add(photoLogo);
								}
							},
							cancel : function() {// having probles, will try to solve it
								//user cancelled the action from within the photo gallery
								winProfile.open();
							}
						});
					} else {
					}
				});

				// prompt for app username
				var usernameLabel = Titanium.UI.createLabel({
					width : 'auto',
					height : '30dp',
					top : '160dp',
					left : '20dp',
					color : '#000014',
					font : {
						fontSize : '14dp',
						fontFamily : 'Helvetica',
						fontWeight : 'bold'
					},
					text : 'Display name:'
				});
				winProfile.add(usernameLabel);

				// name and email display
				//nameText = nameText + Ti.App.Properties.getString('name');
				//emailText = emailText + Ti.App.Properties.getString('email');
				nameText = nameText + userName;
				emailText = emailText + emailAdd;

				// text field to enter display name
				usernameText = Titanium.UI.createTextField({
					value : displayName,
					font : {
						fontSize : '13dp',
					},
					width : '175dp',
					height : '35dp',
					top : '160dp',
					left : '125dp'
				});
				winProfile.add(usernameText);

				// create a label for username
				var nameDisplay = Titanium.UI.createLabel({
					width : 'auto',
					height : '30dp',
					top : '195dp',
					left : '20dp',
					color : '#000014',
					font : {
						fontSize : '14dp',
						fontFamily : 'Helvetica',
						fontWeight : 'bold'
					},
					text : nameText
				});
				winProfile.add(nameDisplay);

				// create a label to display email
				var emailDisplay = Titanium.UI.createLabel({
					width : 'auto',
					height : '30dp',
					top : '230dp',
					left : '20dp',
					color : '#000014',
					font : {
						fontSize : '14dp',
						fontFamily : 'Helvetica',
						fontWeight : 'bold'
					},
					text : emailText
				});
				winProfile.add(emailDisplay);

				// other details textbox
				var detailsLabel = Titanium.UI.createLabel({
					width : 'auto',
					height : '30dp',
					top : '265dp',
					left : '20dp',
					color : '#000014',
					font : {
						fontSize : '14dp',
						fontFamily : 'Helvetica',
						fontWeight : 'bold'
					},
					text : 'Other details:'
				});
				winProfile.add(detailsLabel);

				// text field to enter other details
				details = Titanium.UI.createTextField({
					font : {
						fontSize : '14dp',
					},
					width : '280dp',
					height : '35dp',
					top : '295dp',
					left : '20dp',
					value : otherDetails
				});
				winProfile.add(details);

			} else {
				alert('Error:\\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		}