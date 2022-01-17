f    {
        var cursorOnEnter = cursor;
        var gotoCase = 1;
        var YYMARKER;
        while (1) {
            switch (gotoCase)
            // Following comment is replaced with generated state machine.

        {
            case 1: var yych;
            var yyaccept = 0;
            if (this.getLexCondition() < 3) {
                if (this.getLexCondition() < 1) {
                    { gotoCase = this.case_DIV; continue; };
                } else {
                    if (this.getLexCondition() < 2) {
                        { gotoCase = this.case_NODIV; continue; };
                    } else {
                        { gotoCase = this.case_COMMENT; continue; };
                    }
                }
            } else {
                if (this.getLexCondition() < 4) {
                    { gotoCase = this.case_DSTRING; continue; };
                } else {
                    if (this.getLexCondition() < 5) {
                        { gotoCase = this.case_SSTRING; continue; };
                    } else {
                        { gotoCase = this.case_REGEX; continue; };
                    }
                }
            }
/* *********************************** */
case this.case_COMMENT:

            yych = this._charAt(cursor);
            if (yych <= '\f') {
                if (yych == '\n') { gotoCase = 4; continue; };
                { gotoCase = 3; continue; };
            } else {
                if (yych <= '\r') { gotoCase = 4; continue; };
                if (yych == '*') { gotoCase = 6; continue; };
                { gotoCase = 3; continue; };
            }
case 2:
            { this.tokenType = "javascript-comment"; return cursor; }
case 3:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 12; continue; };
case 4:
            ++cursor;
            { this.tokenType = null; return cursor; }
case 6:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == '*') { gotoCase = 9; continue; };
            if (yych != '/') { gotoCase = 11; continue; };
case 7:
            ++cursor;
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = "javascript-comment"; return cursor; }
case 9:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '*') { gotoCase = 9; continue; };
            if (yych == '/') { gotoCase = 7; continue; };
case 11:
            yyaccept = 0;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 12:
            if (yych <= '\f') {
                if (yych == '\n') { gotoCase = 2; continue; };
                { gotoCase = 11; continue; };
            } else {
                if (yych <= '\r') { gotoCase = 2; continue; };
                if (yych == '*') { gotoCase = 9; continue; };
                { gotoCase = 11; continue; };
            }
/* *********************************** */
case this.case_DIV:
            yych = this._charAt(cursor);
            if (yych <= '9') {
                if (yych <= '(') {
                    if (yych <= '#') {
                        if (yych <= ' ') { gotoCase = 15; continue; };
                        if (yych <= '!') { gotoCase = 17; continue; };
                        if (yych <= '"') { gotoCase = 19; continue; };
                    } else {
                        if (yych <= '%') {
                            if (yych <= '$') { gotoCase = 20; continue; };
                            { gotoCase = 22; continue; };
                        } else {
                            if (yych <= '&') { gotoCase = 23; continue; };
                            if (yych <= '\'') { gotoCase = 24; continue; };
                            { gotoCase = 25; continue; };
                        }
                    }
                } else {
                    if (yych <= ',') {
                        if (yych <= ')') { gotoCase = 26; continue; };
                        if (yych <= '*') { gotoCase = 28; continue; };
                        if (yych <= '+') { gotoCase = 29; continue; };
                        { gotoCase = 25; continue; };
                    } else {
                        if (yych <= '.') {
                            if (yych <= '-') { gotoCase = 30; continue; };
                            { gotoCase = 31; continue; };
                        } else {
                            if (yych <= '/') { gotoCase = 32; continue; };
                            if (yych <= '0') { gotoCase = 34; continue; };
                            { gotoCase = 36; continue; };
                        }
                    }
                }
            } else {
                if (yych <= '\\') {
                    if (yych <= '>') {
                        if (yych <= ';') { gotoCase = 25; continue; };
                        if (yych <= '<') { gotoCase = 37; continue; };
                        if (yych <= '=') { gotoCase = 38; continue; };
                        { gotoCase = 39; continue; };
                    } else {
                        if (yych <= '@') {
                            if (yych <= '?') { gotoCase = 25; continue; };
                        } else {
                            if (yych <= 'Z') { gotoCase = 20; continue; };
                            if (yych <= '[') { gotoCase = 25; continue; };
                            { gotoCase = 40; continue; };
                        }
                    }
                } else {
                    if (yych <= 'z') {
                        if (yych <= '^') {
                            if (yych <= ']') { gotoCase = 25; continue; };
                            { gotoCase = 41; continue; };
                        } else {
                            if (yych != '`') { gotoCase = 20; continue; };
                        }
                    } else {
                        if (yych <= '|') {
                            if (yych <= '{') { gotoCase = 25; continue; };
                            { gotoCase = 42; continue; };
                        } else {
                            if (yych <= '~') { gotoCase = 25; continue; };
                            if (yych >= 0x80) { gotoCase = 20; continue; };
                        }
                    }
                }
            }
case 15:
            ++cursor;
case 16:
            { this.tokenType = null; return cursor; }
case 17:
            ++cursor;
            if ((yych = this._charAt(cursor)) == '=') { gotoCase = 115; continue; };
case 18:
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = null; return cursor; }
case 19:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == '\n') { gotoCase = 16; continue; };
            if (yych == '\r') { gotoCase = 16; continue; };
            { gotoCase = 107; continue; };
case 20:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 50; continue; };
case 21:
            {
                    var token = this._line.substring(cursorOnEnter, cursor);
                    if (WebInspector.SourceJavaScriptTokenizer.Keywords[token] === true && token !== "__proto__")
                        this.tokenType = "javascript-keyword";
                    else
                        this.tokenType = "javascript-ident";
                    return cursor;
                }
case 22:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 23:
            yych = this._charAt(++cursor);
            if (yych == '&') { gotoCase = 43; continue; };
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 24:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == '\n') { gotoCase = 16; continue; };
            if (yych == '\r') { gotoCase = 16; continue; };
            { gotoCase = 96; continue; };
case 25:
            yych = this._charAt(++cursor);
            { gotoCase = 18; continue; };
case 26:
            ++cursor;
            { this.tokenType = null; return cursor; }
case 28:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 29:
            yych = this._charAt(++cursor);
            if (yych == '+') { gotoCase = 43; continue; };
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 30:
            yych = this._charAt(++cursor);
            if (yych == '-') { gotoCase = 43; continue; };
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 31:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 18; continue; };
            if (yych <= '9') { gotoCase = 89; continue; };
            { gotoCase = 18; continue; };
case 32:
            yyaccept = 2;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= '.') {
                if (yych == '*') { gotoCase = 78; continue; };
            } else {
                if (yych <= '/') { gotoCase = 80; continue; };
                if (yych == '=') { gotoCase = 77; continue; };
            }
