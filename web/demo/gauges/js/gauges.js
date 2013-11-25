/******************************************************************************
 *
 *  Copyright 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
 *
 ******************************************************************************/

/* global document: false, console: false, ab: true, $: true, JustGage: false, getRandomInt: false */

"use strict";

var session = null;

start();


function start() {
   // set link to open a second instance
   document.getElementById("secondInstance").href = window.location.pathname;

   // turn on WAMP debug output
   // ab.debug(true, false, false);

   // use jQuery deferreds
   ab.Deferred = $.Deferred;

   // Connect to Crossbar.io ..
   //
   ab.launch(
      // WAMP app configuration
      {
         // Crossbar.io server URL
         wsuri: ab.getServerUrl("ws", "ws://127.0.0.1:8080/ws"),
         // authentication info
         appkey: null // authenticate as anonymous
      },
      // session open handler
      function (newSession) {
         session = newSession;
         ab.log("Connected.")
         main(session);
      },
      // session close handler
      function (code, reason, detail) {
         session = null;
         ab.log(reason);
      }
   );
}

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
   var baseUri = "http://crossbar.io/crossbar/demo/gauges#";

   for (var k = 0; k < gauges.length; ++k) {
      (function (p) {
         session.subscribe(baseUri + p, function (topic, event) {
            gauges[p].refresh(event);
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
