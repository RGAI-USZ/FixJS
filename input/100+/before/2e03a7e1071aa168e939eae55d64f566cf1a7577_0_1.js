function(user, key){
	var current_tiers = sys.getFileContent("tiers.xml");
	if (/category/gi.test(resp)){
		if (current_tiers !== resp){
			sys.writeToFile("tiers (last).xml", sys.getFileContent("tiers.xml"));
			sys.writeToFile("tiers.xml", resp); 
			sys.reloadTiers();
			print(tiers.options["autoupdate"] + " tiers have been installed.");
			if (global.auth !== undefined){
				if (user != "~~Server~~"){
					auth.echo("owner", key + " tiers have been installed as the server's tiers by " + user + "!" , -1);
				}
				else {
					auth.echo("server", key + " tiers have been installed as the server's tiers!", -1);
				}
			}
			return;
		}
		print("The server's tiers are up to date with " + tiers.options["autoupdate"] + "'s.");
	}
}