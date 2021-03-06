function(e, data) {
        var reg = {
            'if': /{{\s*if[^}]+}}/g,
            'else': /{{\s*else\s*}}/g,
            'elseif': /{{\s*else\s+if[^}]+}}/g,
            'endif': /{{\s*endif\s*}}/g,
            'for': /{{\s*for[^}]+}}/g,
            'endfor': /{{\s*endfor\s*}}/g
        };
        var helper = {
            variable: function(str) {
                return str.replace(/{{([^}]+)}}/, '$1');
            },
            statement: function(str, type) {
                var result = '';
                if (type == 'if') {
                    result = str.replace(/{{([^}]+)}}/, '$1') + '{';
                } else if (type == 'elseif' || type == 'else') {
                    result = '}' + str.replace(/{{([^}]+)}}/, '$1') + '{';
                } else if (type == 'for') {
                    var list = str.match(/data=(\w+)\s*/)[1];
                    var key = str.match(/key=(\w+)\s*/)[1] || '_key';
                    var item = str.match(/item=(\w+)\s*/)[1] || '_item';
                    result = 'for(var ' + key + ' in ' + list + '){var ' + item + '=' + list + '[' + key + '];'
                } else if (type == 'endif' || type == 'endfor') {                    result = '}';
                }
                return result;
            }
        };
        var preFlag = 1; // 上一次命中的类型：1：html文本，2：变量，3：语句
        var flag; // 本次命中的类型
        var source = ''; // 输出的源码
        var isFirst = true; // 是否第一行
        var str; // 循环中每行的代码
        // 去注释空行，转义双引号和斜杆，根据语法进行分行，去空行，然后根据行切割
        data = data.replace(/<!--[\w\W\r\n]*?-->/g, '').replace(/("|\\)/g, '\\$1').replace(/({{[^}]+}})/g, function(s) {
            return '\n' + s + '\n';
        }).replace(/(\s*\n\s*)+/g, '\n').split('\n');
        
        for (var i = 0, len = data.length; i < len; i++) {
            str = data[i].trim();
            if (str) {
                var statementType = '';
                if (/{{[^}]+}}/.test(str)) {
                    flag = 2;
                    for (var type in reg) {
                        if (reg[type].test(str)) {
                            flag = 3;
                            statementType = type;
                        }
                    }
                } else {
                    flag = 1;
                }
                if (preFlag == 1) {
                    if (flag == 1) {
                        if (isFirst) {
                            source += '\'';
                        }
                        source += str;
                    } else if (flag == 2) {
                        source += '\',' + helper.variable(str);
                    } else if (flag == 3) {
                        source += '\');' + helper.statement(str, statementType);
                    }
                } else if (preFlag == 2) {
                    if (flag == 1) {
                        source += ',\'' + str;
                    } else if (flag == 2) {
                        source += ',' + helper.variable(str);
                    } else if (flag == 3) {
                        source += ');' + helper.statement(str, statementType);
                    }
                } else if (preFlag == 3) {
                    if (flag == 1) {
                        source += '_s.push(\'' + str;
                    } else if (flag == 2) {
                        source += '_s.push(' + helper.variable(str);
                    } else if (flag == 3) {
                        source += helper.statement(str, statementType);
                    }
                }
                isFirst = false;
                preFlag = flag;
            }
        }
        if (flag == 1) {
            source += '\');';
        } else if (flag == 2) {
            source += ');';
        }
		source = '(function(){return {render:function(map) {var p=[],v =[];for(var i in map) {p.push(i);v.push(map[i]);}return (new Function(p, \"var _s=[];_s.push(' + source + ' return _s;\")).apply(null, v).join("");}};})';
		if(config.fnName) {
			data = config.fnName + '=' + source + '();';
		} else {
			data = 'define' + source + ';';
		}
        fs.writeFile(config.dest, data, config.charset, callback);
		
    });
