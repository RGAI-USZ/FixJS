function(files, outputFile) {
  var namespaces, output, templateSets, templates;
  if (path.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
  }
  templateSets = files.map(function(file) {
    return buildFunctions(extractTemplates(file));
  });
  templates = _.extend.apply(_, [{}].concat(__slice.call(templateSets)));
  namespaces = createNamespaces(_.keys(templates));
  output = [];
  output.push("// AUTOGENERATED by liz.js on " + (new Date()) + ". DO NOT EDIT.");
  output.push("var hogan = require('hogan.js');");
  namespaces.forEach(function(ns) {
    var fn;
    fn = _.has(templates, ns) ? "(function(){var _t=new hogan.Template(" + templates[ns] + ");return{_t:_t,render:function(){return _t.render.apply(_t,arguments)}};})()" : "{}";
    return output.push("exports." + ns + " = " + fn + ";");
  });
  output.push('');
  fs.writeFileSync(outputFile, output.join('\n'), 'utf-8');
  return console.log("Built " + (_.keys(templates).length) + " templates into " + outputFile);
}