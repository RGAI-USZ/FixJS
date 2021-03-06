function() {
		module('Serialization');

		test('links', function() {
			testGc('<a href="http://www.example.com">link</a>',
				   ['<a href="http://www.example.com">link</a>',
					// IE7 adds a trailing slash to the href
					'<a href="http://www.example.com/">link</a>'
				   ]);
			testGc('<a href="http://www.example.com/?#anchor">link</a>', '<a href="http://www.example.com/?#anchor">link</a>');
			// TODO: IE7 fails because it makes a fully qualified URL out of the links. This issue
			// is documented for the nodeToXhtml() method.
			//testGc('<a href="relative/link">link</a>', '<a href="relative/link">link</a>');
			//testGc('<a href="/absolute/link">link</a>', '<a href="/absolute/link">link</a>');
		});
		test('empty elements without closing tag', function() {
			testGc('some <br>text', 'some <br/>text');
			testGc('some<img src="http://www.example.com/img.jpg">text', 'some<img src="http://www.example.com/img.jpg"/>text');
		});
		test('tables', function() {
			testGc('<table><tr><th>one<th>two<tr><td>three<td>four</table>', [
				'<table><tbody><tr><th>one</th><th>two</th></tr><tr><td>three</td><td>four</td></tr></tbody></table>',
				// IE adds spaces after text in each cell except the last one
				'<table><tbody><tr><th>one </th><th>two </th></tr><tr><td>three </td><td>four</td></tr></tbody></table>'
			]);
		});
		test('lists', function() {
			testGc('<ul><li><ol><li>one<li>two</ol></ul>', [
				'<ul><li><ol><li>one</li><li>two</li></ol></li></ul>',
				// IE adds a space after the text in the first list item
				'<ul><li><ol><li>one </li><li>two</li></ol></li></ul>'
			]);
		});
		test('empty elements with closing tag', function() {
			testGc('some<span></span>text', 'some<span></span>text');
			testGc('some<div></div>text', [
				'some<div></div>text',
				// IE adds a space before a div (IE8)
				'some <div></div>text'
			]);
		});
		test('boolean attributes', function() {
			testGc('<input type="checkbox" checked>',
				   [ '<input type="checkbox" checked="checked"/>',
					 // IE8 adds the value="on" even though it's not specified
				     '<input type="checkbox" checked="checked" value="on"/>' ]);
			testGc('<button disabled>',
				   [ '<button disabled="disabled"></button>',
					 // IE8 adds the type="submit" even though it's not specified
				     '<button disabled="disabled" type="submit"></button>' ]);
		});
		test('"pre" preserves spaces tabs and newlines', function() {
			var pre = "<pre>\n"
				+ "		two leading tabs\n"
				+ "        leading whitespace\n"
				+ "</pre>";
			withEditable(function(editable) {
				// On IE8, \n characters become \r characters
				equal(editable.getContents().replace(/\n/g, '\r'),
					   // The newline after the opening pre tag is lost.
					   // This is the same behaviour as with element.innerHTML.
					  ("<pre>		two leading tabs\n"
					   + "        leading whitespace\n"
					   + "</pre>").replace(/\n/g, '\r'));
			}, pre);
			var whiteSpacePre
				= '<span style="white-space: pre">\n'
				+ "		two leading tabs\n"
				+ "        leading whitespace\n"
				+ "</span>";
			withEditable(function(editable) {
				// Serializing a span with "white-space: pre" style on IE8 is unpredictable:
				// the whitespace will most of the time not be preserved, but it sometimes will (loading
				// the same page multiple times yields different results).
				// TODO: This test is disabled. The issue is documented for the nodeToXhtml() method.
				//equal(editable.getContents().replace(/\s/g, ' . '), whiteSpacePre.replace(/\s/g, ' . '));
			}, whiteSpacePre);
		});
		test('special characters in attributes', function() {
			testGc('<img src="http://www.example.com/?one=two&three&&amp;four">',
				   '<img src="http://www.example.com/?one=two&amp;three&amp;&amp;four"/>');
			testGc('<img alt="left << middle >> right">',
				   '<img alt="left &lt;&lt; middle >> right"/>');
			testGc("<img alt='some \"quoted\" text'>",
				   '<img alt="some &quot;quoted&quot; text"/>');
		});
		test('special characters in intra-element text', function() {
			testGc('<span>big < bigger < biggest</span>', '<span>big &lt; bigger &lt; biggest</span>');
			testGc('<span>You&Me&You</span>', '<span>You&amp;Me&amp;You</span>');
		});
		test('script tags', function() {
			// Script tags are not preserved (Chrome).
			// This is the same behaviour as with element.innerHTML (Chrome).
			testGc('<div>pre-script<script> if (1 < 2 && true) { } else { } </script>post-script</div>',
				   '<div>pre-scriptpost-script</div>');
		});
		test('IE conditional includes', function() {
			var conditionalInclude = '<div><!--[if IE 8 ]> <span> some text </span> <![endif]--></div>';
			// IE8 doesn't report conditional comments in contentEditable=true
			// TODO: This test is disabled. The issue is documented for the nodeToXhtml() method.
			//testGc(conditionalInclude, conditionalInclude);
		});
		test('normal comments', function() {
			// IE8 doesn't always report comments inside
			// contentEditable=true correctly. In this example the 'x'
			// before the comment is necessary, otherwise the comment
			// will not appear in the DOM.
			var comment = '<span>x<!-- some comment --></span>';
			testGc(comment, comment);
		});
		test('serializing dynamically set css attributes', function() {
			testStyle({
				// some random css properties
				'color': [ 'green', 'rgb(0, 128, 0)' ],
				'width': '5px'
			}, '<div></div>');
		});
		test('namespaced XML', function() {
			var namespacedXml
				= '<div xmlns:books="urn:loc.gov:books">'
				+ '<books:book xmlns:isbn="urn:ISBN:0-395-36341-6">'
				+ '<isbn:number>1568491379</isbn:number>'
				+ '<books:notes>'
			    // IE8 inserts a space before the p if it's not already there
				+ ' <p xmlns="http://www.w3.org/1999/xhtml">'
				+ 'This is also available <a href="http://www.w3.org/">online</a>.'
				+ '</p>'
				+ '</books:notes>'
				+ '</books:book>'
				+ '</div>';
			testGc(namespacedXml, namespacedXml);
		});
		test('IE unrecognized XML', function() {
			// The x at the beginning is required. If there is some text
			// before unrecognized elements, the DOM structure will
			// incorrect but still predictable. If there is no text
			// before unrecognized elements, the DOM structure will
			// become unpredictable in a way we can't compensate for.
			var unrecognizedXml
				= 'x<ie-unrecognized-1 some-attr="some-value">'
				+ '<ie-unrecognized-2>'
				+ '<ie-unrecognized-3>'
				+ '<span>some text</span>'
				+ '</ie-unrecognized-3>'
				+ '<ie-unrecognized-4>'
				+ 'more text'
				+ ' <span>even more text</span>'
				+ '<!-- comment -->'
				+ '</ie-unrecognized-4>'
				+ '</ie-unrecognized-2>'
				+ '<ie-unrecognized-5>'
				+ '<span> one more text</span>'
				+ '</ie-unrecognized-5>'
				+ '</ie-unrecognized-1>';
			testGc(unrecognizedXml, unrecognizedXml);
		});
	}