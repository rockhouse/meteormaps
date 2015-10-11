if (Meteor.isClient) {
  var MAP_ZOOM = 10;

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.onCreated(function() {
    var self = this;
    this.subscribe('vehicleUpdates');
    this.subscribe('shapes');

    GoogleMaps.ready('map', function(map) {


      var routeShapes = RouteShapes.find({}).fetch();

      _.each(routeShapes,function(routeShape) {
        console.log(routeShape);
        var shapeCoordinates = [];
        for (var key in routeShape) {
          if (routeShape.hasOwnProperty(key)) {
            console.log('lat: ' + routeShape[key].lat + ' lon: ' + routeShape[key].lon);
            if (typeof routeShape[key].lat !== "undefined" ) {
              shapeCoordinates.push({lat: routeShape[key].lat, lng: routeShape[key].lon});
              console.log(shapeCoordinates);
            }
          }
        }
        var shapePath = new google.maps.Polyline({
          path: shapeCoordinates,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        shapePath.setMap(map.instance);
      });



      var markers = {};

      // Create and move the marker when latLng changes.
      var getMarkers = VehicleUpdates.find({}).fetch();
      _.each(getMarkers,function(getMarker){
        // If the marker doesn't yet exist, create it.

      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(getMarker.position_lat, getMarker.position_lon),
          map: map.instance
        });
        markers[getMarker._id] = marker
      });

      var counter = 0;
      var counter2 = 0;

      VehicleUpdates.find().observe({
        added: function(document) {
          // Create a marker for this document
          var marker = new google.maps.Marker({
            icon: 'https://photos-6.dropbox.com/t/2/AADLa5Npz6wLHf6xZQTw78C2I5qUsDoTPht4EG5FcCIXlg/12/7277003/png/32x32/1/_/1/2/bus.png/EM2zswUY9O8MIAIoAigD/gNBfmPxzvuGm___l6oZaQsGpbBe8JDJaobG47JMJcCo?size=1280x960&size_mode=2',
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            title: document.trip_id
          });

          // Store this marker instance within the markers object.
          markers[document._id] = marker;
          counter2 += 1;
          //console.log(counter2);
          //console.log(document._id);
          //console.log(markers[document._id]);
        },

        changed: function(newDocument, oldDocument) {
          var posMarker = new google.maps.LatLng(newDocument.position_lat, newDocument.position_lon)
          if (markers[newDocument._id]) {
            markers[newDocument._id].setPosition( posMarker );
            //console.log('goed: ' + newDocument._id);
          } else {
            counter += 1;
            console.log('fout: ' + newDocument._id);
            console.log('fout oud: ' + oldDocument._id);
            console.log('oud: ' + oldDocument.trip_id);
            console.log('nieuw: ' + newDocument.trip_id);
            console.log(oldDocument);
            console.log(newDocument);
            console.log(counter);
          }

        },
        /*
        removed: function(oldDocument) {
          // Remove the marker from the map
          markers[oldDocument._id].setMap(null);

          // Clear the event listener
          google.maps.event.clearInstanceListeners(
            markers[oldDocument._id]);

          // Remove the reference to this marker instance
          delete markers[oldDocument._id];
        }*/
      });
    });

  });

  Template.map.helpers({
    geolocationError: function() {
      var error = Geolocation.error();
      return error && error.message;
    },
    mapOptions: function() {
      var latLng = Geolocation.latLng();


      if (GoogleMaps.loaded() && latLng ) {
        return {
          center: new google.maps.LatLng(latLng.lat,latLng.lng),
          //center: new google.maps.LatLng(marker.lat, marker.lon),
          zoom: MAP_ZOOM,
          styles: [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]

        };
      }
    }

  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
