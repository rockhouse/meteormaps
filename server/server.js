Meteor.startup(function () {
  var GtfsRealtimeBindings = Meteor.npmRequire('gtfs-realtime-bindings');
  var request = Meteor.npmRequire('request');

  var requestSettings = {
    method: 'GET',
    url: 'http://gtfs.ovapi.nl/nl/vehiclePositions.pb',
    encoding: null
  };

  var wrappedRequest = function () {
    request(requestSettings, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
        console.log("inserting...");
        feed.entity.forEach(function(entity) {
          if (entity.vehicle.position) {
            //console.log(entity.vehicle.trip.trip_id);
            VehicleUpdates.upsert({_id: entity.id}, {
              trip_id: entity.vehicle.trip.trip_id,
              route_id: entity.vehicle.trip.route_id,
              position_lat: entity.vehicle.position.latitude,
              position_lon: entity.vehicle.position.longitude,
              timestamp: entity.vehicle.timestamp.low
            });
          }
        });
        console.log("Done inserting!");
      }
    }))
  };

  Meteor.setInterval(wrappedRequest, 10000);

  //Check if we already have our route-shapes data
  if (RouteShapes.find().count() === 0) {
      console.log("Empty!");

      var requestSettingsShapes = {
        method: 'GET',
        url: 'http://gtfs.ovapi.nl/openov-nl/shapes.txt',
        encoding: null
      };

      request(requestSettingsShapes, Meteor.bindEnvironment(function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
          console.log("inserting shapes...");
          feed.entity.forEach(function(entity) {
            if (entity.vehicle.position) {
              //console.log(entity.vehicle.trip.trip_id);
              VehicleUpdates.upsert({_id: entity.id}, {
                trip_id: entity.vehicle.trip.trip_id,
                route_id: entity.vehicle.trip.route_id,
                position_lat: entity.vehicle.position.latitude,
                position_lon: entity.vehicle.position.longitude,
                timestamp: entity.vehicle.timestamp.low
              });
            }
          });
          console.log("Done inserting!");
        }
      }))


  }

});
