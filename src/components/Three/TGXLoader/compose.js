import * as THREE from 'three';

import * as utils from './utils';

export const compose = content => {

  const geometry = new THREE.Geometry();

  // Set up default white material
  const defaultMaterial = new THREE.MeshLambertMaterial({
    emissive: 0x444444,
    color: 0x777777,
    //shading: THREE.FlatShading,
    flatShading: true,
    side: THREE.DoubleSide
  });
  defaultMaterial.name = 'DefaultMaterial';

  const materials = [defaultMaterial];

  // Figure out which geometry should be loaded ie class, gender
  //var geometryHashes = [], geometryTextures = {};


  //--------

  // var artContent = content.gear.art_content;
  // var artContentSets = content.gear.art_content_sets;
  // if (artContentSets && artContentSets.length > 1) {
  //   //console.log('Requires Arrangement', artContentSets);
  //   for (var r=0; r<artContentSets.length; r++) {
  //     var artContentSet = artContentSets[r];
  //     if (artContentSet.classHash == classHash) {
  //       artContent = artContentSet.arrangement;
  //       break;
  //     }
  //   }
  // } else if (artContentSets && artContentSets.length > 0) {
  //   artContent = artContentSets[0].arrangement;
  // }

  const artContent = content.gear.art_content_sets[0].arrangement;

  //--------

  console.log('ArtContent', artContent);

  const artRegionPatterns = [];

  if (artContent) {
    var gearSet = artContent.gear_set;
    var regions = gearSet.regions;
    if (regions.length > 0) {
      for (var u=0; u<regions.length; u++) {
        const region = regions[u];

        //if (region.pattern_list.length > 0) {
          //var pattern = region.pattern_list[0]; // Always 1?
        if (region.pattern_list.length > 1) {
          console.warn('MultiPatternRegion['+u+']', region);
          // Weapon attachments?
        }

        for (var p=0; p<region.pattern_list.length; p++) {
          var pattern = region.pattern_list[p];
          //var patternIndex = regionIndexSet[p];

          // TODO Figure out why this breaks on some models
          //var patternTextures = [];
          //for (var t=0; t<patternIndex.textures.length; t++) {
          //	var textureIndex = patternIndex.textures[t];
          //	var texture = assetIndexSet[0].textures[textureIndex];
          //	patternTextures.push(texture);
          //}

          artRegionPatterns.push({
            hash: pattern.hash,
            artRegion: u,
            patternIndex: p,
            regionIndex: region.region_index,
            geometry: pattern.geometry_hashes,
            //textures: patternTextures
          });

          //console.log('Pattern['+u+':'+p+']', pattern, patternTextures);
          //
          //for (var h=0; h<pattern.geometry_hashes.length; h++) {
          //	//geometryHashes.push(pattern.geometry_hashes[h]);
          //	parseTextures(pattern.geometry_hashes[h], patternTextures);
          //}
          break;
        }
      }
    } else {
      var overrideArtArrangement = 1===1 ? gearSet.female_override_art_arrangement : gearSet.base_art_arrangement;
      artRegionPatterns.push({
        hash: overrideArtArrangement.hash,
        artRegion: 1===1 ? 'female' : 'male',
        patternIndex: -1,
        regionIndex: -1,
        geometry: overrideArtArrangement.geometry_hashes,
        textures: [] // TODO Implement this later
      });
      //for (var o=0; o<overrideArtArrangement.geometry_hashes.length; o++) {
      //	//geometryHashes.push(overrideArtArrangement.geometry_hashes[o]);
      //	parseTextures(overrideArtArrangement.geometry_hashes[o]);
      //}
    }
  }

  //console.log('GeometryHashes', geometryHashes);
  //var geometryTextures = parseTextures(geometryHashes);
  // var geometryTextures = textures(content, artRegionPatterns);
  const geometryTextures = false;

  //var gearDyes = parseGearDyes(content.gear, shaderGear);
  //console.log('GearDyes', gearDyes);
  const gearDyes = false;

  // Compress geometry into a single THREE.Geometry
  //if (geometryHashes.length == 0) console.warn('NoGeometry');
  for (var a=0; a<artRegionPatterns.length; a++) {
    var artRegionPattern = artRegionPatterns[a];

    var skipRegion = false;
    switch(artRegionPattern.regionIndex) {
      case -1: // armor (no region)
      case 0: // weapon grip
      case 1: // weapon body
      //case 2: // Khvostov 7G-0X?
      case 3: // weapon scope
      case 4: // weapon stock/scope?
      case 5: // weapon magazine
      case 6: // weapon ammo (machine guns)

      case 8: // ship helm
      case 9: // ship guns
      case 10: // ship casing
      case 11: // ship engine
      case 12: // ship body
        break;

      case 21: // hud
        //skipRegion = true;
        break;

      case 22: // sparrow wings
      case 23: // sparrow body

      case 24: // ghost shell casing
      case 25: // ghost shell body
      case 26: // ghost shell cube?
        break;
      default:
        console.warn('UnknownArtRegion['+a+']', artRegionPattern.regionIndex);
        skipRegion = true;
        break;
    }
    if (skipRegion) continue;
    //if (artRegionPattern.regionIndex != 3) continue;
    //if (artRegionPattern.regionIndex != 25) continue;

    console.log('ArtRegion['+a+']', artRegionPattern);

    //if (artRegionPattern.regionIndex != 1) continue;
    //for (var g=0; g<geometryHashes.length; g++) {
    //	var geometryHash = geometryHashes[g];

    for (var g=0; g<artRegionPattern.geometry.length; g++) {
      const geometryHash = artRegionPattern.geometry[g];
      const tgxBin = content.tgx.geometry.find(t => t.fileIdentifier === geometryHash);

      //if (g != 0) continue;
      //if (g != 1) continue;
      if (tgxBin == undefined) {
        console.warn('MissingGeometry['+g+']', geometryHash);
        continue;
      }

      //console.log('Geometry['+g+']', geometryHash, tgxBin);

      //var renderMeshes = parseTGXAsset(tgxBin, geometryHash);

      parseGeometry(content, geometry, geometryHash, geometryTextures, gearDyes);
    }
  }

  //geometry.mergeVertices();
  //geometry.computeVertexNormals();




  return geometry;

}

