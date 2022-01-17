function (win, fail, args) {
        var path = args[0],
            FileReader = topCordova.nativeMethods.FileReader,
            fr = new FileReader(),
            root = fs.root.toURL();

        // Set up FileReader events
        fr.onerror = function (err) {
            if (fail) fail(err.code);
        };
        fr.onload = function (evt) {
            if (win) win(evt.target.result);
        };

        path = cleanPath(path);

        fs.root.getFile(path, {create: false}, function (entry) {
            entry.file(function (blob) {
                fr.readAsDataURL(blob);
            }, function (err) {
                if (fail) fail(err.code);
            });
        }, function (err) {
            if (fail) fail(err.code);
        });
    }