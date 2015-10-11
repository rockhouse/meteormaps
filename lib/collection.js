VehicleUpdates = new Mongo.Collection('vehicleUpdates');

RouteShapes = new Mongo.Collection('routeShapes');

Shapes = new Mongo.Collection('shapes');

// Meteor.methods({triggerRequest: function() {
//   var GtfsRealtimeBindings = Meteor.npmRequire('gtfs-realtime-bindings');
//   var request = Meteor.npmRequire('request');
//
//   var requestSettings = {
//     method: 'GET',
//     url: 'http://gtfs.ovapi.nl/nl/vehiclePositions.pb',
//     encoding: null
//   };
//
//
//   request(requestSettings, Meteor.bindEnvironment(function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
//       console.log("inserting...");
//       feed.entity.forEach(function(entity) {
//         if (entity.vehicle.position) {
//           //console.log(entity.vehicle.trip.trip_id);
//           VehicleUpdates.upsert({_id: entity.id}, {
//             trip_id: entity.vehicle.trip.trip_id,
//             route_id: entity.vehicle.trip.route_id,
//             position_lat: entity.vehicle.position.latitude,
//             position_lon: entity.vehicle.position.longitude,
//             timestamp: entity.vehicle.timestamp.low
//           });
//         }
//       });
//       console.log("Done inserting!");
//     }
//   }))
//   }
// });
