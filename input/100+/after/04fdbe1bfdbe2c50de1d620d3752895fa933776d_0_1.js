function(A,B){Roo.tree.TreeDragZone.superclass.constructor.call(this,A.getTreeEl(),B);this.tree=A;};Roo.extend(Roo.tree.TreeDragZone,Roo.dd.DragZone,{ddGroup:"TreeDD",onBeforeDrag:function(A,e){var n=A.node;return n&&n.draggable&&!n.disabled;},onInitDrag:function(e){var A=this.dragData;this.tree.getSelectionModel().select(A.node);this.proxy.update("");A.node.ui.appendDDGhost(this.proxy.ghost.dom);this.tree.fireEvent("startdrag",this.tree,A.node,e);},getRepairXY:function(e,A){return A.node.ui.getDDRepairXY();},onEndDrag:function(A,e){this.tree.fireEvent("enddrag",this.tree,A.node,e);if(this.scroller!==false){Roo.log('clear scroller');window.clearInterval(this.scroller);this.scroller=false;}},onValidDrop:function(dd,e,id){this.tree.fireEvent("dragdrop",this.tree,this.dragData.node,dd,e);this.hideProxy();},beforeInvalidDrop:function(e,id){var sm=this.tree.getSelectionModel();sm.clearSelections();sm.select(this.dragData.node);},autoScroll:function(x,y,h,w){Roo.log("drop zone - autoscroll called");Roo.log(this.scroll?"scroll=y":"scroll=m");if(this.scroll){var A=Roo.lib.Dom.getViewWidth();var B=Roo.lib.Dom.getViewHeight();var st=this.DDM.getScrollTop();var sl=this.DDM.getScrollLeft();var C=h+y;var D=w+x;var E=(A+st-y-this.deltaY);var F=(B+sl-x-this.deltaX);var G=40;var H=(document.all)?80:30;if(C>A&&E<G){window.scrollTo(sl,st+H);}if(y<st&&st>0&&y-st<G){window.scrollTo(sl,st-H);}if(D>B&&F<G){window.scrollTo(sl+H,st);}if(x<sl&&sl>0&&x-sl<G){window.scrollTo(sl-H,st);}}}}