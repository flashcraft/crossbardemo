// publish a value to Gauge0
//
session.publish("http://tavendo.de/webmq/demo/gauges#0", 66);

// publish random values to Gauge0-3
//
for (var i = 0; i < 4; ++i) {
   var val = Math.round(100 * Math.random());
   session.publish("http://tavendo.de/webmq/demo/gauges#" + i, val);
   console.log(i, val);
}
