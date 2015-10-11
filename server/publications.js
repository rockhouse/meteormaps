Meteor.publish('vehicleUpdates',function() {
  return VehicleUpdates.find({});
});

Meteor.publish('routeShapes',function() {
  return RouteShapes.find({});
});