case 33:
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = null; return cursor; }
case 34:
            yyaccept = 3;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= 'E') {
                if (yych <= '/') {
                    if (yych == '.') { gotoCase = 63; continue; };
                } else {
                    if (yych <= '7') { gotoCase = 72; continue; };
                    if (yych >= 'E') { gotoCase = 62; continue; };
                }
            } else {
                if (yych <= 'd') {
                    if (yych == 'X') { gotoCase = 74; continue; };
                } else {
                    if (yych <= 'e') { gotoCase = 62; continue; };
                    if (yych == 'x') { gotoCase = 74; continue; };
                }
            }
case 35:
            { this.tokenType = "javascript-number"; return cursor; }
case 36:
            yyaccept = 3;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= '9') {
                if (yych == '.') { gotoCase = 63; continue; };
                if (yych <= '/') { gotoCase = 35; continue; };
                { gotoCase = 60; continue; };
            } else {
                if (yych <= 'E') {
                    if (yych <= 'D') { gotoCase = 35; continue; };
                    { gotoCase = 62; continue; };
                } else {
                    if (yych == 'e') { gotoCase = 62; continue; };
                    { gotoCase = 35; continue; };
                }
            }
case 37:
            yych = this._charAt(++cursor);
            if (yych <= ';') { gotoCase = 18; continue; };
            if (yych <= '<') { gotoCase = 59; continue; };
            if (yych <= '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 38:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 58; continue; };
            { gotoCase = 18; continue; };
case 39:
            yych = this._charAt(++cursor);
            if (yych <= '<') { gotoCase = 18; continue; };
            if (yych <= '=') { gotoCase = 43; continue; };
            if (yych <= '>') { gotoCase = 56; continue; };
            { gotoCase = 18; continue; };
case 40:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == 'u') { gotoCase = 44; continue; };
            { gotoCase = 16; continue; };
case 41:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 42:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            if (yych != '|') { gotoCase = 18; continue; };
case 43:
            yych = this._charAt(++cursor);
            { gotoCase = 18; continue; };
case 44:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 46; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 46; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 46; continue; };
            }
case 45:
            cursor = YYMARKER;
            if (yyaccept <= 1) {
                if (yyaccept <= 0) {
                    { gotoCase = 16; continue; };
                } else {
                    { gotoCase = 21; continue; };
                }
            } else {
                if (yyaccept <= 2) {
                    { gotoCase = 33; continue; };
                } else {
                    { gotoCase = 35; continue; };
                }
            }
case 46:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 47; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 47:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 48; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 48:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 49; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 49:
            yyaccept = 1;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 50:
            if (yych <= '[') {
                if (yych <= '/') {
                    if (yych == '$') { gotoCase = 49; continue; };
                    { gotoCase = 21; continue; };
                } else {
                    if (yych <= '9') { gotoCase = 49; continue; };
                    if (yych <= '@') { gotoCase = 21; continue; };
                    if (yych <= 'Z') { gotoCase = 49; continue; };
                    { gotoCase = 21; continue; };
                }
            } else {
                if (yych <= '_') {
                    if (yych <= '\\') { gotoCase = 51; continue; };
                    if (yych <= '^') { gotoCase = 21; continue; };
                    { gotoCase = 49; continue; };
                } else {
                    if (yych <= '`') { gotoCase = 21; continue; };
                    if (yych <= 'z') { gotoCase = 49; continue; };
                    if (yych <= String.fromCharCode(0x7F)) { gotoCase = 21; continue; };
                    { gotoCase = 49; continue; };
                }
            }
case 51:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych != 'u') { gotoCase = 45; continue; };
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 53; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 53:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 54; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 54:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 55; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 55:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 49; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 49; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 49; continue; };
                { gotoCase = 45; continue; };
            }
case 56:
            yych = this._charAt(++cursor);
            if (yych <= '<') { gotoCase = 18; continue; };
            if (yych <= '=') { gotoCase = 43; continue; };
            if (yych >= '?') { gotoCase = 18; continue; };
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 58:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 59:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
case 60:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '9') {
                if (yych == '.') { gotoCase = 63; continue; };
                if (yych <= '/') { gotoCase = 35; continue; };
                { gotoCase = 60; continue; };
            } else {
                if (yych <= 'E') {
                    if (yych <= 'D') { gotoCase = 35; continue; };
                } else {
                    if (yych != 'e') { gotoCase = 35; continue; };
                }
            }
case 62:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych == '+') { gotoCase = 69; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= '-') { gotoCase = 69; continue; };
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 70; continue; };
                { gotoCase = 45; continue; };
            }
case 63:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'D') {
                if (yych <= '/') { gotoCase = 35; continue; };
                if (yych <= '9') { gotoCase = 63; continue; };
                { gotoCase = 35; continue; };
            } else {
                if (yych <= 'E') { gotoCase = 65; continue; };
                if (yych != 'e') { gotoCase = 35; continue; };
            }
case 65:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych != '+') { gotoCase = 45; continue; };
            } else {
                if (yych <= '-') { gotoCase = 66; continue; };
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 67; continue; };
                { gotoCase = 45; continue; };
            }
case 66:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 45; continue; };
            if (yych >= ':') { gotoCase = 45; continue; };
case 67:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 35; continue; };
            if (yych <= '9') { gotoCase = 67; continue; };
            { gotoCase = 35; continue; };
case 69:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 45; continue; };
            if (yych >= ':') { gotoCase = 45; continue; };
case 70:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 35; continue; };
            if (yych <= '9') { gotoCase = 70; continue; };
            { gotoCase = 35; continue; };
case 72:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 35; continue; };
            if (yych <= '7') { gotoCase = 72; continue; };
            { gotoCase = 35; continue; };
case 74:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 75; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 75:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 35; continue; };
                if (yych <= '9') { gotoCase = 75; continue; };
                { gotoCase = 35; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 75; continue; };
                if (yych <= '`') { gotoCase = 35; continue; };
                if (yych <= 'f') { gotoCase = 75; continue; };
                { gotoCase = 35; continue; };
            }
case 77:
            yych = this._charAt(++cursor);
            { gotoCase = 33; continue; };
case 78:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '\f') {
                if (yych == '\n') { gotoCase = 85; continue; };
                { gotoCase = 78; continue; };
            } else {
                if (yych <= '\r') { gotoCase = 85; continue; };
                if (yych == '*') { gotoCase = 83; continue; };
                { gotoCase = 78; continue; };
            }
case 80:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 82; continue; };
            if (yych != '\r') { gotoCase = 80; continue; };
case 82:
            { this.tokenType = "javascript-comment"; return cursor; }
case 83:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '*') { gotoCase = 83; continue; };
            if (yych == '/') { gotoCase = 87; continue; };
            { gotoCase = 78; continue; };
case 85:
            ++cursor;
            this.setLexCondition(this._lexConditions.COMMENT);
            { this.tokenType = "javascript-comment"; return cursor; }
case 87:
            ++cursor;
            { this.tokenType = "javascript-comment"; return cursor; }
case 89:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'D') {
                if (yych <= '/') { gotoCase = 35; continue; };
                if (yych <= '9') { gotoCase = 89; continue; };
                { gotoCase = 35; continue; };
            } else {
                if (yych <= 'E') { gotoCase = 91; continue; };
                if (yych != 'e') { gotoCase = 35; continue; };
            }
