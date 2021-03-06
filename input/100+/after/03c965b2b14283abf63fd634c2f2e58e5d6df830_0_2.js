function(

	require,

	declare,

	lang,

	connect,

	DeferredList,

	template,

	Runtime,

	Workbench,

	Path,

	Metadata,

	Context,

	ModifyRuleCommand,

	SilhouetteIframe,

	URLRewrite,

	Preferences,

	widgetUtils,

	systemResource,

	XPathUtils,

	HtmlFileXPathAdapter,

	GeomUtils

){



var VisualEditor = declare("davinci.ve.VisualEditor",  null,  {



	deviceName: 'none',

	_orientation: 'portrait',

	

	constructor: function(element, pageEditor)	{

		this._pageEditor = pageEditor;

		this.contentPane = dijit.getEnclosingWidget(element);



		this.loadingDiv = dojo.create("div", {

			className: "loading",

			innerHTML: dojo.replace(

					'<table><tr><td><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;{0}</td></tr></table>',

					["Loading..."]) // FIXME: i18n

			},

			this.contentPane.domNode.parentNode,

			"first");



		dojo.addClass(this.contentPane.domNode, "fullPane");

		var silhouette_div_container = dojo.create("div", {className: "silhouette_div_container"}, this.contentPane.domNode);

		dojo.create("span", {className: "silhouetteiframe_object_container"}, silhouette_div_container);

		this.silhouetteiframe = new SilhouetteIframe({

			rootNode: silhouette_div_container,

			margin: 20

		});

		

		/* The following code provides a fix for #864: Drag/drop from widget palette

		 * not working if page canvas is scrolled. Possibly because of the funky stuff we do

		 * with width/height being 100% on HTML and BODY, both Mozilla and WebKit set

		 * the BODY height to the size of the IFRAME, and if scrolled, but (invisible)

		 * top of the BODY is shifted up off of the screen and the height of the BODY

		 * is equal to height of IFRAME, which causes an empty area at bottom of canvas

		 * where the browser will not send mouse events. To workaround this problem,

		 * extend the width/height of the BODY to be the size of the surrounding ContentPane

		 * adjusted by the amount the BODY is scrolled.

		 * 

		 * FIXME: This patch probably won't be necessary if we get rid of the "infinite canvas"

		 * and instead force user to pick a fixed-size canvas, in which case things will

		 * work like the mobile silhouettes, which don't have the problem.

		 */

		function resizeBody(bodyElem, size){

			var scrollLeft = GeomUtils.getScrollLeft(bodyElem);

			var scrollTop = GeomUtils.getScrollTop(bodyElem);

			if(scrollLeft > 0){

				bodyElem.style.width= (size.w + scrollLeft) + "px";

			}else{

				bodyElem.style.width = "100%";

			}

			if(scrollTop > 0){

				bodyElem.style.height=(size.h + scrollTop) + "px";

			}else{

				bodyElem.style.height = "100%";

			}

		}

		var visualEditor = this;

		this.contentPane.connect(this.contentPane, 'resize', function(newPos){

			// "this" is the ContentPane dijit

			var iframe = dojo.query('iframe', this.domNode)[0];

			if(iframe && iframe.contentDocument && iframe.contentDocument.body){

				var bodyElem = iframe.contentDocument.body;

				resizeBody(bodyElem, newPos);

				// Wrapped in setTimeout because sometimes browsers are quirky about

				// instantly updating the size/position values for elements

				// and things usually work if you wait for current processing thread

				// to complete. Also, updateFocusAll() can be safely called within setTimeout.

				setTimeout(function() {

					visualEditor.getContext().updateFocusAll(); 

				}, 100); 

				if(!visualEditor._scrollHandler){

					visualEditor._scrollHandler = connect.connect(iframe.contentDocument, 'onscroll', this, function(e){

						resizeBody(bodyElem, {

							w: dojo.style(this.domNode, 'width'),

							h: dojo.style(this.domNode, 'height')

						});

						// (See setTimeout comment a few lines earlier)

						setTimeout(function() {

							visualEditor.getContext().updateFocusAll(); 

						}, 100); 

					});

				}

			}

		});

		this._pageEditor.deferreds = new DeferredList(Metadata.getDeferreds());

	},

	

	getDevice: function() {

		return this.deviceName;

	},

	

	setDevice: function(deviceName) {

	    this.deviceName = deviceName;

		//FIXME: Path shouldn't be hard-coded

	    var svgfilename = deviceName == 'none' ? null : "app/preview/images/" + deviceName + ".svg";

		this.silhouetteiframe.setSVGFilename(svgfilename);

		this.getContext().setMobileTheme(deviceName);



		// #683 - When using mobile silhouette, add mobile <meta> tags to

		// document.

		this.getContext().setMobileMeta(deviceName);

		dojo.publish("/davinci/ui/deviceChanged", [deviceName]);

	},

	

	toggleOrientation: function() {

		if(this.deviceName!='none'){

			if(this._orientation == 'landscape'){

				this._orientation = 'portrait';

			}else{

				this._orientation = 'landscape';			

			}



			this.setOrientation(this._orientation);

		}

	},

	

	setOrientation: function(orientation) {

		if (this.deviceName!='none') {

			// set orientation

			this._orientation = orientation;



			//FIXME: Would be better to publish an event about orientation changing

			//and then have the toolbar widget subscribe to it and update the icon

			//But easier said than done because of the way the Workbench works.

			//Current Workbench doesn't support icons that can toggle based on

			//product state.

			var editorRootElement,

				ve = this.context && this.context.visualEditor;

			if (ve && ve._pageEditor) {

				editorRootElement = ve._pageEditor._rootElement;

			}

			var rotateIconNode = dojo.query('.rotateIcon',editorRootElement)[0];

			var ccwClass = 'rotateIconCCW';

			if(this._orientation == 'landscape'){

				dojo.addClass(rotateIconNode,ccwClass);

			}else{

				dojo.removeClass(rotateIconNode,ccwClass);

			}

			this.getContext().setMobileOrientation(this._orientation);

			this.silhouetteiframe.setOrientation(this._orientation);

			davinci.Workbench.getOpenEditor()._visualChanged();

			// Wrapped in setTimeout because sometimes browsers are quirky about

			// instantly updating the size/position values for elements

			// and things usually work if you wait for current processing thread

			// to complete. Also, updateFocusAll() can be safely called within setTimeout.

			setTimeout(function() {

				this.getContext().updateFocusAll(); 

			}.bind(this), 100); 

		}

	},



	_objectPropertiesChange: function (event){



		if (!this.isActiveEditor()) {

			return;

		}

		var context = this.getContext();

		var compoundCommand = event.compoundCommand;

		var command = event.command;

		var commandStack = context.getCommandStack();

		if(compoundCommand){

			commandStack.execute(compoundCommand);

		}else{

			commandStack.execute(command);

		}

		if(command._newId){

			var widget = widgetUtils.byId(command._newId, context.getDocument());

			context.select(widget);

		}else{

			var selection = context.getSelection();

			var widget = selection.length ? selection[selection.length - 1] : undefined;

			if(selection.length > 1){

				context.select(widget);

			}

		}

		this._srcChanged();

	},



	isActiveEditor: function(){

		var currentEditor = Runtime.currentEditor;

		return currentEditor && currentEditor.declaredClass=="davinci.ve.PageEditor" && currentEditor.visualEditor == this;

	},

	

	/**

	 * Causes property changes on the currently selected widget.

	 * Right now, only operates on the first widget in the selection.

	 * Creates and executes an appropriate StyleCommand for the operation.

	 * @param {object} value

	 *		value.appliesTo {string|object} - either 'inline' or a CSSRule object

	 *		applyToWhichStates - controls whether style change is attached to Normal or other states:

	 *			"current" => apply to currently active state

	 *			[...array of strings...] => apply to these states (may not yet be implemented)

	 *			any other value (null/undefined/"Normal"/etc) => apply to Normal state

	 *		values [object]  Array of property values. Each item in array is an object with one property

	 *						<propname>:<propvalue>, where <propname> is name of styling property and <propvalue> is value string

	 */

	_stylePropertiesChange: function (value){

		if(!this.isActiveEditor() ){

			return;

		}

		var command = this.getContext().getCommandForStyleChange(value); //#23

		if(command){

			 this.getContext().getCommandStack().execute(command);

			if(command._newId){

				var widget = widgetUtils.byId(command._newId, context.getDocument());

				this.context.select(widget);

			}

			

			this._srcChanged();

			dojo.publish("/davinci/ui/widgetValuesChanged",[value]);

		}

	},

	_srcChanged: function(){

		this.isDirty = true;

	},

	

	getContext: function(){

		return this.context;

	},



	getTemplate: function(){

		return template;

	},

	

	destroy: function () {

		if(!this._handles){

			return;

		}

		this.context.destroy();

	    this._handles.forEach(dojo.disconnect);

	    if(this._scrollHandler){

	    	dojo.disconnect(this._scrollHandler);

	    	this._scrollHandler = null;

	    }

	},

	

	setContent: function (fileName, content, newHtmlParams){

		this._onloadMessages=[];	// List of messages to present to user after loading has completed

		this._setContent(fileName, content, newHtmlParams);

	},

	

	saveAs: function (newFileName, oldFileName, content){

		

		this._setContent(newFileName, content);

	},

	

	_setContent: function(filename,content, newHtmlParams){

		this._setContentRaw(filename, content, newHtmlParams);

	},

	

	_setContentRaw: function(filename, content, newHtmlParams){

		this.fileName = filename;

		this.basePath = new Path(filename);

	   

		if (!this.initialSet){

		   	var workspaceUrl = Runtime.getUserWorkspaceUrl();

		   	if(filename.indexOf( "./")==0 ){

		   		filename = filename.substring(2,filename.length);

			}				

		   	var baseUrl=workspaceUrl+filename;



			this._handles=[];

			var containerNode = dojo.query('.silhouette_div_container',this.contentPane.domNode)[0];

			this.context = new Context({

				editor: this._pageEditor,

				visualEditor: this,

				containerNode: containerNode,

				model: content,

				baseURL: baseUrl,

				iframeattrs:{'class':'silhouetteiframe_iframe'}

			});



			this.context._commandStack=this._commandStack;

			this._commandStack._context=this.context;



			var prefs=Preferences.getPreferences('davinci.ve.editorPrefs', Workbench.getProject());

			if (prefs) {

				this.context.setPreferences(prefs);

			}



//			this._handles.push(dojo.connect(this.context, "activate", this, this.update));

			this._handles.push(dojo.connect(this.context, "onContentChange", this, this.onContentChange));

//			this._handles.push(dojo.connect(this.context, "onSelectionChange",this, this.onContentChange));

		

			this.title = dojo.doc.title;



			this.context._setSource(content, this._connectCallback, this, newHtmlParams);

	   		// set flow layout on user prefs

			var flow = this.context.getFlowLayout(); // gets the current layout, but also sets to default if missing..

			this.initialSet=true;

		}else{

			this.context.setSource(content, this.context._restoreStates, this.context);

		}



	},



	_connectCallback: function(failureInfo) {

		var context = this.context,

			popup;



		this.savePoint = 0;

		context.activate();



		popup = Workbench.createPopup({

			partID: 'davinci.ve.visualEditor',

			domNode: context.getContainerNode(), 

			keysDomNode: context.getDocument(),

			context: context

		});



		popup.adjustPosition = function(event) {

			// Adjust for the x/y position of the visual editor's IFRAME relative to the workbench

			// Adjust for the scrolled position of the document in the visual editor, since the popup menu callback assumes (0, 0)

			var coords = dojo.position(context.frameNode);

			dojo.withDoc(context.getDocument(), function(){

				var scroll = dojo.docScroll();

				coords.x -= scroll.x;

				coords.y -= scroll.y;

			});



			return coords;

		};



		// resize kludge to make Dijit visualEditor contents resize

		// seems necessary due to combination of 100%x100% layouts and extraneous width/height measurements serialized in markup

		context.getTopWidgets().forEach(function (widget) {

			if (widget.resize) {

				widget.resize();

			}

		});

		

		// At doc load time, call the routine that makes document adjustments each time

		// new widgets are added or widgets are deleted.

		context.anyDojoxMobileWidgets = undefined;

//FIXME: All occurrences of context.widgetAddedOrDeleted might need to be

//removed by br's changes to incorporate document.css into themes.

		//context.widgetAddedOrDeleted(true);

		

		// pagebuilt event triggered after converting model into dom for visual page editor

		dojo.publish('/davinci/ui/context/pagebuilt', [context]);



		if (failureInfo.errorMessage) {

			this.loadingDiv.innerHTML = failureInfo.errorMessage || "(unknown)";

		} else if (failureInfo instanceof Error) {

			var message = "Uh oh! An error has occurred:<br><b>" + failureInfo.message + "</b>";

			if (failureInfo.fileName) {

				message += "<br>file: " + failureInfo.fileName + "<br>line: " + failureInfo.lineNumber;

			}

			if (failureInfo.stack) {

				message += "<br><pre>" + failureInfo.stack + "</pre>";

			}

			this.loadingDiv.innerHTML = message;

			dojo.addClass(this.loadingDiv, 'error');

		} else {

			if (this.loadingDiv.parentNode) {

				this.loadingDiv.parentNode.removeChild(this.loadingDiv);				

			}

			delete this.loadingDiv;

		}

	},



	getSelectedWidget: function(){

		//if(this._selectedWidget)

		//	return this._selectedWidget;

		

		var context = this.getContext(),

			selection = context.getSelection(),

			widget = selection.length ? selection[selection.length - 1] : undefined;



		if(selection.length > 1){

			context.select(widget);

		}

		return widget;

	},



	getSelectedSubWidget: function(){

		return this._selectedSubWidget;

	},



	saved: function(){

		this.save();

	},



	//FIXME

	getFileEditors: function(){

		debugger;

	},

	

	save: function (isAutoSave){

		if(!this.context){	// Sometimes we do lazy initialization of Context

			return;

		}

		var model = this.context.getModel();

		model.setDirty(true);

		var visitor = {

			visit: function(node){

				if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){

					node.save(isAutoSave);

				}

				return false;

			}

		};

		

		model.visit(visitor);

		this.getContext().saveDynamicCssFiles(this.context.cssFiles, isAutoSave);

		this.isDirty=isAutoSave;

	},

	

	

	

	removeWorkingCopy: function(){ 

		/*this.removeWorkingCopyDynamicCssFiles(this.getContext()._getCssFiles());

		var visitor = {

				visit: function(node){

					if((node.elementType=="HTMLFile" || node.elementType=="CSSFile") && node.isDirty()){

						var url = node.url || node.fileName;

						systemResource.findResource(url).removeWorkingCopy();

						// node.dirtyResource = false; someone else may be editing the resource

					}

					return false;

				}

			};

		var model = this.context.getModel();	

		model.visit(visitor);*/

		//this._pageEditor.resourceFile.removeWorkingCopy();

		//this.isDirty=false;

	},

	

	getDefaultContent: function (){

		return this.getTemplate();

	},

	

	previewInBrowser: function(){

		var deviceName = this.deviceName,

			editor = Workbench.getOpenEditor(),

			fileURL = editor.resourceFile.getURL(),

			query = [];



		// FIXME. Phil, is there a URL to the working copy of the current file that we can use

		// Right now I am doing an auto-save which is not right.

		// Either we should prompt user "You must save before you can preview in browser. OK to save?"

		// or we should preview the working copy instead of the permanent file.

		editor.save();

		if(deviceName && deviceName.length && deviceName != 'none'){

			query = [

			    'preview=1',

			    'device=' + encodeURIComponent(deviceName),

			    'file=' + encodeURIComponent(fileURL)

			];

			fileURL = Workbench.location();

			if (this._orientation == 'landscape') {

				query.push('orientation=' + this._orientation);

			}

		}

		var useZazl = this.context.getPreference("zazl");

		if(useZazl !== false){

			query.push('zazl=true');

		}

		if(query.length) {

			fileURL += "?" + query.join("&");

		}

		window.open(fileURL, "preview");

	},



	/**

	 * Refresh the Visual Editor while keeping widget selection intact.

	 */

	refresh: function() {

		// save widget selection

		var context = this.context,

			xpath = XPathUtils.getXPath(context.getSelection()[0]._srcElement,

						HtmlFileXPathAdapter);



		// set new content

		context.setSource(context.model);



		// re-establish widget selection in VE

		var id = context.model.evaluate(xpath).getAttribute('id'),

			widget = widgetUtils.byId(id, context.getDocument());

		setTimeout(function() {

			// XXX Sometimes, after resetting the source, the DOM takes some time

			// to get set (#1102).  Unfortunately, I still haven't found an

			// event that I can attach/listen to to see if the DOM is ready.

			// Instead, just use a setTimeout.

			context.select(widget);

		},0);

	}



});



return VisualEditor;



}