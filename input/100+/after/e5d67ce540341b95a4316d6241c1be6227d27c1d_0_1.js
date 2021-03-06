function() {
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	//var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
	var Window;
	
	if (osname === 'ipad') {
		Window = require('ui/tablet/ApplicationWindow');
		var win = new Window('KitchenSink');
		win.open();
	}
	else {
		// iPhone makes use of the platform-specific navigation controller,
		// all other platforms follow a similar UI pattern
		if (osname === 'iphone') {
			Window = require('ui/handheld/ios/ApplicationWindow');
		}
		else if (osname === 'mobileweb'){
			Window = require('ui/handheld/mobileweb/ApplicationWindow');
		}
		else {
			Window = require('ui/handheld/android/ApplicationWindow');
		}

		var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
		new ApplicationTabGroup().open(
			Ti.UI.iPhone ? {transition: Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT} : {}
		);
		
		var MessageWindow = require('ui/common/MessageWindow'),
			messageWin = new MessageWindow();
			
		Titanium.App.addEventListener('event_one', function(e) {
			messageWin.setLabel('app.js: event one, array length = ' + e.data.length);
			messageWin.open();
			setTimeout(function() {
				messageWin.close({opacity:0,duration:500});
			},1000);
		});
		
		Titanium.App.addEventListener('event_two', function(e) {
			messageWin.setLabel('app.js: event two, name = ' + e.name);
			messageWin.open();
			setTimeout(function() {
				messageWin.close({opacity:0,duration:500});
			},1000);	
		});
		
		// test out logging to developer console, formatting and localization
		Ti.API.info(String.format("%s%s",L("welcome_message","default_not_set"),Titanium.version));
		Ti.API.debug(String.format("%s %s",L("user_agent_message","default_not_set"),Titanium.userAgent));
		
		Ti.API.debug(String.format("locale specific date is %s",String.formatDate(new Date()))); // default is short
		Ti.API.debug(String.format("locale specific date (medium) is %s",String.formatDate(new Date(),"medium")));
		Ti.API.debug(String.format("locale specific date (long) is %s",String.formatDate(new Date(),"long")));
		Ti.API.debug(String.format("locale specific time is %s",String.formatTime(new Date())));
		Ti.API.debug(String.format("locale specific currency is %s",String.formatCurrency(12.99)));
		Ti.API.debug(String.format("locale specific decimal is %s",String.formatDecimal(12.99)));
		
		
		Ti.API.info("should be en, was = "+Ti.Locale.currentLanguage);
		Ti.API.info("welcome_message = "+Ti.Locale.getString("welcome_message"));
		Ti.API.info("should be def, was = "+Ti.Locale.getString("welcome_message2","def"));
		Ti.API.info("welcome_message = "+L("welcome_message"));
		Ti.API.info("should be def, was = "+L("welcome_message2","def"));
		Ti.API.info("should be 1, was = "+String.format('%d',1));
		
		// TODO: This is failing
		//Ti.API.info("should be 1.0, was = "+String.format('%1.1f',1));
		
		Ti.API.info("should be hello, was = "+String.format('%s','hello'));
		
		// test to check that we can iterate over titanium based objects
		(function(){	
			Ti.API.info("you should see a list of modules (3 or more) below this line");
			Ti.API.info("---------------------------------------------------------------");
			for (var p in Titanium)
			{
				Ti.API.info("             module: "+p);
			}
			Ti.API.info("Did you see modules? ^^^^^ ");
			Ti.API.info("---------------------------------------------------------------");
		})();
	}
		
}