function (conf, doc, cb, msg) {
                msg.pub("start", "core/inlines");
                doc.normalize();
                if (!conf.normativeReferences) conf.normativeReferences = {};
                if (!conf.informativeReferences) conf.informativeReferences = {};

                // PRE-PROCESSING
                var abbrMap = {}, acroMap = {};
                $("abbr[title]", doc).each(function () { abbrMap[$(this).text()] = $(this).attr("title"); });
                $("acronym[title]", doc).each(function () { acroMap[$(this).text()] = $(this).attr("title"); });
                var aKeys = [];
                for (var k in abbrMap) aKeys.push(k);
                for (var k in acroMap) aKeys.push(k);
                aKeys.sort(function (a, b) {
                    if (b.length < a.length) return -1;
                    if (a.length < b.length) return 1;
                    return 0;
                });
                var abbrRx = aKeys.length ? "(?:\\b" + aKeys.join("\\b)|(?:\\b") + "\\b)" : null;

                // PROCESSING
                var txts = $("body", doc).allTextNodes(["pre"]);
                var rx = new RegExp("(\\bMUST(?:\\s+NOT)?\\b|\\bSHOULD(?:\\s+NOT)?\\b|\\bSHALL(?:\\s+NOT)?\\b|" +
                                    "\\bMAY\\b|\\b(?:NOT\\s+)?REQUIRED\\b|\\b(?:NOT\\s+)?RECOMMENDED\\b|\\bOPTIONAL\\b|" +
                                    "(?:\\[\\[(?:!)?[A-Za-z0-9-]+\\]\\])" + ( abbrRx ? "|" + abbrRx : "") + ")");
                for (var i = 0; i < txts.length; i++) {
                    var txt = txts[i];
                    var subtxt = txt.data.split(rx);

                    var df = doc.createDocumentFragment();
                    while (subtxt.length) {
                        var t = subtxt.shift();
                        var matched = null;
                        if (subtxt.length) matched = subtxt.shift();
                        df.appendChild(doc.createTextNode(t));
                        if (matched) {
                            // RFC 2129
                            if (/MUST(?:\s+NOT)?|SHOULD(?:\s+NOT)?|SHALL(?:\s+NOT)?|MAY|(?:NOT\s+)?REQUIRED|(?:NOT\s+)?RECOMMENDED|OPTIONAL/.test(matched)) {
                                matched = matched.toLowerCase();
                                df.appendChild($("<em/>").attr({ "class": "rfc2119", title: matched }).text(matched)[0]);
                            }
                            // BIBREF
                            else if (/^\[\[/.test(matched)) {
                                var ref = matched;
                                ref = ref.replace(/^\[\[/, "");
                                ref = ref.replace(/\]\]$/, "");
                                var norm = false;
                                if (ref.indexOf("!") === 0) {
                                    norm = true;
                                    ref = ref.replace(/^!/, "");
                                }
                                // contrary to before, we always insert the link
                                if (norm) conf.normativeReferences[ref] = true;
                                else      conf.informativeReferences[ref] = true;
                                df.appendChild(doc.createTextNode("["));
                                df.appendChild($("<cite/>").wrapInner($("<a/>").attr({"class": "bibref", rel: "biblioentry", href: "#bib-" + ref}).text(ref))[0]);
                                df.appendChild(doc.createTextNode("]"));
                            }
                            // ABBR
                            else if (abbrMap[matched]) {
                                if ($(txt).parents("abbr").length) df.appendChild(doc.createTextNode(matched));
                                else df.appendChild($("<abbr/>").attr({ title: abbrMap[matched] }).text(matched)[0]);
                            }
                            // ACRO
                            else if (acroMap[matched]) {
                                if ($(txt).parents("acronym").length) df.appendChild(doc.createTextNode(matched));
                                else df.appendChild($("<acronym/>").attr({ title: acroMap[matched] }).text(matched)[0]);
                            }
                            // FAIL -- not sure that this can really happen
                            else {
                                msg.pub("error", "Found token '" + matched + "' but it does not correspond to anything");
                            }
                        }
                    }
                    txt.parentNode.replaceChild(df, txt);
                }
                msg.pub("end", "core/inlines");
                cb();
            }