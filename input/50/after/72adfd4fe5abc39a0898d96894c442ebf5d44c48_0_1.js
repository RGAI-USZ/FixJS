function(path)
    {
        try {
            var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(path);
            return file;
        }
        catch (e) {
            return false;
        }
    }