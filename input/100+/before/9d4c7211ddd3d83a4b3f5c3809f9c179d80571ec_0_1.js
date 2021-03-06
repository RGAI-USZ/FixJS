function(req, res){
  console.log("req",req.body,req);
  var imgUrl = req.body.img;
  if(!imgUrl){
    res.send({
      error : "no img params found"
    });
    return;
  }
  var ncolors = req.body["ncolors"]|| 1,
      imgName = md5(imgUrl)+".svg";
  
  if(!ncolors){
    
    // black & white
    
    var child = exec('wget -qO- '+imgUrl+' | djpeg -bmp | '+config.potraceCmd+' -s',
      function(error, stdout, stderr){
        if (error !== null) {
          console.log('exec error: ' + error);
          res.send({
            error : error
          });
        } else {
          fs.writeFile(config.publicFolder+"/"+imgName,stdout,function(err){
            //res.writeHead(200, ['Content-Type', 'json/plain']);
            if(err){
              console.log(err);
              res.send({
                error : err
              });
            } else {
              console.log("SVG Successfuly created "+imgName);
              res.send({
                url : config.publicUrl+"/"+imgName
              });
            }
          });
        }
    })
  } else {
    var n = parseInt(ncolors);
    if(isNaN(n)){
      console.log("Bad argument ncolors");
      res.send({
        error : "Bad Argument ncolors"
      });
      return;
    }

    var tmp = "./tmp/",
        tmpImg = tmp+"img.pnm",
        tmpMapFile = tmp+"mapFile.pnm",
        hist = tmp+"hist",
        simpleImg = tmp+"simg.pnm";
        
    var cmds = [
        'rm -rf '+tmp+'*',
        'wget -qO- '+imgUrl+' | jpegtopnm > '+tmpImg,
        'pnmcolormap '+(n+1)+' '+tmpImg+'>'+tmpMapFile,
        'ppmhist -hexcolor -noheader '+tmpMapFile+' >'+hist,
        'pnmremap -mapfile '+tmpMapFile+' '+tmpImg+'>'+simpleImg
    ];
    d&&console.log(cmds.join(";"));
    exec(cmds.join(";"),
          function(error, stdout, stderr){
            if (error !== null) {
              console.log('exec error: ' + error);
              res.send({
                error : error
              });
            } else {
              d&&console.log("stdout : ",stdout);
            }
            
            colors = [];
            fs.readFile(hist,"UTF-8",function(err,data){
              if (error !== null) {
                console.log('exec error: ' + error);
                res.send({
                  error : error
                });
              } else {
                d&&console.log("data",data);
                
                // get hexa colors
                var cs = data.toString().match(/00([0-9a-f]{2})/g),
                    hex,
                    colors = [],
                    tmpColorFiles = [],
                    tmpColorCmd = [];
                d&&console.log('cs: ' + cs.toString());
                
                
                // remove the lightest color
                var maxColorStrength = 0,
                    color;
                for(var i = 0; i < (n+1); i++){
                  var strength = (parseInt(cs[i*3].slice(2),16) + parseInt(cs[i*3].slice(2),16) + parseInt(cs[i*3].slice(2),16)),
                      hex = "#"+cs[i*3].slice(2)+cs[i*3+1].slice(2)+cs[i*3+2].slice(2);
                  if(strength<maxColorStrength){
                    colors.push(hex)
                  } else {
                    color&&colors.push(color); 
                    maxColorStrength = strength;
                    color = hex;
                  }
                }
                
                for(var i = 0; i < n; i++){
                  //tmpMapColorFiles.push(tmp+i+"mapfilecolor.pnm");
                  tmpColorFiles.push(tmp+i+"color.svg");
                  tmpColorCmd.push(
                    'ppmcolormask "'+colors[i]+'" '+simpleImg+' | pamscale "0.5" >'+tmp+i+'.pnm; ppmtojpeg '+tmp+i+'.pnm | djpeg -bmp | '+config.potraceCmd+' --scale 1 -s > '+tmpColorFiles[i]);
                }
                d&&console.log("cmd",tmpColorCmd.join(";"));
                
                exec(tmpColorCmd.join(";"),function(error, stdout, stderr){
                  d&&console.log("stdout",stdout,error,stderr);
                  mergeSVGFiles(tmpColorFiles,colors,function(error,svg){
                    if (error !== null) {
                      console.log('exec error: ' + error);
                      res.send({
                        error : error
                      });
                    } else {
                      //console.log(svg.toString()); 
                      fs.writeFile(
                        config.publicFolder+"/"+imgName,
                        svg.toString(),
                        function(err,data){
                          
                          if (error !== null) {
                            console.log('exec error: ' + error);
                            res.send({
                              error : error
                            });
                          } else {
                            res.send({
                              url : config.publicUrl+"/"+imgName
                            });
                            console.log("cbSvg : ",cbSvg.toString());
                            cbSvg&&cbSvg(svg.toString());
                          }
                      }); 
                    }
                  });
                });
              }
            });
        });
  }

  
}