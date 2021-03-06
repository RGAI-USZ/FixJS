f      //  if (MeshPool[meshUrl] !== undef) return MeshPool[meshUrl];
      var util = base.util;
      var tech;
      var sourceId;
      var materialRef, nameRef, nFace, meshName;
      var cl;

      var mesh = null;
      if (typeof(meshUrl) == 'object') {
        cl = meshUrl;
      } else if (meshUrl.indexOf(".js") != -1) {
        cl = util.getJSON(meshUrl);
      } else {
        cl = base.util.xml2badgerfish(util.getXML(meshUrl));
      }

      var norm, vert, uv, mapLen, computedLen;

      var i, iCount, iMax, iMod, mCount, mMax, k, kMax, cCount, cMax, sCount, sMax, pCount, pMax, j, jMax;

      var cl_source = cl;

      cl = null;

      if (!cl_source.COLLADA) {
          throw new Error(meshUrl + " does not appear to be a valid COLLADA file.");
      }

      cl_source = cl_source.COLLADA;

      var clib = {
          up_axis: 1,
          images: [],
          effects: [],
          materials: [],
          meshes: [],
          scenes: [],
          lights: [],
          cameras: [],
          animations: []
      };


      // var up_axis = 1; // Y
      if (cl_source.asset) {
          var sAxis = cl_source.asset.up_axis.$;
          if (sAxis === "X_UP") {
              clib.up_axis = 0;
          } else if (sAxis === "Y_UP") {
              clib.up_axis = 1;
          } else if (sAxis === "Z_UP") {
              clib.up_axis = 2;
          }
      }

      var up_axis = clib.up_axis;


      if (cl_source.library_images) {
        if (cl_source.library_images.image && !cl_source.library_images.image.length) cl_source.library_images.image = [cl_source.library_images.image];
        if (cl_source.library_images.image.length) {
          var cl_images = cl_source.library_images.image;
          for (var imgCount = 0, imgCountMax = cl_images.length; imgCount < imgCountMax; imgCount++) {
              var cl_img = cl_images[imgCount];
              var imageId = cl_img["@id"];
              var imageName = cl_img["@name"];
              var cl_imgsrc = cl_img.init_from;

              if (cl_imgsrc.$) {
                  var imageSource = cl_imgsrc.$;

                  if (prefix !== undef && (imageSource.lastIndexOf("/") !== -1)) {
                      imageSource = imageSource.substr(imageSource.lastIndexOf("/") + 1);
                  }
                  if (prefix !== undef && (imageSource.lastIndexOf("\\") !== -1)) {
                      imageSource = imageSource.substr(imageSource.lastIndexOf("\\") + 1);
                  }
                  // console.log("Image reference: "+imageSource+" @"+imageId+":"+imageName);
                  clib.images[imageId] = {
                      source: imageSource,
                      id: imageId,
                      name: imageName
                  };
              }
            }
          }
      }

      // Effects
      var effectId;
      var effectCount, effectMax;
      var tCount, tMax, inpCount, inpMax;
      var cl_params, cl_inputs, cl_input, cl_inputmap, cl_samplers, cl_camera, cl_cameras, cl_scene;
      var ofs;
      var meshPart;

      function getColorNode(n) {
        var el = n.color;
        if (!el) {
          return false;
        }

        var cn = n.color;
        var ar = cn ? util.floatDelimArray(cn.$.replace(/ {2}/g," ").replace(/^\s+|\s+$/, ''), " ") : false;

        return ar;
      }

      function getFloatNode(n) {
        var el = n['float'];
        if (!el) {
          return false;
        }

        var cn = n['float'];
        cn = cn ? parseFloat(cn.$.replace(/ {2}/g," ").replace(/^\s+|\s+$/, '')) : 0;

        return cn;
      }

      function getTextureNode(n) {
        var el = n.texture;
        if (!el) {
          return false;
        }

        var cn = n.texture["@texture"];

        return cn;
      }

      if (cl_source.library_effects) {
          var cl_effects = cl_source.library_effects.effect;

          if (cl_effects && !cl_effects.length) cl_effects = [cl_effects];

          for (effectCount = 0, effectMax = cl_effects.length; effectCount < effectMax; effectCount++) {
              var cl_effect = cl_effects[effectCount];

              effectId = cl_effect["@id"];

              var effect = {};

              effect.id = effectId;

              effect.surfaces = [];
              effect.samplers = [];

              cl_params = cl_effect.profile_COMMON.newparam;

              if (cl_params && !cl_params.length) {
                  cl_params = [cl_params];
              }

              var params = [];

              var cl_init;

              if (cl_params) {
                  for (pCount = 0, pMax = cl_params.length; pCount < pMax; pCount++) {
                      var cl_param = cl_params[pCount];

                      var paramId = cl_param["@sid"];

                      if (cl_param.surface) {
                          effect.surfaces[paramId] = {};

                          var initFrom = cl_param.surface.init_from.$;

                          if (typeof(clib.images[initFrom]) === 'object') {

                              var img_path = prefix + "/" + clib.images[initFrom].source;
                              effect.surfaces[paramId].source = img_path;
                              //                console.log(prefix+"/"+clib.images[initFrom].source);
                          }
                      } else if (cl_param.sampler2D) {
                          effect.samplers[paramId] = {};

                          effect.samplers[paramId].source = cl_param.sampler2D.source.$;

                          if (cl_param.sampler2D.minfilter) {
                              effect.samplers[paramId].minfilter = cl_param.sampler2D.minfilter.$;
                          }

                          if (cl_param.sampler2D.magfilter) {
                              effect.samplers[paramId].magfiter = cl_param.sampler2D.magfilter.$;
                          }
                      }

                  }
              }

              var cl_technique = cl_effect.profile_COMMON.technique;

              if (cl_technique && !cl_technique.length) cl_technique = [cl_technique];

              //            effect.material = new Material(effectId);
              effect.material = {
                  textures_ref: []
              };

              for (tCount = 0, tMax = cl_technique.length; tCount < tMax; tCount++) {
                  //        if (cl_technique[tCount].getAttribute("sid") === 'common') {
                  tech = cl_technique[tCount].blinn;

                  if (!tech) {
                      tech = cl_technique[tCount].phong;
                  }
                  if (!tech) {
                      tech = cl_technique[tCount].lambert;
                  }

                  if (tech) {
                      // for (var eCount = 0, eMax = tech[0].childNodes.length; eCount < eMax; eCount++) {
                      //   var node = tech[0].childNodes[eCount];
                      for (var tagName in tech) {
                          var node = tech[tagName];

                          var c = getColorNode(node);
                          var f = getFloatNode(node);
                          var t = getTextureNode(node);

                          if (c !== false) {
                              if (c.length > 3) {
                                  c.pop();
                              }
                          }

                          if (tagName == "emission") {
                              if (c !== false) {
                                  effect.material.ambient = c;
                              }
                          } else if (tagName == "ambient") {} else if (tagName == "diffuse") {
                              if (c !== false) {
                                  effect.material.color = c;
                              }
                          } else if (tagName == "specular") {
                              if (c !== false) {
                                  effect.material.specular = c;
                              }
                          } else if (tagName == "shininess") {
                              if (f !== false) {
                                  effect.material.shininess = f;
                              }
                          } else if (tagName == "reflective") {
                            nop();
                          } else if (tagName == "reflectivity") {
                            nop();
                          } else if (tagName == "transparent") {
                            nop();
                          } else if (tagName == "index_of_refraction") {
                            nop();
                          }

                          // case "transparency": if (f!==false) effect.material.opacity = 1.0-f; break;
                          if (t !== false) {
                              var srcTex = effect.surfaces[effect.samplers[t].source].source;
                              if (tagName == "emission") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.AMBIENT
                                  });
                              } else if (tagName == "ambient") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.AMBIENT
                                  });
                              } else if (tagName == "diffuse") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.COLOR
                                  });
                              } else if (tagName == "specular") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.SPECULAR
                                  });
                              } else if (tagName == "shininess") {} else if (tagName == "reflective") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.REFLECT
                                  });
                              } else if (tagName == "reflectivity") {} else if (tagName == "transparent") {
                                  effect.material.textures_ref.push({
                                      image: srcTex,
                                      type: enums.texture.map.ALPHA
                                  });
                              } else if (tagName == "transparency") {
                                nop();
                              } else if (tagName == "index_of_refraction") {
                                nop();
                              }
                          }
                      }
                  }

                  clib.effects[effectId] = effect;
              }
          }
      }

      // End Effects

      var cl_lib_mat_inst = collada_tools.getAllOf(cl_source, "instance_geometry");

      var materialMap = [];

      if (cl_lib_mat_inst.length) {

          for (i = 0, iMax = cl_lib_mat_inst.length; i < iMax; i++) {
              var cl_mat_inst = cl_lib_mat_inst[i];
              
              var mInst = collada_tools.getAllOf(cl_mat_inst, "instance_material");

              if (mInst.length) {
                for (j = 0, jMax = mInst.length; j<jMax; j++) {
                  var inst = mInst[j];
                  
                  var symbolId = inst["@symbol"];
                  var targetId = inst["@target"].substr(1);

                  materialMap[cl_mat_inst["@url"].substr(1)+":"+symbolId] = targetId;
                }
              }
          }
      }


      var cl_lib_materials = cl_source.library_materials;

      if (cl_lib_materials && cl_lib_materials.material) {
          var cl_materials = cl_lib_materials.material;
          if (cl_materials && !cl_materials.length) cl_materials = [cl_materials];

          for (mCount = 0, mMax = cl_materials.length; mCount < mMax; mCount++) {
              var cl_material = cl_materials[mCount];

              var materialId = cl_material["@id"];
              var materialName = cl_material["@name"];

              var cl_einst = cl_material.instance_effect;

              if (cl_einst) {
                  effectId = cl_einst["@url"].substr(1);
                  clib.materials.push({
                      id: materialId,
                      name: materialName,
                      mat: clib.effects[effectId].material
                  });
              }
          }
      }

      var cl_lib_geo = cl_source.library_geometries;
      var meshId;
      if (cl_lib_geo) {
          var cl_geo_node = cl_lib_geo.geometry;

          if (cl_geo_node && !cl_geo_node.length) cl_geo_node = [cl_geo_node];

          if (cl_geo_node.length) {
              for (var meshCount = 0, meshMax = cl_geo_node.length; meshCount < meshMax; meshCount++) {
                  var meshData = {
                      id: undef,
                      points: [],
                      parts: []
                  };

                  var currentMaterial;

                  var cl_geomesh = cl_geo_node[meshCount].mesh;

                  // console.log("found "+meshUrl+"@"+meshName);
                  if (cl_geomesh) {
                      meshId = cl_geo_node[meshCount]["@id"];
                      meshName = cl_geo_node[meshCount]["@name"];

                      //                    MeshPool[meshUrl + "@" + meshName] = newObj;
                      var cl_geosources = cl_geomesh.source;
                      if (cl_geosources && !cl_geosources.length) cl_geosources = [cl_geosources];

                      var geoSources = [];

                      for (var sourceCount = 0, sourceMax = cl_geosources.length; sourceCount < sourceMax; sourceCount++) {
                          var cl_geosource = cl_geosources[sourceCount];

                          sourceId = cl_geosource["@id"];
                          var sourceName = cl_geosource["@name"];
                          var cl_floatarray = cl_geosource.float_array;


                          if (cl_floatarray) {
                              geoSources[sourceId] = {
                                  id: sourceId,
                                  name: sourceName,
                                  data: util.floatDelimArray(cl_floatarray.$?cl_floatarray.$:"", " ")
                              };
                          }

                          var cl_accessor = cl_geosource.technique_common.accessor;

                          if (cl_accessor) {
                              geoSources[sourceId].count = cl_accessor["@count"]|0;
                              geoSources[sourceId].stride = cl_accessor["@stride"]|0;
                              if (geoSources[sourceId].count) {
                                  geoSources[sourceId].data = util.repackArray(geoSources[sourceId].data,
                                                                               geoSources[sourceId].stride,
                                                                               geoSources[sourceId].count);
                              }
                          }
                      }

                      var geoVerticies = [];

                      var cl_vertices = cl_geomesh.vertices;

                      var pointRef = null;
                      var pointRefId = null;
                      var triangleRef = null;
                      var normalRef = null;
                      var colorRef = null;
                      var uvRef = null;


                      if (cl_vertices) {
                          pointRefId = cl_vertices["@id"];
                          cl_inputs = cl_vertices.input;

                          if (cl_inputs && !cl_inputs.length) cl_inputs = [cl_inputs];

                          if (cl_inputs) {
                              for (inpCount = 0, inpMax = cl_inputs.length; inpCount < inpMax; inpCount++) {
                                  cl_input = cl_inputs[inpCount];

                                  if (cl_input["@semantic"] === "POSITION") {
                                      pointRef = cl_input["@source"].substr(1);
                                  }
                              }
                          }
                      }

                      var CL_VERTEX = 0,
                          CL_NORMAL = 1,
                          CL_TEXCOORD = 2,
                          CL_COLOR = 3,
                          CL_OTHER = 4;


                      var cl_triangles = cl_geomesh.triangles;
                      if (cl_triangles && !cl_triangles.length) cl_triangles = [cl_triangles];

                      if (cl_triangles) {

                          for (tCount = 0, tMax = cl_triangles.length; tCount < tMax; tCount++) {
                              meshPart = {
                                material: 0,
                                faces: [],
                                normals: [],
                                texcoords: [],
                                colors: []
                              };

                              var cl_trianglesCount = parseInt(cl_triangles[tCount]["@count"], 10);
                              cl_inputs = cl_triangles[tCount].input;
                              if (cl_inputs && !cl_inputs.length) cl_inputs = [cl_inputs];

                              cl_inputmap = [];

                              if (cl_inputs.length) {
                                  for (inpCount = 0, inpMax = cl_inputs.length; inpCount < inpMax; inpCount++) {
                                      cl_input = cl_inputs[inpCount];

                                      ofs = parseInt(cl_input["@offset"], 10);
                                      nameRef = cl_input["@source"].substr(1);

                                      if (cl_input["@semantic"] === "VERTEX") {
                                          if (nameRef === pointRefId) {
                                              nameRef = triangleRef = pointRef;
                                          } else {
                                              triangleRef = nameRef;
                                          }
                                          cl_inputmap[ofs] = CL_VERTEX;
                                      } else if (cl_input["@semantic"] === "NORMAL") {
                                          normalRef = nameRef;
                                          if (geoSources[normalRef].count) {
                                              cl_inputmap[ofs] = CL_NORMAL;
                                          }
                                      } else if (cl_input["@semantic"] === "TEXCOORD") {
                                          uvRef = nameRef;
                                          if (geoSources[uvRef].count) {
                                              cl_inputmap[ofs] = CL_TEXCOORD;
                                          }
                                      } else if (cl_input["@semantic"] === "COLOR") {
                                          colorRef = nameRef;
                                          if (geoSources[colorRef].count) {
                                              cl_inputmap[ofs] = CL_COLOR;
                                          }
                                      } else {
                                          cl_inputmap[ofs] = CL_OTHER;
                                      }
                                  }
                              }
                              mapLen = cl_inputmap.length;

                              materialRef = meshId+":"+cl_triangles[tCount]["@material"];

                              if (materialRef === null) {
                                  meshPart.material = 0;
                              } else {
                                  if (materialMap[materialRef] === undef) {
                                      log("missing material [" + materialRef + "]@" + meshId + "?");
                                      meshPart.material = 0;
                                  } else {
                                      meshPart.material = materialMap[materialRef];
                                  }
                              }


                              var cl_triangle_source = cl_triangles[tCount].p;

                              var triangleData = [];

                              if (cl_triangle_source) {
                                  triangleData = util.intDelimArray(cl_triangle_source.$, " ");
                              }

                              if (triangleData.length) {
                                  computedLen = ((triangleData.length) / cl_inputmap.length) / 3;

                                  if (computedLen !== cl_trianglesCount) {
                                      //                console.log("triangle data doesn't add up, skipping object load: "+computedLen+" !== "+cl_trianglesCount);
                                  } else {
                                      if (meshData.points.length === 0) {
                                          meshData.points = geoSources[pointRef].data;
                                      }

                                      ofs = 0;

                                      for (i = 0, iMax = triangleData.length, iMod = cl_inputmap.length; i < iMax; i += iMod * 3) {
                                          norm = [];
                                          vert = [];
                                          uv = [];
                                          color = [];

                                          for (j = 0; j < iMod * 3; j++) {
                                              var jMod = j % iMod;

                                              if (cl_inputmap[jMod] === CL_VERTEX) {
                                                  vert.push(triangleData[i + j]);
                                              } else if (cl_inputmap[jMod] === CL_NORMAL) {
                                                  norm.push(triangleData[i + j]);
                                              } else if (cl_inputmap[jMod] === CL_TEXCOORD) {
                                                  uv.push(triangleData[i + j]);
                                              } else if (cl_inputmap[jMod] === CL_COLOR) {
                                                  color.push(triangleData[i + j]);
                                              }
                                          }

                                          if (vert.length) {
                                              meshPart.faces.push(vert);

                                              if (norm.length === 3) {
                                                  meshPart.normals.push([collada_tools.fixuaxis(clib.up_axis, geoSources[normalRef].data[norm[0]]), collada_tools.fixuaxis(clib.up_axis, geoSources[normalRef].data[norm[1]]), collada_tools.fixuaxis(clib.up_axis, geoSources[normalRef].data[norm[2]])]);
                                              }


                                              if (uv.length === 3) {
                                                  meshPart.texcoords.push([geoSources[uvRef].data[uv[0]], geoSources[uvRef].data[uv[1]], geoSources[uvRef].data[uv[2]]]);
                                              }
                                              
                                              if (color.length === 3) {
                                                meshPart.colors.push([ geoSources[colorRef].data[color[0]],
                                                                       geoSources[colorRef].data[color[1]],
                                                                       geoSources[colorRef].data[color[2]] ]);
                                              }
                                          }
                                      }
                                  }
                              }
                              meshData.parts.push(meshPart);
                          }
                      }


                      var cl_polylist = cl_geomesh.polylist;
                      if (!cl_polylist) {
                          cl_polylist = cl_geomesh.polygons; // try polygons                
                      }

                      if (cl_polylist && !cl_polylist.length) cl_polylist = [cl_polylist];

                      if (cl_polylist) {
                          for (tCount = 0, tMax = cl_polylist.length; tCount < tMax; tCount++) {
                              meshPart = {
                                material: 0,
                                faces: [],
                                normals: [],
                                texcoords: [],
                                colors: []
                              };

                              var cl_polylistCount = parseInt(cl_polylist[tCount]["@count"], 10);

                              cl_inputs = cl_polylist[tCount].input;

                              if (cl_inputs && !cl_inputs.length) cl_inputs = [cl_inputs];

                              cl_inputmap = [];

                              if (cl_inputs.length) {
                                  for (inpCount = 0, inpMax = cl_inputs.length; inpCount < inpMax; inpCount++) {
                                      cl_input = cl_inputs[inpCount];

                                      var cl_ofs = cl_input["@offset"];

                                      if (cl_ofs === null) {
                                          cl_ofs = cl_input["@idx"];
                                      }

                                      ofs = parseInt(cl_ofs, 10);
                                      nameRef = cl_input["@source"].substr(1);

                                      if (cl_input["@semantic"] === "VERTEX") {
                                          if (nameRef === pointRefId) {
                                              nameRef = triangleRef = pointRef;

                                          } else {
                                              triangleRef = nameRef;
                                          }
                                          cl_inputmap[ofs] = CL_VERTEX;
                                      } else if (cl_input["@semantic"] === "NORMAL") {
                                          normalRef = nameRef;
                                          cl_inputmap[ofs] = CL_NORMAL;
                                      } else if (cl_input["@semantic"] === "TEXCOORD") {
                                          uvRef = nameRef;
                                          cl_inputmap[ofs] = CL_TEXCOORD;
                                      } else if (cl_input["@semantic"] === "COLOR") {
                                          colorRef = nameRef;
                                          cl_inputmap[ofs] = CL_COLOR;
                                      } else {
                                          cl_inputmap[ofs] = CL_OTHER;
                                      }
                                  }
                              }


                              var cl_vcount = cl_polylist[tCount].vcount;
                              var vcount = [];

                              if (cl_vcount) {
                                  vcount = util.intDelimArray(cl_vcount.$, " ");
                              }

                              materialRef = meshId+":"+cl_polylist[tCount]["@material"];

                              if (materialRef === undef) {
                                  meshPart.material = 0;
                              } else {
                                  meshPart.material = materialMap[materialRef];
                              }

                              var cl_poly_source = cl_polylist[tCount].p;

                              mapLen = cl_inputmap.length;

                              var polyData = [];

                              if ((cl_poly_source.length > 1) && !vcount.length) // blender 2.49 style
                              {
                                  var pText = "";
                                  for (pCount = 0, pMax = cl_poly_source.length; pCount < pMax; pCount++) {
                                      var tmp = util.intDelimArray(cl_poly_source[pCount].$, " ");

                                      vcount[pCount] = parseInt(tmp.length / mapLen, 10);

                                      polyData = polyData.concat(tmp);
                                  }
                              } else {
                                  if (cl_poly_source) {
                                      polyData = util.intDelimArray(cl_poly_source.$, " ");
                                  }
                              }
                                                          
                              if (polyData.length) {
                                  computedLen = vcount.length;

                                  if (computedLen !== cl_polylistCount) {
                                      log("poly vcount data doesn't add up, skipping object load: " + computedLen + " !== " + cl_polylistCount);
                                  } else {
                                      if (meshData.points.length === 0) {
                                          meshData.points = geoSources[pointRef].data;
                                      }

                                      ofs = 0;

                                      for (i = 0, iMax = vcount.length; i < iMax; i++) {
                                          norm = [];
                                          vert = [];
                                          uv = [];
                                          color = [];

                                          for (j = 0, jMax = vcount[i] * mapLen; j < jMax; j++) {
                                              if (cl_inputmap[j % mapLen] === CL_VERTEX) {
                                                  vert.push(polyData[ofs]);
                                                  ofs++;
                                              } else if (cl_inputmap[j % mapLen] === CL_NORMAL) {
                                                  norm.push(polyData[ofs]);
                                                  ofs++;
                                              } else if (cl_inputmap[j % mapLen] === CL_TEXCOORD) {
                                                  uv.push(polyData[ofs]);
                                                  ofs++;
                                              } else if (cl_inputmap[j % mapLen] === CL_COLOR) {
                                                  color.push(polyData[ofs]);
                                                  ofs++;
                                              } else {
                                                ofs++;
                                              }
                                          }

                                          var tlist;
                                          if (vert.length) {
                                              // if (up_axis !== 1)
                                              // {
                                              //   vert.reverse();
                                              // }
                                              // nFace = newObj.addFace(vert);
                                              meshPart.faces.push(vert);

                                              if (norm.length) {
                                                  nlist = [];
                                                  for (k = 0, kMax = norm.length; k < kMax; k++) {
                                                      // newObj.faces[nFace].point_normals[k] = fixuaxis(geoSources[normalRef].data[norm[k]]);
                                                      nlist.push(collada_tools.fixuaxis(clib.up_axis, geoSources[normalRef].data[norm[k]]));
                                                  }
                                                  meshPart.normals.push(nlist);
                                              }

                                              if (uv.length) {
                                                  tlist = [];
                                                  for (k = 0, kMax = uv.length; k < kMax; k++) {
                                                      // newObj.faces[nFace].uvs[k] = geoSources[uvRef].data[uv[k]];
                                                      tlist.push(geoSources[uvRef].data[uv[k]]);
                                                  }
                                                  meshPart.texcoords.push(tlist);
                                              }
                                              if (color.length) {
                                                  tlist = [];
                                                  for (k = 0, kMax = color.length; k < kMax; k++) {
                                                      // newObj.faces[nFace].uvs[k] = geoSources[uvRef].data[uv[k]];
                                                      tlist.push(geoSources[colorRef].data[color[k]]);
                                                  }
                                                  meshPart.colors.push(tlist);
                                              }
                                          }
                                      }
                                  }
                              }
                              
                              meshData.parts.push(meshPart);
                          }
                      }

                      if (up_axis !== 1) {
                          for (i = 0, iMax = meshData.points.length; i < iMax; i++) {
                              meshData.points[i] = collada_tools.fixuaxis(clib.up_axis, meshData.points[i]);
                          }
                      }



                      meshData.id = meshId;
                      clib.meshes.push(meshData);

                  }
              }
          }
      }





      var cl_lib_cameras = cl_source.library_cameras;
      var camerasBoundRef = [];

      if (cl_lib_cameras) {
          cl_cameras = cl_lib_cameras.camera;
          if (cl_cameras && !cl_cameras.length) cl_cameras = [cl_cameras];

          for (cCount = 0, cMax = cl_cameras.length; cCount < cMax; cCount++) {
              cl_camera = cl_cameras[cCount];

              var cameraId = cl_camera["@id"];
              var cameraName = cl_camera["@name"];

              //      var cl_perspective = cl_camera.getElementsByTagName("perspective");
              // if (cl_perspective.length) {
              //   var perspective = cl_perspective[0];
              var cl_yfov = 0;
              var cl_znear = 0;
              var cl_zfar = 0;

              if (cl_camera.optics) if (cl_camera.optics.technique_common) if (cl_camera.optics.technique_common.perspective) {
                  cl_yfov = cl_camera.optics.technique_common.perspective.yfov;
                  cl_znear = cl_camera.optics.technique_common.perspective.znear;
                  cl_zfar = cl_camera.optics.technique_common.perspective.zfar;
              }


              var yfov;
              var znear;
              var zfar;

              if (!cl_yfov && !cl_znear && !cl_zfar) {
                  cl_params = cl_camera.param;
                  if (cl_params && !cl_params.length) cl_params = [cl_params];

                  for (i = 0, iMax = cl_params.length; i < iMax; i++) {
                      var txt = cl_params[i].$;
                      var pName = cl_params[i]["@name"];
                      if (pName == "YFOV") {
                          yfov = parseFloat(txt);
                      } else if (pName == "ZNEAR") {
                          znear = parseFloat(txt);
                      } else if (pName == "ZFAR") {
                          zfar = parseFloat(txt);
                      }
                  }
              } else {
                  yfov = cl_yfov ? parseFloat(cl_yfov.$) : 60;
                  znear = cl_znear ? parseFloat(cl_znear.$) : 0.1;
                  zfar = cl_zfar ? parseFloat(cl_zfar.$) : 1000.0;
              }

              clib.cameras.push({
                  id: cameraId,
                  targeted: false,
                  fov: parseFloat(yfov),
                  nearclip: parseFloat(znear),
                  farclip: parseFloat(zfar)
              });
          }
      }


      var cl_lib_lights = cl_source.library_lights;
      var cl_light;

      if (cl_lib_lights) {
          var cl_lights = cl_lib_lights.light;
          if (cl_lights && !cl_lights.length) cl_lights = [cl_lights];

          var lightTypes = {
            'point': 'point',
            'directional': 'directional',
            'spot': 'spot'
          };

          if (cl_lights) for (var lightCount = 0, lightMax = cl_lights.length; lightCount < lightMax; lightCount++) {

              cl_light = cl_lights[lightCount];
              var lightType, cl_lightType;
              for (var typeName in lightTypes) {
                if (cl_light.technique_common[typeName]) {
                    lightType = typeName;
                    cl_lightType = cl_light.technique_common[typeName];
                    break;
                }
              }
              if (cl_lightType) {
                  var lightInstType = lightTypes[lightType] || 'point';
                  var lightId = cl_light["@id"];
                  var lightName = cl_light["@name"];
                  var cl_intensity = cl_lightType.intensity;
                  var intensity = cl_intensity ? parseFloat(cl_intensity.$) : 1.0;
                  var cl_distance = cl_lightType.distance;
                  var distance = cl_distance ? parseFloat(cl_distance.$) : 10.0;

                  var cl_color = cl_lightType.color;
                  var color = [1, 1, 1];

                  if (cl_color) {
                      color = util.floatDelimArray(cl_color.$, " ");
                  }

                  clib.lights.push({
                      id: lightId,
                      name: lightId,
                      type: lightInstType,
                      method: enums.light.method.STATIC,
                      diffuse: color,
                      specular: [0, 0, 0],
                      distance: distance,
                      intensity: intensity
                  });
              }
          }
      }

      var cl_lib_scenes = cl_source.library_visual_scenes;

      if (cl_lib_scenes) {
          var cl_scenes = null;

          cl_scenes = cl_lib_scenes.visual_scene;
          if (cl_scenes && !cl_scenes.length) cl_scenes = [cl_scenes];

          for (var sceneCount = 0, sceneMax = cl_scenes.length; sceneCount < sceneMax; sceneCount++) {

              cl_scene = cl_scenes[sceneCount];

              var sceneId = cl_scene["@id"];
              var sceneName = cl_scene["@name"];

              var sceneData = {
                  id: sceneId,
                  sceneObjects: [],
                  cameras: [],
                  lights: [],
                  parentMap: []
              };

              var nodeMap = [];
              var cl_nodes = [];
              var cl_stack;
              var mnode, nodeId, ntemp, nlist;
              var parentNodeName, parentNode;

              var cl_lib_scene_nodes = cl_source.library_nodes;
              if (cl_lib_scene_nodes) {
                var nodes = cl_lib_scene_nodes.node;
                
                if (nodes && !nodes.length) {
                  nodes = [nodes];
                }
                
                nodeMap = [];
                for (i = 0, iMax = nodes.length; i<iMax; i++) {
                  mnode = nodes[i];
                  mnodeId = mnode["@id"];
                  nodeMap[nodeId] = mnode;
                }

                cl_stack = [cl_scene];

                while (cl_stack.length) {
                    ntemp = cl_stack.pop();
                    if (ntemp.node) {
                        nlist = ntemp.node;
                        if (nlist && !nlist.length) nlist = [nlist];

                        if (nlist) {
                            for (i = 0, iMax = nlist.length; i < iMax; i++) {
                                cl_stack.push(nlist[i]);
                            }
                        }
                    }
                    if (ntemp.instance_node) {

                         var iNodes = ntemp.instance_node;
                         if (iNodes && !iNodes.length) {
                          iNodes = [iNodes];                           
                         }
                         for (i = 0, iMax = iNodes.length; i<iMax; i++) {
                           var iNode = iNodes[i];                           
                           var iNodeURL = iNode["@url"].substr(1);

                           if (nodeMap[iNodeURL]) {
                              if (ntemp.node && ntemp.node.length) {
                                ntemp.node = [ntemp.node];
                              }                             
                              if (!ntemp.node) {                              
                                ntemp.node = [nodeMap[iNodeURL]];
                              } else {
                                ntemp.node.push(nodeMap[iNodeURL]);
                              }
                           }
                         }
                    }
                 }
              }

              cl_stack = [cl_scene];

              while (cl_stack.length) {
                  ntemp = cl_stack.pop();
                  if (ntemp.node) {
                      nlist = ntemp.node;
                      if (nlist && !nlist.length) nlist = [nlist];

                      if (nlist) {
                          for (i = 0, iMax = nlist.length; i < iMax; i++) {
                              nlist[i].parentNode = ntemp;
                              cl_nodes.push(nlist[i]);
                              cl_stack.push(nlist[i]);
                          }
                      }
                  }
              }

              if (cl_nodes.length) {
                  for (var nodeCount = 0, nodeMax = cl_nodes.length; nodeCount < nodeMax; nodeCount++) {
                      var cl_node = cl_nodes[nodeCount];

                      var cl_geoms = cl_node.instance_geometry;
                      cl_light = cl_nodes[nodeCount].instance_light;
                      cl_camera = cl_nodes[nodeCount].instance_camera;

                      nodeId = cl_node["@id"];
                      var nodeName = cl_node["@name"];

                      var it = collada_tools.cl_getInitalTransform(clib.up_axis, cl_node);
                      if (up_axis === 2) {
                          it.rotation = collada_tools.quaternionFilterZYYZ(it.rotation, (cl_camera) ? [-90, 0, 0] : undef);
                      }

                      var parentGroup = null;
                      var sceneObject = null;
                      var parentNodeId;

                      if (cl_geoms) {
                          if (cl_geoms && !cl_geoms.length) {
                            cl_geoms = [cl_geoms];
                          }
                          
                          for (i = 0, iMax = cl_geoms.length; i<iMax; i++) {
                            var cl_geom = cl_geoms[i];
                            meshName = cl_geom["@url"].substr(1);

                            sceneObject = {};
  
                           sceneObject.name = ((nodeName) ? nodeName : nodeId)+(i?i:"");
                           sceneObject.id = ((nodeId) ? nodeId : nodeName)+(i?i:"");

                            sceneObject.meshId = meshId;
                            sceneObject.meshName = meshName;

                            if (!parentGroup) {                            
                              sceneObject.position = it.position;
                              sceneObject.rotation = it.rotation;
                              sceneObject.scale = it.scale;
                              sceneObject.matrix = it.matrix;
                            }

                            sceneData.sceneObjects.push(sceneObject);
                            nodeMap[sceneObject.id] = true;

                            if (cl_node.parentNode) {
                                parentNodeId = cl_node.parentNode["@id"];
                                parentNodeName = cl_node.parentNode["@name"];
                                if (parentNodeId && nodeMap[parentNodeId]) {
                                  sceneData.parentMap.push({
                                      parent: parentNodeId,
                                      child: sceneObject.id
                                  });
                                } else if (cl_geoms.length>1) {
                                  if (!parentGroup) {
                                    parentGroup = sceneObject;
                                    sceneObject = {};
                                  } else {
                                    if (nodeMap[parentGroup.id]) {
                                      sceneData.parentMap.push({
                                          parent: parentGroup.id,
                                          child: sceneObject.id});
                                      }                         
                                  }
                              }
                            } 
                      }
                          
                      } else if (cl_camera) {
                          var cam_instance = cl_camera;

                          var camRefId = cam_instance["@url"].substr(1);

                          sceneData.cameras.push({
                              name: (nodeName) ? nodeName : nodeId,
                              id: (nodeName) ? nodeName : nodeId,
                              source: camRefId,
                              position: it.position,
                              rotation: it.rotation
                          });


                      } else if (cl_light) {

                          var lightRefId = cl_light["@url"].substr(1);

                          sceneData.lights.push({
                              name: (nodeName) ? nodeName : nodeId,
                              id: (nodeName) ? nodeName : nodeId,
                              source: lightRefId,
                              position: it.position,
                              rotation: it.rotation || [ 0, 0, 0 ]
                          });

                      } else {

                          sceneObject = {
                              position: it.position,
                              rotation: it.rotation,
                              scale: it.scale,
                              matrix: it.matrix
                          };

                          sceneObject.name = ((nodeName) ? nodeName : nodeId);
                          sceneObject.id = ((nodeId) ? nodeId : nodeName);
                          
                          sceneData.sceneObjects.push(sceneObject);
                          nodeMap[sceneObject.id] = true;

                          if (cl_node.parentNode) {
                              parentNodeId = cl_node.parentNode["@id"];
                              parentNodeName = cl_node.parentNode["@name"];
                              if (parentNodeId && nodeMap[parentNodeId]) {
                                sceneData.parentMap.push({
                                    parent: parentNodeId,
                                    child: sceneObject.id
                                });
                              }
                          }
                      }

                  }
              }

              clib.scenes.push(sceneData);
          }
      }


      var cl_lib_anim = cl_source.library_animations;

      var animId;
      if (cl_lib_anim) {
          var cl_anim_sources = cl_lib_anim.animation;
          if (cl_anim_sources && !cl_anim_sources.length) cl_anim_sources = [cl_anim_sources];

          if (cl_anim_sources) {
              for (var aCount = 0, aMax = cl_anim_sources.length; aCount < aMax; aCount++) {
                  var cl_anim = cl_anim_sources[aCount];

                  animId = cl_anim["@id"];
                  var animName = cl_anim["@name"];

                  clib.animations[animId] = {};
                  clib.animations[animId].sources = [];

                  var cl_sources = cl_anim.source;
                  if (cl_sources && !cl_sources.length) cl_sources = [cl_sources];

                  if (cl_sources.length) {
                      for (sCount = 0, sMax = cl_sources.length; sCount < sMax; sCount++) {
                          var cl_csource = cl_sources[sCount];

                          sourceId = cl_csource["@id"];


                          var tech_common = cl_csource.technique_common;

                          var name_array = null;
                          var float_array = null;
                          var data = null;

                          if (cl_csource.name_array) {
                              name_array = util.textDelimArray(cl_csource.name_array.$, " ");
                          } else if (cl_csource.Name_array) {
                              name_array = util.textDelimArray(cl_csource.Name_array.$, " ");
                          } else if (cl_csource.float_array) {
                              float_array = util.floatDelimArray(cl_csource.float_array.$, " ");
                          }

                          var acCount = 0;
                          var acSource = "";
                          var acStride = 1;

                          if (tech_common) {
                              tech = tech_common;
                              var acc = tech.accessor;

                              acCount = parseInt(acc["@count"], 10);
                              acSource = acc["@source"].substr(1);
                              var aStride = acc["@stride"];

                              if (aStride) {
                                  acStride = parseInt(aStride, 10);
                              }
                          }

                          clib.animations[animId].sources[sourceId] = {
                              data: name_array ? name_array : float_array,
                              count: acCount,
                              source: acSource,
                              stride: acStride
                          };

                          if (acStride !== 1) {
                              clib.animations[animId].sources[sourceId].data = util.repackArray(clib.animations[animId].sources[sourceId].data, acStride, acCount);
                          }
                      }
                  }

                  cl_samplers = cl_anim.sampler;
                  if (cl_samplers && !cl_samplers.length) cl_samplers = [cl_samplers];

                  if (cl_samplers) {
                      clib.animations[animId].samplers = [];

                      for (sCount = 0, sMax = cl_samplers.length; sCount < sMax; sCount++) {
                          var cl_sampler = cl_samplers[sCount];

                          var samplerId = cl_sampler["@id"];

                          cl_inputs = cl_sampler.input;

                          if (cl_inputs && !cl_inputs.length) cl_inputs = [cl_inputs];

                          if (cl_inputs) {
                              var inputs = [];

                              for (iCount = 0, iMax = cl_inputs.length; iCount < iMax; iCount++) {
                                  cl_input = cl_inputs[iCount];

                                  var semanticName = cl_input["@semantic"];

                                  inputs[semanticName] = cl_input["@source"].substr(1);
                              }

                              clib.animations[animId].samplers[samplerId] = inputs;
                          }
                      }
                  }

                  var cl_channels = cl_anim.channel;
                  if (cl_channels && !cl_channels.length) cl_channels = [cl_channels];


                  if (cl_channels) {
                      clib.animations[animId].channels = [];

                      for (cCount = 0, cMax = cl_channels.length; cCount < cMax; cCount++) {
                          var channel = cl_channels[cCount];

                          var channelSource = channel["@source"].substr(1);
                          var channelTarget = channel["@target"];

                          var channelSplitA = channelTarget.split("/");
                          var channelTargetName = channelSplitA[0];
                          var channelSplitB = channelSplitA[1].split(".");
                          var channelParam = channelSplitB[0];
                          var channelType = channelSplitB[1];

                          clib.animations[animId].channels.push({
                              source: channelSource,
                              target: channelTarget,
                              targetName: channelTargetName,
                              paramName: channelParam,
                              typeName: channelType
                          });
                      }
                  }
              }
          }
      }

      var cl_lib_scene = cl_source.scene;

      if (cl_lib_scene) {
          cl_scene = cl_lib_scene.instance_visual_scene;

          if (cl_scene) {
              var sceneUrl = cl_scene["@url"].substr(1);
              clib.scene = sceneUrl;
          }
      }

      return clib;
  }
