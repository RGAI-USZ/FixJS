function(options, opener){
			// the folder are build files will go in
			var to = buildOptions.to || ""+s.URI(opener.firstSteal.options.rootSrc).dir(),
				appNamesToName = {},
				usedNames = {},
				// a helper function that translates between an 
				// app's name and where we are building it to
				appNamesToMake = function(appNames){
					
					//remove js if it's there
					appNames = appNames.map(function(appName){
						return appName.replace(".js","")
					});
					var expanded = appNames.join('-');
					// check map
					if(appNamesToName[expanded]){
						return appNamesToName[expanded];
					}
					// try with just the last part
					var shortened = appNames.map(function(l){
						return s.URI(l).filename()
					}).join('-')
					if(!usedNames[shortened]){
						usedNames[shortened] = true;
					return appNamesToName[expanded] = to + "/packages/"+shortened;
					} else {
						return appNamesToName[expanded] = to + "/packages/"+expanded.replace(/\//g,'_') ;
					}
				},
				filterCode = function(code, type) {
					return buildOptions.minify
						? build[type].minify(code)
						: code;
				};
			
			// make the packages folder
			s.URI(to+"/packages").mkdirs();
			
			// get packages loaded, packages need to be rootSrc style url
			var packs = opener.steal.packages(),
				// will house the master app's files (so we can build them later)
				masterFiles = [];
				
			// go through every file and mark it packaged
			for(var name in options.files){
				options.files[name].packaged = true;
				masterFiles.push(options.files[name])
			}
			
			// Make the packaged!
			// TODO: figure out how to not write it needs this
			
			// change options for loading packages
			// we don't want to change pages, use the current page
			options.newPage = false;
			
			// minify each file we load
			options.minify = false;
			
			// open packages and add their dependencies 
			apps.open(packs, options, function(options){
				
				// order files 
				apps.order(options);
				
				var sharing,
					// makes contains an hash of packageSrc to
					// the object that we will pass to steal.p.make
					// like:
					//  {
					//    package1 : {src: package1, needs: [shared1]}
					//  }
					// this is used so when the package is stolen,
					// it will load anything it needs before it
					makes = {},
					// mappings of packaged app name to packaging file
					// this is what overwrites the loading location for packages
					maps = {},
					// a list of shares, we go through the list twice
					// b/c it is easier to populate makes
					// once we have gone through each share.
					shares = [];
				
				
				
				
				s.print("Getting Packages");
				while(sharing = apps.getMostShared(options.files)){
					shares.push(sharing);
				};
				packages.flatten(shares, buildOptions.depth);
				
				
				s.print("\nMaking Packages");
				shares.forEach(function(sharing){
					// is it a 'end' package
					var isPackage = sharing.appNames.length == 1,
						packageName = appNamesToMake(sharing.appNames);
	
					// create package
					var pack = build.js.makePackage(sharing.files.map(function(f){
						return f.stealOpts;
					}), {}, packageName+".css"),
						hasCSS = pack.css,
						has = [];
					
					
					// 
					if(isPackage){
						s.print("  Package: "+packageName+ (hasCSS ? " js/css" : "" ) )
					} else {
						s.print("  Shared Package: "+packageName+ (hasCSS ? " js/css" : "" ))
					}
					
					sharing.files.forEach(function(f){
						s.print("  + "+f.stealOpts.rootSrc)
						if(f.stealOpts.buildType == 'js'){
							has.push(f.stealOpts.rootSrc+'')
						}
					})
					s.print(" ")
					
					s.URI(packageName+".js").save( filterCode(pack.js, 'js') );
					
					// make this steal instance
					makes[packageName+".js"] = {
						src: packageName+".js",
						needs :[],
						has : has
					}
					// if we have css
					if(hasCSS){
						// write
						// tell the js it needs this css
						makes[packageName+".js"].needs.push(packageName+".css")
						// make the css
						makes[packageName+".css"] = {
							src: packageName+".css",
							has: pack.css.srcs
						};
						s.URI(packageName+".css").save( filterCode(pack.css.code, 'css') );
						sharing.hasCSS = true;
					}
					
					
					// add to maps
					if(isPackage){
						// this should be the real file
						maps[sharing.appNames[0]+".js"] = packageName+".js";
					}
				})
				// handle depth
				
				
				
				shares.forEach(function(sharing){
					var isPackage = sharing.appNames.length == 1,
						sharePackageName = appNamesToMake(sharing.appNames);
					
					if(!isPackage){
						// add this as a needs to master
						sharing.appNames.forEach(function(appName){
							var packageName = appNamesToMake([appName])
							makes[packageName+".js"].needs
								.push(sharePackageName+".js")
							
							// add css
							if(sharing.hasCSS){
								makes[packageName+".js"].needs
									.push(sharePackageName+".css")
							}
							// also needs css!
							
						})
					}
				});
				// write production with makes
				// and maps
				
				// sort masterFiles
				var destJS = ''+steal.URI(buildOptions.to).join('production.js'),
					destCSS = ''+steal.URI(buildOptions.to).join('production.css');
				s.print("Making "+destJS);
				
				var pack = build.js.makePackage(
					masterFiles.map(function(f){return f.stealOpts}),
					{}, destCSS);
				// prepend maps and makes ...
				// make makes
				var makeCode = [],
					mapCode;
				for(name in makes) {
					makeCode.push("Resource.make(",
						s.toJSON(makes[name]),
						");")
				}
				mapCode = "steal.packages("+s.toJSON(maps)+");"
				s.URI(destJS).save( filterCode(mapCode+makeCode.join('\n')+"\n"+pack.js, 'js') );
				if(pack.css){
					s.print("       "+destCSS);
					s.URI(destCSS).save( filterCode(pack.css.code, 'css') );
				}
			});
		}