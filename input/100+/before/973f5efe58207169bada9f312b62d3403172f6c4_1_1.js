function addCSS() {

	if(!playerStyle){

	playerStyle = document.createElement('style');

	playerStyle.setAttribute('type', 'text/css');

	playerStyle.innerHTML ='#playerList {margin-top: 15px; width: 180px; height: 200px; overflow: auto; margin-left:10px; margin-right:10px;}'+

			'.playerWindow {font-size: 12px; line-height:15px; color: darkgrey; background: #e7e7e7; position: fixed; z-index: 20;}'+

			'#playerHeader {height: 30px; cursor: move; text-align:center; position: relative; right: 0px; top: 0px;}'+

			'#playerControls {display: block; text-align: center;}'+

			'.playerListItem {cursor:pointer;, padding-top: 1px; list-style: none;}'+

			'.playerListItemMoveTarget {width:180px; height: 10px; font-size: 10px !important; text-align: center; margin-top: -2px;}'+

			'#playerImage {max-height: 120px; max-width: 180px; display: block; margin-left: auto; margin-right: auto;}'+

			'#playerClose {top: 0px; right: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+

			'#playerStyleSettingsButton {top: 0px; left: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+

			'#playerToggleSet {top: 0px; left: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+

			'#playerChangeMode, .playerListItemDelete, .playerListItemMove {float:right;}'+

			'.playerWindow a {color: darkgray !important; text-decoration: none !important;} .playerWindow a:visited {color: darkgray !important;} .playerWindow a:hover {color: black !important;}'+

			'#playerVolume {padding-top: 7px; height: 14px; width: 60px; display:inline-block;}'+

			'#playerVolumeSeekHeader {margin-left: auto; margin-right:auto; width:180px; background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAHCAYAAAChk2fpAAAAAXNSR0IArs4c6QAAAJpJREFUWMPtV0kKACEMq4N/7Bv7SudUKOKCjo5UkpvWrTGGGkQkERExc6BFEJFk18vb2lfatzR25blW53oCmkeei+0fjWl7J/9/cBJPbe6dwJMX1+JrNnbLXTw7FmXmoC8GggXcCxrYBzWLvISwLjsbu8F4IiTiU9Q1EX4pR1ByDHxeAMC1Q7devK2xS/HaLx7oc9OK9+be4NIvFNCOIPRVVS4AAAAASUVORK5CYII="); background-repeat: no-repeat;}'+

			'#playerCurrentVolume {height: 14px; width: 5px; position:relative; display:block; background: darkgrey;}'+

			'#playerSeekbar {padding-top: 7px; height: 14px; width: 120px; display:inline-block;}'+

			'#playerSeekbarCurrent {height: 14px; width: 5px; position:relative; display:block; background: darkgrey;}'+

			'#playerCurrentVolume:hover, #playerSeekbarCurrent:hover {background: black;}'+

			'.playerControlLink {margin-left: 2px; margin-right:2px;}'+	

			'.playerListItemTag:hover {color: black}'+

			'.playerListItemTag {margin-left: 4px; margin-right: 4px; display:block;}'+
			'#playerTitle {width: 160px; height:15px; overflow:hidden; margin-left:auto; margin-right:auto;}'+

			'#playerTime {width:160px; height:15px; overflow:hidden; margin-left:auto; margin-right:auto;}'+

			'#playerSettings {background: #e7e7e7; position: absolute; max-width:none;}'+

			'#playerSettings > tbody {display:block; padding: 0 10px 10px;}'+
			'#playerListMenu, #playerListItemMenu {padding: 2px 3px; position: fixed; background: #e7e7e7;}'+

			'.playerListItemMenuLink {width: 85px; height: 14px; display:block; oveflow:hidden; overflow:hidden;}'+

			'#playerListMenuAddLocalInput{-moz-transform: scale(5) translateX(-140%); opacity: 0; width: 100%;}';
	document.getElementsByTagName('head')[0].appendChild(playerStyle);

	}

	updateUserCSS();

}