case 91:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych != '+') { gotoCase = 45; continue; };
            } else {
                if (yych <= '-') { gotoCase = 92; continue; };
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 93; continue; };
                { gotoCase = 45; continue; };
            }
case 92:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 45; continue; };
            if (yych >= ':') { gotoCase = 45; continue; };
case 93:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 35; continue; };
            if (yych <= '9') { gotoCase = 93; continue; };
            { gotoCase = 35; continue; };
case 95:
            ++cursor;
            yych = this._charAt(cursor);
case 96:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 45; continue; };
                if (yych <= '\f') { gotoCase = 95; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= '\'') {
                    if (yych <= '&') { gotoCase = 95; continue; };
                    { gotoCase = 98; continue; };
                } else {
                    if (yych != '\\') { gotoCase = 95; continue; };
                }
            }
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'a') {
                if (yych <= '!') {
                    if (yych <= '\n') {
                        if (yych <= '\t') { gotoCase = 45; continue; };
                        { gotoCase = 101; continue; };
                    } else {
                        if (yych == '\r') { gotoCase = 101; continue; };
                        { gotoCase = 45; continue; };
                    }
                } else {
                    if (yych <= '\'') {
                        if (yych <= '"') { gotoCase = 95; continue; };
                        if (yych <= '&') { gotoCase = 45; continue; };
                        { gotoCase = 95; continue; };
                    } else {
                        if (yych == '\\') { gotoCase = 95; continue; };
                        { gotoCase = 45; continue; };
                    }
                }
            } else {
                if (yych <= 'q') {
                    if (yych <= 'f') {
                        if (yych <= 'b') { gotoCase = 95; continue; };
                        if (yych <= 'e') { gotoCase = 45; continue; };
                        { gotoCase = 95; continue; };
                    } else {
                        if (yych == 'n') { gotoCase = 95; continue; };
                        { gotoCase = 45; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych == 's') { gotoCase = 45; continue; };
                        { gotoCase = 95; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 100; continue; };
                        if (yych <= 'v') { gotoCase = 95; continue; };
                        { gotoCase = 45; continue; };
                    }
                }
            }
case 98:
            ++cursor;
            { this.tokenType = "javascript-string"; return cursor; }
case 100:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 103; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 103; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 103; continue; };
                { gotoCase = 45; continue; };
            }
case 101:
            ++cursor;
            this.setLexCondition(this._lexConditions.SSTRING);
            { this.tokenType = "javascript-string"; return cursor; }
case 103:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 104; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 104:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 105; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 105:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 95; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 95; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 95; continue; };
                { gotoCase = 45; continue; };
            }
case 106:
            ++cursor;
            yych = this._charAt(cursor);
case 107:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 45; continue; };
                if (yych <= '\f') { gotoCase = 106; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= '"') {
                    if (yych <= '!') { gotoCase = 106; continue; };
                    { gotoCase = 98; continue; };
                } else {
                    if (yych != '\\') { gotoCase = 106; continue; };
                }
            }
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'a') {
                if (yych <= '!') {
                    if (yych <= '\n') {
                        if (yych <= '\t') { gotoCase = 45; continue; };
                        { gotoCase = 110; continue; };
                    } else {
                        if (yych == '\r') { gotoCase = 110; continue; };
                        { gotoCase = 45; continue; };
                    }
                } else {
                    if (yych <= '\'') {
                        if (yych <= '"') { gotoCase = 106; continue; };
                        if (yych <= '&') { gotoCase = 45; continue; };
                        { gotoCase = 106; continue; };
                    } else {
                        if (yych == '\\') { gotoCase = 106; continue; };
                        { gotoCase = 45; continue; };
                    }
                }
            } else {
                if (yych <= 'q') {
                    if (yych <= 'f') {
                        if (yych <= 'b') { gotoCase = 106; continue; };
                        if (yych <= 'e') { gotoCase = 45; continue; };
                        { gotoCase = 106; continue; };
                    } else {
                        if (yych == 'n') { gotoCase = 106; continue; };
                        { gotoCase = 45; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych == 's') { gotoCase = 45; continue; };
                        { gotoCase = 106; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 109; continue; };
                        if (yych <= 'v') { gotoCase = 106; continue; };
                        { gotoCase = 45; continue; };
                    }
                }
            }
case 109:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 112; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 112; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 112; continue; };
                { gotoCase = 45; continue; };
            }
case 110:
            ++cursor;
            this.setLexCondition(this._lexConditions.DSTRING);
            { this.tokenType = "javascript-string"; return cursor; }
case 112:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 113; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 113:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych >= ':') { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 114; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych >= 'g') { gotoCase = 45; continue; };
            }
case 114:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 45; continue; };
                if (yych <= '9') { gotoCase = 106; continue; };
                { gotoCase = 45; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 106; continue; };
                if (yych <= '`') { gotoCase = 45; continue; };
                if (yych <= 'f') { gotoCase = 106; continue; };
                { gotoCase = 45; continue; };
            }
case 115:
            ++cursor;
            if ((yych = this._charAt(cursor)) == '=') { gotoCase = 43; continue; };
            { gotoCase = 18; continue; };
/* *********************************** */
case this.case_DSTRING:
            yych = this._charAt(cursor);
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 120; continue; };
                if (yych <= '\f') { gotoCase = 119; continue; };
                { gotoCase = 120; continue; };
            } else {
                if (yych <= '"') {
                    if (yych <= '!') { gotoCase = 119; continue; };
                    { gotoCase = 122; continue; };
                } else {
                    if (yych == '\\') { gotoCase = 124; continue; };
                    { gotoCase = 119; continue; };
                }
            }
case 118:
            { this.tokenType = "javascript-string"; return cursor; }
case 119:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 126; continue; };
case 120:
            ++cursor;
case 121:
            { this.tokenType = null; return cursor; }
case 122:
            ++cursor;
case 123:
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = "javascript-string"; return cursor; }
case 124:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= 'e') {
                if (yych <= '\'') {
                    if (yych == '"') { gotoCase = 125; continue; };
                    if (yych <= '&') { gotoCase = 121; continue; };
                } else {
                    if (yych <= '\\') {
                        if (yych <= '[') { gotoCase = 121; continue; };
                    } else {
                        if (yych != 'b') { gotoCase = 121; continue; };
                    }
                }
            } else {
                if (yych <= 'r') {
                    if (yych <= 'm') {
                        if (yych >= 'g') { gotoCase = 121; continue; };
                    } else {
                        if (yych <= 'n') { gotoCase = 125; continue; };
                        if (yych <= 'q') { gotoCase = 121; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych <= 's') { gotoCase = 121; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 127; continue; };
                        if (yych >= 'w') { gotoCase = 121; continue; };
                    }
                }
            }
