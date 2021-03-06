function(input, startRule) {
      var parseFunctions = {
        "templateFile": parse_templateFile,
        "line": parse_line,
        "indent": parse_indent,
        "newline": parse_newline,
        "text": parse_text,
        "identifier": parse_identifier,
        "elemId": parse_elemId,
        "elemClass": parse_elemClass,
        "elemAttribute": parse_elemAttribute,
        "elemProperty": parse_elemProperty,
        "elemQualifier": parse_elemQualifier,
        "element": parse_element,
        "implicitElement": parse_implicitElement,
        "explicitElement": parse_explicitElement,
        "textNode": parse_textNode,
        "contextPath": parse_contextPath,
        "quotedText": parse_quotedText,
        "directiveParameter": parse_directiveParameter,
        "directive": parse_directive
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "templateFile";
      }
      
      var pos = { offset: 0, line: 1, column: 1, seenCR: false };
      var reportFailures = 0;
      var rightmostFailuresPos = { offset: 0, line: 1, column: 1, seenCR: false };
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function clone(object) {
        var result = {};
        for (var key in object) {
          result[key] = object[key];
        }
        return result;
      }
      
      function advance(pos, n) {
        var endOffset = pos.offset + n;
        
        for (var offset = pos.offset; offset < endOffset; offset++) {
          var ch = input.charAt(offset);
          if (ch === "\n") {
            if (!pos.seenCR) { pos.line++; }
            pos.column = 1;
            pos.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            pos.line++;
            pos.column = 1;
            pos.seenCR = true;
          } else {
            pos.column++;
            pos.seenCR = false;
          }
        }
        
        pos.offset += n;
      }
      
      function matchFailed(failure) {
        if (pos.offset < rightmostFailuresPos.offset) {
          return;
        }
        
        if (pos.offset > rightmostFailuresPos.offset) {
          rightmostFailuresPos = clone(pos);
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_templateFile() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_line();
        if (result0 !== null) {
          result1 = [];
          pos2 = clone(pos);
          result2 = parse_newline();
          if (result2 !== null) {
            result3 = parse_line();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = clone(pos2);
            }
          } else {
            result2 = null;
            pos = clone(pos2);
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = clone(pos);
            result2 = parse_newline();
            if (result2 !== null) {
              result3 = parse_line();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = clone(pos2);
              }
            } else {
              result2 = null;
              pos = clone(pos2);
            }
          }
          if (result1 !== null) {
            result2 = parse_newline();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, first, tail) { return generateNodeTree(first, tail); })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_line() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_indent();
        if (result0 !== null) {
          result1 = parse_element();
          if (result1 === null) {
            result1 = parse_textNode();
            if (result1 === null) {
              result1 = parse_directive();
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, depth, s) { return s; })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_indent() {
        var result0, result1;
        var pos0;
        
        reportFailures++;
        pos0 = clone(pos);
        result0 = [];
        if (/^[ \t]/.test(input.charAt(pos.offset))) {
          result1 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[ \t]/.test(input.charAt(pos.offset))) {
            result1 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[ \\t]");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, s) { return parseIndent(s, line); })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("indent");
        }
        return result0;
      }
      
      function parse_newline() {
        var result0;
        
        reportFailures++;
        if (input.charCodeAt(pos.offset) === 10) {
          result0 = "\n";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\n\"");
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("new line");
        }
        return result0;
      }
      
      function parse_text() {
        var result0, result1;
        var pos0;
        
        pos0 = clone(pos);
        result0 = [];
        if (/^[^\n]/.test(input.charAt(pos.offset))) {
          result1 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\n]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[^\n]/.test(input.charAt(pos.offset))) {
            result1 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n]");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, c) { return c.join(''); })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (/^[a-zA-Z_]/.test(input.charAt(pos.offset))) {
          result0 = input.charAt(pos.offset);
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z_]");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[a-zA-Z0-9_\-]/.test(input.charAt(pos.offset))) {
            result2 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z0-9_\\-]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[a-zA-Z0-9_\-]/.test(input.charAt(pos.offset))) {
              result2 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[a-zA-Z0-9_\\-]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, h, t) { return h + t.join(''); })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("identifier");
        }
        return result0;
      }
      
      function parse_elemId() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 35) {
          result0 = "#";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"#\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, id) { return { 'id': id }; })(pos0.offset, pos0.line, pos0.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_elemClass() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 46) {
          result0 = ".";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, cls) { return { 'className': cls }; })(pos0.offset, pos0.line, pos0.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_elemAttribute() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 91) {
          result0 = "[";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            if (input.charCodeAt(pos.offset) === 61) {
              result2 = "=";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result2 !== null) {
              result3 = [];
              if (/^[^\n\]]/.test(input.charAt(pos.offset))) {
                result4 = input.charAt(pos.offset);
                advance(pos, 1);
              } else {
                result4 = null;
                if (reportFailures === 0) {
                  matchFailed("[^\\n\\]]");
                }
              }
              while (result4 !== null) {
                result3.push(result4);
                if (/^[^\n\]]/.test(input.charAt(pos.offset))) {
                  result4 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("[^\\n\\]]");
                  }
                }
              }
              if (result3 !== null) {
                if (input.charCodeAt(pos.offset) === 93) {
                  result4 = "]";
                  advance(pos, 1);
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, attr, value) { return { 'attr': attr, 'value': value.join('') }; })(pos0.offset, pos0.line, pos0.column, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_elemProperty() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 91) {
          result0 = "[";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 46) {
            result1 = ".";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_identifier();
            if (result2 !== null) {
              if (input.charCodeAt(pos.offset) === 61) {
                result3 = "=";
                advance(pos, 1);
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\"=\"");
                }
              }
              if (result3 !== null) {
                result4 = [];
                if (/^[^\n\]]/.test(input.charAt(pos.offset))) {
                  result5 = input.charAt(pos.offset);
                  advance(pos, 1);
                } else {
                  result5 = null;
                  if (reportFailures === 0) {
                    matchFailed("[^\\n\\]]");
                  }
                }
                while (result5 !== null) {
                  result4.push(result5);
                  if (/^[^\n\]]/.test(input.charAt(pos.offset))) {
                    result5 = input.charAt(pos.offset);
                    advance(pos, 1);
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("[^\\n\\]]");
                    }
                  }
                }
                if (result4 !== null) {
                  if (input.charCodeAt(pos.offset) === 93) {
                    result5 = "]";
                    advance(pos, 1);
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"]\"");
                    }
                  }
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = clone(pos1);
                  }
                } else {
                  result0 = null;
                  pos = clone(pos1);
                }
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, prop, value) { return { 'prop': prop, 'value': value.join('') }; })(pos0.offset, pos0.line, pos0.column, result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_elemQualifier() {
        var result0;
        
        reportFailures++;
        result0 = parse_elemId();
        if (result0 === null) {
          result0 = parse_elemClass();
          if (result0 === null) {
            result0 = parse_elemAttribute();
            if (result0 === null) {
              result0 = parse_elemProperty();
            }
          }
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("element qualifier");
        }
        return result0;
      }
      
      function parse_element() {
        var result0;
        
        reportFailures++;
        result0 = parse_implicitElement();
        if (result0 === null) {
          result0 = parse_explicitElement();
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("element");
        }
        return result0;
      }
      
      function parse_implicitElement() {
        var result0, result1;
        var pos0;
        
        pos0 = clone(pos);
        result1 = parse_elemQualifier();
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_elemQualifier();
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, qualifiers) { return createElement('div', qualifiers); })(pos0.offset, pos0.line, pos0.column, result0);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_explicitElement() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_elemQualifier();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_elemQualifier();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, tagName, qualifiers) { return createElement(tagName, qualifiers); })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        return result0;
      }
      
      function parse_textNode() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 34) {
          result0 = "\"";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^\n"]/.test(input.charAt(pos.offset))) {
            result2 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\\n\"]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^\n"]/.test(input.charAt(pos.offset))) {
              result2 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\\n\"]");
              }
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos.offset) === 34) {
              result2 = "\"";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, text) { return new TextNode(text.join('')); })(pos0.offset, pos0.line, pos0.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("text node");
        }
        return result0;
      }
      
      function parse_contextPath() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = [];
          pos2 = clone(pos);
          if (input.charCodeAt(pos.offset) === 46) {
            result2 = ".";
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result2 !== null) {
            result3 = parse_identifier();
            if (result3 !== null) {
              result2 = [result2, result3];
            } else {
              result2 = null;
              pos = clone(pos2);
            }
          } else {
            result2 = null;
            pos = clone(pos2);
          }
          while (result2 !== null) {
            result1.push(result2);
            pos2 = clone(pos);
            if (input.charCodeAt(pos.offset) === 46) {
              result2 = ".";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\".\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_identifier();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = clone(pos2);
              }
            } else {
              result2 = null;
              pos = clone(pos2);
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, first, tail) {
        	var ret = [first];
        	tail.forEach(function(i) {
        		ret.push(i[1]);
        	});
        	return ret;
        })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("context property path");
        }
        return result0;
      }
      
      function parse_quotedText() {
        var result0, result1, result2;
        var pos0, pos1;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 34) {
          result0 = "\"";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[^"]/.test(input.charAt(pos.offset))) {
            result2 = input.charAt(pos.offset);
            advance(pos, 1);
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[^\"]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[^"]/.test(input.charAt(pos.offset))) {
              result2 = input.charAt(pos.offset);
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[^\"]");
              }
            }
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos.offset) === 34) {
              result2 = "\"";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"\\\"\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, chars) { return chars.join(''); })(pos0.offset, pos0.line, pos0.column, result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("quoted text");
        }
        return result0;
      }
      
      function parse_directiveParameter() {
        var result0, result1;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        pos2 = clone(pos);
        result0 = parse_identifier();
        if (result0 !== null) {
          if (input.charCodeAt(pos.offset) === 61) {
            result1 = "=";
            advance(pos, 1);
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"=\"");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos2);
          }
        } else {
          result0 = null;
          pos = clone(pos2);
        }
        if (result0 !== null) {
          result1 = parse_quotedText();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, name, value) { return { name: name ? name[0] : 'text', value: value }; })(pos0.offset, pos0.line, pos0.column, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("directive parameter");
        }
        return result0;
      }
      
      function parse_directive() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1, pos2;
        
        reportFailures++;
        pos0 = clone(pos);
        pos1 = clone(pos);
        if (input.charCodeAt(pos.offset) === 64) {
          result0 = "@";
          advance(pos, 1);
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"@\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_identifier();
          if (result1 !== null) {
            pos2 = clone(pos);
            if (input.charCodeAt(pos.offset) === 32) {
              result2 = " ";
              advance(pos, 1);
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\" \"");
              }
            }
            if (result2 !== null) {
              result3 = parse_contextPath();
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = clone(pos2);
              }
            } else {
              result2 = null;
              pos = clone(pos2);
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result3 = [];
              pos2 = clone(pos);
              if (input.charCodeAt(pos.offset) === 32) {
                result4 = " ";
                advance(pos, 1);
              } else {
                result4 = null;
                if (reportFailures === 0) {
                  matchFailed("\" \"");
                }
              }
              if (result4 !== null) {
                result5 = parse_directiveParameter();
                if (result5 !== null) {
                  result4 = [result4, result5];
                } else {
                  result4 = null;
                  pos = clone(pos2);
                }
              } else {
                result4 = null;
                pos = clone(pos2);
              }
              while (result4 !== null) {
                result3.push(result4);
                pos2 = clone(pos);
                if (input.charCodeAt(pos.offset) === 32) {
                  result4 = " ";
                  advance(pos, 1);
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\" \"");
                  }
                }
                if (result4 !== null) {
                  result5 = parse_directiveParameter();
                  if (result5 !== null) {
                    result4 = [result4, result5];
                  } else {
                    result4 = null;
                    pos = clone(pos2);
                  }
                } else {
                  result4 = null;
                  pos = clone(pos2);
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = clone(pos1);
              }
            } else {
              result0 = null;
              pos = clone(pos1);
            }
          } else {
            result0 = null;
            pos = clone(pos1);
          }
        } else {
          result0 = null;
          pos = clone(pos1);
        }
        if (result0 !== null) {
          result0 = (function(offset, line, column, name, path, parameters) { return createDirective(name, path, parameters); })(pos0.offset, pos0.line, pos0.column, result0[1], result0[2], result0[3]);
        }
        if (result0 === null) {
          pos = clone(pos0);
        }
        reportFailures--;
        if (reportFailures === 0 && result0 === null) {
          matchFailed("directive");
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      
      
      	var INDENT = 'INDENT', DEDENT = 'DEDENT', UNDEF,
      		depths = [0],
      		findPath, interpolate, TextNode, ContainerNode, ElementNode, BlockNode,
      		generateNodeTree, parseIndent, createElement, createDirective;
      		
      		
      	/**
      	 * Find path ("path.to.property") inside context object
      	 */
      	findPath = function(path, context) {
      		var rec;
      		
      		path = path.trim();
      		if (path === 'this') {
      			return context;
      		}
      	
      		rec = function(pathArray, context) {
      			var subcontext = context[pathArray.shift()];
      			
      			if (pathArray.length > 0) {
      				return rec(pathArray, subcontext);
      			} else {
      				return subcontext;
      			}
      		}
      		
      		try {
      			return rec(path.split('.'), context);
      		} catch(e) {
      			throw new Error("Cannot find path " + path + " in context");
      		}
      	};
      	
      	
      	/**
      	 * Interpolate {{variable}}s in 'text'
      	 */
      	interpolate = function(text, context) {
      		return text.replace(rx.interpvar, function(m, p1) { return findPath(p1, context); });
      	};
      	
      	
      	/**
      	 * Text node
      	 */
      	TextNode = function(text) {
      		this.text = text;
      	};
      	
      	TextNode.prototype = {
      		render: function(context, doc) {
      			return (doc||document).createTextNode(interpolate(this.text, context));
      		},
      		
      		appendChild: function(node) {
      			throw new Error("Cannot add children to TextNode");
      		}
      	};
      	
      	
      	/**
      	 * Container node
      	 */
      	ContainerNode = function(features) {
      		var self = this;
      		
      		if (features) {
      			Object.keys(features).forEach(function(key) {
      				self[key] = features[key];
      			});
      		}
      	};
      	
      	ContainerNode.prototype = {
      		appendChild: function(node) {
      			this.children = this.children || [];
      			this.children.push(node);
      		},
      		
      		render: function(context, doc) {
      			var fragment = (doc||document).createDocumentFragment();
      			
      			this.children = this.children || [];
      			this.children.forEach(function(c) {
      				fragment.appendChild(c.render(context, doc));
      			});
      			
      			return fragment;
      		}
      	};
      	
      	
      	/**
      	 * Element node
      	 */
      	ElementNode = function(tagName) {
      		this.tagName = tagName;
      		this.attributes = {};
      		this.properties = {};
      		this.classes = [];
      		this.id = undefined;
      	};
      	
      	ElementNode.prototype = new ContainerNode({
      		setAttribute: function(attr, value) {
      			this.attributes[attr] = value;
      		},
      		
      		setProperty: function(prop, value) {
      			this.properties[prop] = value;
      		},
      		
      		setClass: function(cls) {
      			this.classes.push(cls);
      		},
      		
      		setId: function(id) {
      			this.id = id;
      		},
      		
      		render: function(context, doc) {
      			var self = this,
      				node = (doc||document).createElement(this.tagName);
      			
      			node.appendChild(ContainerNode.prototype.render.call(this, context, doc));
      			
      			Object.keys(this.attributes).forEach(function(attr) {
      				var value = interpolate(self.attributes[attr],  context);
      				node.setAttribute(attr, value);
      			});
      			
      			Object.keys(this.properties).forEach(function(prop) {
      				var value = interpolate(self.attributes[prop],  context);
      				node[prop] = value;
      			});
      			
      			this.classes.forEach(function(cls) {
      				node.classList.add(cls);
      			});
      			
      			if (typeof this.id !== 'undefined') {
      				node.id = this.id;
      			}
      			
      			return node;
      		}
      	});
      	
      	
      	/**
      	 * Block node
      	 */
      	BlockNode = function(name, ctxPath, options) {
      		this.name = name;
      		this.ctxPath = ctxPath;
      		this.options = options;
      	};
      	
      	BlockNode.prototype = new ContainerNode({
      		render: function(context, doc) {
      			var self = this,
      				subContext = this.ctxPath ? findPath(this.ctxPath, context) : undefined;
      			
      			if (typeof helpers[this.name] !== 'function') {
      				throw new Error('No block helper for @' + this.name + ' has been registered');
      			}
      			
      			return helpers[this.name].call(context, subContext, {
      				document: (doc || document),
      				
      				render: function(ctx) {
      					return ContainerNode.prototype.render.call(self, ctx, doc);
      				},
      				
      				options: self.options
      			});
      		}
      	});
      	
      		
      	// Generate node tree
      	generateNodeTree = function(first, tail) {
      		var stack = [new ContainerNode()],
      			indent, peekNode, pushNode, popNode;
      			
      		/* Node stack helpers */
      		
      		peekNode = function() {
      			return stack[stack.length - 1];
      		};
      	
      		pushNode = function(node) {
      			stack.push(node);
      		};
      	
      		popNode = function() {
      			var node;
      			if (stack.length < 2) {
      				throw new Error("Could not pop node from stack");
      			}
      		
      			node = stack.pop();
      			peekNode().appendChild(node);
      			return node;
      		};
      	
      		tail.unshift([null, first]);
      		tail.forEach(function(t, index) {
      			var item = t[1];
      				
      			if (item === DEDENT) {
      				indent = DEDENT;
      				popNode();
      			} else if (item === INDENT) {
      				indent = INDENT;
      			} else {
      				if (index > 0) {
      					popNode();
      				}
      				
      				pushNode(item);
      				indent = UNDEF;
      			}
      		});
      		
      		// Collapse remaining stack
      		while (stack.length > 1) {
      			popNode();
      		}
      		
      		return peekNode();
      	};
      	
      
      	// Keep track of indent, inserting "INDENT" and "DEDENT" tokens
      	parseIndent = function(s, line) {
      		var depth = s.length,
      			dents = [];
      
      		if (depth.length === 0) {
      			// First line, this is the reference indentation
      			depths.push(depth);
      			return [];
      		}
      
      		if (depth == depths[0]) {
      			// Same indent as previous line
      			return [];
      		}
      
      		if (depth > depths[0]) {
      			// Deeper indent, unshift it
      			depths.unshift(depth);
      			return [INDENT];
      		}
      		
      		while (depth < depths[0]) {
      			// Narrower indent, try to find it in previous indents
      			depths.shift();
      			dents.push(DEDENT);
      		}
      
      		if (depth != depths[0]) {
      			// No matching previous indent
      			throw new Error("Unexpected indent on line " + line);
      		}
      
      		return dents;
      	};
      	
      
      	// Element object helper
      	createElement = function(tagName, qualifiers) {
      		var elem = new ElementNode(tagName);
      
      		qualifiers.forEach(function(q) {
      			if (typeof q.id !== 'undefined') {
      				elem.setId(q.id);
      			} else if (typeof q.className !== 'undefined') {
      				elem.setClass(q.className);
      			} else if (typeof q.attr !== 'undefined') {
      				elem.setAttribute(q.attr, q.value);
      			} else if (typeof q.prop !== 'undefined') {
      				elem.setProperty(q.prop, q.value);
      			}
      		});
      
      		return elem;
      	};
      	
      	
      	// Directive object helper
      	createDirective = function(name, path, parameters) {
      		var options = {};
      
      		parameters.forEach(function(p) {
      			options[p[1].name] = p[1].value;
      		});
      		
      		return new BlockNode(name, path ? path[1] : undefined, options);
      	};
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos.offset === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos.offset < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos.offset === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos.offset !== input.length) {
        var offset = Math.max(pos.offset, rightmostFailuresPos.offset);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = pos.offset > rightmostFailuresPos.offset ? pos : rightmostFailuresPos;
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    }