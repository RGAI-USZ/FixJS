function(e,t){function n(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])}function r(e,t){for(var n in t)t.hasOwnProperty(n)&&(e.style[n]=t[n])}function i(t,n){var r=t,i=null;return e.getComputedStyle?i=document.defaultView.getComputedStyle(r,null).getPropertyValue(n):r.currentStyle&&(i=r.currentStyle[n]),i}function s(e,t,n){var s={},o;if(t==="save"){for(o in n)n.hasOwnProperty(o)&&(s[o]=i(e,o));r(e,n)}else t==="apply"&&r(e,n);return s}function o(e){var t=parseInt(i(e,"border-left-width"),10)+parseInt(i(e,"border-right-width"),10),n=parseInt(i(e,"padding-left"),10)+parseInt(i(e,"padding-right"),10),r=e.offsetWidth,s;return isNaN(t)&&(t=0),s=t+n+r,s}function u(e){var t=parseInt(i(e,"border-top-width"),10)+parseInt(i(e,"border-bottom-width"),10),n=parseInt(i(e,"padding-top"),10)+parseInt(i(e,"padding-bottom"),10),r=e.offsetHeight,s;return isNaN(t)&&(t=0),s=t+n+r,s}function a(e,t,r){r=r||"";var i=t.getElementsByTagName("head")[0],s=t.createElement("link");n(s,{type:"text/css",id:r,rel:"stylesheet",href:e,name:e,media:"screen"}),i.appendChild(s)}function f(e,t,n){e.className=e.className.replace(t,n)}function l(e){return e.contentDocument||e.contentWindow.document}function c(e){var t;return document.body.innerText?t=e.innerText:(t=e.innerHTML.replace(/<br>/gi,"\n"),t=t.replace(/<(?:.|\n)*?>/gm,""),t=t.replace(/&lt;/gi,"<"),t=t.replace(/&gt;/gi,">")),t}function h(e,t){return document.body.innerText?e.innerText=t:e.innerHTML=t.replace(/\n/g,"<br>"),!0}function p(){var e=-1,t=navigator.userAgent,n;return navigator.appName=="Microsoft Internet Explorer"&&(n=/MSIE ([0-9]{1,}[\.0-9]{0,})/,n.exec(t)!=null&&(e=parseFloat(RegExp.$1,10))),e}function d(){var t=e.navigator;return t.userAgent.indexOf("Safari")>-1&&t.userAgent.indexOf("Chrome")==-1}function v(e){var t={};return e&&t.toString.call(e)==="[object Function]"}function m(){var e=arguments[0]||{},n=1,r=arguments.length,i=!1,s,o,u,a;typeof e=="boolean"&&(i=e,e=arguments[1]||{},n=2),typeof e!="object"&&!v(e)&&(e={}),r===n&&(e=this,--n);for(;n<r;n++)if((s=arguments[n])!=null)for(o in s)if(s.hasOwnProperty(o)){u=e[o],a=s[o];if(e===a)continue;i&&a&&typeof a=="object"&&!a.nodeType?e[o]=m(i,u||(a.length!=null?[]:{}),a):a!==t&&(e[o]=a)}return e}function g(e){var n=this,r=e||{},i,s,o={container:"epiceditor",basePath:"epiceditor",clientSideStorage:!0,localStorageName:"epiceditor",useNativeFullscreen:!0,file:{name:null,defaultContent:"",autoSave:100},theme:{base:"/themes/base/epiceditor.css",preview:"/themes/preview/github.css",editor:"/themes/editor/epic-dark.css"},focusOnLoad:!1,shortcut:{modifier:18,fullscreen:70,preview:80},parser:typeof marked=="function"?marked:null},u;n.settings=m(!0,o,r);if(typeof n.settings.parser!="function"||typeof n.settings.parser("TEST")!="string")n.settings.parser=function(e){return e};return typeof n.settings.container=="string"?n.element=document.getElementById(n.settings.container):typeof n.settings.container=="object"&&(n.element=n.settings.container),n.settings.file.name||(typeof n.settings.container=="string"?n.settings.file.name=n.settings.container:typeof n.settings.container=="object"&&(n.element.id?n.settings.file.name=n.element.id:(g._data.unnamedEditors||(g._data.unnamedEditors=[]),g._data.unnamedEditors.push(n),n.settings.file.name="__epiceditor-untitled-"+g._data.unnamedEditors.length))),n._instanceId="epiceditor-"+Math.round(Math.random()*1e5),n._storage={},n._canSave=!0,n._defaultFileSchema=function(){return{content:n.settings.file.defaultContent,created:new Date,modified:new Date}},localStorage&&n.settings.clientSideStorage&&(this._storage=localStorage,this._storage[n.settings.localStorageName]&&n.getFiles(n.settings.file.name)===t&&(s=n.getFiles(n.settings.file.name),s=n._defaultFileSchema(),s.content=n.settings.file.defaultContent)),this._storage[n.settings.localStorageName]||(u={},u[n.settings.file.name]=n._defaultFileSchema(),u=JSON.stringify(u),this._storage[n.settings.localStorageName]=u),n._eeState={fullscreen:!1,preview:!1,edit:!1,loaded:!1,unloaded:!1},n.events||(n.events={}),this}g.prototype.load=function(t){function M(e){for(var t=0;t<e.length;t++)e[t].style.width=n.element.offsetWidth-v+"px",e[t].style.height=n.element.offsetHeight-m+"px"}function _(e){v=o(n.element)-n.element.offsetWidth;for(var t=0;t<e.length;t++)e[t].style.width=n.element.offsetWidth-v+"px"}function D(t){if(Math.abs(E.y-t.pageY)>=5||Math.abs(E.x-t.pageX)>=5)y.style.display="block",b&&clearTimeout(b),b=e.setTimeout(function(){y.style.display="none"},1e3);E={y:t.pageY,x:t.pageX}}function P(e){e.keyCode==n.settings.shortcut.modifier&&(k=!0),e.keyCode==17&&(L=!0),k===!0&&e.keyCode==n.settings.shortcut.preview&&!n.is("fullscreen")&&(e.preventDefault(),n.is("edit")?n.preview():n.edit()),k===!0&&e.keyCode==n.settings.shortcut.fullscreen&&(e.preventDefault(),n._goFullscreen(C)),k===!0&&e.keyCode!==n.settings.shortcut.modifier&&(k=!1),e.keyCode==27&&n.is("fullscreen")&&n._exitFullscreen(C),L===!0&&e.keyCode==83&&(n.save(),e.preventDefault(),L=!1),e.metaKey&&e.keyCode==83&&(n.save(),e.preventDefault())}function H(e){e.keyCode==n.settings.shortcut.modifier&&(k=!1),e.keyCode==17&&(L=!1)}if(this.is("loaded"))return this;var n=this,f,c,h,v,m,g,y,b,w,E={y:-1,x:-1},S,x,T=!1,N,C,k=!1,L=!1,A,O;n.settings.useNativeFullscreen&&(T=document.body.webkitRequestFullScreen?!0:!1),d()&&(T=!1),!n.is("edit")&&!n.is("preview")&&(n._eeState.edit=!0),t=t||function(){},f={chrome:'<div id="epiceditor-wrapper" class="epiceditor-edit-mode"><iframe frameborder="0" id="epiceditor-editor-frame"></iframe><iframe frameborder="0" id="epiceditor-previewer-frame"></iframe><div id="epiceditor-utilbar"><img width="30" src="'+this.settings.basePath+'/images/preview.png" title="Toggle Preview Mode" class="epiceditor-toggle-btn epiceditor-toggle-preview-btn"> '+'<img width="30" src="'+this.settings.basePath+'/images/edit.png" title="Toggle Edit Mode" class="epiceditor-toggle-btn epiceditor-toggle-edit-btn"> '+'<img width="30" src="'+this.settings.basePath+'/images/fullscreen.png" title="Enter Fullscreen" class="epiceditor-fullscreen-btn">'+"</div>"+"</div>",previewer:'<div id="epiceditor-preview"></div>'},n.element.innerHTML='<iframe scrolling="no" frameborder="0" id= "'+n._instanceId+'"></iframe>',c=document.getElementById(n._instanceId),n.iframeElement=c,n.iframe=l(c),n.iframe.open(),n.iframe.write(f.chrome),n.editorIframe=n.iframe.getElementById("epiceditor-editor-frame"),n.previewerIframe=n.iframe.getElementById("epiceditor-previewer-frame"),n.editorIframeDocument=l(n.editorIframe),n.editorIframeDocument.open(),n.editorIframeDocument.write(""),n.editorIframeDocument.close(),n.previewerIframeDocument=l(n.previewerIframe),n.previewerIframeDocument.open(),n.previewerIframeDocument.write(f.previewer),h=n.previewerIframeDocument.createElement("base"),h.target="_blank",n.previewerIframeDocument.getElementsByTagName("head")[0].appendChild(h),n.previewerIframeDocument.close(),v=o(n.element)-n.element.offsetWidth,m=u(n.element)-n.element.offsetHeight,N=[n.iframeElement,n.editorIframe,n.previewerIframe],M(N),a(n.settings.basePath+n.settings.theme.base,n.iframe,"theme"),a(n.settings.basePath+n.settings.theme.editor,n.editorIframeDocument,"theme"),a(n.settings.basePath+n.settings.theme.preview,n.previewerIframeDocument,"theme"),n.iframe.getElementById("epiceditor-wrapper").style.position="relative",n.editor=n.editorIframeDocument.body,n.previewer=n.previewerIframeDocument.getElementById("epiceditor-preview"),n.editor.contentEditable=!0,n.iframe.body.style.height=this.element.offsetHeight+"px",this.previewerIframe.style.display="none",p()>-1&&(this.previewer.style.height=parseInt(i(this.previewer,"height"),10)+2),this.open(n.settings.file.name),n.settings.focusOnLoad&&n.iframe.addEventListener("readystatechange",function(){n.iframe.readyState=="complete"&&n.editorIframeDocument.body.focus()}),g=n.iframe.getElementById("epiceditor-utilbar"),S={},n._goFullscreen=function(t){if(n.is("fullscreen")){n._exitFullscreen(t);return}T&&t.webkitRequestFullScreen(),x=n.is("edit"),n._eeState.fullscreen=!0,n._eeState.edit=!0,n._eeState.preview=!0;var r=e.innerWidth,o=e.innerHeight,u=e.outerWidth,a=e.outerHeight;T||(a=e.innerHeight),S.editorIframe=s(n.editorIframe,"save",{width:u/2+"px",height:a+"px","float":"left",cssFloat:"left",styleFloat:"left",display:"block"}),S.previewerIframe=s(n.previewerIframe,"save",{width:u/2+"px",height:a+"px","float":"right",cssFloat:"right",styleFloat:"right",display:"block"}),S.element=s(n.element,"save",{position:"fixed",top:"0",left:"0",width:"100%","z-index":"9999",zIndex:"9999",border:"none",margin:"0",background:i(n.editor,"background-color"),height:o+"px"}),S.iframeElement=s(n.iframeElement,"save",{width:u+"px",height:o+"px"}),g.style.visibility="hidden",T||(document.body.style.overflow="hidden"),n.preview(),n.editorIframeDocument.body.focus(),n.emit("fullscreenenter")},n._exitFullscreen=function(e){s(n.element,"apply",S.element),s(n.iframeElement,"apply",S.iframeElement),s(n.editorIframe,"apply",S.editorIframe),s(n.previewerIframe,"apply",S.previewerIframe),n.element.style.width="",n.element.style.height="",g.style.visibility="visible",T?document.webkitCancelFullScreen():document.body.style.overflow="auto",n._eeState.fullscreen=!1,x?n.edit():n.preview(),_(N),n.emit("fullscreenexit")},n.editor.addEventListener("keyup",function(){w&&e.clearTimeout(w),w=e.setTimeout(function(){n.is("fullscreen")&&n.preview()},250)}),C=n.iframeElement,g.addEventListener("click",function(e){var t=e.target.className;t.indexOf("epiceditor-toggle-preview-btn")>-1?n.preview():t.indexOf("epiceditor-toggle-edit-btn")>-1?n.edit():t.indexOf("epiceditor-fullscreen-btn")>-1&&n._goFullscreen(C)}),document.body.webkitRequestFullScreen&&C.addEventListener("webkitfullscreenchange",function(){document.webkitIsFullScreen||n._exitFullscreen(C)},!1),y=n.iframe.getElementById("epiceditor-utilbar"),y.style.display="none",y.addEventListener("mouseover",function(){b&&clearTimeout(b)}),A=[n.previewerIframeDocument,n.editorIframeDocument];for(O=0;O<A.length;O++)A[O].addEventListener("mousemove",function(e){D(e)}),A[O].addEventListener("scroll",function(e){D(e)}),A[O].addEventListener("keyup",function(e){H(e)}),A[O].addEventListener("keydown",function(e){P(e)});return n.settings.file.autoSave&&(n.saveInterval=e.setInterval(function(){if(!n._canSave)return;n.save()},n.settings.file.autoSave)),e.addEventListener("resize",function(){!n.iframe.webkitRequestFullScreen&&n.is("fullscreen")?(r(n.iframeElement,{width:e.outerWidth+"px",height:e.innerHeight+"px"}),r(n.element,{height:e.innerHeight+"px"}),r(n.previewerIframe,{width:e.outerWidth/2+"px",height:e.innerHeight+"px"}),r(n.editorIframe,{width:e.outerWidth/2+"px",height:e.innerHeight+"px"})):n.is("fullscreen")||_(N)}),n._eeState.loaded=!0,n._eeState.unloaded=!1,n.is("preview")?n.preview():n.edit(),n.iframe.close(),t.call(this),this.emit("load"),this},g.prototype.unload=function(t){if(this.is("unloaded"))throw new Error("Editor isn't loaded");var n=this,r=e.parent.document.getElementById(n._instanceId);return r.parentNode.removeChild(r),n._eeState.loaded=!1,n._eeState.unloaded=!0,t=t||function(){},n.saveInterval&&e.clearInterval(n.saveInterval),t.call(this),n.emit("unload"),n},g.prototype.preview=function(e){var t=this;return e=e||t.settings.basePath+t.settings.theme.preview,f(t.getElement("wrapper"),"epiceditor-edit-mode","epiceditor-preview-mode"),t.previewerIframeDocument.getElementById("theme")?t.previewerIframeDocument.getElementById("theme").name!==e&&(t.previewerIframeDocument.getElementById("theme").href=e):a(e,t.previewerIframeDocument,"theme"),t.previewer.innerHTML=t.exportFile(null,"html"),t.is("fullscreen")||(t.editorIframe.style.display="none",t.previewerIframe.style.display="block",t._eeState.preview=!0,t._eeState.edit=!1,t.previewerIframe.focus()),t.emit("preview"),t},g.prototype.enterFullscreen=function(){return this.is("fullscreen")?this:(this._goFullscreen(this.iframeElement),this)},g.prototype.exitFullscreen=function(){return this.is("fullscreen")?(this._exitFullscreen(this.iframeElement),this):this},g.prototype.edit=function(){var e=this;return f(e.getElement("wrapper"),"epiceditor-preview-mode","epiceditor-edit-mode"),e._eeState.preview=!1,e._eeState.edit=!0,e.editorIframe.style.display="block",e.previewerIframe.style.display="none",e.editorIframe.focus(),e.emit("edit"),this},g.prototype.getElement=function(e){var t={container:this.element,wrapper:this.iframe.getElementById("epiceditor-wrapper"),wrapperIframe:this.iframeElement,editor:this.editorIframeDocument,editorIframe:this.editorIframe,previewer:this.previewerIframeDocument,previewerIframe:this.previewerIframe};return!t[e]||this.is("unloaded")?null:t[e]},g.prototype.is=function(e){var t=this;switch(e){case"loaded":return t._eeState.loaded;case"unloaded":return t._eeState.unloaded;case"preview":return t._eeState.preview;case"edit":return t._eeState.edit;case"fullscreen":return t._eeState.fullscreen;default:return!1}},g.prototype.open=function(e){var n=this,r=n.settings.file.defaultContent,i;return e=e||n.settings.file.name,n.settings.file.name=e,this._storage[n.settings.localStorageName]&&(i=n.getFiles(),i[e]!==t?(h(n.editor,i[e].content),n.emit("read")):(h(n.editor,r),n.save(),n.emit("create")),n.previewer.innerHTML=n.exportFile(null,"html"),n.emit("open")),this},g.prototype.save=function(){var e=this,n,r=!1,i=e.settings.file.name,s=c(this.editor);return this._canSave=!0,n=JSON.parse(this._storage[e.settings.localStorageName]),n[i]===t?n[i]=e._defaultFileSchema():s!==n[i].content&&(n[i].modified=new Date,r=!0),n[i].content=s,this._storage[e.settings.localStorageName]=JSON.stringify(n),r&&e.emit("update"),this.emit("save"),this},g.prototype.remove=function(e){var t=this,n;return e=e||t.settings.file.name,e==t.settings.file.name&&(t._canSave=!1),n=JSON.parse(this._storage[t.settings.localStorageName]),delete n[e],this._storage[t.settings.localStorageName]=JSON.stringify(n),this.emit("remove"),this},g.prototype.rename=function(e,t){var n=this,r=JSON.parse(this._storage[n.settings.localStorageName]);return r[t]=r[e],delete r[e],this._storage[n.settings.localStorageName]=JSON.stringify(r),n.open(t),this},g.prototype.importFile=function(e,n,r,i){var s=this,o=!1;return e=e||s.settings.file.name,n=n||"",r=r||"md",i=i||{},JSON.parse(this._storage[s.settings.localStorageName])[e]===t&&(o=!0),s.settings.file.name=e,h(s.editor,n),o&&s.emit("create"),s.save(),s.is("fullscreen")&&s.preview(),this},g.prototype.exportFile=function(e,n){var r=this,i,s;e=e||r.settings.file.name,n=n||"text",i=r.getFiles(e);if(i===t)return;s=i.content;switch(n){case"html":return s=s.replace(/\u00a0/g," ").replace(/&nbsp;/g," "),r.settings.parser(s);case"text":return s=s.replace(/&nbsp;/g," "),s;default:return s}},g.prototype.getFiles=function(e){var t=JSON.parse(this._storage[this.settings.localStorageName]);return e?t[e]:t},g.prototype.on=function(e,t){var n=this;return this.events[e]||(this.events[e]=[]),this.events[e].push(t),n},g.prototype.emit=function(e,t){function i(e){e.call(n,t)}var n=this,r;t=t||n.getFiles(n.settings.file.name);if(!this.events[e])return;for(r=0;r<n.events[e].length;r++)i(n.events[e][r]);return n},g.prototype.removeListener=function(e,t){var n=this;return t?this.events[e]?(this.events[e].splice(this.events[e].indexOf(t),1),n):n:(this.events[e]=[],n)},g.version="0.1.1",g._data={},e.EpicEditor=g})(window),function(){function n(e,n){return e[0][0]!=="!"?'<a href="'+f(n.href)+'"'+(n.title?' title="'+f(n.title)+'"':"")+">"+t.lexer(e[1])+"</a>":'<img src="'+f(n.href)+'" alt="'+f(e[1])+'"'+(n.title?' title="'+f(n.title)+'"':"")+">"}function s(){return i=r.pop()}function o(){switch(i.type){case"space":return"";case"hr":return"<hr>\n";case"heading":return"<h"+i.depth+">"+t.lexer(i.text)+"</h"+i.depth+">\n";case"code":return v.highlight&&(i.code=v.highlight(i.text,i.lang),i.code!=null&&i.code!==i.text&&(i.escaped=!0,i.text=i.code)),i.escaped||(i.text=f(i.text,!0)),"<pre><code"+(i.lang?' class="lang-'+i.lang+'"':"")+">"+i.text+"</code></pre>\n";case"blockquote_start":var e="";while(s().type!=="blockquote_end")e+=o();return"<blockquote>\n"+e+"</blockquote>\n";case"list_start":var n=i.ordered?"ol":"ul",e="";while(s().type!=="list_end")e+=o();return"<"+n+">\n"+e+"</"+n+">\n";case"list_item_start":var e="";while(s().type!=="list_item_end")e+=i.type==="text"?u():o();return"<li>"+e+"</li>\n";case"loose_item_start":var e="";while(s().type!=="list_item_end")e+=o();return"<li>"+e+"</li>\n";case"html":return v.sanitize?t.lexer(i.text):!i.pre&&!v.pedantic?t.lexer(i.text):i.text;case"paragraph":return"<p>"+t.lexer(i.text)+"</p>\n";case"text":return"<p>"+u()+"</p>\n"}}function u(){var e=i.text,n;while((n=r[r.length-1])&&n.type==="text")e+="\n"+s().text;return t.lexer(e)}function a(e){r=e.reverse();var t="";while(s())t+=o();return r=null,i=null,t}function f(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function l(e){var t="",n=e.length,r=0,i;for(;r<n;r++)i=e.charCodeAt(r),Math.random()>.5&&(i="x"+i.toString(16)),t+="&#"+i+";";return t}function c(){var e="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+";return e}function h(e,t){return e=e.source,t=t||"",function n(r,i){return r?(e=e.replace(r,i.source||i),n):new RegExp(e,t)}}function p(){}function d(t,n){return g(n),a(e.lexer(t))}function g(n){n||(n=m);if(v===n)return;v=n,v.gfm?(e.fences=e.gfm.fences,e.paragraph=e.gfm.paragraph,t.text=t.gfm.text,t.url=t.gfm.url):(e.fences=e.normal.fences,e.paragraph=e.normal.paragraph,t.text=t.normal.text,t.url=t.normal.url),v.pedantic?(t.em=t.pedantic.em,t.strong=t.pedantic.strong):(t.em=t.normal.em,t.strong=t.normal.strong)}var e={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:p,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,lheading:/^([^\n]+)\n *(=|-){3,} *\n*/,blockquote:/^( *>[^\n]+(\n[^\n]+)*\n*)+/,list:/^( *)(bull) [^\0]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,def:/^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,paragraph:/^([^\n]+\n?(?!body))+\n*/,text:/^[^\n]+/};e.bullet=/(?:[*+-]|\d+\.)/,e.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,e.item=h(e.item,"gm")(/bull/g,e.bullet)(),e.list=h(e.list)(/bull/g,e.bullet)("hr",/\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)(),e.html=h(e.html)("comment",/<!--[^\0]*?-->/)("closed",/<(tag)[^\0]+?<\/\1>/)("closing",/<tag(?!:\/|@)\b(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,c())(),e.paragraph=function(){var t=e.paragraph.source,n=[];return function r(t){return t=e[t]?e[t].source:t,n.push(t.replace(/(^|[^\[])\^/g,"$1")),r}("hr")("heading")("lheading")("blockquote")("<"+c())("def"),new RegExp(t.replace("body",n.join("|")))}(),e.normal={fences:e.fences,paragraph:e.paragraph},e.gfm={fences:/^ *``` *(\w+)? *\n([^\0]+?)\s*``` *(?:\n+|$)/,paragraph:/^/},e.gfm.paragraph=h(e.paragraph)("(?!","(?!"+e.gfm.fences.source.replace(/(^|[^\[])\^/g,"$1")+"|")(),e.lexer=function(t){var n=[];return n.links={},t=t.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    "),e.token(t,n,!0)},e.token=function(t,n,r){var t=t.replace(/^ +$/gm,""),i,s,o,u,a,f,l;while(t){if(o=e.newline.exec(t))t=t.substring(o[0].length),o[0].length>1&&n.push({type:"space"});if(o=e.code.exec(t)){t=t.substring(o[0].length),o=o[0].replace(/^ {4}/gm,""),n.push({type:"code",text:v.pedantic?o:o.replace(/\n+$/,"")});continue}if(o=e.fences.exec(t)){t=t.substring(o[0].length),n.push({type:"code",lang:o[1],text:o[2]});continue}if(o=e.heading.exec(t)){t=t.substring(o[0].length),n.push({type:"heading",depth:o[1].length,text:o[2]});continue}if(o=e.lheading.exec(t)){t=t.substring(o[0].length),n.push({type:"heading",depth:o[2]==="="?1:2,text:o[1]});continue}if(o=e.hr.exec(t)){t=t.substring(o[0].length),n.push({type:"hr"});continue}if(o=e.blockquote.exec(t)){t=t.substring(o[0].length),n.push({type:"blockquote_start"}),o=o[0].replace(/^ *> ?/gm,""),e.token(o,n,r),n.push({type:"blockquote_end"});continue}if(o=e.list.exec(t)){t=t.substring(o[0].length),n.push({type:"list_start",ordered:isFinite(o[2])}),o=o[0].match(e.item),i=!1,l=o.length,f=0;for(;f<l;f++)u=o[f],a=u.length,u=u.replace(/^ *([*+-]|\d+\.) +/,""),~u.indexOf("\n ")&&(a-=u.length,u=v.pedantic?u.replace(/^ {1,4}/gm,""):u.replace(new RegExp("^ {1,"+a+"}","gm"),"")),s=i||/\n\n(?!\s*$)/.test(u),f!==l-1&&(i=u[u.length-1]==="\n",s||(s=i)),n.push({type:s?"loose_item_start":"list_item_start"}),e.token(u,n),n.push({type:"list_item_end"});n.push({type:"list_end"});continue}if(o=e.html.exec(t)){t=t.substring(o[0].length),n.push({type:"html",pre:o[1]==="pre",text:o[0]});continue}if(r&&(o=e.def.exec(t))){t=t.substring(o[0].length),n.links[o[1].toLowerCase()]={href:o[2],title:o[3]};continue}if(r&&(o=e.paragraph.exec(t))){t=t.substring(o[0].length),n.push({type:"paragraph",text:o[0]});continue}if(o=e.text.exec(t)){t=t.substring(o[0].length),n.push({type:"text",text:o[0]});continue}}return n};var t={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:p,tag:/^<!--[^\0]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([^\0]+?)__(?!_)|^\*\*([^\0]+?)\*\*(?!\*)/,em:/^\b_((?:__|[^\0])+?)_\b|^\*((?:\*\*|[^\0])+?)\*(?!\*)/,code:/^(`+)([^\0]*?[^`])\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,text:/^[^\0]+?(?=[\\<!\[_*`]| {2,}\n|$)/};t._linkInside=/(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/,t._linkHref=/\s*<?([^\s]*?)>?(?:\s+['"]([^\0]*?)['"])?\s*/,t.link=h(t.link)("inside",t._linkInside)("href",t._linkHref)(),t.reflink=h(t.reflink)("inside",t._linkInside)(),t.normal={url:t.url,strong:t.strong,em:t.em,text:t.text},t.pedantic={strong:/^__(?=\S)([^\0]*?\S)__(?!_)|^\*\*(?=\S)([^\0]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([^\0]*?\S)_(?!_)|^\*(?=\S)([^\0]*?\S)\*(?!\*)/},t.gfm={url:/^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,text:/^[^\0]+?(?=[\\<!\[_*`]|https?:\/\/| {2,}\n|$)/},t.lexer=function(e){var i="",s=r.links,o,u,a,c;while(e){if(c=t.escape.exec(e)){e=e.substring(c[0].length),i+=c[1];continue}if(c=t.autolink.exec(e)){e=e.substring(c[0].length),c[2]==="@"?(u=c[1][6]===":"?l(c[1].substring(7)):l(c[1]),a=l("mailto:")+u):(u=f(c[1]),a=u),i+='<a href="'+a+'">'+u+"</a>";continue}if(c=t.url.exec(e)){e=e.substring(c[0].length),u=f(c[1]),a=u,i+='<a href="'+a+'">'+u+"</a>";continue}if(c=t.tag.exec(e)){e=e.substring(c[0].length),i+=v.sanitize?f(c[0]):c[0];continue}if(c=t.link.exec(e)){e=e.substring(c[0].length),i+=n(c,{href:c[2],title:c[3]});continue}if((c=t.reflink.exec(e))||(c=t.nolink.exec(e))){e=e.substring(c[0].length),o=(c[2]||c[1]).replace(/\s+/g," "),o=s[o.toLowerCase()];if(!o||!o.href){i+=c[0][0],e=c[0].substring(1)+e;continue}i+=n(c,o);continue}if(c=t.strong.exec(e)){e=e.substring(c[0].length),i+="<strong>"+t.lexer(c[2]||c[1])+"</strong>";continue}if(c=t.em.exec(e)){e=e.substring(c[0].length),i+="<em>"+t.lexer(c[2]||c[1])+"</em>";continue}if(c=t.code.exec(e)){e=e.substring(c[0].length),i+="<code>"+f(c[2],!0)+"</code>";continue}if(c=t.br.exec(e)){e=e.substring(c[0].length),i+="<br>";continue}if(c=t.text.exec(e)){e=e.substring(c[0].length),i+=f(c[0]);continue}}return i};var r,i;p.exec=p;var v,m;d.options=d.setOptions=function(e){return m=e,g(e),d},d.setOptions({gfm:!0,pedantic:!1,sanitize:!1,highlight:null}),d.parser=function(e,t){return g(t),a(e)},d.lexer=function(t,n){return g(n),e.lexer(t)},d.parse=d,typeof module!="undefined"?module.exports=d:this.marked=d}.call(function(){return this||(typeof window!="undefined"?window:global)}