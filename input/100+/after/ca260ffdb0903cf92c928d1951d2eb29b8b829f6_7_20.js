function(e){this.data=(this.container.value)?this.container.value:this.container.innerHTML;joEvent.stop(e);if(this.enabled){this.blur();this.changeEvent.fire(this.data);}},focus:function(e){if(!this.enabled)
return;joDOM.addCSSClass(this.container,'focus');if(!e)
this.container.focus();return this;},setValue:function(value){this.value=value;this.changeEvent.fire(value);return this;},getValue:function(){return this.value;},blur:function(){joDOM.removeCSSClass(this.container,'focus');return this;},setDataSource:function(source){this.dataSource=source;source.changeEvent.subscribe(this.setData,this);var data=source.getData();this.setData((data!=='undefined')?data:null);this.changeEvent.subscribe(source.setData,source);return this;},setValueSource:function(source){this.valueSource=source;source.changeEvent.subscribe(this.setValue,this);var value=source.getData();this.setValue((value!=='undefined')?value:null);this.selectEvent.subscribe(source.setData,source);return this;}});joButton=function(data,classname){