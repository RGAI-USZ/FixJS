function(){d.destroy()}a(this.input).attr("autocomplete",b)},_resetListCached:function(a){var f=this,c;this.needsUpdate=!0;this.lastUpdatedValue=!1;this.lastUnfoundValue="";this.updateTimer||(j.QUnit||(c=a&&i.activeElement==f.input)?f.updateListOptions(c):b.ready("WINDOWLOAD",function(){f.updateTimer=setTimeout(function(){f.updateListOptions();f=null;m=1},200+100*m)}))},updateListOptions:function(b){this.needsUpdate=!1;clearTimeout(this.updateTimer);this.updateTimer=!1;this.shadowList.css({fontSize:a.css(this.input,"fontSize"),