case 125:
            yyaccept = 0;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 126:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 118; continue; };
                if (yych <= '\f') { gotoCase = 125; continue; };
                { gotoCase = 118; continue; };
            } else {
                if (yych <= '"') {
                    if (yych <= '!') { gotoCase = 125; continue; };
                    { gotoCase = 133; continue; };
                } else {
                    if (yych == '\\') { gotoCase = 132; continue; };
                    { gotoCase = 125; continue; };
                }
            }
case 127:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 128; continue; };
                if (yych <= '9') { gotoCase = 129; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 129; continue; };
                if (yych <= '`') { gotoCase = 128; continue; };
                if (yych <= 'f') { gotoCase = 129; continue; };
            }
case 128:
            cursor = YYMARKER;
            if (yyaccept <= 0) {
                { gotoCase = 118; continue; };
            } else {
                { gotoCase = 121; continue; };
            }
case 129:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 128; continue; };
                if (yych >= ':') { gotoCase = 128; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 130; continue; };
                if (yych <= '`') { gotoCase = 128; continue; };
                if (yych >= 'g') { gotoCase = 128; continue; };
            }
case 130:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 128; continue; };
                if (yych >= ':') { gotoCase = 128; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 131; continue; };
                if (yych <= '`') { gotoCase = 128; continue; };
                if (yych >= 'g') { gotoCase = 128; continue; };
            }
case 131:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 128; continue; };
                if (yych <= '9') { gotoCase = 125; continue; };
                { gotoCase = 128; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 125; continue; };
                if (yych <= '`') { gotoCase = 128; continue; };
                if (yych <= 'f') { gotoCase = 125; continue; };
                { gotoCase = 128; continue; };
            }
case 132:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'e') {
                if (yych <= '\'') {
                    if (yych == '"') { gotoCase = 125; continue; };
                    if (yych <= '&') { gotoCase = 128; continue; };
                    { gotoCase = 125; continue; };
                } else {
                    if (yych <= '\\') {
                        if (yych <= '[') { gotoCase = 128; continue; };
                        { gotoCase = 125; continue; };
                    } else {
                        if (yych == 'b') { gotoCase = 125; continue; };
                        { gotoCase = 128; continue; };
                    }
                }
            } else {
                if (yych <= 'r') {
                    if (yych <= 'm') {
                        if (yych <= 'f') { gotoCase = 125; continue; };
                        { gotoCase = 128; continue; };
                    } else {
                        if (yych <= 'n') { gotoCase = 125; continue; };
                        if (yych <= 'q') { gotoCase = 128; continue; };
                        { gotoCase = 125; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych <= 's') { gotoCase = 128; continue; };
                        { gotoCase = 125; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 127; continue; };
                        if (yych <= 'v') { gotoCase = 125; continue; };
                        { gotoCase = 128; continue; };
                    }
                }
            }
case 133:
            ++cursor;
            yych = this._charAt(cursor);
            { gotoCase = 123; continue; };
/* *********************************** */
case this.case_NODIV:
            yych = this._charAt(cursor);
            if (yych <= '9') {
                if (yych <= '(') {
                    if (yych <= '#') {
                        if (yych <= ' ') { gotoCase = 136; continue; };
                        if (yych <= '!') { gotoCase = 138; continue; };
                        if (yych <= '"') { gotoCase = 140; continue; };
                    } else {
                        if (yych <= '%') {
                            if (yych <= '$') { gotoCase = 141; continue; };
                            { gotoCase = 143; continue; };
                        } else {
                            if (yych <= '&') { gotoCase = 144; continue; };
                            if (yych <= '\'') { gotoCase = 145; continue; };
                            { gotoCase = 146; continue; };
                        }
                    }
                } else {
                    if (yych <= ',') {
                        if (yych <= ')') { gotoCase = 147; continue; };
                        if (yych <= '*') { gotoCase = 149; continue; };
                        if (yych <= '+') { gotoCase = 150; continue; };
                        { gotoCase = 146; continue; };
                    } else {
                        if (yych <= '.') {
                            if (yych <= '-') { gotoCase = 151; continue; };
                            { gotoCase = 152; continue; };
                        } else {
                            if (yych <= '/') { gotoCase = 153; continue; };
                            if (yych <= '0') { gotoCase = 154; continue; };
                            { gotoCase = 156; continue; };
                        }
                    }
                }
            } else {
                if (yych <= '\\') {
                    if (yych <= '>') {
                        if (yych <= ';') { gotoCase = 146; continue; };
                        if (yych <= '<') { gotoCase = 157; continue; };
                        if (yych <= '=') { gotoCase = 158; continue; };
                        { gotoCase = 159; continue; };
                    } else {
                        if (yych <= '@') {
                            if (yych <= '?') { gotoCase = 146; continue; };
                        } else {
                            if (yych <= 'Z') { gotoCase = 141; continue; };
                            if (yych <= '[') { gotoCase = 146; continue; };
                            { gotoCase = 160; continue; };
                        }
                    }
                } else {
                    if (yych <= 'z') {
                        if (yych <= '^') {
                            if (yych <= ']') { gotoCase = 146; continue; };
                            { gotoCase = 161; continue; };
                        } else {
                            if (yych != '`') { gotoCase = 141; continue; };
                        }
                    } else {
                        if (yych <= '|') {
                            if (yych <= '{') { gotoCase = 146; continue; };
                            { gotoCase = 162; continue; };
                        } else {
                            if (yych <= '~') { gotoCase = 146; continue; };
                            if (yych >= 0x80) { gotoCase = 141; continue; };
                        }
                    }
                }
            }
case 136:
            ++cursor;
case 137:
            { this.tokenType = null; return cursor; }
case 138:
            ++cursor;
            if ((yych = this._charAt(cursor)) == '=') { gotoCase = 260; continue; };
case 139:
            { this.tokenType = null; return cursor; }
case 140:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == '\n') { gotoCase = 137; continue; };
            if (yych == '\r') { gotoCase = 137; continue; };
            { gotoCase = 252; continue; };
case 141:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 170; continue; };
case 142:
            this.setLexCondition(this._lexConditions.DIV);
            {
                    var token = this._line.substring(cursorOnEnter, cursor);
                    if (WebInspector.SourceJavaScriptTokenizer.Keywords[token] === true && token !== "__proto__")
                        this.tokenType = "javascript-keyword";
                    else
                        this.tokenType = "javascript-ident";
                    return cursor;
                }
case 143:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 144:
            yych = this._charAt(++cursor);
            if (yych == '&') { gotoCase = 163; continue; };
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 145:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == '\n') { gotoCase = 137; continue; };
            if (yych == '\r') { gotoCase = 137; continue; };
            { gotoCase = 241; continue; };
case 146:
            yych = this._charAt(++cursor);
            { gotoCase = 139; continue; };
case 147:
            ++cursor;
            this.setLexCondition(this._lexConditions.DIV);
            { this.tokenType = null; return cursor; }
case 149:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 150:
            yych = this._charAt(++cursor);
            if (yych == '+') { gotoCase = 163; continue; };
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 151:
            yych = this._charAt(++cursor);
            if (yych == '-') { gotoCase = 163; continue; };
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 152:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 139; continue; };
            if (yych <= '9') { gotoCase = 234; continue; };
            { gotoCase = 139; continue; };
