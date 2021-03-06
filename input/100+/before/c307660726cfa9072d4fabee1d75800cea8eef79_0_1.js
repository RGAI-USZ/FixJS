function() {

    var pofile = process.argv[2];

    if(!pofile) {
        console.log('.po file is not specifed.');
        return;
    }

    if(!path.existsSync(pofile)) {
        console.log('.po file is not exists.');
        return;
    }

    var src = fs.readFileSync(pofile);
    var dest = {};

    src = src.toString();
    src = src.split("\n");

    src.forEach(function(line, i) {

        if(line.substr(0, 'msgid'.length) === 'msgid') {

            var s = line.indexOf('"');
            var e = line.lastIndexOf('"');
            var id = line.substr(s + 1, e - s - 1);

            if(id) {

                var msgstr = src[i + 1];
                var s = msgstr.indexOf('"');
                var e = msgstr.lastIndexOf('"');

                dest[id] = msgstr.substr(s + 1, e - s - 1);

            }

        }

    });

    console.log(JSON.stringify(dest));

}