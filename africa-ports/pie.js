var basemap = L.tileLayer(
  "https://api.mapbox.com/styles/v1/ilabmedia/cjtq2y5740uf61ftj7pgsxax9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaWxhYm1lZGlhIiwiYSI6ImNpbHYycXZ2bTAxajZ1c2tzdWU1b3gydnYifQ.AHxl8pPZsjsqoz95-604nw",
  {}
);

var map = L.map("map", {
  center: [5, 20],
  zoom: 4,
  maxZoom: 18,
  scrollWheelZoom: true,
  minZoom: 4,
  zoomControl: false,
  layers: [basemap]
});

var client = new carto.Client({
  apiKey: "DvGUxloK2lbeTzJBBhzGrA",
  username: "csis"
});

var source = new carto.source.SQL("SELECT * FROM copy_of_africa_port_test");
var style = new carto.style.CartoCSS(`#layer {
  marker-placement: point;
  marker-allow-overlap: true;
  marker-line-color:black;
  marker-line-width:.2;

  marker-file: ramp([risks],(url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieFunding.svg),url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieBuilding.svg),url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieOperating.svg),url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieBuildingFunding.svg),url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieBuildingOperating.svg),url(https://csis-ilab.github.io/mapbox-custom/africa-ports/pieBuildingFundingOperating.svg)),("funding","building","operating","building,funding","operating,building","building,funding,operating"),"=");


    [zoom > 0] {
  marker-width: 22;
  }
    [zoom > 4] {
  marker-width:  28;
  }
     [zoom > 7] {

  marker-width: 32;
  }

}`);

var layer = new carto.layer.Layer(source, style, {
  featureOverColumns: ["port", "risk", "risks", "risk_level"]
});

var popup = L.popup({ closeButton: false });

layer.on(carto.layer.events.FEATURE_OVER, function(e) {
  document.querySelector("aside").classList.add("hidden");
  popup.setLatLng(e.latLng);

  var content = `${e.data.port +
    "<br>risk level: " +
    e.data.risk_level +
    "<br>" +
    e.data.risks.split(",").join(" and ")}`;

  popup.setContent(content);
  popup.openOn(map);

  document.querySelector("#controls h3").innerHTML =
    "<h3>" + e.data.port + "</h3>";
  document.querySelector("#controls ul").innerHTML = e.data.risks
    .split(",")
    .map(r => `<li>${r}</li>`)
    .join(" and ");

  setTimeout(
    () => document.querySelector("aside").classList.remove("hidden"),
    300
  );
});

layer.on(carto.layer.events.FEATURE_OUT, function(e) {
  setTimeout(
    () => document.querySelector("aside").classList.remove("hidden"),
    300
  );

  popup.removeFrom(map);
});

client.addLayer(layer);

client
  .getLeafletLayer()
  .bringToFront()
  .addTo(map);
