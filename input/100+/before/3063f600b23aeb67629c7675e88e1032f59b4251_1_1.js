function(snapshot, log, DB, room, io){
      var sandbox, SocialCalc, ss, div, parts, line, cmdstr;
      if (SC[room] != null) {
        SC[room]._doClearCache();
        return SC[room];
      }
      sandbox = vm.createContext({
        SocialCalc: null,
        ss: null,
        require: function(){
          try {
            return require('jsdom');
          } catch (__e) {}
        },
        console: console
      });
      try {
        vm.runInContext(bootSC, sandbox);
      } catch (__e) {}
      if (!sandbox.SocialCalc) {
        console.log('==> Cannot load jsdom/contextify; falling back to log-only mode without support for ="page"!A1 refs');
        SC._init = function(){
          return null;
        };
        return null;
      }
      SocialCalc = sandbox.SocialCalc;
      SocialCalc.SaveEditorSettings = function(){
        return "";
      };
      SocialCalc.CreateAuditString = function(){
        return "";
      };
      SocialCalc.CalculateEditorPositions = function(){};
      SocialCalc.Popup.Types.List.Create = function(){};
      SocialCalc.Popup.Types.ColorChooser.Create = function(){};
      SocialCalc.Popup.Initialize = function(){};
      vm.runInContext('ss = new SocialCalc.SpreadsheetControl', sandbox);
      SocialCalc.RecalcInfo.LoadSheet = function(ref){
        var serialization, parts;
        ref = ref.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
        if (SC[ref]) {
          serialization = SC[ref].CreateSpreadsheetSave();
          parts = SC[ref].DecodeSpreadsheetSave(serialization);
          SocialCalc.RecalcLoadedSheet(ref, serialization.substring(parts.sheet.start, parts.sheet.end), true);
        } else {
          SocialCalc.RecalcLoadedSheet(ref, "", true);
        }
        return true;
      };
      ss = sandbox.ss;
      delete ss.editor.StatusCallback.statusline;
      div = SocialCalc.document.createElement('div');
      SocialCalc.document.body.appendChild(div);
      ss.InitializeSpreadsheetControl(div, 0, 0, 0);
      ss._room = room;
      ss._doClearCache = function(){
        return SocialCalc.Formula.SheetCache.sheets = {};
      };
      ss.editor.StatusCallback.EtherCalc = {
        func: function(editor, status, arg){
          var newSnapshot, __this = this;
          if (!(status === 'doneposcalc' && !ss.editor.busy)) {
            return;
          }
          newSnapshot = ss.CreateSpreadsheetSave();
          if (ss._snapshot === newSnapshot) {
            return;
          }
          io.sockets['in']("recalc." + room).emit('data', {
            type: 'recalc',
            snapshot: newSnapshot,
            force: true,
            room: room
          });
          ss._snapshot = newSnapshot;
          return DB.multi().set("snapshot-" + room, newSnapshot).del("log-" + room).bgsave().exec(function(){
            return console.log("==> Regenerated snapshot for " + room);
          });
        }
      };
      if (snapshot) {
        parts = ss.DecodeSpreadsheetSave(snapshot);
      }
      if (parts != null && parts.sheet) {
        ss.sheet.ResetSheet();
        ss.ParseSheetSave(snapshot.substring(parts.sheet.start, parts.sheet.end));
      }
      cmdstr = (function(){
        var __i, __ref, __len, __results = [];
        for (__i = 0, __len = (__ref = log).length; __i < __len; ++__i) {
          line = __ref[__i];
          if (!/^re(calc|display)$/.test(line)) {
            __results.push(line);
          }
        }
        return __results;
      }()).join('\n');
      if (cmdstr.length) {
        cmdstr += "\n";
      }
      ss.context.sheetobj.ScheduleSheetCommands("set sheet defaulttextvalueformat text-wiki\n" + cmdstr + "recalc\n", false, true);
      return ss;
    }