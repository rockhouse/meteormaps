var item = {
  id: 0,
  sequence: {}
};

Meteor.startup(function () {
  var GtfsRealtimeBindings = Meteor.npmRequire('gtfs-realtime-bindings');
  var request = Meteor.npmRequire('request');
  var dataStream = Meteor.npmRequire('dataStream');

  function vehicle (entity) {
    if (entity.vehicle.position) {
      VehicleUpdates.upsert({_id: entity.id}, {
        trip_id: entity.vehicle.trip.trip_id,
        route_id: entity.vehicle.trip.route_id,
        position_lat: entity.vehicle.position.latitude,
        position_lon: entity.vehicle.position.longitude,
        timestamp: entity.vehicle.timestamp.low
      });
    }
  };

  var requestSettingsVehicle = {
    method: 'GET',
    url: 'http://gtfs.ovapi.nl/nl/vehiclePositions.pb',
    encoding: null
  };

  function wrappedRequest(func, req, string) {
    console.log("Calling function..." + string + " Req URL: " + req.url);
    request(req, Meteor.bindEnvironment(function (error, response, body) {
      if (!error && response.statusCode == 200 && string === "vehicle") {
        var feed = GtfsRealtimeBindings.FeedMessage.decode(body);
        console.log("inserting..." + string);
        feed.entity.forEach(func);
        console.log("Done inserting " + string + "!");
      }
      if (!error && response.statusCode == 200 && string === "shapes") {

      }
    }))
  };

  Meteor.setInterval(function() {
    wrappedRequest(vehicle, requestSettingsVehicle, "vehicle");
  }, 15000);

  //Check if we already have our route-shapes data in mongo
  if (RouteShapes.find().count() === 0) {
      console.log("Empty!");

      var stream = new dataStream({
        data: function(chunk) {
          // convert the Buffer to a String
          console.log("new chunk.... watch out!!! ");
          chunk = chunk.toString();
          chunk += '\n';

          var line = chunk.split('\n');

          for (var i = 0; i < line.length; i++) {
            var split = line[i].split(',');
            //console.log("Split: " + split[0] + " " + split[1] + " " + split[2] + " " + split[3] + " " + split[4] + " " + split.length);
            if(item.id === split[0]) {

              item.sequence[split[1]] = {lat: split[2], lng: split[3]};
            } else {
              //console.log(JSON.stringify(item));
              if(item.id != 0) {
                console.log("writing to DB: " + item.id);
                writeMongo(item);
                debugger;
              }
              item.sequence = [];
              item.id = split[0];
              item.sequence[split[1]] = {lat: split[2], lng: split[3]};
            }
          }
        }
      });

      var writeMongo = Meteor.bindEnvironment(function writeShapesToMongo(array) {
        RouteShapes.insert(array);
      }, "failed");

  }
      var wrapped = Meteor.wrapAsync(function(){
        request
        .get('http://gtfs.ovapi.nl/openov-nl/shapes.txt')
        .on('error', function(err) {
          console.log(err)
        })
        .on('response', function(response) {
          console.log(response.statusCode) // 200
          console.log(response.headers['content-type']) // 'image/png'
        })
        .pipe(stream)
      });

      wrapped();

      console.log("Shapes done!");
  };

});
