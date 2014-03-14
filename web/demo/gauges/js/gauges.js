/******************************************************************************
 *
 *  Copyright 2012-2014 Tavendo GmbH.
 *
 *                                Apache License
 *                          Version 2.0, January 2004
 *                       http://www.apache.org/licenses/
 *
 ******************************************************************************/

/* global document: false, console: false, ab: true, $: true, JustGage: false, getRandomInt: false */

"use strict";

var session = null;

start();


function start() {

   var wsuri;

   if (document.location.protocol === "file:") {
      wsuri =  "ws://127.0.0.1:8080/ws";
   } else {
      var scheme = document.location.protocol === 'https:' ? 'wss://' : 'ws://';
      var port = document.location.port !== "" ? ':' + document.location.port : '';
      wsuri = scheme + document.location.hostname + port + "/ws";
   }

   var connection = new autobahn.Connection({
      url: wsuri,
      realm: 'realm1',
      max_retries: 30,
      initial_retry_delay: 2
      }
   );

   connection.onopen = function (newSession) {
      session = newSession;

      console.log("connected");

      updateStatusline("Connected to " + wsuri);

      main(session);

   };

   connection.onclose = function() {
      console.log("connection closed ", arguments);
      updateStatusline("Not connected.");
   }

   connection.open();

}

function updateStatusline(status) {
   $(".statusline").text(status);
};

function main (session) {
   // create and configure gauges
   //
   var gauges = [];

   gauges.push(new JustGage({
      id: "g" + gauges.length,
      value: getRandomInt(0, 100),
      min: 0,
      max: 100,
      title: "Big Fella",
      label: "pounds"
   }));

   gauges.push(new JustGage({
      id: "g" + gauges.length,
      value: getRandomInt(0, 100),
      min: 0,
      max: 100,
      title: "Small Buddy",
      label: "oz"
   }));

   gauges.push(new JustGage({
      id: "g" + gauges.length,
      value: getRandomInt(0, 100),
      min: 0,
      max: 100,
      title: "Tiny Lad",
      label: "oz"
   }));

   gauges.push(new JustGage({
      id: "g" + gauges.length,
      value: getRandomInt(0, 100),
      min: 0,
      max: 100,
      title: "Little Pal",
      label: "oz"
   }));

   // wire up gauges for PubSub events
   //
   var baseUri = "io.crossbar.demo.gauges.";

   for (var k = 0; k < gauges.length; ++k) {
      (function (p) {
         session.subscribe(baseUri + "g" + p, function (args, kwargs, details) {
            gauges[p].refresh(args[0]);
         });
      })(k);
   }

   // auto-animate gauges
   //
   if (false) {
      setInterval(function () {
         for (var j = 0; j < gauges.length; ++j) {
            gauges[j].refresh(getRandomInt(0, 100));
         }
      }, 2500);
   }
}
