function(){document.addEventListener("DOMContentLoaded",z,false);var y=3.141592653589793;var j=2*y;var x=y/2;var q=this.WebGL2D=function q(B){this.canvas=B;this.gl=undefined;this.fs=undefined;this.vs=undefined;this.shaderProgram=undefined;this.transform=new u();this.shaderPool=[];this.maxTextureSize=undefined;B.gl2d=this;B.$getContext=B.getContext;B.oGetContext=B.getContext;B.getContext=(function(C){return function(D){if(C.gl){return C.gl}if(D==="2d"&&!(B.width===0||B.height===0)){var G=C.gl=C.canvas.$getContext("webgl",{alpha:false})||C.canvas.$getContext("experimental-webgl",{alpha:false});if((typeof(G)==="undefined")||(G===null)){return C.canvas.$getContext("2d")}try{C.initShaders();C.initBuffers()}catch(F){var H=document.createElement("canvas");H.width=C.canvas.width;H.height=C.canvas.height;H.id=C.canvas.id;H.onclick=function(){this.focus()};var E=C.canvas.parentNode;E.removeChild(C.canvas);E.insertBefore(H,E.firstChild);window.onload();return H.getContext("2d")}C.initCanvas2DAPI();G.viewport(0,0,C.canvas.width,C.canvas.height);G.clearColor(0,0,0,1);G.clear(G.COLOR_BUFFER_BIT);G.enable(G.BLEND);G.blendFunc(G.SRC_ALPHA,G.ONE_MINUS_SRC_ALPHA);C.maxTextureSize=G.getParameter(G.MAX_TEXTURE_SIZE);gxtkGraphics.prototype.DrawSurface=function(J,I,K){if(!J.image.complete){return}this.gc.drawImage(J.image,I,K)};gxtkGraphics.prototype.DrawSurface2=function(J,I,O,L,K,M,N){if(!J.image.complete){return}if(M<0){L+=M;M=-M}if(N<0){K+=N;N=-N}if(M<=0||N<=0){return}this.gc.drawImage(J.image,L,K,M,N,I,O,M,N)};gxtkGraphics.prototype.SetScissor=function(I,L,J,K){if(I!==0||L!==0||J!==C.canvas.width||K!==C.canvas.height){G.enable(G.SCISSOR_TEST);L=C.canvas.height-L-K;G.scissor(I,L,J,K)}else{G.disable(G.SCISSOR_TEST)}};return G}else{return C.canvas.$getContext(D)}}}(this))};q.prototype.initCanvas2DAPI=function f(){var af=this,Y=this.gl;var K=1,Q=1,B=1;var G=1,X="source-over";Object.defineProperty(Y,"fillStyle",{get:function(){return"rgb("+(r*255)+", "+(g*255)+", "+(b*255)+")"},set:function(aj){var ai=aj.slice(4,-1).split(",");K=ai[0]>=255?1:ai[0]/255;Q=ai[1]>=255?1:ai[1]/255;B=ai[2]>=255?1:ai[2]/255}});Object.defineProperty(Y,"strokeStyle",{get:function(){return"rgb("+(r*255)+", "+(g*255)+", "+(b*255)+")"},set:function(ai){}});Object.defineProperty(Y,"globalAlpha",{get:function(){return G},set:function(ai){G=ai}});Object.defineProperty(Y,"globalCompositeOperation",{get:function(){return X},set:function(ai){if(X===ai){return}if(ai==="lighter"){Y.blendFunc(Y.SRC_ALPHA,Y.ONE)}else{Y.blendFunc(Y.SRC_ALPHA,Y.ONE_MINUS_SRC_ALPHA)}X=ai}});Y.save=function ab(){af.transform.pushMatrix()};Y.restore=function aa(){af.transform.popMatrix()};Y.translate=function R(ai,aj){af.transform.translate(ai,aj)};Y.rotate=function Z(ai){af.transform.rotate(ai)};Y.scale=function ag(ai,aj){af.transform.scale(ai,aj)};Y.transform=function S(am,al,ao,an,ak,aj){var ai=af.transform.m_stack[af.transform.c_stack];ai[0]=am;ai[1]=al;ai[3]=ao;ai[4]=an;ai[6]=ak;ai[7]=aj};function P(al){var ai=af.transform.m_stack;for(var ak=0,aj=af.transform.c_stack+1;ak<aj;++ak){Y.uniformMatrix3fv(al.uTransforms[ak],false,ai[aj-1-ak])}}Y.setTransform=function F(al,ak,an,am,aj,ai){af.transform.setIdentity();Y.transform.apply(this,arguments)};Y.fillRect=function O(aj,an,al,ai){var ak=af.transform;var am=af.initShaders(ak.c_stack+2,0);Y.bindBuffer(Y.ARRAY_BUFFER,o);Y.vertexAttribPointer(am.vertexPositionAttribute,4,Y.FLOAT,false,0,0);ak.pushMatrix();ak.translate(aj,an);ak.scale(al,ai);P(am);Y.uniform4f(am.uColor,K,Q,B,G);Y.drawArrays(Y.TRIANGLE_FAN,0,4);ak.popMatrix()};var H=[];function N(ai,aj){this.closed=false;this.verts=[ai,aj,0,0]}Y.beginPath=function ah(){H.length=0};Y.closePath=function E(){if(H.length){var ak=H[H.length-1],aj=ak.verts[0],ai=ak.verts[1];ak.closed=true;var al=new N(aj,ai);H.push(al)}};Y.moveTo=function U(ai,aj){H.push(new N(ai,aj))};Y.lineTo=function T(ai,aj){if(H.length){H[H.length-1].verts.push(ai,aj,0,0)}else{Y.moveTo(ai,aj)}};Y.rect=function C(ai,al,aj,ak){Y.moveTo(ai,al);Y.lineTo(ai+aj,al);Y.lineTo(ai+aj,al+ak);Y.lineTo(ai,al+ak);Y.closePath()};Y.arc=function M(ap,ao,am,an,aj,ak){if(!H.length){Y.moveTo(ap,ao+am);var ai=x*0.1;var aq=H[0].verts;for(var al=ai;al<j;al+=ai){aq.push(ap+Math.sin(al)*am,ao+Math.cos(al)*am,0,0)}}else{var ai=x*0.1;var aq=H[H.length-1].verts;for(var al=0;al<360;al+=ai){aq.push(ap+Math.sin(al)*am,ao+Math.cos(al)*am,0,0)}}};function ac(ak){var aj=af.transform;var am=af.initShaders(aj.c_stack+2,0);var ai=H[ak];var al=ai.verts;Y.bindBuffer(Y.ARRAY_BUFFER,h);Y.bufferData(Y.ARRAY_BUFFER,new Float32Array(al),Y.STATIC_DRAW);Y.vertexAttribPointer(am.vertexPositionAttribute,4,Y.FLOAT,false,0,0);aj.pushMatrix();P(am);Y.uniform4f(am.uColor,K,Q,B,G);Y.drawArrays(Y.TRIANGLE_FAN,0,al.length/4);aj.popMatrix()}Y.fill=function W(){for(var ai=0;ai<H.length;ai++){ac(ai)}};function I(ak){var aj=af.transform;var am=af.initShaders(aj.c_stack+2,0);var ai=H[ak];var al=ai.verts;Y.bindBuffer(Y.ARRAY_BUFFER,h);Y.bufferData(Y.ARRAY_BUFFER,new Float32Array(al),Y.STATIC_DRAW);Y.vertexAttribPointer(am.vertexPositionAttribute,4,Y.FLOAT,false,0,0);aj.pushMatrix();P(am);Y.uniform4f(am.uColor,K,Q,B,G);if(ai.closed){Y.drawArrays(Y.LINE_LOOP,0,al.length/4)}else{Y.drawArrays(Y.LINE_STRIP,0,al.length/4)}aj.popMatrix()}Y.stroke=function L(){for(var ai=0;ai<H.length;ai++){I(ai)}};Y.clip=function ad(){};var J=[],ae=[];function D(ak){this.obj=Y.createTexture();this.index=ae.push(this);var al=(typeof(CFG_MOJO_IMAGE_FILTERING_ENABLED)!=="undefined"&&CFG_MOJO_IMAGE_FILTERING_ENABLED==="true");J.push(ak);if(ak.width>af.maxTextureSize||ak.height>af.maxTextureSize){var aj=document.createElement("canvas");aj.width=(ak.width>af.maxTextureSize)?af.maxTextureSize:ak.width;aj.height=(ak.height>af.maxTextureSize)?af.maxTextureSize:ak.height;var ai=aj.getContext("2d");ai.drawImage(ak,0,0,ak.width,ak.height,0,0,aj.width,aj.height);ak=aj}Y.bindTexture(Y.TEXTURE_2D,this.obj);Y.texImage2D(Y.TEXTURE_2D,0,Y.RGBA,Y.RGBA,Y.UNSIGNED_BYTE,ak);Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_WRAP_S,Y.CLAMP_TO_EDGE);Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_WRAP_T,Y.CLAMP_TO_EDGE);if(al){Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MAG_FILTER,Y.LINEAR)}else{Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MAG_FILTER,Y.NEAREST)}if(m(ak.width)&&m(ak.height)){if(al){Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MIN_FILTER,Y.LINEAR_MIPMAP_LINEAR);Y.generateMipmap(Y.TEXTURE_2D)}else{Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MIN_FILTER,Y.NEAREST_MIPMAP_NEAREST);Y.generateMipmap(Y.TEXTURE_2D)}}else{if(al){Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MIN_FILTER,Y.LINEAR)}else{Y.texParameteri(Y.TEXTURE_2D,Y.TEXTURE_MIN_FILTER,Y.NEAREST)}}Y.bindTexture(Y.TEXTURE_2D,null)}Y.drawImage=function V(ak,aw,av,at,ar,ap,ao,an,am){var aj=af.transform;aj.pushMatrix();var al=k.texture;var ax=false;if(arguments.length===3){aj.translate(aw,av);aj.scale(ak.width,ak.height)}else{if(arguments.length===5){aj.translate(aw,av);aj.scale(at,ar)}else{if(arguments.length===9){aj.translate(ap,ao);aj.scale(an,am);al=al|k.crop;ax=true}}}var ai=af.initShaders(aj.c_stack,al);var aq,au=J.indexOf(ak);if(au!==-1){aq=ae[au]}else{aq=new D(ak)}if(ax){Y.uniform4f(ai.uCropSource,aw/ak.width,av/ak.height,at/ak.width,ar/ak.height)}Y.bindBuffer(Y.ARRAY_BUFFER,o);Y.vertexAttribPointer(ai.vertexPositionAttribute,4,Y.FLOAT,false,0,0);Y.bindTexture(Y.TEXTURE_2D,aq.obj);Y.activeTexture(Y.TEXTURE0);Y.uniform1i(ai.uSampler,0);P(ai);Y.uniform4f(ai.uColor,K,Q,B,G);Y.drawArrays(Y.TRIANGLE_FAN,0,4);aj.popMatrix()}};var k={texture:1,crop:2,path:4};q.prototype.getFragmentShaderSource=function e(C){var B=["#ifdef GL_ES","precision highp float;","#endif","#define hasTexture "+((C&k.texture)?"1":"0"),"#define hasCrop "+((C&k.crop)?"1":"0"),"varying vec4 vColor;","#if hasTexture","varying vec2 vTextureCoord;","uniform sampler2D uSampler;","#if hasCrop","uniform vec4 uCropSource;","#endif","#endif","void main(void) {","#if hasTexture","#if hasCrop","gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x * uCropSource.z, vTextureCoord.y * uCropSource.w) + uCropSource.xy) * vColor;","#else","gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;","#endif","#else","gl_FragColor = vColor;","#endif","}"].join("\n");return B};q.prototype.getVertexShaderSource=function i(D,F){var C=2/this.canvas.width,E=-2/this.canvas.height;D=D||1;var B=["#define hasTexture "+((F&k.texture)?"1":"0"),"attribute vec4 aVertexPosition;","#if hasTexture","varying vec2 vTextureCoord;","#endif","uniform vec4 uColor;","uniform mat3 uTransforms["+D+"];","varying vec4 vColor;","const mat4 pMatrix = mat4("+C+",0,0,0, 0,"+E+",0,0, 0,0,1.0,1.0, -1.0,1.0,0,0);","mat3 crunchStack(void) {","mat3 result = uTransforms[0];","for (int i = 1; i < "+D+"; ++i) {","result = uTransforms[i] * result;","}","return result;","}","void main(void) {","vec3 position = crunchStack() * vec3(aVertexPosition.x, aVertexPosition.y, 1.0);","gl_Position = pMatrix * vec4(position, 1.0);","vColor = uColor;","#if hasTexture","vTextureCoord = aVertexPosition.zw;","#endif","}"].join("\n");return B};q.prototype.initShaders=function A(F,E){var G=this.gl;F=F||1;E=E||0;var C=this.shaderPool[F];if(!C){C=this.shaderPool[F]=[]}C=C[E];if(C){G.useProgram(C);this.shaderProgram=C;return C}else{var B=this.fs=G.createShader(G.FRAGMENT_SHADER);G.shaderSource(this.fs,this.getFragmentShaderSource(E));G.compileShader(this.fs);if(!G.getShaderParameter(this.fs,G.COMPILE_STATUS)){throw"fragment shader error: "+G.getShaderInfoLog(this.fs)}var I=this.vs=G.createShader(G.VERTEX_SHADER);G.shaderSource(this.vs,this.getVertexShaderSource(F,E));G.compileShader(this.vs);if(!G.getShaderParameter(this.vs,G.COMPILE_STATUS)){throw"vertex shader error: "+G.getShaderInfoLog(this.vs)}var H=this.shaderProgram=G.createProgram();H.stackDepth=F;G.attachShader(H,B);G.attachShader(H,I);G.linkProgram(H);if(!G.getProgramParameter(H,G.LINK_STATUS)){throw"Could not initialise shaders."}G.useProgram(H);H.vertexPositionAttribute=G.getAttribLocation(H,"aVertexPosition");G.enableVertexAttribArray(H.vertexPositionAttribute);H.uColor=G.getUniformLocation(H,"uColor");H.uSampler=G.getUniformLocation(H,"uSampler");H.uCropSource=G.getUniformLocation(H,"uCropSource");H.uTransforms=[];for(var D=0;D<F;++D){H.uTransforms[D]=G.getUniformLocation(H,"uTransforms["+D+"]")}this.shaderPool[F][E]=H;return H}};var o;var s;var h;var w;var p=new Float32Array([0,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0]);q.prototype.initBuffers=function v(){var B=this.gl;o=B.createBuffer();s=B.createBuffer();h=B.createBuffer();w=B.createBuffer();B.bindBuffer(B.ARRAY_BUFFER,o);B.bufferData(B.ARRAY_BUFFER,p,B.STATIC_DRAW)};function m(B){return B>0&&((B-1)&B)===0}var c={length:function(B){return Math.sqrt(B[0]*B[0]+B[1]*B[1]+B[2]*B[2])},normalize:function(B){var C=Math.sqrt((B[0]*B[0])+(B[1]*B[1])+(B[2]*B[2]));if(C===0){return[0,0,0]}return[B[0]/C,B[1]/C,B[2]/C]},dot:function(C,B){return C[0]*B[0]+C[1]*B[1]+C[2]*B[2]},angle:function(C,B){return Math.acos((C[0]*B[0]+C[1]*B[1]+C[2]*B[2])/(Math.sqrt(C[0]*C[0]+C[1]*C[1]+C[2]*C[2])*Math.sqrt(B[0]*B[0]+B[1]*B[1]+B[2]*B[2])))},cross:function(C,B){return[C[1]*B[2]-B[1]*C[2],C[2]*B[0]-B[2]*C[0],C[0]*B[1]-B[0]*C[1]]},multiply:function(C,B){return[C[0]*B,C[1]*B,C[2]*B]},add:function(C,B){return[C[0]+B[0],C[1]+B[1],C[2]+B[2]]},subtract:function(C,B){return[C[0]-B[0],C[1]-B[1],C[2]-B[2]]},equal:function(C,B){var D=1e-7;if((C===undefined)&&(B===undefined)){return true}if((C===undefined)||(B===undefined)){return false}return(Math.abs(C[0]-B[0])<D&&Math.abs(C[1]-B[1])<D&&Math.abs(C[2]-B[2])<D)}};var n={identity:[1,0,0,0,1,0,0,0,1],multiply:function(C,B){var U=C[0],T=C[1],S=C[2],R=C[3],Q=C[4],P=C[5],O=C[6],N=C[7],M=C[8],L=B[0],K=B[1],J=B[2],I=B[3],H=B[4],G=B[5],F=B[6],E=B[7],D=B[8];B[0]=L*U+I*T+F*S;B[1]=K*U+H*T+E*S;B[2]=J*U+G*T+D*S;B[3]=L*R+I*Q+F*P;B[4]=K*R+H*Q+E*P;B[5]=J*R+G*Q+D*P;B[6]=L*O+I*N+F*M;B[7]=K*O+H*N+E*M;B[8]=J*O+G*N+D*M},vec2_multiply:function(D,C){var B=[];B[0]=C[0]*D[0]+C[3]*D[1]+C[6];B[1]=C[1]*D[0]+C[4]*D[1]+C[7];return B},transpose:function(B){return[B[0],B[3],B[6],B[1],B[4],B[7],B[2],B[5],B[8]]}};function u(B){return this.clearStack(B)}var d=16;u.prototype.clearStack=function(B){this.m_stack=[];this.m_cache=[];this.c_stack=0;this.valid=0;this.result=null;for(var C=0;C<d;C++){this.m_stack[C]=this.getIdentity()}if(B!==undefined){this.m_stack[0]=B}else{this.setIdentity()}};u.prototype.setIdentity=function(){this.m_stack[this.c_stack]=this.getIdentity();if(this.valid===this.c_stack&&this.c_stack){this.valid--}};u.prototype.getIdentity=function(){return[1,0,0,0,1,0,0,0,1]};u.prototype.getResult=function(){if(!this.c_stack){return this.m_stack[0]}var B=n.identity;if(this.valid>this.c_stack-1){this.valid=this.c_stack-1}for(var C=this.valid;C<this.c_stack+1;C++){B=n.multiply(this.m_stack[C],B);this.m_cache[C]=B}this.valid=this.c_stack-1;this.result=this.m_cache[this.c_stack];return this.result};u.prototype.pushMatrix=function(){this.c_stack++;this.m_stack[this.c_stack]=this.getIdentity()};u.prototype.popMatrix=function(){if(this.c_stack===0){return}this.c_stack--};var t=u.prototype.getIdentity();u.prototype.translate=function(B,C){t[6]=B;t[7]=C;n.multiply(t,this.m_stack[this.c_stack])};var l=u.prototype.getIdentity();u.prototype.scale=function(B,C){l[0]=B;l[4]=C;n.multiply(l,this.m_stack[this.c_stack])};var a=u.prototype.getIdentity();u.prototype.rotate=function(B){var C,D;C=Math.sin(-B);D=Math.cos(-B);a[0]=D;a[3]=C;a[1]=-C;a[4]=D;n.multiply(a,this.m_stack[this.c_stack])};function z(){new q(document.getElementById("GameCanvas"))}}