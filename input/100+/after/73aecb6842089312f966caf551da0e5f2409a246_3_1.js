function(hjs, undefined) {
	/** @const */ var NUMBER_START_PATTERN = /\d|\./;
	/** @const */ var DIGIT_PATTERN = /\d/;
	/** @const */ var HEX_DIGIT_PATTERN = /[0-9a-fA-F]/;
	/** @const */ var LETTER_PATTERN = /[a-z]/i;
	/** @const */ var LINE_TERM_PATTERN = /[\n\r\u2028\u2029]/;
	/** @const */ var WHITESPACE_PATTERN = /\s|\r|\n/;
	/** @const */ var LINE_CONTINUATOR = "¬";
	/** @const */ var DELIMITED_PATTERN = /∞|~/;

	/** @const */
	var escapes = {
		'n': '\n',
		't': '\t',
		'r': '\r',
		'\\': '\\'
	};

	/**
	 * Returns true if the given character could be the beginning of a number literal.
	 * @return {boolean}
	 */
	function isNumberStart(c) {
		return NUMBER_START_PATTERN.test(c);
	};

	/**
	 * Returns true if the given character could be the beginning of an identifier.
	 * @return {boolean}
	 */
	function isIdStart(c) {
		return LETTER_PATTERN.test(c)
			|| c == "'";
	};

	/**
	 * Returns true if the given character could be part of an identifier (but not the first character).
	 * @return {boolean}
	 */
	function isIdPart(c) {
		return c == "."
			|| c == "'"
			|| isIdStart(c)
			|| DIGIT_PATTERN.test(c);
	};

	/**
	 * Returns true if the given character is an EOL character.
	 * @return {boolean}
	 */
	function isLineTerm(c) {
		return LINE_TERM_PATTERN.test(c)
			|| c == '';
	};

	/**
	 * Returns true if the given character counts as whitespace.
	 */
	function isWhitespace(c) {
		return WHITESPACE_PATTERN.test(c);
	};

	/**
	 * Represents an object that can read HyperTalk and produce lexing tokens
	 * suitable for use by our HyperTalk parser.
	 *
	 * @constructor
	 * @param {string} source The HyperTalk script to be lexed.
	 */
	function Lexer(source) {
		this.source    = source;
		this.pos       = 0;
		this.reader    = new hjs.StringReader(source);
		this.buffer    = [];
		this.lastToken = null;
	};

	/**
	 * Represents an error that occured during lexing.
	 *
	 * @constructor
	 * @extends {Error}
	 * @param {string} message Text that describes the lexing error.
	 */
	function LexError(message) {
		if (message) {
			this.message = message;
		}
	};

	LexError.prototype = new Error("Could not understand your HyperTalk.");
	LexError.prototype.name = "LexError";

	/**
	 * A helper function that constructs a lexer token of a given type and content.
	 *
	 * @param {TokenType} type The type of token to produce.
	 * @param {string} token The content of the token.
	 * @return {Token} The constructed token.
	 */
	Lexer.prototype.__makeToken__ = function(type, token) {
		return new hjs.Token(
						type,
						token,
						this.source,
						this.reader.markedLine(),
						this.reader.markedColumn(),
						this.reader.getLine(),
						this.reader.getColumn());
	};

	/**
	 * Reads a line-term token.
	 *
	 * @param {string} firstChar
	 * @return {Token}
	 */
	Lexer.prototype.__readLineTerm__ = function(firstChar) {
		if (firstChar == "") {
			return this.__makeToken__(hjs.TokenType.LINE_TERM, "");
		}

		var numChars = 1;

		while (LINE_TERM_PATTERN.test(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		return this.__makeToken__(hjs.TokenType.LINE_TERM, this.reader.read(numChars));
	};

	/**
	 * Reads a numeric literal token.
	 *
	 * Implements JSON-style number validation as a state machine.  See
	 * http://json.org for details of the number specification.
	 *
	 * @param {string} firstChar
	 * @return {Token} A NUMBER token.
	 */
	Lexer.prototype.__readNumber__ = function(firstChar) {
		var c = firstChar;
		var numChars = 1;
		var states = {
			SIGN:          0,
			INTEGRAL:      1,
			FRACTIONAL:    2,
			EXPONENT_SIGN: 3,
			EXPONENT:      4,
			COMPLETE:      5,
			NAN:           255
		};

		var state = states.SIGN;
		var lastSign = false;

		function signOrIntegral() {
			if (c == '+' || c == '-') {
				lastSign = true;
				return states.INTEGRAL;
			}

			if (DIGIT_PATTERN.test(c)) {
				return states.INTEGRAL;
			}

			if (c == '.') {
				return states.FRACTIONAL;
			}

			throw new LexError("Invalid number literal.");
		};

		function integral() {
			if (DIGIT_PATTERN.test(c)) {
				return states.INTEGRAL;
			}

			if (c == '.') {
				return states.FRACTIONAL;
			}

			if (c == 'e' || c == 'E') {
				return states.EXPONENT_SIGN;
			}

			if (lastSign) {
				return states.NAN;
			}

			lastSign = false;

			return states.COMPLETE;
		};

		function decimal() {
			if (c != '.') {
				throw new LexError("Invalid number literal.");
			}

			return states.FRACTIONAL;
		};

		function fractional() {
			if (c == 'e' || c == 'E') {
				return states.EXPONENT_SIGN;
			}

			if (DIGIT_PATTERN.test(c)) {
				return states.FRACTIONAL;
			}

			return states.COMPLETE;
		};

		function exponent_sign() {
			if (c == '+' || c == '-' || DIGIT_PATTERN.test(c)) {
				return states.EXPONENT;
			}

			throw new LexError("Invalid number literal.");
		};

		function exponent() {
			if (DIGIT_PATTERN.test(c)) {
				return states.EXPONENT;
			}

			return states.COMPLETE;
		};

		var transitions = [signOrIntegral, integral, fractional, exponent_sign, exponent];

		while (state != states.COMPLETE) {
			state = transitions[state]();

			if (state != states.COMPLETE) {
				c = this.reader.readNextChar();
				++numChars;
			}

			if (state == states.NAN) {
				return null;
			}
		}

		// At this point, we've read the number plus one extra char.  Decrement and return the token.
		this.reader.reset();
		
		return this.__makeToken__(hjs.TokenType.NUMBER, this.reader.read(numChars - 1));
	};

	Lexer.prototype.__readHexLiteral__ = function(prefix) {
		var numChars = prefix.length;

		while (HEX_DIGIT_PATTERN.test(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		var tok = this.reader.read(numChars);

		return this.__makeToken__(hjs.TokenType.NUMBER, tok);
	};

	/**
	 * Reads a string-literal token delimited by double-quotes.
	 *
	 * @param {string} firstChar
	 * @return {Token} A STRING token.
	 */
	Lexer.prototype.__readString__ = function(firstChar) {
		var tok = '"';

		while (true) {
			var nextChar = this.reader.readNextChar();
			
			if (isLineTerm(nextChar))
				break;

			if (nextChar == '"') {
				tok += nextChar;
				break;
			}

			if (nextChar == '\\') {
				nextChar = this.reader.readNextChar();

				if (isLineTerm(nextChar))
					break;
				
				var unescaped = escapes[nextChar];

				if (typeof unescaped !== 'undefined') {
					tok += unescaped;
				} else {
					throw new LexError("Invalid escape sequence '\\" + nextChar);
				}
			} else {
				tok += nextChar;
			}
		}

		return this.__makeToken__(hjs.TokenType.STRING, tok);
	};

	/**
	 * Reads an identifier token.
	 *
	 * @param {string} firstChar
	 * @return {Token} An ID token.
	 */
	Lexer.prototype.__readId__ = function(firstChar) {
		var numChars = 1;

		while (isIdPart(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		return this.__makeToken__(hjs.TokenType.ID, this.reader.read(numChars));
	};

	/**
	 * Reads a single-line comment initiated with a hash sign, a Unicode
	 * em-dash, or a Unicode horizontal bar (U+2014 and U+2015), respectively.
	 *
	 * @param {string} firstChar
	 * @return {Token} A COMMENT token.
	 */
	Lexer.prototype.__readSingleCharComment__ = function(firstChar) {
		var numChars = 1;

		while (!isLineTerm(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		return this.__makeToken__(hjs.TokenType.COMMENT, this.reader.read(numChars));
	};

	/**
	 * Attempts to read a double-character comment, which is a single-line
	 * comment initiated with either "//" or "--".
	 *
	 * @param {string} firstChar
	 * @return {Token} A COMMENT token, or null if delimiters were wrong.
	 */
	Lexer.prototype.__readDoubleCharComment__ = function(firstChar) {
		var numChars = 2;
		var nextChar = this.reader.readNextChar();

		if (nextChar != firstChar) {
			return null;
		}

		while (!isLineTerm(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		return this.__makeToken__(hjs.TokenType.COMMENT, this.reader.read(numChars));
	};

	/**
	 * Attempts to read a "bounded comment", which is a block of text delimited
	 * by a matching set of two or more of either infinity (U+221E) or tilde
	 * characters.
	 *
	 * @param {string} firstChar
	 * @return {Token} A COMMENT token, or null if delimiters were wrong.
	 */
	Lexer.prototype.__readBoundedComment__ = function(firstChar) {
		var numChars = 2;
		var nextChar = this.reader.readNextChar();

		if (nextChar != firstChar) {
			return null;
		}

		var nextToLastChar = firstChar;
		var lastChar = nextChar;

		while (nextToLastChar == firstChar && lastChar == firstChar) {
			nextToLastChar = lastChar;
			lastChar = this.reader.readNextChar();
			++numChars;
		}

		while ((nextToLastChar != "" && nextToLastChar != firstChar) || (lastChar != "" && lastChar != firstChar)) {
			nextToLastChar = lastChar;
			lastChar = this.reader.readNextChar();
			++numChars;
		} 

		while (this.reader.readNextChar() == firstChar) ++numChars;

		this.reader.reset();
		
		return this.__makeToken__(hjs.TokenType.COMMENT, this.reader.read(numChars));
	};

	Lexer.prototype.__readLineContinuation__ = function(firstChar) {
		var numChars = 1;

		while (true) {
			var nextChar = this.reader.readNextChar();
			++numChars;

			if (isLineTerm(nextChar) && nextChar != '') {
				while (isLineTerm(nextChar = this.reader.readNextChar()) && nextChar != '') {
					++numChars;
				}

				this.reader.reset();

				return this.__makeToken__(hjs.TokenType.CONTINUATOR, this.reader.read(numChars));
			} else if (!isWhitespace(nextChar)) {
				return null;
			}
		}
	};

	Lexer.prototype.__readWhitespace__ = function(firstChar) {
		var numChars = 1;

		while (isWhitespace(this.reader.readNextChar())) {
			++numChars;
		}

		this.reader.reset();

		return this.__makeToken__(hjs.TokenType.WHITESPACE, this.reader.read(numChars));
	};

	// The workhorse.  Who needs flex, anyways?
	// My sincere thanks to Rebecca Bettencourt for doing
	// the hard stuff.
	
	/**
	 * Reads the next token from the lexer's source.
	 *
	 * @return {Token}
	 */
	Lexer.prototype.__nextToken__ = function() {
		this.reader.mark();

		var firstChar = this.reader.readNextChar();

		if (isLineTerm(firstChar) || firstChar == '') {
			return this.__readLineTerm__(firstChar);
		}

		// String literal
		if (firstChar == "\"") {
			return this.__readString__(firstChar);
		}

		// Numeric literal
		if (isNumberStart(firstChar)) {
			var maybeNumberToken = this.__readNumber__(firstChar);

			if (maybeNumberToken != null) {
				return maybeNumberToken;
			}

			// If this is null, it is because the first character was a sign
			// and the following characters were not a number literal.  This
			// may be the beginning of a comment (--) block, or the sign may
			// just be a symbol.  Either way, processing should continue.
			this.reader.reset();
			this.reader.readNextChar();
		}

		// Identifier
		if (isIdStart(firstChar)) {
			return this.__readId__(firstChar);
		}

		// Single-character comment initiator
		if (firstChar == "#" || firstChar == "\u2014" || firstChar == "\u2015") {
			return this.__readSingleCharComment__(firstChar);
		}

		// Two-character comment initiator
		if (firstChar == "-" || firstChar == "/") {
			var maybeCommentToken = this.__readDoubleCharComment__(firstChar);

			if (maybeCommentToken != null) {
				return maybeCommentToken;
			}

			// Not a comment - must be a symbol then.
			this.reader.reset();
			this.reader.readNextChar();
			return this.__makeToken__(hjs.TokenType.SYMBOL, firstChar);
		}

		// Begin-end delimited comment
		if (DELIMITED_PATTERN.test(firstChar)) {
			var maybeCommentToken = this.__readBoundedComment__(firstChar);

			if (maybeCommentToken != null) {
				return maybeCommentToken;
			}

			this.reader.reset();
			this.reader.readNextChar();
			return this.__makeToken__(hjs.TokenType.SYMBOL, firstChar);
		}

		// Line continuation
		if (firstChar == LINE_CONTINUATOR || firstChar == "\\") {
			var maybeContinuationToken = this.__readLineContinuation__(firstChar);

			if (maybeContinuationToken != null) {
				return maybeContinuationToken;
			}

			// Not a continuation, so must be a symbol.
			this.reader.reset();
			this.reader.readNextChar();
			return this.__makeToken__(hjs.TokenType.SYMBOL, firstChar);
		}

		// Whitespace
		if (isWhitespace(firstChar)) {
			return this.__readWhitespace__(firstChar);
		}

		// Symbol token
		return this.__makeToken__(hjs.TokenType.SYMBOL, firstChar);
	};

	/**
	 * Reads and returns a token, compressing intermediate special tokens
	 * (comments, whitespaces, continuations).
	 *
	 * @return {Token}
	 */
	Lexer.prototype.__assembleToken__ = function() {
		var tok = this.__nextToken__();

		while (tok.type == hjs.TokenType.COMMENT
			|| tok.type == hjs.TokenType.CONTINUATOR
			|| tok.type == hjs.TokenType.WHITESPACE) {
			var nextTok = this.__nextToken__();
			nextTok.specialToken = tok;
			tok = nextTok;
		}

		return tok;
	};

	/**
	 * Reads and returns a token from the lex stream.
	 *
	 * @return {Token}
	 */
	Lexer.prototype.getToken = function() {
		var tok = this.buffer.length > 0 ? this.buffer.unshift(1) : this.__assembleToken__();
		if (this.lastToken != null) {
			this.lastToken.next = tok;
		}

		this.lastToken = tok;

		return tok;
	};

	/**
	 * Look ahead at tokens further in the lex stream.
	 *
	 * @param {number} pos The number of tokens relative to the current position to look ahead.
	 * @return {Token}
	 */
	Lexer.prototype.lookToken = function(pos) {
		if (pos < 1) {
			return this.lastToken;
		}

		while (this.buffer.length < pos) {
			this.buffer.push(this.__assembleToken__());
		}

		return this.buffer[pos - 1];
	};

	/**
	 * Gets the original source of the lexer.
	 *
	 * @return {string}
	 */
	Lexer.prototype.getSource = function() {
		return this.source;
	};

	/**
	 * Gets the current line the lexer is on.
	 *
	 * @return {number}
	 */
	Lexer.prototype.getCurrentLine = function() {
		return this.reader.getLine();
	};

	/**
	 * Gets the current column the lexer is on.
	 *
	 * @return {number}
	 */
	Lexer.prototype.getCurrentColumn = function() {
		return this.reader.getColumn();
	};

	// Export!
	hjs.Lexer = Lexer;
	hjs.LexError = LexError;

	return hjs;

})(Hyper || {}