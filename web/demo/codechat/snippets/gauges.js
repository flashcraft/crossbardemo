var baseUri = "http://tavendo.de/webmq/demo/gauges#";

session.publish(baseUri + "0", Math.round(100 * Math.random()));

for (var i = 0; i < 4; ++i) {
   var val = Math.round(100 * Math.random());
   session.publish(baseUri + i, val);
   console.log(i, val);
}
