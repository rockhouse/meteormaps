if (Meteor.isClient) {
  var MAP_ZOOM = 15;

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.onCreated(function() {
    var self = this;

    GoogleMaps.ready('map', function(map) {
      // Create and move the marker when latLng changes.
      var getMarkers = Markers.find({}).fetch();
      _.each(getMarkers,function(getMarker){
        // If the marker doesn't yet exist, create it.*/

        marker = new google.maps.Marker({
          position: new google.maps.LatLng(getMarker.lat, getMarker.lon),
          map: map.instance
        });

      });

      // Center and zoom the map view onto the current position.
      map.instance.setCenter(marker.getPosition());
      map.instance.setZoom(7);

      var markers = [];

      _.each(Markers.find({}).fetch(),function(m) {
        markers.push(m._id._str);
      });

      Markers.find().observe({
        added: function(document) {
          // Create a marker for this document
          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            // We store the document _id on the marker in order
            // to update the document within the 'dragend' event below.
            id: document._id
          });

          // This listener lets us drag markers on the map and update their corresponding document.
          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          // Store this marker instance within the markers object.
          markers[document._id] = marker;
        },

        changed: function(newDocument, oldDocument) {
          var posMarker = new google.maps.LatLng(newDocument.lat, newDocument.lon)
          markers[newDocument._id].setPosition( posMarker );
        },

        removed: function(oldDocument) {
          // Remove the marker from the map
          markers[oldDocument._id].setMap(null);

          // Clear the event listener
          google.maps.event.clearInstanceListeners(
            markers[oldDocument._id]);

          // Remove the reference to this marker instance
          delete markers[oldDocument._id];
        }
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

      if (GoogleMaps.loaded() ) {
        return {
          center: new google.maps.LatLng(latLng.lat,latLng.lng),
          //center: new google.maps.LatLng(marker.lat, marker.lon),
          zoom: MAP_ZOOM
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

Markers = new Mongo.Collection('markers');
