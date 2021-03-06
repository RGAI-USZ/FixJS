function( attributes ){

	if( typeof attributes === 'undefined' )
		var attributes = {};

	var flow = this;
	var s3;
	var tmp;

	flow.name =				attributes.name;
	flow.type =				attributes.type;
	flow.extensions =		attributes.extensions;
	flow.base_path =		attributes.base_path || config.base_path;
	flow.paths =			attributes.paths;
	flow.files =			[];
	flow.compress =			attributes.compress || config.compress;
	flow.watch =			attributes.watch || config.watch;
	flow.jst_lang =			attributes.jst_lang;
	flow.jst_namespace =	attributes.jst_namespace;
	flow.encoding =			attributes.encoding || config.encoding;
	flow.strings =			[];
	flow.string =			'';
	flow.url =				'';

	// Validate flow name
	if( typeof flow.name === 'function' )
		flow.name = flow.name();
	if( typeof flow.name !== 'string' )
		throw new Error('\'name\' must be a string or a function that returns a string');
	if( flow.name.length < 1 )
		throw new Error('\'name\' cannot be empty');

	// Validate flow type
	if( typeof flow.type === 'function' )
		flow.type = flow.type();
	if( typeof flow.type !== 'string' )
		throw new Error('\'type\' must be a string or a function that returns a string');
	if( flow.type !== 'css' && flow.type !== 'js' && flow.type !== 'javascript' && flow.type !== 'jst' )
		throw new Error('\'type\' must be \'css\', \'js\', or \'jst\'');
	if( flow.type === 'javascript' )
		flow.type === 'js';
	
	// Set valid extensions for this flow
	if( !flow.extensions ){
		if( flow.type === 'js' )
			flow.extensions = ['js'];
		else if( flow.type === 'css' )
			flow.extensions = ['css'];
		else if( flow.type === 'jst' )
			flow.extensions = ['jst'];
	}
	
	// Validate paths
	if( typeof flow.paths === 'string' )
		flow.paths = [flow.paths];
	if( !_isArray(flow.paths) )
		throw new Error('\'paths\' must be a string or array of strings');
	if( flow.paths.length < 1 )
		throw new Error('\'paths\' must contain relative paths as strings');
	flow.paths.forEach( function( path, i ){
		if( typeof path === 'function' )
			path = path();
	});

	// Validate host
	if( !config.host )
		throw new Error('\'host\' must be set');

	// Validate host (s3)
	if( config.host.provider === 's3' ){
		if( !config.aws_key )
			throw new Error('\'aws_key\' must be set');
		if( !config.aws_secret )
			throw new Error('\'aws_secret\' must be set');
		if( !config.s3_bucket )
			throw new Error('\'bucket\' must be set');
		// Create knox client
		s3 = knox.createClient({
			key: config.host.aws_key,
			secret: config.host.aws_secret,
			bucket: config.host.bucket
		});
	}
	// Validate host (local)
	else if( config.host.provider === 'local' ){
		if( !config.host.path )
			throw new Error('local_path must be set');
		if( typeof config.host.path === 'function' )
			config.host.path = config.host.path();
		if( typeof config.host.path !== 'string' )
			throw new Error('\'path\' must be a string or a function that returns a string');
	}

	// jst_namespace default
	if( flow.type === 'jst' && !flow.jst_namespace )
		flow.jst_namespace = 'JST';
	
	// _watch()
	// Watches specified paths for changes and regenerates the flow
	var _watch = function(){
		
		var root = flow.base_path;
		var watch_timeouts = {}; // get around a node.js watch bug...
		
		flow.paths.forEach( function( path, i ){
			
			var true_path = ( root.charAt( root.length-1 ) === '/' || root === '' )
				? root + path
				: root +'/'+ path;
			var stats = fs.statSync( true_path );
			var is_file = stats.isFile();
			var is_directory = stats.isDirectory();
			
			if( !is_file && !is_directory )
				throw new Error('path "'+ true_path +'" is invalid! Must be a file or directory');
			
			fs.watch( true_path, function( event, filename ){
				
				var file = ( is_file )
					? true_path
					: true_path + filename;
				
				if( watch_timeouts[file] )
					clearTimeout( watch_timeouts[file] );
				watch_timeouts[file] = setTimeout( function(){
					flow._flow();
					if( config.debug )
						console.log( 'Updated: '+ file );
				}, 50 );
				
			});
				
		});
		
	};
	
	if( flow.watch )
		_watch();
	
	// _flow()
	// Generates a flow, can be run manually to regenerate a flow
	flow._flow = function(){
		
		flow._add();
		flow._read();
		flow._preprocess();
		flow._concatenate();
		if( flow.compress )
			flow._compress();
		( config.host.provider === 'local' )
			? flow._write()
			: flow._send();

	};
	
	// _add()
	// Adds specific files to flow
	flow._add = function(){
		
		flow.files = [];
		
		// Convert folder paths to lists of file paths
		// Add all file paths to files array
		var addFiles = function( paths, root ){
			paths.forEach( function( path, i ){	
				var true_path = ( root.charAt( root.length-1 ) === '/' || root === '' )
					? root + path
					: root +'/'+ path;
				var stats = fs.statSync( true_path );
				if( stats.isDirectory() ){
					var files = fs.readdirSync( true_path );
					addFiles( files, true_path );
				}
				else if( stats.isFile() ){
					var extension = _getExtension( true_path );
					var is_extension_relevant = !flow.extensions.indexOf( extension );
					if( is_extension_relevant )
						flow.files.push( true_path );
				}
				else
					throw new Error('path "'+ true_path +'" is invalid! Must be a file or directory');
			});
		};
		
		addFiles( flow.paths, flow.base_path );
		
	};
	
	// _read()
	// Reads each file in a flow and adds its contents to the strings array
	flow._read = function(){

		flow.files.forEach( function( file, i ){
			var contents = fs.readFileSync( file, 'utf-8' );
			// Remove BOM (Byte Mark Order)
			if( contents.charCodeAt(0) === 65279 )
				contents = contents.substring(1);
			flow.strings.push( contents );
		});

	};

	// _preprocess()
	// Runs files through preprocessors and updates processed contents
	flow._preprocess = function(){

		if( flow.type === 'jst' ){
			if( flow.jst_lang === 'handlebars' ){
				var preprocess_handlebars = require('./preprocessors/handlebars.js');
				preprocess_handlebars( flow );
			}
			else if( flow.jst_lang === 'jquery-tmpl' ){
				var preprocess_jquery = require('./preprocessors/jquery-tmpl.js');
				preprocess_jquery( flow );
			}
		}

	};

	// _concatenate()
	// Joins file strings	
	flow._concatenate = function(){

		flow.string = flow.strings.join('\r\n');
		flow.strings = [];

	};

	// _compress()
	// Compresses file string
	flow._compress = function(){

		if( flow.type === 'js' || flow.type === 'jst' ){
			try {
				var parser = uglifyJS.parser;
				var uglify = uglifyJS.uglify;
				var ast = parser.parse( flow.string );
				ast = uglify.ast_mangle( ast );
				ast = uglify.ast_squeeze( ast );
				flow.string = uglify.gen_code( ast );
			}
			catch( err ){
				console.error( 'Error when compressing JS: ', err );
			}
		}
		else if( flow.type === 'css' ){
			try {
				var process = cleanCSS.process;
				flow.string = process( flow.string );
			}
			catch( err ){
				console.error( 'Error when compressing CSS: ', err );
			}
		}

	};

	// _write()
	// Writes file to disk
	flow._write = function(){

		var time = new Date().getTime();
		var filename = time +'_'+ flow.name;
		
		if( flow.path )
			fs.unlinkSync( flow.path );
		fs.writeFileSync( config.host.path +'/'+ filename, flow.string, flow.encoding );
		flow.path = config.host.path +'/'+ filename;
		flow.url = config.host.url +'/'+ filename;
		
		if( config.debug )
			console.log( flow.url );
		
	};

	// _send()
	// Sends file to third-party
	flow._send = function(){

		// TODO send the new file directly to S3
		var tmp = './'+ flow.name;
		var time = new Date().getTime();

		fs.writeFileSync( tmp, flow.string, flow.encoding );
		s3.putFile( tmp, time +'_'+ flow.name, flow._receive );

	};

	// _receive()
	// Accepts third-party response
	flow._receive = function( err, res ){

		if( err )
			throw new Error( err );
		if( res.statusCode !== 200 )
			throw new Error( 'S3 upload failed' );
		else {
			fs.unlink( tmp );
			flow.url = res.client._httpMessage.url;
			igneous[flow.name] = flow.url;
			flow.string = '';
			tmp = '';
		}

	};

	// tag()
	// Shortcut for igneous.tag()
	flow.tag = igneous.tag( flow );

	if( !config.test )
		flow._flow();

}