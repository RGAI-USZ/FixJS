fstepMismatch:"Invalid input.",tooLong:"Please enter at most {%maxlength} character(s). You entered {%valueLen}.",patternMismatch:"Invalid input. {%title}",valueMissing:{defaultMessage:"Please fill out this field.",checkbox:"Please check this box if you want to proceed."}};["select","radio"].forEach(function(a){f.en.valueMissing[a]="Please select an option."});["date","time","datetime-local"].forEach(function(a){f.en.rangeUnderflow[a]="Value must be at or after {%min}."});["date","time","datetime-local"].forEach(function(a){f.en.rangeOverflow[a]=
"Value must be at or before {%max}."});f["en-US"]=f["en-US"]||f.en;f[""]=f[""]||f["en-US"];f.de=f.de||{typeMismatch:{email:"{%value} ist keine zul\u00e4ssige E-Mail-Adresse",url:"{%value} ist keine zul\u00e4ssige Webadresse",number:"{%value} ist keine Nummer!",date:"{%value} ist kein Datum",time:"{%value} ist keine Uhrzeit",range:"{%value} ist keine Nummer!","datetime-local":"{%value} ist kein Datum-Uhrzeit Format."},rangeUnderflow:{defaultMessage:"{%value} ist zu niedrig. {%min} ist der unterste Wert, den Sie benutzen k\u00f6nnen."},
rangeOverflow:{defaultMessage:"{%value} ist zu hoch. {%max} ist der oberste Wert, den Sie benutzen k\u00f6nnen."},stepMismatch:"Der Wert {%value} ist in diesem Feld nicht zul\u00e4ssig. Hier sind nur bestimmte Werte zul\u00e4ssig. {%title}",tooLong:"Der eingegebene Text ist zu lang! Sie haben {%valueLen} Zeichen eingegeben, dabei sind {%maxlength} das Maximum.",patternMismatch:"{%value} hat f\u00fcr dieses Eingabefeld ein falsches Format! {%title}",valueMissing:{defaultMessage:"Bitte geben Sie einen Wert ein",
checkbox:"Bitte aktivieren Sie das K\u00e4stchen"}};["select","radio"].forEach(function(a){f.de.valueMissing[a]="Bitte w\u00e4hlen Sie eine Option aus"});["date","time","datetime-local"].forEach(function(a){f.de.rangeUnderflow[a]="{%value} ist zu fr\u00fch. {%min} ist die fr\u00fcheste Zeit, die Sie benutzen k\u00f6nnen."});["date","time","datetime-local"].forEach(function(a){f.de.rangeOverflow[a]="{%value} ist zu sp\u00e4t. {%max} ist die sp\u00e4teste Zeit, die Sie benutzen k\u00f6nnen."});var n=
f[""];d.createValidationMessage=function(d,f){var g=n[f];g&&"string"!==typeof g&&(g=g[a.prop(d,"type")]||g[(d.nodeName||"").toLowerCase()]||g.defaultMessage);g&&"value,min,max,title,maxlength,label".split(",").forEach(function(f){if(-1!==g.indexOf("{%"+f)){var i=("label"==f?a.trim(a('label[for="'+d.id+'"]',d.form).text()).replace(/\*$|:$/,""):a.attr(d,f))||"";g=g.replace("{%"+f+"}",i);"value"==f&&(g=g.replace("{%valueLen}",i.length))}});return g||""};(d.bugs.validationMessage||!Modernizr.formvalidation||
d.bugs.bustedValidity)&&k.push("validationMessage");d.activeLang({langObj:f,module:"form-core",callback:function(a){n=a}});Modernizr.input.list&&!(a("<datalist><select><option></option></select></datalist>").prop("options")||[]).length&&d.defineNodeNameProperty("datalist","options",{prop:{writeable:!1,get:function(){var d=this.options||[];if(!d.length){var f=a("select",this);if(f[0]&&f[0].options&&f[0].options.length)d=f[0].options}return d}}});k.forEach(function(f){d.defineNodeNamesProperty(["fieldset",
"output","button"],f,{prop:{value:"",writeable:!1}});["input","select","textarea"].forEach(function(g){var i=d.defineNodeNameProperty(g,f,{prop:{get:function(){var f=this,g="";if(!a.prop(f,"willValidate"))return g;var b=a.prop(f,"validity")||{valid:1};if(b.valid||(g=d.getContentValidationMessage(f,b)))return g;if(b.customError&&f.nodeName&&(g=Modernizr.formvalidation&&!d.bugs.bustedValidity&&i.prop._supget?i.prop._supget.call(f):d.data(f,"customvalidationMessage")))return g;a.each(b,function(a,c){if("valid"!=
a&&c&&(g=d.createValidationMessage(f,a)))return!1});return g||""},writeable:!1}})})})});