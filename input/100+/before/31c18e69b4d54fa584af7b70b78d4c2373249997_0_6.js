function(f,d){var e=b._createColumn(f);a[d]=e;c[d]=e});a.push(f);b.set("emptyColumn",f)},getColumns:function(){return this.get("columns")},getColumnsWidth:function(){var b=this.getColumns(),a=0;e.each(b,function(b){b.get("visible")&&(a+=b.get("el").outerWidth())});return a},getColumnByIndex:function(b){return this.getColumns()[b]},getColumnById:function(b){var a=this.getColumns(),c=null;e.each(a,function(a){if(a.get("id")===b)return c=
a,!1});return c},getColumnIndex:function(b){var a=this.getColumns();return e.indexOf(b,a)},scrollTo:function(b){this.get("view").scrollTo(b)},_bindColumnsEvent:function(){var b=this;b.on("afterWidthChange",function(a){a.target!==b&&b.setTableWidth()});b.on("afterVisibleChange",function(a){a.target!==b&&b.setTableWidth()});b.on("afterSortStateChange",function(a){var c=a.target,f=b.getColumns();a.newVal&&e.each(f,function(a){a!==c&&a.set("sortState","")})});b.on("add",function(){b.setTableWidth()}