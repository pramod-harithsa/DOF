dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.dijit.HomeButton");
dojo.require("esri.dijit.LayerSwipe");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.layers.graphics");
var temMapRef;
var serviceArea;
var main, alertGraphicsLayer;
dojo.addOnLoad(function () {
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	main=this;
	this.model = new (Backbone.Model.extend({}))();
	this.model.on('change', this.toggleShare, this);
	//this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.fb = new Firebase('https://boiling-fire-2225.firebaseio.com/users');
	//https://boiling-fire-2225.firebaseio.com/users
	
	this.symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([5, 112, 176] ), 2);
	this.symbol.setOutline(new esri.symbol.SimpleLineSymbol().setWidth(0.5));
alertGraphicsLayer=new esri.layers.GraphicsLayer();
	/*
	require(["esri/arcgis/utils","esri/config"], function(arcgisUtils,esriConfig) { 
var deferred;
esriConfig.defaults.io.corsEnabledServers.push("arcgis.com");
//esriConfig.defaults.io.corsEnabledServers.push("energy.esri.com");
    var createMapOptions = {
        mapOptions: {
            slider: true
        },
               
        geometryServiceURL: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"

    };
    var webMapItemID = "0359aa3c64914a91af00adf054c1ca92";
    deferred = arcgisUtils.createMap(webMapItemID, "map", createMapOptions);

    deferred.then(function (response) {
        this.map = response.map;
    }, function (error) {
        console.log("Error: ", error.code, " Message: ", error.message);
        deferred.cancel();
    });

 });
*/	

	this.map = new esri.Map('map', {basemap: 'gray', center: [-103.396454, 48.284335], zoom: 12 });
	temMapRef=this.map;
	var infraLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/NorthSeaInfrastructure/MapServer",
 {useMapImage:true});
 var spillLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/SpillExtent/MapServer",
 {useMapImage:true});
 var wellLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/UK_WellsResponse/MapServer",
 {useMapImage:true});
  var basemapLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/NorthSeaBasemap/MapServer",
 {useMapImage:true});
 var responseLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/Resources/MapServer",
 {useMapImage:true});
 var spillAreaLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/SpillSite/MapServer",
 {useMapImage:true});
 var protractionLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/NorthSea_Response/NorthSeaProtraction/MapServer",
 {useMapImage:true});
 var bakkenDivLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/BakkenMS/MapServer",
 {useMapImage:true});
 var bakkenWellsLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Wells_by_County/MapServer",
 {useMapImage:true,"opacity": 0.5});
