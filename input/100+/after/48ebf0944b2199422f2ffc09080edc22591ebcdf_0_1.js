function(a,g,c,e,i,f,d){g=g||b.INTERRUPT_NONE;c==null&&(c=0);e==null&&(e=0);i==null&&(i=0);f==null&&(f=1);d==null&&(d=0);if(c==0){if(!b.beginPlaying(a,g,e,i,f,d))return false}else setTimeout(function(){b.beginPlaying(a,g,e,i,f,d)},c);this.instances.push(a);this.instanceHash[a.uniqueId]=a;return true};b.beginPlaying=function(a,b,c,e,d,h){if(!f.add(a,b))return false;
return!a.beginPlaying(c,e,d,h)?(this.instances.splice(this.instances.indexOf(a),1),delete this.instanceHash[a.uniqueId],false):true};b.checkPlugin=function(a){return b.activePlugin==null&&(a&&!b.pluginsRegistered&&b.registerPlugin(b.HTMLAudioPlugin),b.activePlugin==null)?false:true};b.getSrcFromId=function(a){return b.idHash==null||b.idHash[a]==null?a:b.idHash[a]};b.setVolume=function(a,g){if(Number(a)==null)return false;a=Math.max(0,Math.min(1,a));return b.tellAllInstances("setVolume",g,a)}