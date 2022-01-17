function(e){dc._charts.push(e)},dc.hasChart=function(e){return dc._charts.indexOf(e)>=0},dc.deregisterAllCharts=function(){dc._charts=[]},dc.filterAll=function(){for(var e=0;e<dc._charts.length;++e)dc._charts[e].filterAll()},dc.renderAll=function(){for(var e=0;e<dc._charts.length;++e)dc._charts[e].render()},dc.redrawAll=function(){for(var e=0;e<dc._charts.length;++e)dc._charts[e].redraw()},dc.transition=function(e,t,n){if(t<=0)return e;var r=e.transition().duration(t);return n instanceof Function&&n(r),r},dc.units={},dc.units.integers=function(e,t){return new Array(Math.abs(t-e))},dc.round={},dc.round.floor=function(e){return Math.floor(e)},dc.baseChart=function(e){var t,n,r,i,s=200,o=200,u=750;return e.dimension=function(n){return arguments.length?(t=n,e):t},e.group=function(t){return arguments.length?(n=t,e):n},e.orderedGroup=function(){return n.order(function(e){return e.key})},e.filterAll=function(){return e.filter(null)},e.dataAreSet=function(){return t!=undefined&&n!=undefined},e.select=function(e){return i.select(e)},e.selectAll=function(e){return i.selectAll(e)},e.anchor=function(t){return arguments.length?(r=t,i=d3.select(r),e):r},e.root=function(t){return arguments.length?(i=t,e):i},e.width=function(t){return arguments.length?(s=t,e):s},e.height=function(t){return arguments.length?(o=t,e):o},e.resetSvg=function(){e.select("svg").remove()},e.generateSvg=function(){return e.root().append("svg").data([e.group().top(Infinity)]).attr("width",e.width()).attr("height",e.height())},e.turnOnReset=function(){e.select("a.reset").style("display",null)},e.turnOffReset=function(){e.select("a.reset").style("display","none")},e.transitionDuration=function(t){return arguments.length?(u=t,e):u},e.filter=function(t){return e},e.render=function(){return e},e.redraw=function(){return e},e},dc.pieChart=function(e){function d(){return d3.layout.pie().value(function(e){return e.value})}function v(e){dc.transition(c,h.transitionDuration()).attr("transform",function(t){t.innerRadius=h.innerRadius(),t.outerRadius=i;var n=e.centroid(t);return isNaN(n[0])||isNaN(n[1])?"translate(0,0)":"translate("+n+")"}).attr("text-anchor","middle").text(function(e){var t=e.data;return t.value==0?"":p(e)})}function m(e){e.innerRadius=h.innerRadius();var t=this._current;g(t)&&(t={startAngle:0,endAngle:0});var n=d3.interpolate(t,e);return this._current=n(0),function(e){return u(n(e))}}function g(e){return e==null||isNaN(e.startAngle)||isNaN(e.endAngle)}function y(e){h.filter(e.data.key),dc.redrawAll()}var t,n="pie-slice",r=d3.scale.category20c(),i=0,s=0,o,u,a,f,l,c,h=dc.baseChart({}),p=function(e){return e.data.key};return h.transitionDuration(350),h.render=function(){return h.resetSvg(),h.dataAreSet()&&(o=h.generateSvg().append("g").attr("transform","translate("+h.cx()+","+h.cy()+")"),a=d(),u=h.buildArcs(),f=h.drawSlices(o,a,u),h.drawLabels(f,u),h.highlightFilter()),h},h.innerRadius=function(e){return arguments.length?(s=e,h):s},h.colors=function(e){return arguments.length?(r=d3.scale.ordinal().range(e),h):r},h.radius=function(e){return arguments.length?(i=e,h):i},h.cx=function(){return h.width()/2},h.cy=function(){return h.height()/2},h.buildArcs=function(){return d3.svg.arc().outerRadius(i).innerRadius(s)},h.drawSlices=function(e,t,i){return f=e.selectAll("g."+n).data(t(h.orderedGroup().top(Infinity))).enter().append("g").attr("class",function(e,t){return n+" "+t}),l=f.append("path").attr("fill",function(e,t){return r(t)}).attr("d",i),l.transition().duration(h.transitionDuration()).attrTween("d",m),l.on("click",y),f},h.drawLabels=function(e,t){c=e.append("text"),v(t),c.on("click",y)},h.hasFilter=function(){return t!=null},h.filter=function(e){return arguments.length?(t=e,h.dataAreSet()&&h.dimension().filter(t),e?h.turnOnReset():h.turnOffReset(),h):t},h.isSelectedSlice=function(e){return h.filter()==e.data.key},h.highlightFilter=function(){var e=1,t=3,r=.1,i=0;h.hasFilter()?h.selectAll("g."+n).select("path").each(function(n){h.isSelectedSlice(n)?d3.select(this).attr("fill-opacity",e).attr("stroke","#ccc").attr("stroke-width",t):d3.select(this).attr("fill-opacity",r).attr("stroke-width",i)}):h.selectAll("g."+n).selectAll("path").attr("fill-opacity",e).attr("stroke-width",i)},h.redraw=function(){h.highlightFilter();var e=a(h.orderedGroup().top(Infinity));return l=l.data(e),c=c.data(e),dc.transition(l,h.transitionDuration(),function(e){e.attrTween("d",m)}),v(u),h},h.label=function(e){return p=e,h},dc.registerChart(h),h.anchor(e)},dc.barChart=function(e){function g(){h.select("g.x").remove(),o.range([0,i.width()-s.left-s.right]),a=a.scale(o).orient("bottom"),h.append("g").attr("class","axis x").attr("transform","translate("+s.left+","+_()+")").call(a)}function y(){h.select("g.y").remove(),u.domain([0,O()]).rangeRound([M(),0]),f=f.scale(u).orient("left").ticks(t),h.append("g").attr("class","axis y").attr("transform","translate("+s.left+","+s.top+")").call(f)}function b(){v.on("brushstart",w).on("brush",E).on("brushend",S);var e=h.append("g").attr("class","brush").attr("transform","translate("+s.left+",0)").call(v.x(o));e.selectAll("rect").attr("height",_()),e.selectAll(".resize").append("path").attr("d",D),d&&L()}function w(e){}function E(e){var t=v.extent();m&&(t[0]=t.map(m)[0],t[1]=t.map(m)[1],h.select(".brush").call(v.extent(t))),i.filter([v.extent()[0],v.extent()[1]]),dc.redrawAll()}function S(e){}function x(){p=h.selectAll("rect.bar").data(i.group().all()),p.enter().append("rect").attr("class","bar").attr("x",function(e){return N(e)}).attr("y",_()).attr("width",function(){return T()}),dc.transition(p,i.transitionDuration()).attr("y",function(e){return C(e)}).attr("height",function(e){return k(e)}),dc.transition(p,i.transitionDuration()).attr("y",function(e){return C(e)}).attr("height",function(e){return k(e)}),dc.transition(p.exit(),i.transitionDuration()).attr("y",_()).attr("height",0)}function T(){var e=Math.floor(i.axisXLength()/c(o.domain()[0],o.domain()[1]).length);if(isNaN(e)||e<n)e=n;return e}function N(e){return o(e.key)+s.left}function C(e){return s.top+u(e.value)}function k(e){return M()-u(e.value)-r}function L(){d&&v.empty()&&v.extent(d);var e=h.select("g.brush");e.call(v.x(o)),e.selectAll("rect").attr("height",_()),A()}function A(){if(!v.empty()&&v.extent()!=null){var e=v.extent()[0],t=v.extent()[1];p.classed("deselected",function(n){return n.key<e||n.key>=t})}else p.classed("deselected",!1)}function O(){return i.group().orderNatural().top(1)[0].value}function M(){return i.height()-s.top-s.bottom}function _(){return i.height()-s.bottom}function D(e){var t=+(e=="e"),n=t?1:-1,r=_()/3;return"M"+.5*n+","+r+"A6,6 0 0 "+t+" "+6.5*n+","+(r+6)+"V"+(2*r-6)+"A6,6 0 0 "+t+" "+.5*n+","+2*r+"Z"+"M"+2.5*n+","+(r+8)+"V"+(2*r-8)+"M"+4.5*n+","+(r+8)+"V"+(2*r-8)}var t=5,n=1,r=1,i=dc.baseChart({}),s={top:10,right:50,bottom:30,left:20},o,u=d3.scale.linear().range([100,0]),a=d3.svg.axis(),f=d3.svg.axis(),l=!1,c=dc.units.integers,h,p,d,v=d3.svg.brush(),m;return i.transitionDuration(500),i.render=function(){return i.resetSvg(),i.dataAreSet()&&(h=i.generateSvg().append("g").attr("transform","translate("+s.left+","+s.top+")"),g(),y(),x(),b()),i},i.redraw=function(){return x(),L(),l&&y(),i},i.axisXLength=function(){return i.width()-i.margins().left-i.margins().right},i.filter=function(e){return e?(d=e,v.extent(e),i.dimension().filterRange(e),i.turnOnReset()):(d=null,v.clear(),i.dimension().filterAll(),i.turnOffReset()),i},i.margins=function(e){return arguments.length?(s=e,i):s},i.x=function(e){return arguments.length?(o=e,i):o},i.y=function(e){return arguments.length?(u=e,i):u},i.xUnits=function(e){return arguments.length?(c=e,i):c},i.axisX=function(e){return arguments.length?(a=e,i):a},i.axisY=function(e){return arguments.length?(f=e,i):f},i.round=function(e){return arguments.length?(m=e,i):m},i.elasticAxisY=function(e){return arguments.length?(l=e,i):l},dc.registerChart(i),i.anchor(e)},dc.dataCount=function(e){var t=d3.format(",d"),n=dc.baseChart({});return n.render=function(){return n.selectAll(".total-count").text(t(n.dimension().size())),n.selectAll(".filter-count").text(t(n.group().value())),n},n.redraw=function(){return n.render()},dc.registerChart(n),n.anchor(e)},dc.dataTable=function(e){function u(){var e=t.root().selectAll("div.group").data(a(),function(e){return e.key});return e.enter().append("div").attr("class","group").append("span").attr("class","label").text(function(e){return e.key}),e.exit().remove(),e}function a(){o||(o=crossfilter.quicksort.by(i));var e=t.dimension().top(n);return d3.nest().key(t.group()).sortKeys(s).entries(o(e,0,e.length))}function f(e){var t=e.order().selectAll("div.row").data(function(e){return e.values}),n=t.enter().append("div").attr("class","row");for(var i=0;i<r.length;++i){var s=r[i];n.append("span").attr("class","column "+i).text(function(e){return s(e)})}return t.exit().remove(),t}var t=dc.baseChart({}),n=25,r=[],i=function(e){return e},s=d3.ascending,o;return t.render=function(){return t.selectAll("div.row").remove(),f(u()),t},t.redraw=function(){return t.render()},t.size=function(e){return arguments.length?(n=e,t):n},t.columns=function(e){return arguments.length?(r=e,t):r},t.sortBy=function(e){return arguments.length?(i=e,t):i},t.order=function(e){return arguments.length?(s=e,t):s},dc.registerChart(t),t.anchor(e)}