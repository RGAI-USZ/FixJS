function(opts){var api="http://api.twitter.com/1/statuses/user_timeline.json",options={retweets:!0,replies:!1,user:"rogie",tweet:null,target:null,count:100,cacheExpire:12e4,callback:function(){},templates:{base:'<ul class="chirp">{{tweets}}</ul>',tweet:"<li>{{html}}</li>"}},ext=function(e,t){for(var n in t)n in e&&(e[n]&&e[n].constructor==Object?ext(e[n],t[n]):e[n]=t[n])},ago=function(e){var t=new Date((e||"").replace(/-/g,"/").replace(/[TZ]/g," ")),n=((new Date).getTime()-t.getTime())/1e3,r=Math.floor(n/86400);if(isNaN(r)||r<0||r>=31)return;return r==0&&(n<60&&"just now"||n<120&&"1 minute ago"||n<3600&&Math.floor(n/60)+" minutes ago"||n<7200&&"1 hour ago"||n<86400&&Math.floor(n/3600)+" hours ago")||r==1&&"Yesterday"||r<7&&r+" days ago"||r<31&&Math.ceil(r/7)+" weeks ago"},linkify=function(e){e=e.replace(/((\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]))/igm,'<a href="$1">$1</a>');return e.replace(/@([A-Za-z0-9_]+)/igm,'<a href="http://twitter.com/$1">@$1</a>')},toHTML=function(e){var t="",n=0;for(twt in e){e[twt].index=++n;e[twt].html=linkify(e[twt].text);e[twt].time_ago=ago(e[twt].created_at);t+=render(options.templates.tweet,e[twt])}return render(options.templates.base,{tweets:t})},render=function(tpl,data){var html=tpl,dotData=function(d,dotKey){return eval("d['"+dotKey.split(".").join("']['")+"']")},matches=tpl.match(/{{[^}}]*}}/igm);for(i in matches)html=html.replace(new RegExp(matches[i],"igm"),dotData(data,matches[i].replace(/{{|}}/ig,""))||"");return html},cache=function(e,t){if(!localStorage||!JSON)return null;var n=(new Date).getTime(),r=null;if(t==undefined){r=JSON.parse(localStorage.getItem(e));n-r.time<options.cacheExpire?r=r.data:r=null;return r}localStorage.setItem(e,JSON.stringify({time:n,data:t}))},get=function(){Chirp.requests=Chirp.requests==undefined?1:Chirp.requests+1;var e=document.createElement("script"),t="callback"+Chirp.requests,n=document.body.children,r=document.scripts[document.scripts.length-1],i=api+"?count="+options.count+"&include_rts="+options.retweets+"&exclude_replies="+!options.replies+"&screen_name="+options.user,s=r.parentNode.nodeName!="head";Chirp[t]=function(e,t){t!==!0&&cache(i,e);var n=document.createElement("div");n.innerHTML=toHTML(e);options.target==null?r.parentNode.insertBefore(n,r):document.getElementById(options.target).appendChild(n);options.callback.call(this,e)};if(cachedData=cache(i))Chirp[t](cachedData,!0);else{e.src=i+"&callback=Chirp."+t;document.head.appendChild(e)}};this.show=function(){get()};this.constructor!=Chirp?(new Chirp(opts)).show():opts&&opts!=undefined&&(opts.constructor==String?ext(options,{