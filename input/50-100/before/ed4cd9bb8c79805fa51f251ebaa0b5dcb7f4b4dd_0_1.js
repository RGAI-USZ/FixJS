function(response) {
      // see if no data
      if (response == "") {
         //TODO add warning
         return;
      }
      
      var track = rover.tracks.getByCid(this.get('trackId'));
      
      // delete old scribl
      var scribl = track.get('scribl')
      if ( scribl.getFeatures().length > 0 ) {
         scribl.removeEventListeners('mouseover');
         delete track.get('scribl')
      
         // create new scribl;
         var chart = track.createScribl();         
         track.set({scribl: chart}, {silent:true});
      }
   }