case 153:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 137; continue; };
                    { gotoCase = 197; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 137; continue; };
                    if (yych <= ')') { gotoCase = 197; continue; };
                    { gotoCase = 202; continue; };
                }
            } else {
                if (yych <= 'Z') {
                    if (yych == '/') { gotoCase = 204; continue; };
                    { gotoCase = 197; continue; };
                } else {
                    if (yych <= '[') { gotoCase = 200; continue; };
                    if (yych <= '\\') { gotoCase = 199; continue; };
                    if (yych <= ']') { gotoCase = 137; continue; };
                    { gotoCase = 197; continue; };
                }
            }
case 154:
            yyaccept = 2;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= 'E') {
                if (yych <= '/') {
                    if (yych == '.') { gotoCase = 183; continue; };
                } else {
                    if (yych <= '7') { gotoCase = 192; continue; };
                    if (yych >= 'E') { gotoCase = 182; continue; };
                }
            } else {
                if (yych <= 'd') {
                    if (yych == 'X') { gotoCase = 194; continue; };
                } else {
                    if (yych <= 'e') { gotoCase = 182; continue; };
                    if (yych == 'x') { gotoCase = 194; continue; };
                }
            }
case 155:
            this.setLexCondition(this._lexConditions.DIV);
            { this.tokenType = "javascript-number"; return cursor; }
case 156:
            yyaccept = 2;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= '9') {
                if (yych == '.') { gotoCase = 183; continue; };
                if (yych <= '/') { gotoCase = 155; continue; };
                { gotoCase = 180; continue; };
            } else {
                if (yych <= 'E') {
                    if (yych <= 'D') { gotoCase = 155; continue; };
                    { gotoCase = 182; continue; };
                } else {
                    if (yych == 'e') { gotoCase = 182; continue; };
                    { gotoCase = 155; continue; };
                }
            }
case 157:
            yych = this._charAt(++cursor);
            if (yych <= ';') { gotoCase = 139; continue; };
            if (yych <= '<') { gotoCase = 179; continue; };
            if (yych <= '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 158:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 178; continue; };
            { gotoCase = 139; continue; };
case 159:
            yych = this._charAt(++cursor);
            if (yych <= '<') { gotoCase = 139; continue; };
            if (yych <= '=') { gotoCase = 163; continue; };
            if (yych <= '>') { gotoCase = 176; continue; };
            { gotoCase = 139; continue; };
case 160:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych == 'u') { gotoCase = 164; continue; };
            { gotoCase = 137; continue; };
case 161:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 162:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            if (yych != '|') { gotoCase = 139; continue; };
case 163:
            yych = this._charAt(++cursor);
            { gotoCase = 139; continue; };
case 164:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 166; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 166; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 166; continue; };
            }
case 165:
            cursor = YYMARKER;
            if (yyaccept <= 1) {
                if (yyaccept <= 0) {
                    { gotoCase = 137; continue; };
                } else {
                    { gotoCase = 142; continue; };
                }
            } else {
                if (yyaccept <= 2) {
                    { gotoCase = 155; continue; };
                } else {
                    { gotoCase = 217; continue; };
                }
            }
case 166:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 167; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 167:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 168; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 168:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 169; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 169:
            yyaccept = 1;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 170:
            if (yych <= '[') {
                if (yych <= '/') {
                    if (yych == '$') { gotoCase = 169; continue; };
                    { gotoCase = 142; continue; };
                } else {
                    if (yych <= '9') { gotoCase = 169; continue; };
                    if (yych <= '@') { gotoCase = 142; continue; };
                    if (yych <= 'Z') { gotoCase = 169; continue; };
                    { gotoCase = 142; continue; };
                }
            } else {
                if (yych <= '_') {
                    if (yych <= '\\') { gotoCase = 171; continue; };
                    if (yych <= '^') { gotoCase = 142; continue; };
                    { gotoCase = 169; continue; };
                } else {
                    if (yych <= '`') { gotoCase = 142; continue; };
                    if (yych <= 'z') { gotoCase = 169; continue; };
                    if (yych <= String.fromCharCode(0x7F)) { gotoCase = 142; continue; };
                    { gotoCase = 169; continue; };
                }
            }
case 171:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych != 'u') { gotoCase = 165; continue; };
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 173; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 173:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 174; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 174:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 175; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 175:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 169; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 169; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 169; continue; };
                { gotoCase = 165; continue; };
            }
case 176:
            yych = this._charAt(++cursor);
            if (yych <= '<') { gotoCase = 139; continue; };
            if (yych <= '=') { gotoCase = 163; continue; };
            if (yych >= '?') { gotoCase = 139; continue; };
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 178:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 179:
            yych = this._charAt(++cursor);
            if (yych == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
case 180:
            yyaccept = 2;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '9') {
                if (yych == '.') { gotoCase = 183; continue; };
                if (yych <= '/') { gotoCase = 155; continue; };
                { gotoCase = 180; continue; };
            } else {
                if (yych <= 'E') {
                    if (yych <= 'D') { gotoCase = 155; continue; };
                } else {
                    if (yych != 'e') { gotoCase = 155; continue; };
                }
            }
case 182:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych == '+') { gotoCase = 189; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= '-') { gotoCase = 189; continue; };
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 190; continue; };
                { gotoCase = 165; continue; };
            }
case 183:
            yyaccept = 2;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'D') {
                if (yych <= '/') { gotoCase = 155; continue; };
                if (yych <= '9') { gotoCase = 183; continue; };
                { gotoCase = 155; continue; };
            } else {
                if (yych <= 'E') { gotoCase = 185; continue; };
                if (yych != 'e') { gotoCase = 155; continue; };
            }
case 185:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych != '+') { gotoCase = 165; continue; };
            } else {
                if (yych <= '-') { gotoCase = 186; continue; };
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 187; continue; };
                { gotoCase = 165; continue; };
            }
case 186:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 165; continue; };
            if (yych >= ':') { gotoCase = 165; continue; };
case 187:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 155; continue; };
            if (yych <= '9') { gotoCase = 187; continue; };
            { gotoCase = 155; continue; };
case 189:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 165; continue; };
            if (yych >= ':') { gotoCase = 165; continue; };
case 190:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 155; continue; };
            if (yych <= '9') { gotoCase = 190; continue; };
            { gotoCase = 155; continue; };
case 192:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 155; continue; };
            if (yych <= '7') { gotoCase = 192; continue; };
            { gotoCase = 155; continue; };
case 194:
            yych = this._charAt(++cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 195; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 195:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 155; continue; };
                if (yych <= '9') { gotoCase = 195; continue; };
                { gotoCase = 155; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 195; continue; };
                if (yych <= '`') { gotoCase = 155; continue; };
                if (yych <= 'f') { gotoCase = 195; continue; };
                { gotoCase = 155; continue; };
            }
