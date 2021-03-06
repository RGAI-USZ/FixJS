function RESPreloadCSS() {
RESUtils.addCSS(' \
#RESConsole { \
	visibility: hidden; \
	color: #000; \
	font-size: 12px; \
	z-index: 1000; \
	position: fixed; \
	margin: auto; \
	top: -1500px; \
	left: 1.5%; \
	width: 95%; \
	height: 85%; \
	overflow: hidden; \
	padding: 10px; \
	box-shadow: 10px 10px 10px #aaa; \
	-moz-box-shadow: 10px 10px 10px #aaa; \
	-webkit-box-shadow: 10px 10px 10px #aaa; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	/* border: 4px solid #CCCCCC; */ \
	background-color: #ffffff; \
	-webkit-transition:top 0.5s ease-in-out; \
	-moz-transition:top 0.5s ease-in-out; \
	-o-transition:top 0.5s ease-in-out; \
	-ms-transition:top 0.5s ease-in-out; \
	-transition:top 0.5s ease-in-out; \
} \
#RESConsole.slideIn { \
	visibility: visible; \
	top: 30px; \
} \
#RESConsole.slideOut { \
	visibility: visible; \
	top: -1500px; \
} \
#modalOverlay { \
	display: none; \
	z-index: 999; \
	position: fixed; \
	top: 0px; \
	left: 0px; \
	width: 100%; \
	height: 100%; \
	background-color: #c9c9c9; \
	opacity: 0; \
	-webkit-transition:opacity 0.4s ease-in-out; \
	-moz-transition:opacity 0.4s ease-in-out; \
	-o-transition:opacity 0.4s ease-in-out; \
	-ms-transition:opacity 0.4s ease-in-out; \
	-transition:opacity 0.4s ease-in-out; \
} \
#modalOverlay.fadeIn { \
	display: block; \
	opacity: 0.9; \
} \
#modalOverlay.fadeOut { \
	display: block; \
	opacity: 0; \
	height: 0; \
} \
#RESSettingsButton { \
	display: inline-block; \
	margin: auto; \
	margin-bottom: -2px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESSettingsButton.newNotification, .gearIcon.newNotification { \
	cursor: pointer; \
	background-position: 0px -134px; \
} \
#DashboardLink a { \
	display: block; \
	width: auto; \
	height: auto; \
} \
#RESMainGearOverlay { \
	position: absolute; \
	display: none; \
	width: 27px; \
	height: 24px; \
	border: 1px solid #336699; \
	border-bottom: 1px solid #5f99cf; \
	background-color: #5f99cf; \
	border-radius: 3px 3px 0px 0px; \
	z-index: 10000; \
} \
.gearIcon { \
	position: absolute; \
	top: 3px; \
	left: 6px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESPrefsDropdown { \
	display: none; \
	position: absolute; \
	z-index: 10000; \
} \
.RESDropdownList { \
	list-style-type: none; \
	background-color: #5f99cf; \
	width: 180px; \
	border-radius: 0px 0px 3px 3px; \
	border: 1px solid #336699; \
	border-bottom: none; \
	margin-top: -1px; \
} \
.RESDropdownList li { \
	cursor: pointer; \
	border-bottom: 1px solid #336699; \
	height: 35px; \
	line-height: 34px; \
	font-weight: bold; \
	color: #c9def2; \
	padding-left: 10px; \
} \
.RESDropdownList a, .RESDropdownList a:visited { \
	display: inline-block; \
	width: 100%; \
	height: 100%; \
	color: #c9def2; \
} \
.RESDropdownList li:hover, .RESDropdownList li a:hover { \
	background-color: #9cc6ec; \
	color: #336699; \
} \
.editButton { \
	cursor: pointer; \
	width: 24px; \
	height: 22px; \
	background-repeat: no-repeat; \
	background-position: 2px 2px; \
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAY5JREFUeNpi/P//PwM1ABMDlcDAGHTgwAFxigy6d+8e0507d+p+/PixaseOHf1kGfTw4UPON2/edL9//77R0NDQ7unTp2pbtmzZSpJBp0+fFgZSE7W0tIrevXvHcObMGQYFBQWvs2fPftq+fft6ogwCKlY4d+7cPKBhqX///mXQ0NBgAHqP4erVqyDpX/z8/F0EDQJqNj558uRsOTk5v8+fPzOsX7+eAZTeVFVVGV69etXi4uLSYWVldRxZDyN6ggS6xBZoSLuKioo1yJCXL18yPH78mIGdnZ1BVFQ0w8LCYqOxsfELvGF06tQp9pUrV3rp6elZf/jwgeH58+cMwMBl+PTpEyjQq3R0dFZiMwTDRRMmTFADuuLKr1+/WAUEBMAu+fnzJ8ig7MzMzLk2NjY/iUpHgoKCrmlpaawgNsglnJycDGxsbJHR0dEz8BkCAizInG3btglJSUkxaGtrM+zfvx8UsF5LlizZTkyiRfFaenr6/2vXrlXKyMj8/vfv33VgeG0jNvswDt9iBCDAAGGFwZtPlqrJAAAAAElFTkSuQmCC) \
} \
.optionsTable .deleteButton { \
	cursor: pointer; \
	width: 16px; \
	height: 16px; \
	background-image: url(data:image/gif;base64,R0lGODlhEAAQAOZOAP///3F6hcopAJMAAP/M//Hz9OTr8ZqksMTL1P8pAP9MDP9sFP+DIP8zAO7x8/D1/LnEz+vx+Flha+Ln7OLm61hhayk0QCo1QMfR2eDo8b/K1M/U2pqiqcfP15WcpcLK05ymsig0P2lyftnf5naBi8XJzZ6lrJGdqmBqdKissYyZpf/+/puotNzk66ayvtbc4rC7x9Xd5n+KlbG7xpiirnJ+ivDz9KKrtrvH1Ojv9ePq8HF8h2x2gvj9/yYyPmRueFxlb4eRm+71+kFLVdrb3c/X4KOnrYGMl3uGke/0+5Sgq1ZfaY6Xn/X4+f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAE4ALAAAAAAQABAAAAexgE6CggGFAYOIiAEPEREPh4lOhpOUgwEAmJmaABuQAUktMUUYGhAwLiwnKp41REYmHB5MQUcyN0iQTjsAHU05ICM4SjMQJIg8AAgFBgcvE5gUJYgiycsHDisCApjagj/VzAACBATa5AJOKOAHAAMMDOTvA05A6w7tC/kL804V9uIKAipA52QJgA82dNAQRyBBgwYJyjmRgKmHkAztHA4YAJHfEB8hLFxI0W4AACcbnQQCADs=) \
} \
#openRESPrefs { \
	display: inline-block; \
	height: 100%; \
} \
#RESConsoleHeader { \
	width: 100%; \
} \
#RESLogo { \
	margin-right: 5px; \
	float: left; \
} \
.RESDialogTopBar { \
	border-radius: 3px 3px 0px 0px; \
	-moz-border-radius: 3px 3px 0px 0px; \
	-webkit-border-radius: 3px 3px 0px 0px; \
	position: absolute; \
	top: 0px; \
	left: 0px; \
	right: 0px; \
	height: 40px; \
	margin-bottom: 10px; \
	padding-top: 10px; \
	padding-left: 10px; \
	padding-right: 10px; \
	border-bottom: 1px solid #c7c7c7; \
	background-color: #F0F3FC; \
	float: left; \
} \
#RESConsoleTopBar h1 { \
	float: left; \
	margin-top: 6px; \
	padding: 0px; \
	font-size: 14px; \
} \
#RESConsoleSubredditLink { \
	float: right; \
	margin-right: 34px; \
	margin-top: 7px; \
	font-size: 11px; \
} \
#RESKnownBugs, #RESKnownFeatureRequests { \
	list-style-type: disc; \
} \
.RESCloseButton { \
	position: absolute; \
	top: 7px; \
	right: 7px; \
	font: 12px Verdana, sans-serif; \
	background-color: #ffffff; \
	border: 1px solid #d7d9dc; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #9a958e; \
	text-align: center; \
	line-height: 22px; \
	width: 24px; \
	height: 24px; \
	z-index: 1000; \
	cursor: pointer; \
} \
#RESConsoleTopBar .RESCloseButton { \
	top: 9px; \
	right: 9px; \
} \
.RESCloseButton:hover { \
	border: 1px solid #999999; \
	background-color: #dddddd; \
} \
#RESClose { \
	float: right; \
	margin-top: 2px; \
	margin-right: 0px; \
} \
.RESDialogSmall { \
	background-color: #ffffff; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	font-size: 12px; \
	color: #666666; \
	position: relative; \
} \
.RESDialogSmall > h3 { \
	color: #000000; \
	font-size: 14px; \
	margin-top: 6px; \
	margin-bottom: 10px; \
	font-weight: normal; \
	position: absolute; \
	top: -5px; \
	left: 0px; \
	right: 0px; \
	background-color: #f0f3fc; \
	border-bottom: 1px solid #c7c7c7; \
	width: auto; \
	z-index: 10; \
	height: 28px; \
	padding-left: 10px; \
	padding-top: 12px; \
} \
.RESDialogSmall .RESDialogContents, .usertext-edit .RESDialogSmall .md.RESDialogContents { \
	padding: 56px 12px 12px 12px;  \
} \
.usertext-edit .RESDialogSmall .md.RESDialogContents { \
	border: none; \
} \
#RESHelp { \
	background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); \
	background-position: -16px -120px; \
	margin-right: 8px; \
	width: 16px; \
	height: 16px; \
	float: right; \
	cursor: pointer; \
} \
#RESMenu { \
	position: absolute; \
	top: 60px; \
	left: 15px; \
	right: 0px; \
	height: 30px; \
} \
#RESMenu li { \
	float: left; \
	text-align: center; \
	/* min-width: 80px; */ \
	height: 22px; \
	margin-right: 15px; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	padding-top: 6px; \
	padding-bottom: 0px; \
	padding-left: 8px; \
	padding-right: 8px; \
	cursor: pointer; \
	background-color: #dddddd; \
	color: #6c6c6c; \
} \
#RESMenu li.active { \
	border-color: #000000; \
	background-color: #7f7f7f; \
	color: #ffffff; \
} \
#RESMenu li:hover { \
	border-color: #000000; \
} \
#RESConsoleContent { \
	clear: both; \
	padding: 6px; \
	position: absolute; \
	top: 100px; \
	left: 0px; \
	right: 0px; \
	bottom: 0px; \
	border-top: 1px solid #DDDDDD; \
	overflow: auto; \
} \
#RESConfigPanelOptions, #RESAboutDetails { \
	margin-top: 15px; \
	display: block; \
	margin-left: 220px; \
} \
#allOptionsContainer { \
	position: relative; \
} \
#moduleOptionsScrim { \
	display: none; \
	position: absolute; \
	top: 1px; \
	left: 4px; \
	right: 13px; \
	bottom: 1px; \
	border-radius:2px \
	z-index: 1500; \
	background-color: #DDDDDD; \
	opacity: 0.7; \
} \
#moduleOptionsScrim.visible { \
	display: block; \
} \
#RESConfigPanelModulesPane, #RESAboutPane { \
	float: left; \
	width: 195px; \
	padding-right: 15px; \
	border-right: 1px solid #dedede; \
	height: 100%; \
} \
.moduleButton { \
	font-size: 12px; \
	color: #868686; \
	text-align: right; \
	padding-bottom: 3px; \
	padding-top: 3px; \
	margin-bottom: 12px; \
	cursor: pointer; \
	opacity: 0.5; \
} \
.moduleButton.enabled { \
	opacity: 1; \
} \
.moduleButton:hover { \
	text-decoration: underline; \
} \
.moduleButton.active, .moduleButton.active:hover { \
	opacity: 1; \
	font-weight: bold; \
} \
.RESPanel { \
	display: none; \
} \
.clear { \
	clear: both; \
} \
#keyCodeModal { \
	display: none; \
	width: 200px; \
	height: 40px; \
	position: absolute; \
	z-index: 1000; \
	background-color: #FFFFFF; \
	padding: 4px; \
	border: 2px solid #CCCCCC; \
} \
p.moduleListing { \
	padding-left: 5px; \
	padding-right: 5px; \
	padding-top: 5px; \
	padding-bottom: 15px; \
	border: 1px solid #BBBBBB; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
} \
#RESConsoleModulesPanel label { \
	float: left; \
	width: 15%; \
	padding-top: 6px; \
} \
#RESConsoleModulesPanel input[type=checkbox] { \
	float: left; \
	margin-left: 10px; \
} \
#RESConsoleModulesPanel input[type=button] { \
	float: right; \
	padding: 3px; \
	margin-left: 20px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#RESConsoleModulesPanel p { \
	overflow: auto; \
	clear: both; \
	margin-bottom: 10px; \
} \
.moduleDescription { \
	float: left; \
	width: 500px; \
	margin-left: 10px; \
	padding-top: 6px; \
} \
#RESConfigPanelOptions .moduleDescription { \
	margin-left: 0px; \
	margin-top: 10px; \
	padding-top: 0px; \
	clear: both; \
	width: auto; \
} \
.moduleToggle, .toggleButton { \
	float: left; \
	width: 60px; \
	height: 20px; \
	cursor: pointer; \
} \
.moduleHeader { \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.moduleName { \
	font-size: 16px; \
	float: left; \
	margin-right: 15px; \
} \
#RESConsole .toggleButton { \
	margin-left: 10px; \
} \
.toggleButton input[type=checkbox] { \
	display: none; \
} \
.moduleToggle span, .toggleButton span { \
	margin-top: -3px; \
	font-size: 11px; \
	padding-top: 3px; \
	width: 28px; \
	height: 17px; \
	float: left; \
	display: inline-block; \
	text-align: center; \
} \
.moduleToggle .toggleOn, .toggleButton .toggleOn { \
	background-color: #dddddd; \
	color: #636363; \
	border-left: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 3px 0px 0px 3px; \
} \
.moduleToggle.enabled .toggleOn, .toggleButton.enabled .toggleOn { \
	background-color: #107ac4 ; \
	color: #ffffff; \
} \
.moduleToggle.enabled .toggleOff, .toggleButton.enabled .toggleOff { \
	background-color: #dddddd; \
	color: #636363; \
} \
.moduleToggle .toggleOff, .toggleButton .toggleOff { \
	background-color: #d02020; \
	color: #ffffff; \
	border-right: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 0px 3px 3px 0px; \
} \
.optionContainer { \
	position: relative; \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.optionContainer table { \
	clear: both; \
	width: 650px; \
	margin-top: 20px; \
} \
.optionContainer label { \
	float: left; \
	width: 175px; \
} \
.optionContainer input[type=text], .optionContainer input[type=password], div.enum { \
	margin-left: 10px; \
	float: left; \
	width: 140px; \
} \
.optionContainer input[type=checkbox] { \
	margin-left: 10px; \
	margin-top: 0px; \
	float: left; \
} \
.optionContainer .optionsTable input[type=text], .optionContainer .optionsTable input[type=password] { \
	margin-left: 0px; \
} \
.optionsTable th, .optionsTable td { \
	padding-bottom: 7px; \
} \
.optionsTable textarea { \
	width: 400px; \
} \
.optionDescription { \
	margin-left: 255px; \
} \
.optionDescription.textInput { \
	margin-left: 340px; \
} \
.optionDescription.table { \
	position: relative; \
	top: auto; \
	left: auto; \
	right: auto; \
	float: left; \
	width: 100%; \
	margin-left: 0px; \
	margin-top: 12px; \
	margin-bottom: 12px; \
} \
#RESConsoleVersion { \
	float: left; \
	font-size: 10px; \
	color: f0f3fc; \
	margin-left: 6px; \
	margin-top: 7px; \
} \
#moduleOptionsSave { \
	display: none; \
	position: fixed; \
	z-index: 1100; \
	top: 98px; \
	right: 4%; \
	cursor: pointer; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #5cc410; \
	margin-bottom: 10px; \
} \
#moduleOptionsSave:hover { \
	background-color: #73e81e; \
} \
.addRowButton { \
	cursor: pointer; \
	padding-top: 2px; \
	padding-bottom: 2px; \
	padding-right: 5px; \
	padding-left: 5px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
.addRowButton:hover { \
	background-color: #289dee; \
} \
#moduleOptionsSaveBottom { \
	float: right; \
	margin-top: 10px; \
	margin-right: 30px; \
	cursor: pointer; \
	padding: 3px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#moduleOptionsSaveStatus { \
	display: none; \
	position: fixed; \
	top: 98px; \
	right: 160px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#moduleOptionsSaveStatusBottom { \
	display: none; \
	float: right; \
	margin-top: 10px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#RESConsoleAboutPanel p { \
	margin-bottom: 10px; \
} \
#RESConsoleAboutPanel ul { \
	margin-bottom: 10px; \
	margin-top: 10px; \
} \
#RESConsoleAboutPanel li { \
	list-style-type: disc; \
	margin-left: 15px; \
} \
.aboutPanel { \
	background-color: #f0f3fc; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	padding: 10px; \
} \
.aboutPanel h3 { \
	margin-top: 0px; \
	margin-bottom: 10px; \
} \
#DonateRES { \
	display: block; \
} \
#RESTeam { \
	display: none; \
} \
#AboutRESTeamImage { \
	width: 100%; \
	background-color: #000000; \
	margin-bottom: 12px; \
} \
#AboutRESTeamImage img { \
	display: block; \
	margin: auto; \
} \
#AboutRES { \
	display: none; \
} \
.outdated { \
	float: right; \
	font-size: 11px; \
	margin-right: 15px; \
	margin-top: 5px; \
} \
#RESNotifications { \
	position: fixed; \
	top: 0px; \
	right: 10px; \
	height: auto; \
	width: 360px; \
	background: none; \
} \
.RESNotification { \
	opacity: 0; \
	position: relative; \
	font: 12px/14px Arial, Helvetica, Verdana, sans-serif; \
	z-index: 99999; \
	width: 360px; \
	margin-top: 6px; \
	border: 1px solid #ccccff; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #000000; \
	background-color: #ffffff; \
} \
.RESNotification a { \
	color: orangered; \
} \
.RESNotification a:hover { \
	text-decoration: underline; \
} \
.RESNotification.timerOn { \
	border: 1px solid #c7c7c7; \
} \
.RESNotificationContent { \
	overflow: auto; \
	padding: 10px; \
	color: #999999; \
} \
.RESNotificationContent h2 { \
	color: #000000; \
	margin-bottom: 10px; \
} \
.RESNotificationHeader { \
	padding-left: 10px; \
	padding-right: 10px; \
	background-color: #f0f3fc; \
	border-bottom: #c7c7c7; \
	height: 38px; \
} \
.RESNotificationHeader h3 { \
	padding-top: 12px; \
	font-size: 15px; \
} \
.RESNotificationClose { \
	position: absolute; \
	right: 0px; \
	top: 0px; \
	margin-right: 12px; \
	margin-top: 6px; \
} \
a.RESNotificationButtonBlue { \
	clear: both; \
	float: right; \
	cursor: pointer; \
	margin-top: 12px; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff !important; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
#baconBit { \
	position: fixed; \
	width: 32px; \
	height: 32px; \
	background-image: url("http://thumbs.reddit.com/t5_2s10b_6.png"); \
	top: -5%; \
	left: -5%; \
	z-index: 999999; \
	-webkit-transform: rotate(0deg); \
	-moz-transform: rotate(0deg); \
	transform: rotate(0deg); \
	-webkit-transition: all 2s linear; \
	-moz-transition: all 2s linear; \
	-o-transition: all 2s linear; \
	-ms-transition: all 2s linear; \
	-transition: all 2s linear; \
} \
#baconBit.makeitrain { \
	top: 100%; \
	left: 100%; \
	-webkit-transform: rotate(2000deg); \
	-moz-transform: rotate(2000deg); \
	transform: rotate(2000deg); \
} \
.RESButton { margin: 5px; padding: 3px; border: 1px solid #999999; width: 120px; cursor: pointer; border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px; -webkit-border-radius: 5px 5px 5px 5px;  } \
.RESButton:hover { background-color: #DDDDDD;  } \
');
}