function(p){return this.data[p];},setProperty:function(p,data){if(this.data[p]===data)
return;this.data[p]=data;this.changeEvent.fire(this);if(this.autoSave)
this.save();return this;},load:function(){console.log("TODO: extend the load() method");return this;},save:function(){console.log("TODO: extend the save() method");return this;}});joProperty=function(datasource,p){joDataSource.call(this);this.changeEvent=new joSubject(this);datasource.changeEvent.subscribe(this.onSourceChange,this);this.datasource=datasource;this.p=p;};joProperty.extend(joDataSource,{