// Spasm.TGXAssetLoader.prototype.getGearRenderableModel
const parseTGXAsset = (geometryHash, tgxBin) => {

  //console.log('Metadata['+geometryHash+']', metadata);

  var meshes = [];

  //for (var renderMeshIndex in metadata.render_model.render_meshes) {
  for (var r=0; r<tgxBin.metadata.render_model.render_meshes.length; r++) {
    var renderMeshIndex = r;
    var renderMesh = tgxBin.metadata.render_model.render_meshes[renderMeshIndex]; // BoB Bunch of Bits

    //console.log('RenderMesh['+renderMeshIndex+']', renderMesh);
    //if (renderMeshIndex != 0) continue;

    // IndexBuffer
    var indexBufferInfo = renderMesh.index_buffer;
    var indexBufferData = tgxBin.files[tgxBin.lookup.indexOf(indexBufferInfo.file_name)].data;

    var indexBuffer = [];
    for (var j=0; j<indexBufferInfo.byte_size; j+=indexBufferInfo.value_byte_size) {
      var indexValue = utils.ushort(indexBufferData, j);
      indexBuffer.push(indexValue);
    }
    //console.log('IndexBuffer', indexBufferInfo);

    // VertexBuffer
    var vertexBuffer = parseVertexBuffers(tgxBin, renderMesh);

    // Spasm.RenderMesh.prototype.getRenderableParts
    //console.log('RenderMesh['+renderMeshIndex+']',
    //	"\n\tPartOffsets:", renderMesh.stage_part_offsets,
    //	"\n\tPartList:", renderMesh.stage_part_list,
    //	"\n\t", renderMesh);

    var parts = [];
    var partIndexList = [];
    var stagesToRender = [0, 7, 15]; // Hardcoded?
    var partOffsets = [];

    var partLimit = renderMesh.stage_part_offsets[4];//renderMesh.stage_part_list.length;
    //var partLimit = renderMesh.stage_part_offsets[8];//renderMesh.stage_part_list.length;
    for (var i=0; i<partLimit; i++) {
      partOffsets.push(i);
    }

    for (var i=0; i<partOffsets.length; i++) {
      var partOffset = partOffsets[i];
      var stagePart = renderMesh.stage_part_list[partOffset];

      //if (stagesToRender.indexOf(partOffset) == -1) continue;

      //console.log('StagePart['+renderMeshIndex+':'+partOffset+']',
      //	"\n\tLOD:", stagePart.lod_category,
      //	"\n\tShader:", stagePart.shader,
      //	"\n\tFlags:", stagePart.flags,
      //	"\n\tVariantShader:", stagePart.variant_shader_index
      //);
      if (!stagePart) {
        console.warn('MissingStagePart['+renderMeshIndex+':'+partOffset+']');
        continue;
      }
      if (partIndexList.indexOf(stagePart.start_index) != -1) {
        //console.warn('DuplicatePart['+renderMeshIndex+':'+partOffset, stagePart);
        continue;
      }
      partIndexList.push(stagePart.start_index);
      parts.push(parseStagePart(stagePart));
    }

    // Spasm.RenderMesh
    meshes.push({
      positionOffset: renderMesh.position_offset,
      positionScale: renderMesh.position_scale,
      texcoordOffset: renderMesh.texcoord_offset,
      texcoordScale: renderMesh.texcoord_scale,
      texcoord0ScaleOffset: renderMesh.texcoord0_scale_offset,
      indexBuffer: indexBuffer,
      vertexBuffer: vertexBuffer,
      parts: parts
    });
  }

  return meshes;
}

