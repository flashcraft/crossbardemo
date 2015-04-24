var tessel = require('tessel');
// var accel = require('accel-mma84').use(tessel.port['A']);
var autobahn = require('wamp-tessel');

var leds = [tessel.led[0], tessel.led[1], tessel.led[2], tessel.led[3]];

// leds[0].toggle();

function main () {

   var connection = new autobahn.Connection({
      url: "ws://23.101.67.214:80/ws", // replace with the url of your crossbar instance
      realm: "ms_iot_hack_01"
   });
   // var connection = new autobahn.Connection({
   //    url: "ws://192.168.1.110:8080/ws", // replace with the url of your crossbar instance
   //    realm: "ms_iot_hack_01"
   // });

   var blinking_freq = 0;
   var blinking_timer = null;

   connection.onopen = function (session, details) {

      session.publish("io.corssbar.iotberlin.alarmapp.component_ready", ["lights"]);

      // send publishes to keep wifi alive (testing)
      setInterval(function() {
         session.publish("io.crossbar.iotberlin.alarmapp.keepalive");
         console.log("keepalive sent");
      }, 1000);

      console.log("connected!");

      function toggle_lights (args) {
         var led = args[0];
         console.log("toggling light " + led);
         leds[led].toggle();
      }

      session.register("io.crossbar.iotberlin.alarmapp.toggle_lights", toggle_lights).then(
         function () {
            console.log("toggle_lights registered");
            session.publish("io.crossbar.iotberlin.alarmapp.accelerometerlog", ["toggle_lights registered"]);
         },
         function (e) {
            console.log(e);
         }
      );

      function set_blinking (args) {
         var freq = args[0];
         if (blinking_freq != freq) {
            blinking_freq = freq;
            if (blinking_timer) {
               clearInterval(blinking_timer);
               blinking_timer = null;
               console.log("blinking disabled");
            }
            if (blinking_freq) {
               console.log("enabled blinking", blinking_freq);
               blinking_timer = setInterval(function () {
                  leds[0].toggle();
                  leds[1].toggle();
                  leds[2].toggle();
                  leds[3].toggle();
               }, blinking_freq);
            } else {
               leds[0].write(false);
               leds[1].write(false);
               leds[2].write(false);
               leds[3].write(true);
            }
         }
      }

      session.register("io.crossbar.iotberlin.alarmapp.set_blinking", set_blinking).then(
         function () {
            console.log("set_blinking registered");
            session.publish("io.crossbar.iotberlin.alarmapp.accelerometerlog", ["set_blinking registered"]);
         },
         function (e) {
            console.log(e);
         }
      );
   };

   connection.onclose = function (reason, details) {
      console.log("Connection lost: " + reason, details);
   };

   connection.open();
}

main();