case 197:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '.') {
                if (yych <= '\n') {
                    if (yych <= '\t') { gotoCase = 197; continue; };
                    { gotoCase = 165; continue; };
                } else {
                    if (yych == '\r') { gotoCase = 165; continue; };
                    { gotoCase = 197; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych <= '/') { gotoCase = 220; continue; };
                    if (yych <= 'Z') { gotoCase = 197; continue; };
                    { gotoCase = 228; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 227; continue; };
                    if (yych <= ']') { gotoCase = 165; continue; };
                    { gotoCase = 197; continue; };
                }
            }
case 199:
            yych = this._charAt(++cursor);
            if (yych == '\n') { gotoCase = 165; continue; };
            if (yych == '\r') { gotoCase = 165; continue; };
            { gotoCase = 197; continue; };
case 200:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 200; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 200; continue; };
                    { gotoCase = 165; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych == '/') { gotoCase = 165; continue; };
                    { gotoCase = 200; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 215; continue; };
                    if (yych <= ']') { gotoCase = 213; continue; };
                    { gotoCase = 200; continue; };
                }
            }
case 202:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '\f') {
                if (yych == '\n') { gotoCase = 209; continue; };
                { gotoCase = 202; continue; };
            } else {
                if (yych <= '\r') { gotoCase = 209; continue; };
                if (yych == '*') { gotoCase = 207; continue; };
                { gotoCase = 202; continue; };
            }
case 204:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 206; continue; };
            if (yych != '\r') { gotoCase = 204; continue; };
case 206:
            { this.tokenType = "javascript-comment"; return cursor; }
case 207:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '*') { gotoCase = 207; continue; };
            if (yych == '/') { gotoCase = 211; continue; };
            { gotoCase = 202; continue; };
case 209:
            ++cursor;
            this.setLexCondition(this._lexConditions.COMMENT);
            { this.tokenType = "javascript-comment"; return cursor; }
case 211:
            ++cursor;
            { this.tokenType = "javascript-comment"; return cursor; }
case 213:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 213; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 213; continue; };
                    { gotoCase = 197; continue; };
                }
            } else {
                if (yych <= 'Z') {
                    if (yych == '/') { gotoCase = 220; continue; };
                    { gotoCase = 213; continue; };
                } else {
                    if (yych <= '[') { gotoCase = 218; continue; };
                    if (yych <= '\\') { gotoCase = 216; continue; };
                    { gotoCase = 213; continue; };
                }
            }
case 215:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 165; continue; };
            if (yych == '\r') { gotoCase = 165; continue; };
            { gotoCase = 200; continue; };
case 216:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 217; continue; };
            if (yych != '\r') { gotoCase = 213; continue; };
case 217:
            this.setLexCondition(this._lexConditions.REGEX);
            { this.tokenType = "javascript-regexp"; return cursor; }
case 218:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 218; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 218; continue; };
                    { gotoCase = 165; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych == '/') { gotoCase = 165; continue; };
                    { gotoCase = 218; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 225; continue; };
                    if (yych <= ']') { gotoCase = 223; continue; };
                    { gotoCase = 218; continue; };
                }
            }
case 220:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'h') {
                if (yych == 'g') { gotoCase = 220; continue; };
            } else {
                if (yych <= 'i') { gotoCase = 220; continue; };
                if (yych == 'm') { gotoCase = 220; continue; };
            }
            { this.tokenType = "javascript-regexp"; return cursor; }
case 223:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 223; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 223; continue; };
                    { gotoCase = 197; continue; };
                }
            } else {
                if (yych <= 'Z') {
                    if (yych == '/') { gotoCase = 220; continue; };
                    { gotoCase = 223; continue; };
                } else {
                    if (yych <= '[') { gotoCase = 218; continue; };
                    if (yych <= '\\') { gotoCase = 226; continue; };
                    { gotoCase = 223; continue; };
                }
            }
case 225:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 165; continue; };
            if (yych == '\r') { gotoCase = 165; continue; };
            { gotoCase = 218; continue; };
case 226:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 217; continue; };
            if (yych == '\r') { gotoCase = 217; continue; };
            { gotoCase = 223; continue; };
case 227:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 217; continue; };
            if (yych == '\r') { gotoCase = 217; continue; };
            { gotoCase = 197; continue; };
case 228:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 228; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 228; continue; };
                    { gotoCase = 165; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych == '/') { gotoCase = 165; continue; };
                    { gotoCase = 228; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 232; continue; };
                    if (yych >= '^') { gotoCase = 228; continue; };
                }
            }
case 230:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 165; continue; };
                    { gotoCase = 230; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 165; continue; };
                    if (yych <= ')') { gotoCase = 230; continue; };
                    { gotoCase = 197; continue; };
                }
            } else {
                if (yych <= 'Z') {
                    if (yych == '/') { gotoCase = 220; continue; };
                    { gotoCase = 230; continue; };
                } else {
                    if (yych <= '[') { gotoCase = 228; continue; };
                    if (yych <= '\\') { gotoCase = 233; continue; };
                    { gotoCase = 230; continue; };
                }
            }
case 232:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 165; continue; };
            if (yych == '\r') { gotoCase = 165; continue; };
            { gotoCase = 228; continue; };
case 233:
            yyaccept = 3;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 217; continue; };
            if (yych == '\r') { gotoCase = 217; continue; };
            { gotoCase = 230; continue; };
case 234:
            yyaccept = 2;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'D') {
                if (yych <= '/') { gotoCase = 155; continue; };
                if (yych <= '9') { gotoCase = 234; continue; };
                { gotoCase = 155; continue; };
            } else {
                if (yych <= 'E') { gotoCase = 236; continue; };
                if (yych != 'e') { gotoCase = 155; continue; };
            }
case 236:
            yych = this._charAt(++cursor);
            if (yych <= ',') {
                if (yych != '+') { gotoCase = 165; continue; };
            } else {
                if (yych <= '-') { gotoCase = 237; continue; };
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 238; continue; };
                { gotoCase = 165; continue; };
            }
case 237:
            yych = this._charAt(++cursor);
            if (yych <= '/') { gotoCase = 165; continue; };
            if (yych >= ':') { gotoCase = 165; continue; };
case 238:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '/') { gotoCase = 155; continue; };
            if (yych <= '9') { gotoCase = 238; continue; };
            { gotoCase = 155; continue; };
case 240:
            ++cursor;
            yych = this._charAt(cursor);
