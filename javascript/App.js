dojo.require('esri.map', 'esri.tasks.locator', 'esri.geometry.webMercatorUtils');
dojo.require("esri.layers.agsdynamic");
dojo.require("esri.dijit.HomeButton");
dojo.addOnLoad(function () {
var AppView = Backbone.View.extend({
el: 'body',
initialize: function() {
	_.bindAll.apply(_, [this].concat(_.functions(this)));
	var $this = this;
	this.model = new (Backbone.Model.extend({}))();
	this.model.on('change', this.toggleShare, this);
	//this.fb = new Firebase('https://luminous-fire-5575.firebaseio.com/users');
	this.fb = new Firebase('https://boiling-fire-2225.firebaseio.com/users');
	//https://boiling-fire-2225.firebaseio.com/users
	this.symbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([0, 255, 0, 0.25]));
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

	this.map = new esri.Map('map', {basemap: 'osm', center: [-103.396454, 48.284335], zoom: 12 });
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
 var bakkenOpsLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Operations/MapServer",
 {useMapImage:true});
 var bakkenFeaturesLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Features/MapServer",
 {useMapImage:true});
 var bakkenVehiclesLayer=new esri.layers.ArcGISDynamicMapServiceLayer("http://energy.esri.com/arcgis/rest/services/Bakken/Maintenance_Vehicles/MapServer",
 {useMapImage:true});
 this.map.addLayers([basemapLayer,infraLayer,spillLayer,wellLayer,responseLayer,spillAreaLayer,protractionLayer,bakkenDivLayer,bakkenWellsLayer,bakkenOpsLayer,bakkenFeaturesLayer,bakkenVehiclesLayer]);
 var home = new HomeButton({
        map: this.map
      }, "HomeButton");
      home.startup();
	$('.current-location').on('click',function() { $this.getLocation($this.model) });
	$('#search-input').on('typeahead:selected', function (evt, datum, name) {
		$this.map.centerAndZoom(new esri.geometry.Point(datum.lon, datum.lat), 12);
		$('#search-modal').modal('hide');
	});
	$('#dev-summit').on('click',function() { $this.map.centerAndZoom([2.414142, 57.348584], 16)});
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
	};
    g.setInfoTemplate(new esri.InfoTemplate().setTitle(msg.name +' '+ tS).setContent(msg.text));
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
