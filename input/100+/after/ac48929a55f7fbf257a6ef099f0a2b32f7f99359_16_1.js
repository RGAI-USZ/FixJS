function V(a){r.merge(this,a)}V.prototype.constructor=r;function Cb(a,b,c,d){var e=/^(.+?)(\[.*\])$/,g,f,i;if(d!==m&&(f=b.match(e))){i=f[1];b=f[2].replace(/^\[|\]$/g,"").split("][");b.forEach(function(h){g=!h||h.match(/^\d+$/);if(!i&&ca(a))i=a.length;a[i]||(a[i]=g?[]:{});a=a[i];i=h});if(!i&&g)i=a.length.toString();Cb(a,i,c)}else a[b]=c.match(/^[\d.]+$/)?parseFloat(c):c==="true"?j:c==="false"?m:c}