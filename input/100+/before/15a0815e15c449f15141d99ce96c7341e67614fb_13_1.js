function(){e.destroy()}a(this.input).attr("autocomplete",b)},_resetListCached:function(a){var c=this,d;this.needsUpdate=!0;this.lastUpdatedValue=!1;this.lastUnfoundValue="";this.updateTimer||(n.QUnit||(d=a&&q.activeElement==c.input)?c.updateListOptions(d):g.ready("WINDOWLOAD",function(){c.updateTimer=setTimeout(function(){c.updateListOptions();c=null;o=1},200+100*o)}))},updateListOptions:function(b){this.needsUpdate=!1;clearTimeout(this.updateTimer);this.updateTimer=!1;this.shadowList.css({fontSize:a.curCSS(this.input,