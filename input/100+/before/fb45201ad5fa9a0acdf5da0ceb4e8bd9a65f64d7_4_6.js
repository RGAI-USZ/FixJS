function(){this.sessionHeader=null;this.SESSION_HEADER="App-Session"},sforce.Client.prototype.ajax=function(a,b,d,c,e,f){var g=this;$j.ajax({type:a,url:b,processData:!0,data:d,dataType:"json",success:c,error:e,complete:f,beforeSend:function(a){g.sessionHeader&&a.setRequestHeader(g.SESSION_HEADER,g.sessionHeader)}})},sforce.Client.prototype.setSessionHeader=function(a){this.sessionHeader=a}