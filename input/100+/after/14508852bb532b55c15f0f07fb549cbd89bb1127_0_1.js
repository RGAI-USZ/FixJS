function parseQuery(queryString) {
  for (var
    query = {},
    amp = queryString && unescape(
      decodeURI(queryString).replace(/\+/g, " ")
    ).split("&"),
    i = 0, l = amp.length,
    eq, j, len, k, v;
    i < l;
  ) {
    eq = amp[i++].split("=");
    k = eq[0];
    v = eq.slice(1).join("=");
    if (query.hasOwnProperty(k)) {
      if (typeof query[k] == "string") {
        query[k] = [query[k]];
      }
      query[k].push(v);
    } else {
      query[k] = v;
    }
  }
  return query;
}