// Spasm.RenderMesh.prototype.getAttributes
const parseVertexBuffers = (tgxBin, renderMesh) => {
  if (renderMesh.stage_part_vertex_stream_layout_definitions.length > 1) {
    console.warn('Multiple Stage Part Vertex Layout Definitions', renderMesh.stage_part_vertex_stream_layout_definitions);
  }
  var stagePartVertexStreamLayoutDefinition = renderMesh.stage_part_vertex_stream_layout_definitions[0];
  var formats = stagePartVertexStreamLayoutDefinition.formats;

  var vertexBuffer = [];

  for (var vertexBufferIndex in renderMesh.vertex_buffers) {
    //for (var j=0; renderMesh.vertex_buffers.length; j++) {
    var vertexBufferInfo = renderMesh.vertex_buffers[vertexBufferIndex];
    var vertexBufferData = tgxBin.files[tgxBin.lookup.indexOf(vertexBufferInfo.file_name)].data;
    var format = formats[vertexBufferIndex];

    //console.log('VertexBuffer['+vertexBufferIndex+']', vertexBufferInfo.file_name, vertexBufferInfo, "\n"+'Elements', format);

    var vertexIndex = 0;
    for (var v=0; v<vertexBufferInfo.byte_size; v+= vertexBufferInfo.stride_byte_size) {
      var vertexOffset = v;
      if (vertexBuffer.length <= vertexIndex) vertexBuffer[vertexIndex] = {};
      for (var e=0; e<format.elements.length; e++) {
        var element = format.elements[e];
        var values = [];

        var elementType = element.type.replace('_vertex_format_attribute_', '');
        var types = ["ubyte", "byte", "ushort", "short", "uint", "int", "float"];
        for (var typeIndex in types) {
          var type = types[typeIndex];
          if (elementType.indexOf(type) === 0) {
            var count = parseInt(elementType.replace(type, ''));
            var j, value;
            switch(type) {
              case 'ubyte':
                for (j=0; j<count; j++) {
                  value = utils.ubyte(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 8);
                  values.push(value);
                  vertexOffset++;
                }
                break;
              case 'byte':
                for (j=0; j<count; j++) {
                  value = utils.byte(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 8);
                  values.push(value);
                  vertexOffset++;
                }
                break;
              case 'ushort':
                for(j=0; j<count; j++) {
                  value = utils.ushort(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 16);
                  values.push(value);
                  vertexOffset += 2;
                }
                break;
              case 'short':
                for(j=0; j<count; j++) {
                  value = utils.short(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 16);
                  values.push(value);
                  vertexOffset += 2;
                }
                break;
              case 'uint':
                for(j=0; j<count; j++) {
                  value = utils.uint(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.unormalize(value, 32);
                  values.push(value);
                  vertexOffset += 4;
                }
                break;
              case 'int':
                for(j=0; j<count; j++) {
                  value = utils.int(vertexBufferData, vertexOffset);
                  if (element.normalized) value = utils.normalize(value, 32);
                  values.push(value);
                  vertexOffset += 4;
                }
                break;
              case 'float':
                // Turns out all that icky binary2float conversion stuff can be done with a typed array, who knew?
                values = new Float32Array(vertexBufferData.buffer, vertexOffset, count);
                vertexOffset += count*4;
                //console.log(values);
                //console.log(floatArray());
                //for(j=0; j<count; j++) {
                //	value = utils.float(vertexBufferData, vertexOffset);
                //	values.push(value);
                //	vertexOffset += 4;
                //}
                break;
            }
            break;
          }
        }

        var semantic = element.semantic.replace('_tfx_vb_semantic_', '');
        switch(semantic) {
          case 'position':
          case 'normal':
          case 'tangent': // Not used
          case 'texcoord':
          case 'blendweight': // Bone weights 0-1
          case 'blendindices': // Bone indices, 255=none, index starts at 1?
          case 'color':
            break;
          default:
            console.warn('Unknown Vertex Semantic', semantic, element.semantic_index, values);
            break;
        }
        vertexBuffer[vertexIndex][semantic+element.semantic_index] = values;
      }
      vertexIndex++;
    }
  }
  return vertexBuffer;
}

// Spasm.RenderablePart
const parseStagePart = (stagePart) => {
  var gearDyeSlot = 0;
  var usePrimaryColor = true;
  var useInvestmentDecal = false;

  //console.log('StagePart', stagePart);

  switch(stagePart.gear_dye_change_color_index) {
    case 0:
      gearDyeSlot = 0;
      break;
    case 1:
      gearDyeSlot = 0;
      usePrimaryColor = false;
      break;
    case 2:
      gearDyeSlot = 1;
      break;
    case 3:
      gearDyeSlot = 1;
      usePrimaryColor = false;
      break;
    case 4:
      gearDyeSlot = 2;
      break;
    case 5:
      gearDyeSlot = 2;
      usePrimaryColor = false;
      break;
    case 6:
      gearDyeSlot = 3;
      useInvestmentDecal = true;
      break;
    case 7:
      gearDyeSlot = 3;
      useInvestmentDecal = true;
      break;
    default:
      console.warn('UnknownDyeChangeColorIndex['+stagePart.gear_dye_change_color_index+']', stagePart);
      break;
  }

  var part = {
    //externalIdentifier: stagePart.external_identifier,
    //changeColorIndex: stagePart.gear_dye_change_color_index,
    //primitiveType: stagePart.primitive_type,
    //lodCategory: stagePart.lod_category,
    gearDyeSlot: gearDyeSlot,
    usePrimaryColor: usePrimaryColor,
    useInvestmentDecal: useInvestmentDecal,
    //indexMin: stagePart.index_min,
    //indexMax: stagePart.index_max,
    //indexStart: stagePart.start_index,
    //indexCount: stagePart.index_count
  };

  for (var key in stagePart) {
    var partKey = key;
    var value = stagePart[key];
    switch(key) {
      //case 'external_identifier': partKey = 'externalIdentifier'; break;
      case 'gear_dye_change_color_index': partKey = 'changeColorIndex'; break;
      //case 'primitive_type': partKey = 'primitiveType'; break;
      //case 'lod_category': partKey = 'lodCategory'; break;

      //case 'index_min': partKey = 'indexMin'; break;
      //case 'index_max': partKey = 'indexMax'; break;
      case 'start_index': partKey = 'indexStart'; break;
      //case 'index_count': partKey = 'indexCount'; break;

      case 'shader':
        var staticTextures = value.static_textures;
        value = {
          type: value.type
        };
        if (staticTextures) value.staticTextures = staticTextures;
        break;

      //case 'static_textures': partKey = 'staticTextures'; break;

      default:
        var keyWords = key.split('_');
        var partKey = '';
        for (var i=0; i<keyWords.length; i++) {
          var keyWord = keyWords[i];
          partKey += i == 0 ? keyWord : keyWord.slice(0, 1).toUpperCase()+keyWord.slice(1);
        }
        break;
    }
    part[partKey] = value;
  }

  //if (stagePart.shader) {
  //	var shader = stagePart.shader;
  //	//console.log('StagePartShader', shader);
  //	part.shader = shader.type;
  //	part.staticTextures = shader.static_textures ? shader.static_textures : [];
  //}

  return part;
}

let vertexOffset = 0

function checkRenderPart(part) {
  var shouldRender = false;

  // Spasm was checking the lod category name for zeros which was very inefficient.
  // This implementation checks the lod category value and then further checks against
  // the part flags before filtering out geometry.
  switch(part.lodCategory.value) {
    case 0: // Main Geometry
    case 1: // Grip/Stock
    case 2: // Stickers
    case 3: // Internal/Hidden Geometry?
    //case 8: // Grip/Stock/Scope
      //if (!(part.flags & 0x30)) {
        shouldRender = true;
      //}
      break;
    case 4: // LOD 1: Low poly geometries
    case 7: // LOD 2: Low poly geometries
    case 8: // HUD / Low poly geometries
    case 9: // LOD 3: Low poly geometries
      shouldRender = false;
      break;
    default:
      console.warn('SkippedRenderMeshPart', part.lodCategory, part);
      break;
  }

  switch(part.shader ? part.shader.type : 7) {
    case -1:
      shouldRender = false;
      break;
  }

  return shouldRender;
}

const parseGeometry = (content, geometry, geometryHash, geometryTextures, gearDyes) => {
  const tgxBin = content.tgx.geometry.find(t => t.fileIdentifier === geometryHash);
  const renderMeshes = parseTGXAsset(geometryHash, tgxBin);

  //console.log('ParseGeometry', geometryHash, geometryTextures, gearDyes, materials.length);

  //if (geometryHash != '1780854371-0') return;

  //console.log('RenderMeshes', renderMeshes);
  var gearDyeSlotOffsets = [];

  // if (loadTextures) {
  //   for (var i=0; i<gearDyes.length; i++) {
  //     var gearDye = gearDyes[i];

  //     gearDyeSlotOffsets.push(materials.length);

  //     // Create a material for both primary and secondary color variants
  //     for (var j=0; j<2; j++) {
  //       var materialParams = {
  //         game: game,
  //         //side: THREE.DoubleSide,
  //         //overdraw: true,
  //         skinning: hasBones,
  //         //color: 0x777777,
  //         //emissive: 0x444444,
  //         usePrimaryColor: j == 0,
  //         envMap: null
  //       };
  //       //materialParams.envMap = contentLoaded.textures[DEFAULT_CUBEMAP].texture;
  //       for (var textureId in geometryTextures[geometryHash]) {
  //         var texture = geometryTextures[geometryHash][textureId];

  //         materialParams[textureId] = texture;
  //         //
  //         ////if (j == 0) logTexture(textureId, texture);
  //         //
  //         //switch(textureId) {
  //         //	case 'diffuse': materialParams.map = texture; break;
  //         //	case 'normal': materialParams.normalMap = texture; break;
  //         //	case 'gearstack': materialParams.gearstackMap = texture; break;
  //         //	default:
  //         //		console.warn('UnknownGeometryTexture', textureId);
  //         //		break;
  //         //}
  //       }

  //       copyGearDyeParams(gearDye, materialParams);

  //       var material = new THREE.TGXMaterial(materialParams);
  //       //var material = new THREE.MeshPhongMaterial(materialParams);
  //       material.name = geometryHash+'-'+(j == 0 ? 'Primary' : 'Secondary')+i;
  //       materials.push(material);
  //       //console.log('MaterialName:'+material.name);
  //     }
  //   }
  // }

  for (var m=0; m<renderMeshes.length; m++) {
    var renderMesh = renderMeshes[m];
    var indexBuffer = renderMesh.indexBuffer;
    var vertexBuffer = renderMesh.vertexBuffer;
    var positionOffset = renderMesh.positionOffset;
    var positionScale = renderMesh.positionScale;
    var texcoord0ScaleOffset = renderMesh.texcoord0ScaleOffset;
    var texcoordOffset = renderMesh.texcoordOffset;
    var texcoordScale = renderMesh.texcoordScale;
    var parts = renderMesh.parts;

    //if (m != 0) continue;
    //if (m != 1) continue;

    if (parts.length == 0) {
      console.log('Skipped RenderMesh['+geometryHash+':'+m+']: No parts');
      continue;
    } // Skip meshes with no parts

    //console.log('RenderMesh['+m+']', renderMesh);

    // Spasm.Renderable.prototype.render
    var partCount = -1;
    for (var p=0; p<parts.length; p++) {
      var part = parts[p];

      if (!checkRenderPart(part)) continue;

      // Ghost Shell Eye Bg
      //if (m != 0) continue;
      //if (p != 3) continue;

      //if (m != 0) continue;
      //if (p <6) continue;

      // Phoenix Strife Type 0 - Feathers
      //if (m != 1 && p != 1) continue;

      console.log('RenderMeshPart['+geometryHash+':'+m+':'+p+']', part);
      partCount++;

      var gearDyeSlot = part.gearDyeSlot;

      if (gearDyeSlotOffsets[gearDyeSlot] == undefined) {
        console.warn('MissingDefaultDyeSlot', gearDyeSlot);
        gearDyeSlot = 0;
      }
      var materialIndex = gearDyeSlotOffsets[gearDyeSlot]+(part.usePrimaryColor ? 0 : 1);

      //console.log('RenderMeshPart['+geometryHash+':'+m+':'+p+']', part);

      // Load Material
      // if (loadTextures) {
      //   var textures = geometryTextures[geometryHash];
      //   if (!textures) {
      //     //console.warn('NoGeometryTextures['+geometryHash+']', part);
      //   } else {
      //     //continue;
      //   }
      //   var material = parseMaterial(part, gearDyes[gearDyeSlot], textures);

      //   if (material) {
      //     material.name = geometryHash+'-CustomShader'+m+'-'+p;
      //     materials.push(material);
      //     materialIndex = materials.length-1;
      //     //console.log('MaterialName['+materialIndex+']:'+material.name);
      //   }
      // }

      // Load Vertex Stream
      var increment = 3;
      var start = part.indexStart;
      var count = part.indexCount;

      // PrimitiveType, 3=TRIANGLES, 5=TRIANGLE_STRIP
      // https://stackoverflow.com/questions/3485034/convert-triangle-strips-to-triangles

      if (part.primitiveType === 5) {
        increment = 1;
        count -= 2;
      }

      for (var i=0; i<count; i+= increment) {
        var faceVertexNormals = [];
        var faceVertexUvs = [];
        var faceVertex = [];

        var faceColors = [];

        var detailVertexUvs = [];

        var faceIndex = start+i;

        var tri = part.primitiveType === 3 || i & 1 ? [0, 1, 2] : [2, 1, 0];

        for (var j=0; j<3; j++) {
          var index = indexBuffer[faceIndex+tri[j]];
          var vertex = vertexBuffer[index];
          if (!vertex) { // Verona Mesh
            console.warn('MissingVertex['+index+']');
            i=count;
            break;
          }
          var normal = vertex.normal0;
          var uv = vertex.texcoord0;
          var color = vertex.color0;

          var detailUv = vertex.texcoord2;
          if (!detailUv) detailUv = [0, 0];

          faceVertex.push(index+vertexOffset);
          faceVertexNormals.push(new THREE.Vector3(-normal[0], -normal[1], -normal[2]));

          var uvu = uv[0]*texcoordScale[0]+texcoordOffset[0];
          var uvv = uv[1]*texcoordScale[1]+texcoordOffset[1];
          faceVertexUvs.push(new THREE.Vector2(uvu, uvv));

          if (color) {
            //console.log('Color['+m+':'+p+':'+i+':'+j+']', color);
            faceColors.push(new THREE.Color(color[0], color[1], color[2]));
          }

          //if (p == 10) {
          //	console.log('Vertex['+j+']', index, vertex);
          //}

          //console.log(
          //	uv[0]+','+uv[1],
          //	texcoordScale[0]+'x'+texcoordScale[1],
          //	texcoordOffset[0]+','+texcoordOffset[1],
          //	detailUv[0]+','+detailUv[1]
          //);

          detailVertexUvs.push(new THREE.Vector2(
            uvu*detailUv[0],
            uvv*detailUv[1]
          ));
        }
        var face = new THREE.Face3(faceVertex[0], faceVertex[1], faceVertex[2], faceVertexNormals);
        face.materialIndex = materialIndex;
        if (faceColors.length > 0) face.vertexColors = faceColors;
        geometry.faces.push(face);
        geometry.faceVertexUvs[0].push(faceVertexUvs);

        if (geometry.faceVertexUvs.length < 2) geometry.faceVertexUvs.push([]);
        //geometry.faceVertexUvs[1].push(detailVertexUvs);
      }
    }

    //return;

    for (var v=0; v<vertexBuffer.length; v++) {
      var vertex = vertexBuffer[v];
      var position = vertex.position0;
      var x = position[0];//*positionScale[0]+positionOffset[0];
      var y = position[1];//*positionScale[1]+positionOffset[1];
      var z = position[2];//*positionScale[2]+positionOffset[2]; // Apply negative scale to fix lighting

      geometry.vertices.push(new THREE.Vector3(x, y, z));

      // Set bone weights
      var boneIndex = position[3];//Math.abs((positionOffset[3] * 32767.0) + 0.01);
      //var bone = geometry.bones[boneIndex];

      var blendIndices = vertex.blendindices0 ? vertex.blendindices0 : [boneIndex, 255, 255, 255];
      var blendWeights = vertex.blendweight0 ? vertex.blendweight0: [1, 0, 0, 0];

      var skinIndex = [0, 0, 0, 0];
      var skinWeight = [0, 0, 0, 0];

      var totalWeights = 0;
      for (var w=0; w<blendIndices.length; w++) {
        if (blendIndices[w] == 255) break;
        skinIndex[w] = blendIndices[w];
        skinWeight[w] = blendWeights[w];
        totalWeights += blendWeights[w]*255;
      }
      if (totalWeights != 255) console.error('MissingBoneWeight', 255-totalWeights, i, j);

      geometry.skinIndices.push(new THREE.Vector4().fromArray(skinIndex));
      geometry.skinWeights.push(new THREE.Vector4().fromArray(skinWeight));
      //geometry.skinIndices[index+vertexOffset].fromArray(skinIndex);
      //geometry.skinWeights[index+vertexOffset].fromArray(skinWeight);
    }

    vertexOffset += vertexBuffer.length;
  }
}

const textures = (content, artRegionPatterns) => {

  // var canvas, ctx;
  // var canvasPlates = {};
  // var geometryTextures = [];

  // //for (var g=0; g<geometryHashes.length; g++) {
  //   //var geometryHash = geometryHashes[g];
  // for (var a=0; a<artRegionPatterns.length; a++) {
  //   var artRegionPattern = artRegionPatterns[a];

  //   for (var g=0; g<artRegionPattern.geometry.length; g++) {
  //     const geometryHash = artRegionPattern.geometry[g];

  //     var tgxBin = content.tgx.geometry.find(t => t.fileIdentifier === geometryHash);

  //     if (!tgxBin) {
  //       console.warn('MissingTGXBinGeometry['+g+']', geometryHash);
  //       continue;
  //     }

  //     var metadata = tgxBin.metadata;
  //     var texturePlates = metadata.texture_plates;


  //     //console.log('Metadata['+geometryHash+']', tgxBin);

  //     // Spasm.TGXAssetLoader.prototype.getGearRenderableModel
  //     //console.log('TexturePlates['+g+']', texturePlates);
      
  //     if (texturePlates.length == 1) {
  //       var texturePlate = texturePlates[0];
  //       var texturePlateSet = texturePlate.plate_set;

  //       // Stitch together plate sets
  //       // Web versions are pre-stitched

  //       for (var texturePlateId in texturePlateSet) {
  //         var texturePlate = texturePlateSet[texturePlateId];
  //         var texturePlateRef = texturePlateId+'_'+texturePlate.plate_index;
  //         //var texturePlateRef = geometryHash+'_'+texturePlateId+'_'+texturePlate.plate_index;

  //         var textureId = texturePlateId;
  //         switch(texturePlateId) {
  //           case 'diffuse': textureId = 'map'; break;
  //           case 'normal': textureId = 'normalMap'; break;
  //           case 'gearstack': textureId = 'gearstackMap'; break;
  //           default:
  //             console.warn('UnknownTexturePlateId', texturePlateId, texturePlateSet);
  //             break;
  //         }

  //         var canvasPlate = canvasPlates[texturePlateRef];
  //         if (!canvasPlate) {
  //           //console.log('NewTexturePlacementCanvas['+texturePlateRef+']');
  //           canvas = document.createElement('canvas');
  //           canvas.width = texturePlate.plate_size[0];
  //           canvas.height = texturePlate.plate_size[1];
  //           ctx = canvas.getContext('2d');

  //           ctx.fillStyle = '#000000';
  //           ctx.fillRect(0, 0, canvas.width, canvas.height);

  //           ctx.fillStyle = '#FFFFFF';
  //           canvasPlate = {
  //             plateId: texturePlateId,
  //             textureId: textureId,
  //             canvas: canvas,
  //             hashes: []
  //           };
  //           canvasPlates[texturePlateRef] = canvasPlate;
  //         }
  //         canvas = canvasPlate.canvas;
  //         ctx = canvas.getContext('2d');
  //         if (canvasPlate.hashes.indexOf(geometryHash) == -1) canvasPlate.hashes.push(geometryHash);

  //         for (var p=0; p<texturePlate.texture_placements.length; p++) {
  //           var placement = texturePlate.texture_placements[p];
  //           var placementTexture = contentLoaded.textures[placement.texture_tag_name];
  //           //VertexColorsent);

  //           // Fill draw area with white in case there are textures with an alpha channel
  //           //ctx.fillRect(placement.position_x*scale, placement.position_y*scale, placement.texture_size_x*scale, placement.texture_size_y*scale);
  //           // Actually it looks like the alpha channel is being used for masking
  //           ctx.clearRect(
  //             placement.position_x*scale, placement.position_y*scale,
  //             placement.texture_size_x*scale, placement.texture_size_y*scale
  //           );

  //           if (platedTexture) {
  //             ctx.drawImage(
  //               platedTexture.texture.image,
  //               placement.position_x*scale, placement.position_y*scale,
  //               placement.texture_size_x*scale, placement.texture_size_y*scale,
  //               placement.position_x*scale, placement.position_y*scale,
  //               placement.texture_size_x*scale, placement.texture_size_y*scale
  //             );
  //           } else {
  //             // Should be fixed, but add these checks in case
  //             if (!placementTexture) {
  //               console.warn('MissingPlacementTexture', placement.texture_tag_name, contentLoaded.textures);
  //               continue;
  //             }
  //             if (!placementTexture.texture.image) {
  //               console.warn('TextureNotLoaded', placementTexture);
  //               continue;
  //             }
  //             ctx.drawImage(
  //               placementTexture.texture.image,
  //               placement.position_x, placement.position_y,
  //               placement.texture_size_x, placement.texture_size_y);
  //           }
  //         }
  //       }
  //     }
  //     else if (texturePlates.length > 1) {
  //       console.warn('MultipleTexturePlates?', texturePlates);
  //     }

  //   }
  // }

  // for (var canvasPlateId in canvasPlates) {
  //   var canvasPlate = canvasPlates[canvasPlateId];
  //   var dataUrl = canvasPlate.canvas.toDataURL('image/png');
  //   loadDataTexture(dataUrl, canvasPlateId, null, true);
  //   for (var i=0; i<canvasPlate.hashes.length; i++) {
  //     var geometryHash = canvasPlate.hashes[i];
  //     if (geometryTextures[geometryHash] == undefined) {
  //       geometryTextures[geometryHash] = {};
  //     }
  //     //if (geometryTextures[geometryHash][canvasPlate.plateId] != undefined) {
  //     if (geometryTextures[geometryHash][canvasPlate.textureId] != undefined) {
  //       //console.warn('OverridingTexturePlate['+geometryHash+':'+canvasPlate.plateId+']', geometryTextures[geometryHash][canvasPlate.plateId]);
  //       console.warn('OverridingTexturePlate['+geometryHash+':'+canvasPlate.textureId+']', geometryTextures[geometryHash][canvasPlate.textureId]);
  //       continue;
  //     }
  //     var texture = contentLoaded.platedTextures[canvasPlateId].texture;
  //     //geometryTextures[geometryHash][canvasPlate.plateId] = texture;
  //     geometryTextures[geometryHash][canvasPlate.textureId] = texture;
  //   }
  // }

  // return geometryTextures;
}