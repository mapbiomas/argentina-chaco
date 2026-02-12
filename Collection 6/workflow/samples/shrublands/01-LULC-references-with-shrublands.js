/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var lccs2013 = ee.FeatureCollection("projects/mapbiomas-chaco/DATOS_AUXILIARES/DATOS_REFERENCIA/LCC_2013"),
    unsef = ee.FeatureCollection("projects/mapbiomas-chaco/DATOS_AUXILIARES/DATOS_REFERENCIA/unsef_lccs3"),
    limite = ee.FeatureCollection("projects/mapbiomas-chaco/SENTINEL/Limites/Nuevo_Limite_Operativo"),
    zonas = ee.Image("projects/mapbiomas-chaco/SENTINEL/Limites/Limite_ChacoS1_sinbuffer_raster"),
    altura = ee.Image("projects/ee-santiagobanchero/assets/GEDI/mapa-altura-2021chaco-rh96-2");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
var zona = 12
var roi = limite.filter(ee.Filter.eq("zona", zona))

var mb = ee.Image("projects/mapbiomas-public/assets/chaco/lulc/collection5/mapbiomas_chaco_collection5_integration_v2")

var LCCS2013 = lccs2013.filter(ee.Filter.stringStartsWith("Descripcio","Arbustal"))//.filterBounds(roi)
var unsefLCCS = unsef.filter(ee.Filter.stringStartsWith("DESCRIP","ARBUST")).filterBounds(roi)

Map.addLayer(limite)
var msk1 = LCCS2013.reduceToImage(["LCCS_3"], ee.Reducer.first()).rename("LCCS_3_INTA")
var msk2 = unsefLCCS.reduceToImage(["LCCS_3"], ee.Reducer.first()).rename("LCCS_3_UNSEF")

var stack = msk1
              .addBands(msk2)
              // .addBands(zonas)
              // .addBands(mb.select("classification_2021"))

var output = "info-" + zona

Export.image.toAsset({
  image: stack.set({zona: zona}).clip(roi), 
  description:output, 
  assetId: "projects/mapbiomas-argentina/assets/ANCILLARY_DATA/RASTER/CHACO/arbustales/ic-variables-por-zonas/" + output, 
  region: roi, 
  scale: 250, 
  maxPixels: 1e13})