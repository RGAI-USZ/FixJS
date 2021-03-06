function(exports, require, module) {
  
  /* ------------------------------------------------------------------------
  # CLASS FOR THE COZY NOTE EDITOR
  #
  # usage : 
  #
  # newEditor = new CNEditor( iframeTarget,callBack )
  #   iframeTarget = iframe where the editor will be nested
  #   callBack     = launched when editor ready, the context 
  #                  is set to the editorCtrl (callBack.call(this))
  # properties & methods :
  #   replaceContent    : (htmlContent) ->  # TODO : replace with markdown
  #   _keyPressListener : (e) =>
  #   _insertLineAfter  : (param) ->
  #   _insertLineBefore : (param) ->
  #   
  #   editorIframe      : the iframe element where is nested the editor
  #   editorBody$       : the jquerry pointer on the body of the iframe
  #   _lines            : {} an objet, each property refers a line
  #   _highestId        : 
  #   _firstLine        : pointes the first line : TODO : not taken into account
  */

  (function() {
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    exports.CNEditor = (function(_super) {

      __extends(CNEditor, _super);

      /*
          #   Constructor : newEditor = new CNEditor( iframeTarget,callBack )
          #       iframeTarget = iframe where the editor will be nested
          #       callBack     = launched when editor ready, the context 
          #                      is set to the editorCtrl (callBack.call(this))
      */

      function CNEditor(iframeTarget, callBack) {
        this._keyPressListener = __bind(this._keyPressListener, this);
        var iframe$,
          _this = this;
        iframe$ = $(iframeTarget);
        iframe$.on('load', function() {
          var editorBody$, editor_css$, editor_head$, editor_html$;
          editor_html$ = iframe$.contents().find("html");
          editorBody$ = editor_html$.find("body");
          editorBody$.parent().attr('id', '__ed-iframe-html');
          editorBody$.attr("contenteditable", "true");
          editorBody$.attr("id", "__ed-iframe-body");
          editor_head$ = editor_html$.find("head");
          editor_css$ = editor_head$.html('<link href="stylesheets/app.css" \
                                                 rel="stylesheet">');
          _this.editorBody$ = editorBody$;
          _this.editorIframe = iframe$[0];
          _this._lines = {};
          _this._highestId = 0;
          _this._firstLine = null;
          editorBody$.prop('__editorCtl', _this);
          editorBody$.on('keypress', _this._keyPressListener);
          callBack.call(_this);
          return _this;
        });
      }

      /* ------------------------------------------------------------------------
      # TODO : initialise the editor content from a markdown string
      */

      CNEditor.prototype.replaceContent = function(htmlContent) {
        this.editorBody$.html(htmlContent);
        return this._readHtml();
      };

      /*
          # Change the path of the css applied to the editor iframe
      */

      CNEditor.prototype.replaceCSS = function(path) {
        return $(this.editorIframe).contents().find("link[rel=stylesheet]").attr({
          href: path
        });
      };

      /* ------------------------------------------------------------------------
      #    The listner of keyPress event on the editor's iframe... the king !
      */

      /*
          # SHORTCUT
          #
          #??Definition of a shortcut : 
          #   a combination alt,ctrl,shift,meta
          #   + one caracter(.which) 
          #   or 
          #     arrow (.keyCode=dghb:) or 
          #     return(keyCode:13) or 
          #     bckspace (which:8) or 
          #     tab(keyCode:9)
          #   ex : shortcut = 'CtrlShift-up', 'Ctrl-115' (ctrl+s), '-115' (s),
          #                   'Ctrl-'
      */

      CNEditor.prototype._keyPressListener = function(e) {
        var div, keyStrokesCode, metaKeyStrokesCode, range4sel, sel, shortcut;
        metaKeyStrokesCode = (e.altKey ? "Alt" : "") + 
                                (e.ctrlKey ? "Ctrl" : "") + 
                                (e.shiftKey ? "Shift" : "");
        switch (e.keyCode) {
          case 13:
            keyStrokesCode = "return";
            break;
          case 35:
            keyStrokesCode = "end";
            break;
          case 36:
            keyStrokesCode = "home";
            break;
          case 33:
            keyStrokesCode = "pgUp";
            break;
          case 34:
            keyStrokesCode = "pgDwn";
            break;
          case 37:
            keyStrokesCode = "left";
            break;
          case 38:
            keyStrokesCode = "up";
            break;
          case 39:
            keyStrokesCode = "right";
            break;
          case 40:
            keyStrokesCode = "down";
            break;
          case 9:
            keyStrokesCode = "tab";
            break;
          case 8:
            keyStrokesCode = "backspace";
            break;
          case 32:
            keyStrokesCode = "space";
            break;
          case 27:
            keyStrokesCode = "esc";
            break;
          case 46:
            keyStrokesCode = "suppr";
            break;
          default:
            switch (e.which) {
              case 32:
                keyStrokesCode = "space";
                break;
              case 8:
                keyStrokesCode = "backspace";
                break;
              default:
                keyStrokesCode = e.which;
            }
        }
        shortcut = metaKeyStrokesCode + '-' + keyStrokesCode;
        if ((keyStrokesCode === "left" || keyStrokesCode === "up" || keyStrokesCode === "right" || keyStrokesCode === "down" || keyStrokesCode === "pgUp" || keyStrokesCode === "pgDwn" || keyStrokesCode === "end" || keyStrokesCode === "home") && (shortcut !== 'CtrlShift-down' && shortcut !== 'CtrlShift-up')) {
          this.newPosition = true;
          $("#editorPropertiesDisplay").text("newPosition = true");
        } else {
          if (this.newPosition) {
            this.newPosition = false;
            $("#editorPropertiesDisplay").text("newPosition = false");
            sel = rangy.getIframeSelection(this.editorIframe);
            div = sel.getRangeAt(0).startContainer;
            if (div.nodeName !== "DIV") div = $(div).parents("div")[0];
            if (div.innerHTML === "<span></span><br>") {
              range4sel = rangy.createRange();
              range4sel.collapseToPoint(div.firstChild, 0);
              sel.setSingleRange(range4sel);
            }
          }
        }
        this.currentSel = null;
        switch (shortcut) {
          case "-return":
            this._return();
            return e.preventDefault();
          case "-tab":
            this.tab();
            return e.preventDefault();
          case "-backspace":
            return this._backspace(e);
          case "-suppr":
            return this._suppr(e);
          case "Shift-tab":
            this.shiftTab();
            return e.preventDefault();
          case "Alt-97":
            this._toggleLineType();
            return e.preventDefault();
          case "Ctrl-118":
            return e.preventDefault();
          case "Ctrl-115":
            return e.preventDefault();
        }
      };

      /* ------------------------------------------------------------------------
      #  Manage deletions when ??uppr key is pressed
      */

      CNEditor.prototype._suppr = function(e) {
        var sel, startLine;
        this._findLinesAndIsStartIsEnd();
        sel = this.currentSel;
        startLine = sel.startLine;
        if (sel.range.collapsed) {
          if (sel.rangeIsEndLine) {
            if (startLine.lineNext !== null) {
              sel.range.setEndBefore(startLine.lineNext.line$[0].firstChild);
              sel.endLine = startLine.lineNext;
              this._deleteMultiLinesSelections();
              return e.preventDefault();
            } else {
              return e.preventDefault();
            }
          }
        } else if (sel.endLine === startLine) {
          sel.range.deleteContents();
          return e.preventDefault();
        } else {
          this._deleteMultiLinesSelections();
          return e.preventDefault();
        }
      };

      /* ------------------------------------------------------------------------
      #  Manage deletions when backspace key is pressed
      */

      CNEditor.prototype._backspace = function(e) {
        var sel, startLine;
        this._findLinesAndIsStartIsEnd();
        sel = this.currentSel;
        startLine = sel.startLine;
        if (sel.range.collapsed) {
          if (sel.rangeIsStartLine) {
            if (startLine.linePrev !== null) {
              sel.range.setStartBefore(startLine.linePrev.line$[0].lastChild);
              sel.startLine = startLine.linePrev;
              this._deleteMultiLinesSelections();
              return e.preventDefault();
            } else {
              return e.preventDefault();
            }
          }
        } else if (sel.endLine === startLine) {
          sel.range.deleteContents();
          return e.preventDefault();
        } else {
          this._deleteMultiLinesSelections();
          return e.preventDefault();
        }
      };

      /* ------------------------------------------------------------------------
      #  Turn selected lines in a title List (Th)
      */

      CNEditor.prototype.titleList = function() {
        var endContainer, endDiv, endDivID, endLineID, initialEndOffset, initialStartOffset, line, range, sel, startContainer, startDiv, _results;
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        startDiv = startContainer;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        endDiv = endContainer;
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
        endLineID = endDiv.id;
        line = this._lines[startDiv.id];
        endDivID = endDiv.id;
        _results = [];
        while (true) {
          this._line2titleList(line);
          if (line.lineID === endDivID) {
            break;
          } else {
            _results.push(line = line.lineNext);
          }
        }
        return _results;
      };

      /* ------------------------------------------------------------------------
      #  Turn a given line in a title List Line (Th)
      */

      CNEditor.prototype._line2titleList = function(line) {
        var parent1stSibling, _results;
        if (line.lineType !== 'Th') {
          if (line.lineType[0] === 'L') {
            line.lineType = 'Tu';
            line.lineDepthAbs += 1;
          }
          this._titilizeSiblings(line);
          parent1stSibling = this._findParent1stSibling(line);
          _results = [];
          while (parent1stSibling !== null && parent1stSibling.lineType !== 'Th') {
            this._titilizeSiblings(parent1stSibling);
            _results.push(parent1stSibling = this._findParent1stSibling(parent1stSibling));
          }
          return _results;
        }
      };

      /* ------------------------------------------------------------------------
      #  Turn selected lines in a Marker List
      */

      CNEditor.prototype.markerList = function(l) {
        var endContainer, endDiv, endLineID, initialEndOffset, initialStartOffset, line, lineTypeTarget, range, startDiv, startDivID, _results;
        if (l != null) {
          startDivID = l.lineID;
          endLineID = startDivID;
        } else {
          range = rangy.getIframeSelection(this.editorIframe).getRangeAt(0);
          endContainer = initialStartOffset = range.startOffset;
          initialEndOffset = range.endOffset;
          startDiv = range.startContainer;
          if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
          startDivID = startDiv.id;
          endDiv = range.endContainer;
          if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
          endLineID = endDiv.id;
        }
        line = this._lines[startDivID];
        _results = [];
        while (true) {
          switch (line.lineType) {
            case 'Th':
              lineTypeTarget = 'Tu';
              l = line.lineNext;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                switch (l.lineType) {
                  case 'Th':
                    l.line$.prop("class", "Tu-" + l.lineDepthAbs);
                    l.lineType = 'Tu';
                    l.lineDepthRel = this._findDepthRel(l);
                    break;
                  case 'Lh':
                    l.line$.prop("class", "Lu-" + l.lineDepthAbs);
                    l.lineType = 'Lu';
                    l.lineDepthRel = this._findDepthRel(l);
                }
                l = l.lineNext;
              }
              l = line.linePrev;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                switch (l.lineType) {
                  case 'Th':
                    l.line$.prop("class", "Tu-" + l.lineDepthAbs);
                    l.lineType = 'Tu';
                    l.lineDepthRel = this._findDepthRel(l);
                    break;
                  case 'Lh':
                    l.line$.prop("class", "Lu-" + l.lineDepthAbs);
                    l.lineType = 'Lu';
                    l.lineDepthRel = this._findDepthRel(l);
                }
                l = l.linePrev;
              }
              break;
            case 'Lh':
            case 'Lu':
              this.tab(line);
              break;
            default:
              lineTypeTarget = false;
          }
          if (lineTypeTarget) {
            line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
            line.lineType = lineTypeTarget;
          }
          if (line.lineID === endLineID) {
            break;
          } else {
            _results.push(line = line.lineNext);
          }
        }
        return _results;
      };

      /* ------------------------------------------------------------------------
      # Calculates the relative depth of the line
      #   usage   : cycle : Tu => To => Lx => Th
      #   param   : line : the line we want to find the relative depth
      #   returns : a number
      #
      */

      CNEditor.prototype._findDepthRel = function(line) {
        var linePrev;
        if (line.lineDepthAbs === 1) {
          if (line.lineType[1] === "h") {
            return 0;
          } else {
            return 1;
          }
        } else {
          linePrev = line.linePrev;
          while (linePrev.lineDepthAbs >= line.lineDepthAbs) {
            linePrev = linePrev.linePrev;
          }
          return linePrev.lineDepthRel + 1;
        }
      };

      /* ------------------------------------------------------------------------
      # Toggle line type
      #   usage : cycle : Tu => To => Lx => Th
      #   param :
      #       e = event
      */

      CNEditor.prototype._toggleLineType = function() {
        var endContainer, endDiv, endLineID, initialEndOffset, initialStartOffset, l, line, lineTypeTarget, range, sel, startContainer, startDiv, _results;
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        startDiv = startContainer;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        endDiv = endContainer;
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
        endLineID = endDiv.id;
        line = this._lines[startDiv.id];
        _results = [];
        while (true) {
          switch (line.lineType) {
            case 'Tu':
              lineTypeTarget = 'Th';
              l = line.lineNext;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                if (l.lineDepthAbs === line.lineDepthAbs) {
                  if (l.lineType === 'Tu') {
                    l.line$.prop("class", "Th-" + line.lineDepthAbs);
                    l.lineType = 'Th';
                  } else {
                    l.line$.prop("class", "Lh-" + line.lineDepthAbs);
                    l.lineType = 'Lh';
                  }
                }
                l = l.lineNext;
              }
              l = line.linePrev;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                if (l.lineDepthAbs === line.lineDepthAbs) {
                  if (l.lineType === 'Tu') {
                    l.line$.prop("class", "Th-" + line.lineDepthAbs);
                    l.lineType = 'Th';
                  } else {
                    l.line$.prop("class", "Lh-" + line.lineDepthAbs);
                    l.lineType = 'Lh';
                  }
                }
                l = l.linePrev;
              }
              break;
            case 'Th':
              lineTypeTarget = 'Tu';
              l = line.lineNext;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                if (l.lineDepthAbs === line.lineDepthAbs) {
                  if (l.lineType === 'Th') {
                    l.line$.prop("class", "Tu-" + line.lineDepthAbs);
                    l.lineType = 'Tu';
                  } else {
                    l.line$.prop("class", "Lu-" + line.lineDepthAbs);
                    l.lineType = 'Lu';
                  }
                }
                l = l.lineNext;
              }
              l = line.linePrev;
              while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
                if (l.lineDepthAbs === line.lineDepthAbs) {
                  if (l.lineType === 'Th') {
                    l.line$.prop("class", "Tu-" + line.lineDepthAbs);
                    l.lineType = 'Tu';
                  } else {
                    l.line$.prop("class", "Lu-" + line.lineDepthAbs);
                    l.lineType = 'Lu';
                  }
                }
                l = l.linePrev;
              }
              break;
            default:
              lineTypeTarget = false;
          }
          if (lineTypeTarget) {
            line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
            line.lineType = lineTypeTarget;
          }
          if (line.lineID === endDiv.id) {
            break;
          } else {
            _results.push(line = line.lineNext);
          }
        }
        return _results;
      };

      /* ------------------------------------------------------------------------
      # tab keypress
      #   l = optional : a line to indent. If none, the selection will be indented
      */

      CNEditor.prototype.tab = function(l) {
        var endDiv, endLineID, isTabAllowed, line, lineNext, linePrev, linePrevSibling, lineTypeTarget, nextLineType, range, sel, startDiv, _results;
        if (l != null) {
          startDiv = l.line$[0];
          endDiv = startDiv;
        } else {
          sel = rangy.getIframeSelection(this.editorIframe);
          range = sel.getRangeAt(0);
          startDiv = range.startContainer;
          endDiv = range.endContainer;
        }
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
        endLineID = endDiv.id;
        line = this._lines[startDiv.id];
        _results = [];
        while (true) {
          switch (line.lineType) {
            case 'Tu':
            case 'Th':
              linePrevSibling = this._findPrevSibling(line);
              if (linePrevSibling === null) {
                isTabAllowed = false;
              } else {
                isTabAllowed = true;
                if (linePrevSibling.lineType === 'Th') {
                  lineTypeTarget = 'Lh';
                } else {
                  if (linePrevSibling.lineType === 'Tu') {
                    lineTypeTarget = 'Lu';
                  } else {
                    lineTypeTarget = 'Lo';
                  }
                  if (line.lineType === 'Th') {
                    lineNext = line.lineNext;
                    while (lineNext !== null && lineNext.lineDepthAbs > line.lineDepthAbs) {
                      switch (lineNext.lineType) {
                        case 'Th':
                          lineNext.lineType = 'Tu';
                          line.line$.prop("class", "Tu-" + lineNext.lineDepthAbs);
                          nextLineType = prevTxType;
                          break;
                        case 'Tu':
                          nextLineType = 'Lu';
                          break;
                        case 'To':
                          nextLineType = 'Lo';
                          break;
                        case 'Lh':
                          lineNext.lineType = nextLineType;
                          line.line$.prop("class", "" + nextLineType + "-" + lineNext.lineDepthAbs);
                      }
                    }
                  }
                }
              }
              break;
            case 'Lh':
            case 'Lu':
            case 'Lo':
              lineNext = line.lineNext;
              lineTypeTarget = null;
              while (lineNext !== null && lineNext.lineDepthAbs >= line.lineDepthAbs) {
                if (lineNext.lineDepthAbs === line.lineDepthAbs + 1) {
                  lineTypeTarget = lineNext.lineType;
                  lineNext = null;
                } else {
                  lineNext = lineNext.lineNext;
                }
              }
              if (lineTypeTarget === null) {
                linePrev = line.linePrev;
                while (linePrev !== null && linePrev.lineDepthAbs >= line.lineDepthAbs) {
                  if (linePrev.lineDepthAbs === line.lineDepthAbs + 1) {
                    lineTypeTarget = linePrev.lineType;
                    linePrev = null;
                  } else {
                    linePrev = linePrev.linePrev;
                  }
                }
              }
              if (lineTypeTarget === null) {
                isTabAllowed = true;
                lineTypeTarget = 'Tu';
                line.lineDepthAbs += 1;
                line.lineDepthRel += 1;
              } else {
                if (lineTypeTarget === 'Th') {
                  isTabAllowed = true;
                  line.lineDepthAbs += 1;
                  line.lineDepthRel = 0;
                }
                if (lineTypeTarget === 'Tu' || lineTypeTarget === 'To') {
                  isTabAllowed = true;
                  line.lineDepthAbs += 1;
                  line.lineDepthRel += 1;
                }
              }
          }
          if (isTabAllowed) {
            line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
            line.lineType = lineTypeTarget;
          }
          if (line.lineID === endLineID) {
            break;
          } else {
            _results.push(line = line.lineNext);
          }
        }
        return _results;
      };

      /* ------------------------------------------------------------------------
      # shift + tab keypress
      #   e = event
      */

      CNEditor.prototype.shiftTab = function() {
        var endDiv, endLineID, initialEndOffset, initialStartOffset, isTabAllowed, line, lineTypeTarget, nextL, parent, range, sel, startDiv, _results;
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startDiv = range.startContainer;
        endDiv = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
        endLineID = endDiv.id;
        line = this._lines[startDiv.id];
        _results = [];
        while (true) {
          switch (line.lineType) {
            case 'Tu':
            case 'Th':
              parent = line.linePrev;
              while (parent !== null && parent.lineDepthAbs >= line.lineDepthAbs) {
                parent = parent.linePrev;
              }
              if (parent !== null) {
                isTabAllowed = true;
                lineTypeTarget = parent.lineType;
                lineTypeTarget = "L" + lineTypeTarget.charAt(1);
                line.lineDepthAbs -= 1;
                line.lineDepthRel -= parent.lineDepthRel;
                if (line.lineNext.lineType[0] === 'L') {
                  nextL = line.lineNext;
                  nextL.lineType = 'T' + nextL.lineType[1];
                  nextL.line$.prop('class', "" + nextL.lineType + "-" + nextL.lineDepthAbs);
                }
              } else {
                isTabAllowed = false;
              }
              break;
            case 'Lh':
              isTabAllowed = true;
              lineTypeTarget = 'Th';
              break;
            case 'Lu':
              isTabAllowed = true;
              lineTypeTarget = 'Tu';
              break;
            case 'Lo':
              isTabAllowed = true;
              lineTypeTarget = 'To';
          }
          if (isTabAllowed) {
            line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
            line.lineType = lineTypeTarget;
          }
          if (line.lineID === endDiv.id) {
            break;
          } else {
            _results.push(line = line.lineNext);
          }
        }
        return _results;
      };

      /* ------------------------------------------------------------------------
      # return keypress
      #   e = event
      */

      CNEditor.prototype._return = function() {
        var currSel, endLine, endOfLineFragment, newLine, range4sel, startLine;
        this._findLinesAndIsStartIsEnd();
        currSel = this.currentSel;
        startLine = currSel.startLine;
        endLine = currSel.endLine;
        if (currSel.range.collapsed) {} else if (endLine === startLine) {
          currSel.range.deleteContents();
        } else {
          this._deleteMultiLinesSelections();
          this._findLinesAndIsStartIsEnd();
          currSel = this.currentSel;
          startLine = currSel.startLine;
        }
        if (currSel.rangeIsEndLine) {
          newLine = this._insertLineAfter({
            sourceLineID: startLine.lineID,
            targetLineType: startLine.lineType,
            targetLineDepthAbs: startLine.lineDepthAbs,
            targetLineDepthRel: startLine.lineDepthRel
          });
          range4sel = rangy.createRange();
          range4sel.collapseToPoint(newLine.line$[0].firstChild, 0);
          return currSel.sel.setSingleRange(range4sel);
        } else if (currSel.rangeIsStartLine) {
          newLine = this._insertLineBefore({
            sourceLineID: startLine.lineID,
            targetLineType: startLine.lineType,
            targetLineDepthAbs: startLine.lineDepthAbs,
            targetLineDepthRel: startLine.lineDepthRel
          });
          range4sel = rangy.createRange();
          range4sel.collapseToPoint(startLine.line$[0].firstChild, 0);
          return currSel.sel.setSingleRange(range4sel);
        } else {
          currSel.range.setEndBefore(startLine.line$[0].lastChild);
          endOfLineFragment = currSel.range.extractContents();
          currSel.range.deleteContents();
          newLine = this._insertLineAfter({
            sourceLineID: startLine.lineID,
            targetLineType: startLine.lineType,
            targetLineDepthAbs: startLine.lineDepthAbs,
            targetLineDepthRel: startLine.lineDepthRel,
            fragment: endOfLineFragment
          });
          range4sel = rangy.createRange();
          range4sel.collapseToPoint(newLine.line$[0].firstChild.childNodes[0], 0);
          currSel.sel.setSingleRange(range4sel);
          return this.currentSel = null;
        }
      };

      /* ------------------------------------------------------------------------
      # turn in Th or Lh of the siblings of line (and line itself of course)
      # the children are note modified
      */

      CNEditor.prototype._titilizeSiblings = function(line) {
        var l, lineDepthAbs;
        lineDepthAbs = line.lineDepthAbs;
        l = line;
        while (l !== null && l.lineDepthAbs >= lineDepthAbs) {
          if (l.lineDepthAbs === lineDepthAbs) {
            switch (l.lineType) {
              case 'Tu':
              case 'To':
                l.line$.prop("class", "Th-" + lineDepthAbs);
                l.lineType = 'Th';
                l.lineDepthRel = 0;
                break;
              case 'Lu':
              case 'Lo':
                l.line$.prop("class", "Lh-" + lineDepthAbs);
                l.lineType = 'Lh';
                l.lineDepthRel = 0;
            }
          }
          l = l.lineNext;
        }
        l = line.linePrev;
        while (l !== null && l.lineDepthAbs >= lineDepthAbs) {
          if (l.lineDepthAbs === lineDepthAbs) {
            switch (l.lineType) {
              case 'Tu':
              case 'To':
                l.line$.prop("class", "Th-" + lineDepthAbs);
                l.lineType = 'Th';
                l.lineDepthRel = 0;
                break;
              case 'Lu':
              case 'Lo':
                l.line$.prop("class", "Lh-" + lineDepthAbs);
                l.lineType = 'Lh';
                l.lineDepthRel = 0;
            }
          }
          l = l.linePrev;
        }
        return true;
      };

      /* ------------------------------------------------------------------------
      # find the sibling line of the parent of line that is the first of the list
      # ex :
      #??  . Sibling1  <= _findParent1stSibling(line)
      #??  . Sibling2
      #??  . Parent
      #??     . child1
      #??     . line     : the line in argument
      # returns null if no previous sibling, the line otherwise
      # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
      */

      CNEditor.prototype._findParent1stSibling = function(line) {
        var lineDepthAbs, linePrev;
        lineDepthAbs = line.lineDepthAbs;
        linePrev = line.linePrev;
        if (linePrev === null) return line;
        if (lineDepthAbs <= 2) {
          while (linePrev.linePrev !== null) {
            linePrev = linePrev.linePrev;
          }
          return linePrev;
        } else {
          while (linePrev !== null && linePrev.lineDepthAbs > (lineDepthAbs - 2)) {
            linePrev = linePrev.linePrev;
          }
          return linePrev.lineNext;
        }
      };

      /* ------------------------------------------------------------------------
      # find the previous sibling line.
      # returns null if no previous sibling, the line otherwise
      # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
      */

      CNEditor.prototype._findPrevSibling = function(line) {
        var lineDepthAbs, linePrevSibling;
        lineDepthAbs = line.lineDepthAbs;
        linePrevSibling = line.linePrev;
        if (linePrevSibling === null) {
          return null;
        } else if (linePrevSibling.lineDepthAbs < lineDepthAbs) {
          return null;
        } else {
          while (linePrevSibling.lineDepthAbs > lineDepthAbs) {
            linePrevSibling = linePrevSibling.linePrev;
          }
          while (linePrevSibling.lineType[0] === 'L') {
            linePrevSibling = linePrevSibling.linePrev;
          }
          return linePrevSibling;
        }
      };

      /* ------------------------------------------------------------------------
      #   delete the user multi line selection
      #
      #   prerequisite : at least 2 lines must be selected
      # 
      #   parameters :
      #        :
      #
      */

      CNEditor.prototype._deleteMultiLinesSelections = function(startLine, endLine) {
        var deltaDepth, deltaDepth1stLine, depthSibling, endLineDepthAbs, endOfLineFragment, firstLineAfterSiblingsOfDeleted, line, newDepth, prevSiblingType, range, range4caret, range4fragment, startContainer, startLineDepthAbs, startOffset;
        if (startLine !== void 0) {
          range = rangy.createRange();
          range.setStartBefore(startLine.line$);
          range.setStartAfter(endLine.line$);
        } else {
          this._findLines();
          range = this.currentSel.range;
          startContainer = range.startContainer;
          startOffset = range.startOffset;
          startLine = this.currentSel.startLine;
          endLine = this.currentSel.endLine;
        }
        endLineDepthAbs = endLine.lineDepthAbs;
        startLineDepthAbs = startLine.lineDepthAbs;
        deltaDepth = endLineDepthAbs - startLineDepthAbs;
        range4fragment = rangy.createRangyRange();
        range4fragment.setStart(range.endContainer, range.endOffset);
        range4fragment.setEndAfter(endLine.line$[0].lastChild);
        endOfLineFragment = range4fragment.cloneContents();
        if (endLine.lineType[1] === 'h' && startLine.lineType[1] !== 'h') {
          if (endLine.lineType[0] === 'L') {
            endLine.lineType = 'T' + endLine.lineType[1];
            endLine.line$.prop("class", "" + endLine.lineType + "-" + endLine.lineDepthAbs);
          }
          this.markerList(endLine);
        }
        range.deleteContents();
        if (startLine.line$[0].lastChild.nodeName === 'BR') {
          startLine.line$[0].removeChild(startLine.line$[0].lastChild);
        }
        startLine.line$.append(endOfLineFragment);
        startLine.lineNext = endLine.lineNext;
        if (endLine.lineNext !== null) endLine.lineNext.linePrev = startLine;
        endLine.line$.remove();
        delete this._lines[endLine.lineID];
        line = startLine.lineNext;
        if (line !== null) {
          deltaDepth1stLine = line.lineDepthAbs - startLineDepthAbs;
          if (deltaDepth1stLine >= 1) {
            while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
              newDepth = line.lineDepthAbs - deltaDepth;
              line.lineDepthAbs = newDepth;
              line.line$.prop("class", "" + line.lineType + "-" + newDepth);
              line = line.lineNext;
            }
          }
        }
        if (line !== null) {
          if (line.lineType[0] === 'L') {
            line.lineType = 'T' + line.lineType[1];
            line.line$.prop("class", "" + line.lineType + "-" + line.lineDepthAbs);
          }
          firstLineAfterSiblingsOfDeleted = line;
          depthSibling = line.lineDepthAbs;
          line = line.linePrev;
          while (line !== null && line.lineDepthAbs > depthSibling) {
            line = line.linePrev;
          }
          prevSiblingType = line.lineType;
          if (firstLineAfterSiblingsOfDeleted.lineType !== prevSiblingType) {
            if (prevSiblingType[1] === 'h') {
              this._line2titleList(firstLineAfterSiblingsOfDeleted);
            } else {
              this.markerList(firstLineAfterSiblingsOfDeleted);
            }
          }
        }
        range4caret = rangy.createRange();
        range4caret.collapseToPoint(startContainer, startOffset);
        this.currentSel.sel.setSingleRange(range4caret);
        return this.currentSel = null;
      };

      /* ------------------------------------------------------------------------
      # Insert a line after a source line
      # p = 
      #     sourceLineID       : ID of the line after which the line will be added
      #     fragment           : [optionnal] - an html fragment that will be added
      #     targetLineType     : type of the line to add
      #     targetLineDepthAbs : absolute depth of the line to add
      #     targetLineDepthRel : relative depth of the line to add
      */

      CNEditor.prototype._insertLineAfter = function(p) {
        var lineID, newLine, newLine$, sourceLine;
        this._highestId += 1;
        lineID = 'CNID_' + this._highestId;
        newLine$ = $("<div id='" + lineID + "' class='" + p.targetLineType + "-" + p.targetLineDepthAbs + "'></div>");
        if (p.fragment != null) {
          newLine$.append(p.fragment);
          newLine$.append('<br>');
        } else {
          newLine$.append($('<span></span><br>'));
        }
        sourceLine = this._lines[p.sourceLineID];
        newLine$ = newLine$.insertAfter(sourceLine.line$);
        newLine = {
          line$: newLine$,
          lineID: lineID,
          lineType: p.targetLineType,
          lineDepthAbs: p.targetLineDepthAbs,
          lineDepthRel: p.targetLineDepthRel,
          lineNext: sourceLine.lineNext,
          linePrev: sourceLine
        };
        this._lines[lineID] = newLine;
        if (sourceLine.lineNext !== null) sourceLine.lineNext.linePrev = newLine;
        sourceLine.lineNext = newLine;
        return newLine;
      };

      /* ------------------------------------------------------------------------
      # Insert a line before a source line
      # p = 
      #     sourceLineID       : ID of the line before which a line will be added
      #     fragment           : [optionnal] - an html fragment that will be added
      #     targetLineType     : type of the line to add
      #     targetLineDepthAbs : absolute depth of the line to add
      #     targetLineDepthRel : relative depth of the line to add
      */

      CNEditor.prototype._insertLineBefore = function(p) {
        var lineID, newLine, newLine$, sourceLine;
        this._highestId += 1;
        lineID = 'CNID_' + this._highestId;
        newLine$ = $("<div id='" + lineID + "' class='" + p.targetLineType + "-" + p.targetLineDepthAbs + "'></div>");
        if (p.fragment != null) {
          newLine$.append(p.fragment);
          newLine$.append($('<br>'));
        } else {
          newLine$.append($('<span></span><br>'));
        }
        sourceLine = this._lines[p.sourceLineID];
        newLine$ = newLine$.insertBefore(sourceLine.line$);
        newLine = {
          line$: newLine$,
          lineID: lineID,
          lineType: p.targetLineType,
          lineDepthAbs: p.targetLineDepthAbs,
          lineDepthRel: p.targetLineDepthRel,
          lineNext: sourceLine,
          linePrev: sourceLine.linePrev
        };
        this._lines[lineID] = newLine;
        if (sourceLine.linePrev !== null) sourceLine.linePrev.lineNext = newLine;
        sourceLine.linePrev = newLine;
        return newLine;
      };

      /* ------------------------------------------------------------------------
      #??Finds :
      #   First and last line of selection. 
      # Remark :
      #   Only the first range of the selections is taken into account.
      # Returns : 
      #   sel : the selection
      #   range : the 1st range of the selections
      #   startLine : the 1st line of the range
      #   endLine : the last line of the range
      */

      CNEditor.prototype._findLines = function() {
        var endContainer, endLine, initialEndOffset, initialStartOffset, range, sel, startContainer, startLine;
        if (this.currentSel === null) {
          sel = rangy.getIframeSelection(this.editorIframe);
          range = sel.getRangeAt(0);
          startContainer = range.startContainer;
          endContainer = range.endContainer;
          initialStartOffset = range.startOffset;
          initialEndOffset = range.endOffset;
          if ((endContainer.id != null) && endContainer.id.substr(0, 5) === 'CNID_') {
            endLine = this._lines[endContainer.id];
          } else {
            endLine = this._lines[$(endContainer).parents("div")[0].id];
          }
          if (startContainer.nodeName === 'DIV') {
            startLine = this._lines[startContainer.id];
          } else {
            startLine = this._lines[$(startContainer).parents("div")[0].id];
          }
          return this.currentSel = {
            sel: sel,
            range: range,
            startLine: startLine,
            endLine: endLine,
            rangeIsStartLine: null,
            rangeIsEndLine: null
          };
        }
      };

      /* ------------------------------------------------------------------------
      #??Finds :
      #   first and last line of selection 
      #   wheter the selection starts at the beginning of startLine or not
      #   wheter the selection ends at the end of endLine or not
      # 
      # Remark :
      #   Only the first range of the selections is taken into account.
      #
      # Returns : 
      #   sel : the selection
      #   range : the 1st range of the selections
      #   startLine : the 1st line of the range
      #   endLine : the last line of the range
      #   rangeIsEndLine : true if the range ends at the end of the last line
      #   rangeIsStartLine : turu if the range starts at the start of 1st line
      */

      CNEditor.prototype._findLinesAndIsStartIsEnd = function() {
        var endContainer, endLine, initialEndOffset, initialStartOffset, nextSibling, parentEndContainer, range, rangeIsEndLine, rangeIsStartLine, sel, startContainer, startLine;
        if (this.currentSel === null) {
          sel = rangy.getIframeSelection(this.editorIframe);
          range = sel.getRangeAt(0);
          startContainer = range.startContainer;
          endContainer = range.endContainer;
          initialStartOffset = range.startOffset;
          initialEndOffset = range.endOffset;
          if ((endContainer.id != null) && endContainer.id.substr(0, 5) === 'CNID_') {
            endLine = this._lines[endContainer.id];
            rangeIsEndLine = (endContainer.children.length - 1 === initialEndOffset) || (endContainer.children[initialEndOffset].nodeName === "BR");
          } else {
            endLine = this._lines[$(endContainer).parents("div")[0].id];
            parentEndContainer = endContainer;
            rangeIsEndLine = false;
            if (parentEndContainer.nodeType === Node.TEXT_NODE) {
              rangeIsEndLine = initialEndOffset === parentEndContainer.textContent.length;
            } else {
              nextSibling = parentEndContainer.nextSibling;
              rangeIsEndLine = nextSibling === null || nextSibling.nodeName === 'BR';
            }
            parentEndContainer = endContainer.parentNode;
            while (rangeIsEndLine && parentEndContainer.nodeName !== "DIV") {
              nextSibling = parentEndContainer.nextSibling;
              rangeIsEndLine = nextSibling === null || nextSibling.nodeName === 'BR';
              parentEndContainer = parentEndContainer.parentNode;
            }
          }
          if (startContainer.nodeName === 'DIV') {
            startLine = this._lines[startContainer.id];
            rangeIsStartLine = initialStartOffset === 0;
            if (initialStartOffset === 1 && startContainer.innerHTML === "<span></span><br>") {
              rangeIsStartLine = true;
            }
          } else {
            startLine = this._lines[$(startContainer).parents("div")[0].id];
            rangeIsStartLine = initialStartOffset === 0;
            while (rangeIsStartLine && parentEndContainer.nodeName !== "DIV") {
              rangeIsStartLine = parentEndContainer.previousSibling === null;
              parentEndContainer = parentEndContainer.parentNode;
            }
          }
          return this.currentSel = {
            sel: sel,
            range: range,
            startLine: startLine,
            endLine: endLine,
            rangeIsStartLine: rangeIsStartLine,
            rangeIsEndLine: rangeIsEndLine
          };
        }
      };

      /*  -----------------------------------------------------------------------
      # Parse a raw html inserted in the iframe in order to update the controler
      */

      CNEditor.prototype._readHtml = function() {
        var DeltaDepthAbs, htmlLine, htmlLine$, lineClass, lineDepthAbs, lineDepthAbs_old, lineDepthRel, lineDepthRel_old, lineID, lineID_st, lineNew, lineNext, linePrev, lineType, linesDiv$, _i, _len, _ref;
        linesDiv$ = this.editorBody$.children();
        lineDepthAbs = 0;
        lineDepthRel = 0;
        lineID = 0;
        this._lines = {};
        linePrev = null;
        lineNext = null;
        for (_i = 0, _len = linesDiv$.length; _i < _len; _i++) {
          htmlLine = linesDiv$[_i];
          htmlLine$ = $(htmlLine);
          lineClass = (_ref = htmlLine$.attr('class')) != null ? _ref : "";
          lineClass = lineClass.split('-');
          lineType = lineClass[0];
          if (lineType !== "") {
            lineDepthAbs_old = lineDepthAbs;
            lineDepthAbs = +lineClass[1];
            DeltaDepthAbs = lineDepthAbs - lineDepthAbs_old;
            lineDepthRel_old = lineDepthRel;
            if (lineType === "Th") {
              lineDepthRel = 0;
            } else {
              lineDepthRel = lineDepthRel_old + DeltaDepthAbs;
            }
            lineID = parseInt(lineID, 10) + 1;
            lineID_st = "CNID_" + lineID;
            htmlLine$.prop("id", lineID_st);
            lineNew = {
              line$: htmlLine$,
              lineID: lineID_st,
              lineType: lineType,
              lineDepthAbs: lineDepthAbs,
              lineDepthRel: lineDepthRel,
              lineNext: null,
              linePrev: linePrev
            };
            if (linePrev !== null) linePrev.lineNext = lineNew;
            linePrev = lineNew;
            this._lines[lineID_st] = lineNew;
          }
        }
        return this._highestId = lineID;
      };

      /* ------------------------------------------------------------------------
      # Checks whether the lines are well structured or not
      # Some suggestions of what could be checked out:
      #    <> each elt of lines corresponds to a DIV ----------------(  )
      #    <> each DIV has a matching elt in lines ------------------(  )
      #    <> type and depth are coherent ---------------------------(OK)
      #    <> linePrev and LineNext are linked to the correct DIV ---(  )
      #    <> hierarchy of lines and indentation are okay -----------(OK)
      #    <> a DIV contains a sequence of SPAN ended by a BR -------(  )
      #    <> two successive SPAN can't have the same class ---------(  )
      #    <> empty SPAN are really empty (<span></span>) -----------(  )
      #    <> a note must  have at least one line
      */

      CNEditor.prototype.checkLines = function() {
        var child, children, currentLine, depth, element, error, i, id, iframeGet, iframeNumberOfLines, lastClass, myAncestor, nextLine, nodeType, possibleSon, prevLine, recVerif, root, type, _ref, _ref2;
        console.log('Lines are being checked');
        possibleSon = {
          "Th": function(name) {
            return name === "Lh" || name === "Th" || name === "To" || name === "Tu";
          },
          "Tu": function(name) {
            return name === "Lu" || name === "To" || name === "Tu";
          },
          "To": function(name) {
            return name === "Lu" || name === "To" || name === "Tu";
          },
          "Lh": function(name) {
            return false;
          },
          "Lu": function(name) {
            return false;
          },
          "Lo": function(name) {
            return false;
          },
          "root": function(name) {
            return true;
          }
        };
        nodeType = function(name) {
          if (name === "Lh" || name === "Lu" || name === "Lo") {
            return "L";
          } else if (name === "Th" || name === "Tu" || name === "To") {
            return "T";
          } else {
            return "ERR";
          }
        };
        id = function(line) {
          if (line === null) {
            return -1;
          } else {
            return parseInt(line.lineID.split("_")[1], 10);
          }
        };
        error = function(num) {
          return alert("Une erreur s'est produite ligne " + num);
        };
        iframeGet = function(myId) {
          return $(window.frames[0].document.getElementById(myId));
        };
        iframeNumberOfLines = function() {
          return (window.frames[0].document.getElementsByTagName('DIV')).length;
        };
        root = {
          lineType: "root",
          lineID: "CNID_0",
          lineNext: this._lines["CNID_1"],
          linePrev: null,
          lineDepthAbs: 0
        };
        myAncestor = [root];
        prevLine = null;
        currentLine = root;
        nextLine = root.lineNext;
        while (nextLine !== null) {
          type = nodeType(nextLine.lineType);
          depth = nextLine.lineDepthAbs;
          if (iframeGet("CNID_" + (id(nextLine))) === null) error(id(nextLine));
          if (!((id(prevLine) + 2 === (_ref = id(currentLine) + 1) && _ref === id(nextLine)))) {
            error(id(nextLine));
          }
          element = iframeGet("CNID_" + (id(nextLine)));
          children = element.children();
          if (children === null || children.length < 2) error(id(nextLine));
          for (i = 0, _ref2 = children.length - 1; 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
            child = children.get(i);
            if (child.nodeName === 'SPAN') {
              if ($(child).attr('class') != null) {
                if (lastClass === $(child).attr('class')) {
                  error(id(nextLine));
                } else {
                  lastClass = $(child).attr('class');
                }
              } else if (child.nodeName === 'A' || child.nodeName === 'IMG') {
                lastClass = void 0;
              }
            } else {
              if (child.nodeName !== 'BR' || i < children.length - 1) {
                error(id(nextLine));
              }
            }
          }
          if (type === "T") {
            if (depth > myAncestor.length) {
              myAncestor.push(nextLine);
            } else {
              myAncestor[depth] = nextLine;
            }
            if (!(myAncestor[depth - 1].sons != null)) {
              myAncestor[depth - 1].sons = [];
            }
            myAncestor[depth - 1].sons.push(nextLine);
          } else if (type === "L") {
            if (!(myAncestor[depth].sons != null)) myAncestor[depth].sons = [];
            myAncestor[depth].sons.push(nextLine);
          }
          prevLine = currentLine;
          currentLine = nextLine;
          nextLine = currentLine.lineNext;
        }
        if (id(currentLine) !== iframeNumberOfLines()) {
          alert("We should have " + (id(currentLine)) + " = " + (iframeNumberOfLines()));
          error(id(currentLine));
        }
        recVerif = function(line) {
          var i, _ref3, _results;
          if (line.sons != null) {
            _results = [];
            for (i = 0, _ref3 = line.sons.length - 1; 0 <= _ref3 ? i <= _ref3 : i >= _ref3; 0 <= _ref3 ? i++ : i--) {
              child = line.sons[i];
              if (!possibleSon[line.lineType](child.lineType)) {
                alert("struct " + child.lineType + "-" + child.lineDepthAbs);
              }
              if (nodeType(child.lineType) === "T") {
                if (line.lineDepthAbs + 1 !== child.lineDepthAbs) {
                  alert("indent title " + child.lineType + "-" + child.lineDepthAbs);
                }
                _results.push(recVerif(child));
              } else if (nodeType(child.lineType) === "L") {
                if (line.lineDepthAbs !== child.lineDepthAbs) {
                  _results.push(alert("indent line " + child.lineType + "-" + child.lineDepthAbs));
                } else {
                  _results.push(void 0);
                }
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
        return recVerif(root);
      };

      return CNEditor;

    })(Backbone.View);

  }).call(this);
  
}