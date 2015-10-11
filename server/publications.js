Meteor.publish('vehicleUpdates',function() {
  return VehicleUpdates.find({});
});

Meteor.publish('shapes',function() {
  return Shapes.find({});
});
