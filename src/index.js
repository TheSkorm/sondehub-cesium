var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');
var mqtt = require('mqtt');

var viewer = new Cesium.Viewer('cesiumContainer');
viewer.clockViewModel.shouldAnimate = true;

var sondes = {};

var client  = mqtt.connect('wss://ws.v2.sondehub.org');

client.on('connect', function () {
    client.subscribe('sondes/#', function (err) {
        if (err){
            console.log(err)
        }
    })
  })

client.on('message', function (topic, message) {
    payload = JSON.parse(message.toString())
    processSonde(payload.serial,payload.datetime,payload.lat, payload.lon,payload.alt );
})

function processSonde(serial, datetime, lat, lng, alt){
    var position = Cesium.Cartesian3.fromDegrees(lng, lat, alt);
    var csdatetime = new Cesium.JulianDate.fromDate(new Date(Date.parse(datetime)));
    if (serial in sondes){ // check if serial already in there
        sondes[serial].position.addSample(csdatetime,position)
    } else {
        
        var property = new Cesium.SampledPositionProperty();
        property.addSample(csdatetime, position);
        sondes[serial] = viewer.entities.add({
            name : serial,
            position : property,
            path: {
                leadTime: 1000,
                trailTime: 1000,
                width: 2
            },
            point : {
                pixelSize : 5,
                color : Cesium.Color.RED,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 2
            },
            label : {
                text : serial,
                font : '14pt monospace',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth : 2,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                pixelOffset : new Cesium.Cartesian2(0, -9)
            }
        });
    }
}

//processSonde("test", "2021-06-05T08:16:26+0000", -37.8136, 144.9631, 20000);
//processSonde("test", "2021-06-05T08:17:26+0000", -20.8136, 144.9631, 30000);