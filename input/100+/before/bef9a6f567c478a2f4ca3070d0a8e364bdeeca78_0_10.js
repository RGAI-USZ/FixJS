function(){this.node.innerHTML=Tr8n.SDK.Proxy.translate(this.label,this.description,this.tokens,this.options)}};Tr8n.SDK.TML.Token=function(a,b){this.node=a;this.type=(this.type=this.node.attributes.type)?this.type.value:"data";this.name=(this.name=this.node.attributes.name)?this.name.value:"unknown";this.name=this.name.toLowerCase();this.context=(this.context=this.node.attributes.context)?this.context.value:null;this.content="";for(var c=0;c<this.node.childNodes.length;c++){var d=this.node.childNodes[c];if(3==d.nodeType)b[this.name]=a.attributes.context&&"gender"==a.attributes.context.nodeValue?{subject:a.attributes.value.nodeValue,
value:Tr8n.Utils.trim(d.nodeValue)}:Tr8n.Utils.trim(d.nodeValue);else{var f=d.nodeName.toLowerCase(),e=[];d.attributes.style&&e.push("style='"+d.attributes.style.nodeValue+"'");d.attributes["class"]&&e.push("class='"+d.attributes["class"].nodeValue+"'");b[this.name]="<"+f+" "+e.join(" ")+">{$0}</"+f+">";this.content="";for(f=0;f<d.childNodes.length;f++)e=d.childNodes[f],3==e.nodeType?this.content=Tr8n.Utils.trim(this.content)+" "+Tr8n.Utils.trim(e.nodeValue):"TML:TOKEN"==e.nodeName&&(e=new Tr8n.SDK.TML.Token(e,
b),this.content=Tr8n.Utils.trim(this.content)+" "+e.toTokenString())}}this.content=this.content.replace(/\n/g,"");this.content=Tr8n.Utils.trim(this.content)};Tr8n.SDK.TML.Token.prototype={toTokenString:function(){return"data"==this.type?"{"+this.name+"}":"["+this.name+": "+this.content+"]"}};Tr8n.UI.LanguageSelector={options:{},keyboardMode:!1,loaded:!1,container:null,init:function(a){this.options=a||{};this.loaded=this.keyboardMode=!1;this.container=document.createElement("div");this.container.className="tr8n_language_selector";this.container.id="tr8n_language_selector";this.container.style.display="none";document.body.appendChild(this.container)},toggle:function(){"none"==this.container.style.display?this.show():this.hide()},hide:function(){this.container.style.display="none";Tr8n.Utils.showFlash()}