case 241:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 165; continue; };
                if (yych <= '\f') { gotoCase = 240; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= '\'') {
                    if (yych <= '&') { gotoCase = 240; continue; };
                    { gotoCase = 243; continue; };
                } else {
                    if (yych != '\\') { gotoCase = 240; continue; };
                }
            }
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'a') {
                if (yych <= '!') {
                    if (yych <= '\n') {
                        if (yych <= '\t') { gotoCase = 165; continue; };
                        { gotoCase = 246; continue; };
                    } else {
                        if (yych == '\r') { gotoCase = 246; continue; };
                        { gotoCase = 165; continue; };
                    }
                } else {
                    if (yych <= '\'') {
                        if (yych <= '"') { gotoCase = 240; continue; };
                        if (yych <= '&') { gotoCase = 165; continue; };
                        { gotoCase = 240; continue; };
                    } else {
                        if (yych == '\\') { gotoCase = 240; continue; };
                        { gotoCase = 165; continue; };
                    }
                }
            } else {
                if (yych <= 'q') {
                    if (yych <= 'f') {
                        if (yych <= 'b') { gotoCase = 240; continue; };
                        if (yych <= 'e') { gotoCase = 165; continue; };
                        { gotoCase = 240; continue; };
                    } else {
                        if (yych == 'n') { gotoCase = 240; continue; };
                        { gotoCase = 165; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych == 's') { gotoCase = 165; continue; };
                        { gotoCase = 240; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 245; continue; };
                        if (yych <= 'v') { gotoCase = 240; continue; };
                        { gotoCase = 165; continue; };
                    }
                }
            }
case 243:
            ++cursor;
            { this.tokenType = "javascript-string"; return cursor; }
case 245:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 248; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 248; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 248; continue; };
                { gotoCase = 165; continue; };
            }
case 246:
            ++cursor;
            this.setLexCondition(this._lexConditions.SSTRING);
            { this.tokenType = "javascript-string"; return cursor; }
case 248:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 249; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 249:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 250; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 250:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 240; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 240; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 240; continue; };
                { gotoCase = 165; continue; };
            }
case 251:
            ++cursor;
            yych = this._charAt(cursor);
case 252:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 165; continue; };
                if (yych <= '\f') { gotoCase = 251; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= '"') {
                    if (yych <= '!') { gotoCase = 251; continue; };
                    { gotoCase = 243; continue; };
                } else {
                    if (yych != '\\') { gotoCase = 251; continue; };
                }
            }
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'a') {
                if (yych <= '!') {
                    if (yych <= '\n') {
                        if (yych <= '\t') { gotoCase = 165; continue; };
                        { gotoCase = 255; continue; };
                    } else {
                        if (yych == '\r') { gotoCase = 255; continue; };
                        { gotoCase = 165; continue; };
                    }
                } else {
                    if (yych <= '\'') {
                        if (yych <= '"') { gotoCase = 251; continue; };
                        if (yych <= '&') { gotoCase = 165; continue; };
                        { gotoCase = 251; continue; };
                    } else {
                        if (yych == '\\') { gotoCase = 251; continue; };
                        { gotoCase = 165; continue; };
                    }
                }
            } else {
                if (yych <= 'q') {
                    if (yych <= 'f') {
                        if (yych <= 'b') { gotoCase = 251; continue; };
                        if (yych <= 'e') { gotoCase = 165; continue; };
                        { gotoCase = 251; continue; };
                    } else {
                        if (yych == 'n') { gotoCase = 251; continue; };
                        { gotoCase = 165; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych == 's') { gotoCase = 165; continue; };
                        { gotoCase = 251; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 254; continue; };
                        if (yych <= 'v') { gotoCase = 251; continue; };
                        { gotoCase = 165; continue; };
                    }
                }
            }
case 254:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 257; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 257; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 257; continue; };
                { gotoCase = 165; continue; };
            }
case 255:
            ++cursor;
            this.setLexCondition(this._lexConditions.DSTRING);
            { this.tokenType = "javascript-string"; return cursor; }
case 257:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 258; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 258:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych >= ':') { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 259; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych >= 'g') { gotoCase = 165; continue; };
            }
case 259:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 165; continue; };
                if (yych <= '9') { gotoCase = 251; continue; };
                { gotoCase = 165; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 251; continue; };
                if (yych <= '`') { gotoCase = 165; continue; };
                if (yych <= 'f') { gotoCase = 251; continue; };
                { gotoCase = 165; continue; };
            }
case 260:
            ++cursor;
            if ((yych = this._charAt(cursor)) == '=') { gotoCase = 163; continue; };
            { gotoCase = 139; continue; };
/* *********************************** */
case this.case_REGEX:
            yych = this._charAt(cursor);
            if (yych <= '.') {
                if (yych <= '\n') {
                    if (yych <= '\t') { gotoCase = 264; continue; };
                    { gotoCase = 265; continue; };
                } else {
                    if (yych == '\r') { gotoCase = 265; continue; };
                    { gotoCase = 264; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych <= '/') { gotoCase = 267; continue; };
                    if (yych <= 'Z') { gotoCase = 264; continue; };
                    { gotoCase = 269; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 270; continue; };
                    if (yych <= ']') { gotoCase = 265; continue; };
                    { gotoCase = 264; continue; };
                }
            }
case 263:
            { this.tokenType = "javascript-regexp"; return cursor; }
case 264:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 272; continue; };
case 265:
            ++cursor;
case 266:
            { this.tokenType = null; return cursor; }
case 267:
            ++cursor;
            yych = this._charAt(cursor);
            { gotoCase = 278; continue; };
case 268:
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = "javascript-regexp"; return cursor; }
case 269:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 266; continue; };
                if (yych <= '\f') { gotoCase = 276; continue; };
                { gotoCase = 266; continue; };
            } else {
                if (yych <= '*') {
                    if (yych <= ')') { gotoCase = 276; continue; };
                    { gotoCase = 266; continue; };
                } else {
                    if (yych == '/') { gotoCase = 266; continue; };
                    { gotoCase = 276; continue; };
                }
            }
case 270:
            yych = this._charAt(++cursor);
            if (yych == '\n') { gotoCase = 266; continue; };
            if (yych == '\r') { gotoCase = 266; continue; };
case 271:
            yyaccept = 0;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 272:
            if (yych <= '.') {
                if (yych <= '\n') {
                    if (yych <= '\t') { gotoCase = 271; continue; };
                    { gotoCase = 263; continue; };
                } else {
                    if (yych == '\r') { gotoCase = 263; continue; };
                    { gotoCase = 271; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych <= '/') { gotoCase = 277; continue; };
                    if (yych <= 'Z') { gotoCase = 271; continue; };
                    { gotoCase = 275; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 273; continue; };
                    if (yych <= ']') { gotoCase = 263; continue; };
                    { gotoCase = 271; continue; };
                }
            }
case 273:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 274; continue; };
            if (yych != '\r') { gotoCase = 271; continue; };
case 274:
            cursor = YYMARKER;
            if (yyaccept <= 0) {
                { gotoCase = 263; continue; };
            } else {
                { gotoCase = 266; continue; };
            }
case 275:
            ++cursor;
            yych = this._charAt(cursor);
case 276:
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 274; continue; };
                    { gotoCase = 275; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 274; continue; };
                    if (yych <= ')') { gotoCase = 275; continue; };
                    { gotoCase = 274; continue; };
                }
            } else {
                if (yych <= '[') {
                    if (yych == '/') { gotoCase = 274; continue; };
                    { gotoCase = 275; continue; };
                } else {
                    if (yych <= '\\') { gotoCase = 281; continue; };
                    if (yych <= ']') { gotoCase = 279; continue; };
                    { gotoCase = 275; continue; };
                }
            }
