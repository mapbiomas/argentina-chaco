/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var table = ee.FeatureCollection("projects/mapbiomas-argentina/assets/ANCILLARY_DATA/VECTOR/CHACO/frutales-version-3"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-66.77988573739955, -21.800964840951163],
          [-66.77988573739955, -27.99502602171524],
          [-63.17637011239955, -27.99502602171524],
          [-63.17637011239955, -21.800964840951163]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
/**
 * Generar Máscaras de frutales
 * 
 *  
 * */
 
 
 var frutales = ee.FeatureCollection("projects/mapbiomas-argentina/assets/ANCILLARY_DATA/VECTOR/CHACO/frutales-version-3");
 
 
 var i_frutal = frutales.reduceToImage(["id_tipo"], ee.Reducer.first())
 Map.addLayer(i_frutal)
 Map.addLayer(frutales.bounds())
 
 
 Export.image.toAsset({
   image: i_frutal, 
   description: "frutales-version-3", 
   assetId: "projects/mapbiomas-argentina/assets/ANCILLARY_DATA/RASTER/CHACO/frutales-version-3", 
   pyramidingPolicy: "mode",
   region: frutales.bounds(), 
   scale: 30, 
   maxPixels: 1e13})