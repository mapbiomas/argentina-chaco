/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var chaco = ee.FeatureCollection("projects/ee-santiagobanchero/assets/GEDI/limite-operativo-chaco-arg"),
    altura_vis = {"opacity":1,"bands":["BIOEST"],"min":0,"max":10,"palette":["a14f14","fff922","16ba14"]},
    rgb = {"opacity":1,"bands":["red_median","green_median","blue_median"],"min":29,"max":185,"gamma":1},
    image = ee.Image("projects/mapbiomas-chaco/SENTINEL/Limites/zonas-raster-SIN-buffer"),
    Problemas = /* color: #d63000 */ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([-62.92798522343355, -23.117595939111716]),
            {
              "system:index": "0"
            }),
        ee.Feature(
            ee.Geometry.Point([-61.65357116093355, -24.254445801141383]),
            {
              "system:index": "1"
            }),
        ee.Feature(
            ee.Geometry.Point([-61.75244811405855, -24.684425542226975]),
            {
              "system:index": "2"
            }),
        ee.Feature(
            ee.Geometry.Point([-61.51581642780454, -23.742229731651587]),
            {
              "system:index": "3"
            })]),
    geom = /* color: #d63000 */ee.Geometry.Point([-80.17070312500002, 28.919738661947715]),
    limite = ee.FeatureCollection("projects/mapbiomas-chaco/SENTINEL/Limites/Nuevo_Limite_Operativo"),
    vars_x_zonas = ee.ImageCollection("projects/mapbiomas-argentina/assets/ANCILLARY_DATA/RASTER/CHACO/arbustales/ic-variables-por-zonas"),
    zonas = ee.Image("projects/mapbiomas-chaco/SENTINEL/Limites/zonas-raster-Suavizado-SIN-buffer"),
    idecor = {"opacity":1,"bands":["b1"],"min":0,"max":4,"palette":["ffffff","00ce18","7dff2b","ffffff","ffaa2d"]};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// --------------------------------------
//    Ajuste de modelos de Altura GEDI
// --------------------------------------

var altura_vis = {
    "opacity":1,
    "bands":["BIOEST"],
    "min":  0,
    "max": 10,
    "palette": ['#7b3294','#c2a5cf','#f7f7f7','#a6dba0','#008837']
}

var zona = 11
var roi = limite.filter(ee.Filter.eq("zona", zona))

Map.addLayer(zonas.eq(zona))
var stack = ee.Image('projects/ee-santiagobanchero/assets/GEDI/mosaic-landsat-altura-v2')
var altura = ee.Image('projects/ee-santiagobanchero/assets/GEDI/mapa-altura-2021chaco-rh96-2')
// var altura = ee.Image('projects/ee-santiagobanchero/assets/GEDI/mapa-altura-2021chaco-rh99')
var unsef = ee.FeatureCollection('projects/mapbiomas-chaco/DATOS_AUXILIARES/DATOS_REFERENCIA/unsef_lccs3')
var lccs2013 = ee.FeatureCollection('projects/mapbiomas-chaco/DATOS_AUXILIARES/DATOS_REFERENCIA/LCC_2013')

var cordoba = ee.Image('projects/mapbiomas-argentina/assets/ANCILLARY_DATA/RASTER/CHACO/arbustales/idecor-cobertura-y-uso-2021')
var arbustal = cordoba.where(cordoba.gt(4),0)
var arbustal = arbustal.where(cordoba.eq(3),0)
Map.addLayer(arbustal, idecor, "Arb IDECOR")

var chaco = ee.Image('projects/mapbiomas-public/assets/chaco/lulc/collection5/mapbiomas_chaco_collection5_integration_v2')
var lulc = chaco.select("classification_2021").mask(image.lt(15))
lulc = lulc.eq(3).or(lulc.eq(4)).or(lulc.eq(6)).rename("MB_LN")

var LCCS2013 = lccs2013.filter(ee.Filter.stringStartsWith('Descripcio', 'Arbustal'))
var LCCS2013 = LCCS2013


var wc = ee.ImageCollection('ESA/WorldCover/v200')
var wc_mosaic = wc.mosaic().updateMask(image)
var wc_mask = ee.Image(0).where(wc_mosaic.eq(20), 1)
wc_mask = wc_mask.updateMask(wc_mask.neq(0))

var ALT_META = ee.ImageCollection('projects/meta-forest-monitoring-okw37/assets/CanopyHeight').mosaic().rename("ALT_META")
var ALT_LANG = ee.Image('users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1').rename("ALT_LANG")
var ALT_POTA = ee.ImageCollection("users/potapovpeter/GEDI_V27").mosaic().rename("ALT_POTA")


var super_stack = stack
                  .addBands(altura)
                  .addBands(chaco.select("classification_2021"))
                  .addBands(lulc)
                  .addBands(arbustal.rename("ARB_IDECOR"))
                  .addBands(ALT_META)
                  .addBands(ALT_LANG)
                  .addBands(ALT_POTA)
                  .addBands(wc_mask)
                  .addBands(vars_x_zonas.mosaic().unmask(0))
                  
Map.addLayer(super_stack.mask(zonas.eq(zona)))

var samples =  super_stack.sample({
    region: roi, 
    scale: 30, 
    numPixels: 10000, 
    seed: 123, 
    dropNulls: false, 
    tileScale: 4, 
    geometries: true})
    
Map.addLayer(samples, {color: "yellow"},"SMP")    
Export.table.toDrive({
  collection: samples, 
  description: "muestras-caract-arbustales-z" + zona, 
  folder: "Caracterizacion-Arbustales"
  })


//Map.addLayer(wc_mask ,visualization,'worldcover')
Map.addLayer(wc_mask ,{color:'green'},'worldcover')
Map.addLayer(stack, rgb, "RGB")
Map.addLayer(altura.mask(lulc), altura_vis, "Altura GEDI (RH96)")
Map.addLayer(unsef, {}, "UNSEF")
Map.addLayer(LCCS2013, {color:"red"}, "LCCS2013")

var ts = require("users/MapBiomasAR/coleccion-6:Utils/series_de_tiempo_ndvi")
 
var params = {
  start: "1985-01-01",
  end: "2024-12-31",
  geom: geom,
  
  index: "ndvi",
  
  cloud_cover: 10,
  
  options:{
    title: "NDVI time series"
  }
}

var panel = null;
var chk_refresh_plot_flag = null;
var get_panel_chart_ts = function(){
  
Map.onClick(function(point){
  var punto = ee.Geometry.Point([point.lon, point.lat])
  params.geom = punto
    if(chk_refresh_plot_flag.getValue()){
      panel.remove(panel.widgets().get(1))
      panel.insert(1,ts.get(params));
      
    }
    
  });
  
  chk_refresh_plot_flag = ui.Checkbox("¿Actualizar serie?")
  
  var panel = ui.Panel({
    widgets: [chk_refresh_plot_flag],
    layout: ui.Panel.Layout.Flow('vertical'),
    style: {width: '300px', height: '400px'}
  })
  return panel
}
panel = ui.Panel({
  widgets: [get_panel_chart_ts()]
  
})
ui.root.add(panel)
Map.setOptions('HYBRID')