case 277:
            ++cursor;
            yych = this._charAt(cursor);
case 278:
            if (yych <= 'h') {
                if (yych == 'g') { gotoCase = 277; continue; };
                { gotoCase = 268; continue; };
            } else {
                if (yych <= 'i') { gotoCase = 277; continue; };
                if (yych == 'm') { gotoCase = 277; continue; };
                { gotoCase = 268; continue; };
            }
case 279:
            yyaccept = 0;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '*') {
                if (yych <= '\f') {
                    if (yych == '\n') { gotoCase = 263; continue; };
                    { gotoCase = 279; continue; };
                } else {
                    if (yych <= '\r') { gotoCase = 263; continue; };
                    if (yych <= ')') { gotoCase = 279; continue; };
                    { gotoCase = 271; continue; };
                }
            } else {
                if (yych <= 'Z') {
                    if (yych == '/') { gotoCase = 277; continue; };
                    { gotoCase = 279; continue; };
                } else {
                    if (yych <= '[') { gotoCase = 275; continue; };
                    if (yych <= '\\') { gotoCase = 282; continue; };
                    { gotoCase = 279; continue; };
                }
            }
case 281:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 274; continue; };
            if (yych == '\r') { gotoCase = 274; continue; };
            { gotoCase = 275; continue; };
case 282:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych == '\n') { gotoCase = 274; continue; };
            if (yych == '\r') { gotoCase = 274; continue; };
            { gotoCase = 279; continue; };
/* *********************************** */
case this.case_SSTRING:
            yych = this._charAt(cursor);
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 287; continue; };
                if (yych <= '\f') { gotoCase = 286; continue; };
                { gotoCase = 287; continue; };
            } else {
                if (yych <= '\'') {
                    if (yych <= '&') { gotoCase = 286; continue; };
                    { gotoCase = 289; continue; };
                } else {
                    if (yych == '\\') { gotoCase = 291; continue; };
                    { gotoCase = 286; continue; };
                }
            }
case 285:
            { this.tokenType = "javascript-string"; return cursor; }
case 286:
            yyaccept = 0;
            yych = this._charAt(YYMARKER = ++cursor);
            { gotoCase = 293; continue; };
case 287:
            ++cursor;
case 288:
            { this.tokenType = null; return cursor; }
case 289:
            ++cursor;
case 290:
            this.setLexCondition(this._lexConditions.NODIV);
            { this.tokenType = "javascript-string"; return cursor; }
case 291:
            yyaccept = 1;
            yych = this._charAt(YYMARKER = ++cursor);
            if (yych <= 'e') {
                if (yych <= '\'') {
                    if (yych == '"') { gotoCase = 292; continue; };
                    if (yych <= '&') { gotoCase = 288; continue; };
                } else {
                    if (yych <= '\\') {
                        if (yych <= '[') { gotoCase = 288; continue; };
                    } else {
                        if (yych != 'b') { gotoCase = 288; continue; };
                    }
                }
            } else {
                if (yych <= 'r') {
                    if (yych <= 'm') {
                        if (yych >= 'g') { gotoCase = 288; continue; };
                    } else {
                        if (yych <= 'n') { gotoCase = 292; continue; };
                        if (yych <= 'q') { gotoCase = 288; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych <= 's') { gotoCase = 288; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 294; continue; };
                        if (yych >= 'w') { gotoCase = 288; continue; };
                    }
                }
            }
case 292:
            yyaccept = 0;
            YYMARKER = ++cursor;
            yych = this._charAt(cursor);
case 293:
            if (yych <= '\r') {
                if (yych == '\n') { gotoCase = 285; continue; };
                if (yych <= '\f') { gotoCase = 292; continue; };
                { gotoCase = 285; continue; };
            } else {
                if (yych <= '\'') {
                    if (yych <= '&') { gotoCase = 292; continue; };
                    { gotoCase = 300; continue; };
                } else {
                    if (yych == '\\') { gotoCase = 299; continue; };
                    { gotoCase = 292; continue; };
                }
            }
case 294:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 295; continue; };
                if (yych <= '9') { gotoCase = 296; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 296; continue; };
                if (yych <= '`') { gotoCase = 295; continue; };
                if (yych <= 'f') { gotoCase = 296; continue; };
            }
case 295:
            cursor = YYMARKER;
            if (yyaccept <= 0) {
                { gotoCase = 285; continue; };
            } else {
                { gotoCase = 288; continue; };
            }
case 296:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 295; continue; };
                if (yych >= ':') { gotoCase = 295; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 297; continue; };
                if (yych <= '`') { gotoCase = 295; continue; };
                if (yych >= 'g') { gotoCase = 295; continue; };
            }
case 297:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 295; continue; };
                if (yych >= ':') { gotoCase = 295; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 298; continue; };
                if (yych <= '`') { gotoCase = 295; continue; };
                if (yych >= 'g') { gotoCase = 295; continue; };
            }
case 298:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= '@') {
                if (yych <= '/') { gotoCase = 295; continue; };
                if (yych <= '9') { gotoCase = 292; continue; };
                { gotoCase = 295; continue; };
            } else {
                if (yych <= 'F') { gotoCase = 292; continue; };
                if (yych <= '`') { gotoCase = 295; continue; };
                if (yych <= 'f') { gotoCase = 292; continue; };
                { gotoCase = 295; continue; };
            }
case 299:
            ++cursor;
            yych = this._charAt(cursor);
            if (yych <= 'e') {
                if (yych <= '\'') {
                    if (yych == '"') { gotoCase = 292; continue; };
                    if (yych <= '&') { gotoCase = 295; continue; };
                    { gotoCase = 292; continue; };
                } else {
                    if (yych <= '\\') {
                        if (yych <= '[') { gotoCase = 295; continue; };
                        { gotoCase = 292; continue; };
                    } else {
                        if (yych == 'b') { gotoCase = 292; continue; };
                        { gotoCase = 295; continue; };
                    }
                }
            } else {
                if (yych <= 'r') {
                    if (yych <= 'm') {
                        if (yych <= 'f') { gotoCase = 292; continue; };
                        { gotoCase = 295; continue; };
                    } else {
                        if (yych <= 'n') { gotoCase = 292; continue; };
                        if (yych <= 'q') { gotoCase = 295; continue; };
                        { gotoCase = 292; continue; };
                    }
                } else {
                    if (yych <= 't') {
                        if (yych <= 's') { gotoCase = 295; continue; };
                        { gotoCase = 292; continue; };
                    } else {
                        if (yych <= 'u') { gotoCase = 294; continue; };
                        if (yych <= 'v') { gotoCase = 292; continue; };
                        { gotoCase = 295; continue; };
                    }
                }
            }
case 300:
            ++cursor;
            yych = this._charAt(cursor);
            { gotoCase = 290; continue; };
        }

        }
    }