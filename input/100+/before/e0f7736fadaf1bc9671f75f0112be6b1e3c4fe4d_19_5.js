function(){a(this).hasClass("list-focus")&&i.showList()}).bind("mousedown.datalistWidget",function(){(this==l.activeElement||a(this).is(":focus"))&&i.showList()}).bind("blur.datalistWidget",this.timedHide);a(this.datalist).unbind("updateDatalist.datalistWidget").bind("updateDatalist.datalistWidget",a.proxy(this,"_resetListCached"));this._resetListCached();b.input.form&&b.input.id&&a(b.input.form).bind("submit.datalistWidget"+b.input.id,function(){var g=a.prop(b.input,
"value"),c=(b.input.name||b.input.id)+a.prop(b.input,"type");if(!i.storedOptions)i.storedOptions=w(c);if(g&&-1==i.storedOptions.indexOf(g)&&(i.storedOptions.push(g),g=i.storedOptions,c)){g=g||[];try{localStorage.setItem("storedDatalistOptions"+c,JSON.stringify(g))}catch(p){}}});a(o).bind("unload",function(){i.destroy()}