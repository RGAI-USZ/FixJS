function(e){var t={decode:function(e,t){return t&&typeof t=="string"&&(t=t.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi,""),t=t.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi,""),e.innerHTML=t,t=e.textContent,e.textContent=""),t},open:function(e,t){var n=t.createElement("iframe");n.src="about:blank",n.style.width="100%",n.style.height="100%",n.style.position="absolute",n.style.top="0px",n.style.zIndex="9999",n.style.background="#fff",n.id="iframe";var r=t.createElement("a");r.innerHTML="x",r.style.position="absolute",r.style.top="5px",r.style.left="5px",r.style.zIndex="99999",r.className="minibutton alter",r.href="javascript:;",r.onclick=function(){return window.location.reload(),!1};var i=t.createElement("a");i.innerHTML="+links",i.style.position="absolute",i.style.top="5px",location.href.indexOf("#gitHtml")==-1?i.style.left="40px":i.style.left="5px",i.style.zIndex="99999",i.className="minibutton alter",i.href="javascript:;",i.onclick=function(){this.style.cssText=this.style.cssText+";"+"color:#fff;"+"text-decoration:none;"+"text-shadow:0 -1px 0 rgba(0,0,0,0.3);"+"border-color:#518cc6;"+"border-bottom-color:#2a65a0;"+"background:#599bdc;"+"background:-moz-linear-gradient(#599bdc,#3072b3);"+"background:-webkit-linear-gradient(#599bdc,#3072b3);";var e=t.getElementById("iframe");e=e.contentDocument.document?e.contentDocument.document:e.contentDocument;var n=e.getElementsByTagName("a");for(var r=0;r<n.length;r++)n[r].onclick=function(){return location.href=this.href,!1};return!1};var s=65;if(location.href.indexOf("#gitHtml")==-1)t.body.appendChild(r),s=100;else{var o=document.createElement("link");o.type="text/css",o.rel="stylesheet",o.href="https://a248.e.akamai.net/assets.github.com/assets/github-25f0cdc450c8628e99f0aca61ea96d2e66e045c5.css",t.body.appendChild(o)}t.body.appendChild(i),t.body.appendChild(n),t.body.style.padding="0px",t.body.style.margin="0px",t.body.onkeyup=function(e){if(e.keyCode==9){var t=document.getElementsByClassName("alter");for(var n=0;n<t.length;n++)t[n].style.display=="none"?t[n].style.display="inline":t[n].style.display="none"}},t.body.innerHTML=t.body.innerHTML+'<div class="tipsy alter tipsy-w gitHtml-tip" style="display: inline; opacity: 0.8; padding: 2px 5px; margin-left: 5px; position: absolute;top: 5px;left: '+s+'px;"><div class="tipsy-arrow tipsy-arrow-w"></div><div class="tipsy-inner git-html-btn" style="max-width:400px;">&lt;tab&gt; to toggle</div></div>';var u=t.getElementById("iframe");u=u.contentWindow?u.contentWindow:u.contentDocument.document?u.contentDocument.document:u.contentDocument,u.document.open(),e.indexOf("githtml.min.js")>5&&(e='---> click the [x] on the left and try "git-html" again'),u.document.write(e),u.document.close()},start:function(e){var n={bootstrap:"http://raw.github.com/twitter/bootstrap/master/docs/assets/css/bootstrap.css"},r=e.createElement("div"),i=typeof jQuery=="undefined"?e.getElementsByTagName("pre")[0].innerHTML:$(".highlight pre").html(),s=location.href.replace(/\/blob\//,"/raw/"),o=s.replace(/\/[a-zA-Z0-9-_\.]+$/,""),u=i.replace(/<div class=[\'|\"]line/g,'\n<div class="line').replace(/(<([^>]+)>)/ig,"");u=u.replace(/http\:([a-zA-Z0-9-_\.\/]+)bootstrap[a-zA-Z0-9-_\.\/\:]+css/g,n.bootstrap),u=escape(t.decode(r,u)),location.href.indexOf("#gitHtml")==-1&&(u=u.replace(/http/g,"https")),u=u.replace(/\.html/g,".html#gitHtml"),u=unescape(u).replace(/\n/g,"--githtml-newline--").replace(/\s/g," ").replace(/--githtml-newline--/g,"\n"),t.open(unescape("%3Cbase%20href%3D%22"+escape(s)+"%22%3E")+u,e)}};t.start(e)}