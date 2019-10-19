//Global variables:
let map;
let infobox;

function initApp() {
    getMap();
    getDirectionsManager();
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), null);
    infobox.setHtmlContent("");
    infobox.setOptions({visible: false});
    infobox.setMap(map);
}

function getMap() {
    map = Microsoft.Maps.Map('#map', {
        credentials: "AsFbvK5rycmcVWN5vZDHMqwfWCFLQE3YekuZo8o6l5ZKL5aU3nB-fDQnvsZmUud1",
        center: new Microsoft.Maps.Location(43.2557, -79.8711),
        zoom: 10
    });
}

function getDirectionsManager() {
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        directionsManager.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
        directionsManager.setRenderOptions({ itineraryContainer: '.directions__list' });
    });
}