// var bakkenWellsLayer = new esri.layers.FeatureLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Wells_by_County/MapServer/0", {showLabels: true, outFields: ["*"],"opacity": 0.5});
 var bakkenOpsLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Operations/MapServer",
 {useMapImage:true});
 var bakkenFeaturesLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Features/MapServer",
 {useMapImage:true});
 var bakkenVehiclesLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Maintenance_Vehicles/MapServer",
 {useMapImage:true});
 this.map.addLayers([alertGraphicsLayer,bakkenWellsLayer,basemapLayer,infraLayer,spillLayer,wellLayer,responseLayer,spillAreaLayer,protractionLayer,bakkenDivLayer,bakkenOpsLayer,bakkenFeaturesLayer,bakkenVehiclesLayer]);
 var home = new esri.dijit.HomeButton({
        map: this.map
      }, "HomeButton");
      home.startup();
      var swipeWidget = new esri.dijit.LayerSwipe({
            type: "scope",  //Try switching to "scope" or "horizontal"
            map: this.map,
            layers: [bakkenWellsLayer]
          }, "swipeDiv");
          swipeWidget.startup();
          
     ////
     
     ////
     $('#serviceArea').on('click',function(){
     	if(serviceArea!=null)
	serviceArea = dojo.connect(temMapRef, 'onClick', main.customServiceArea);
     	else
     	temMapRef.graphics.clear();
     });
          $('#swipeToggle').on('click',function(){$( '#swipeDiv' ).toggle();});
	$('.current-location').on('click',function() { $this.getLocation($this.model) });
	$('#search-input').on('typeahead:selected', function (evt, datum, name) {
		$this.map.centerAndZoom(new esri.geometry.Point(datum.lon, datum.lat), 12);
		$('#search-modal').modal('hide');
	});
	$('#dev-summit').on('click',function() { $this.map.centerAndZoom([2.414142, 57.348584], 6)});
	this.fb.on('value', function (ss) {
		$this.messages = [];
		_.each(ss.val(), function (item) { _.each(item.messages, function (item2) {
				$this.messages.push(item2) });
		});
		$this.displayChatMessages() & $this.activateClickListener() & $this.initTypeahead();
	});
},
events: {
	'keyup #message-input': 'toggleShare',	'keyup #name-input': 'toggleShare',
	'click .share-message': 'saveMsg',	'click #add-event-btn': 'enableEventClickHandler'
},
toggleShare: function (model) {
	$('#loader').modal('hide');
	if ($('#name-input').val() && $('#message-input').val() && (this.model.get('loc'))) {
		$('.share-message').removeClass('disabled');
	} else { $('.share-message').addClass('disabled') };
},
saveMsg: function (evt) {
	var loc = this.model.get('loc');
	var exists; var tC = new Date().getTime();
	var name = $('#name-input').val(); var text = $('#message-input').val();
	if (!name || !text) { $('#alert-modal').modal(); return; }
	if (!loc || !loc.lat || !loc.lon) {	$('#no-location-modal').modal(); return; };
	this.fb.on('value', function (ss) {	exists = (ss.val() !== null) });
	if(!exists){ this.fb.child(name).set({text: name}) };
	this.fb.child(name).child('messages').push({ name: name, text: text,
			lat: loc.lat, lon: loc.lon, timeStamp: tC });
	$('#share-modal').modal('hide'); $('#message-input').val(''); this.model.set('loc', null);
},getLocation: function (model) {
	if (navigator.geolocation) {
		$('#loader').modal({show: true, backdrop: false});
		navigator.geolocation.getCurrentPosition(function (p) {
			model.set('loc', null);
			model.set('loc', {lat: String(p.coords.latitude), lon: String(p.coords.longitude)});
		});
	} else { $('#alert-modal').modal(); }
},enableEventClickHandler: function() {
	if (this.mch){ dojo.disconnect(this.mch) };
	this.mch = dojo.connect(this.map, 'onClick', dojo.hitch(this, this.onMapClick));
	$('#share-modal').modal('hide');
},onMapClick: function (evt) {
	var x = esri.geometry.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y, true);
	this.model.set('loc', { lat: x[1], lon: x[0] });
    dojo.disconnect(this.mch) & $('#share-modal').modal('show');
},activateClickListener: function() {
	var $this = this;
	$('.chat-item').on('click', function(evt) {
		var d = evt.currentTarget.dataset;
		$this.map.centerAndZoom(new esri.geometry.Point(d.lon, d.lat), 15);
		$('#chat-modal').modal('hide');
	});
},displayChatMessages: function() {
	var $this = this; $('#chat-container').empty();
	this.messages.sort(function (a, b) { if (a.timeStamp > b.timeStamp) { return 1; }
		if (a.timeStamp < b.timeStamp) { return -1; } return 0;
	});
	_.each(this.messages, function (msg) {
	var tC = new Date().getTime();
	tE = Math.floor((tC - msg.timeStamp) / 1000 / 60); //get time elapsed since the previous messages in firebase
	tS = (tE > 60) ? Math.floor((tE * 60) / 3600)  + ' hours ago' :  tE + ' minutes ago';
	$('<li class="list-group-item chat-item"></li>').append('<div class="chat-date">' +
		msg.name +':  '+ tS +  '</div><div>'+ msg.text + '</div>')
		.attr('data-lat', msg.lat).attr('data-lon',msg.lon).prependTo($('#chat-container'));
	if (msg.lat && msg.lon && $this.map.graphics) {
		var pt = new esri.geometry.Point(msg.lon, msg.lat);
		var g = new esri.Graphic(pt, $this.symbol);
		$this.map.graphics.add(g);
		alertGraphicsLayer.add(g);
	};
    g.setInfoTemplate(new esri.InfoTemplate().setTitle(msg.name +' '+ tS).setContent(msg.text));
});
},customServiceArea:function(evt){
	require([
      
      "dojo/on",
      "esri/graphic",
      "esri/graphicsUtils",
      "esri/tasks/Geoprocessor",
      "esri/tasks/FeatureSet",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleFillSymbol"
    ], function(On,Graphic, graphicsUtils, Geoprocessor, FeatureSet, SimpleMarkerSymbol, SimpleLineSymbol,
                SimpleFillSymbol) {

      var gp;
      var driveTimes = "1 2 3";
dojo.disconnect(serviceArea);
serviceArea=null;
      // Initialize map, GP and image params
      gp = new Geoprocessor("http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Network/ESRI_DriveTime_US/GPServer/CreateDriveTimePolygons");
      gp.setOutputSpatialReference({wkid: 102100});
      //On(this.map,"click", computeServiceArea);

      
        temMapRef.graphics.clear();
        var pointSymbol = new SimpleMarkerSymbol();
        pointSymbol.setOutline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
        pointSymbol.setSize(14);
        pointSymbol.setColor(new dojo.Color([0, 255, 0, 0.25]));

        var graphic = new Graphic(evt.mapPoint, pointSymbol);
        temMapRef.graphics.add(graphic);

        var features = [];
        features.push(graphic);
        var featureSet = new FeatureSet();
        featureSet.features = features;
        var params = { "Input_Location": featureSet, "Drive_Times": driveTimes };
        gp.execute(params, getDriveTimePolys);
      

      function getDriveTimePolys(results, messages) {
        var features = results[0].value.features;
        // add drive time polygons to the map
        for (var f = 0, fl = features.length; f < fl; f++) {
          var feature = features[f];
          if (f === 0) {
            var polySymbolRed = new SimpleFillSymbol();
            polySymbolRed.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.5]), 1));
            polySymbolRed.setColor(new dojo.Color([255, 0, 0, 0.7]));
            feature.setSymbol(polySymbolRed);
          }
          else if (f == 1) {
            var polySymbolGreen = new SimpleFillSymbol();
            polySymbolGreen.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new dojo.Color([0, 0, 0, 0.5]), 1));
            polySymbolGreen.setColor(new dojo.Color([0, 255, 0, 0.7]));
            feature.setSymbol(polySymbolGreen);
          }
          else if (f == 2) {
            var polySymbolBlue = new SimpleFillSymbol();
            polySymbolBlue.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.5]), 1));
            polySymbolBlue.setColor(new dojo.Color([0, 0, 255, 0.7]));
            feature.setSymbol(polySymbolBlue);
          }
          temMapRef.graphics.add(feature);
        }
        // get the extent for the drive time polygon graphics and
        // zoom to the extent of the drive time polygons
        temMapRef.setExtent(graphicsUtils.graphicsExtent(temMapRef.graphics.graphics), true);
        
      }
    });
},initTypeahead: function () {
	$('#search-input').typeahead('destroy');
	var bloodhound = new Bloodhound({
		datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.text); },
		queryTokenizer: Bloodhound.tokenizers.whitespace, local: this.messages });
	bloodhound.initialize();
    var options = {	displayKey: 'text',	source: bloodhound.ttAdapter(),
        	templates: { suggestion: _.template('<strong><%=text%></strong>')}};
    $('#search-input').typeahead(null, options);
}});
new AppView();});
