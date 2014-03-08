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

   var wsuri = "ws://127.0.0.1:8080/ws"; // hardcoded for now, FIXME once an equivalent to 'get_appliance_url' exists again
   // var wsuri: 'ws://' + document.location.host + '/ws';

   var connection = new autobahn.Connection({
      url: wsuri,
      realm: 'realm1',
      // use_deferred: jQuery.Deferred
      }
   );

   connection.onopen = function (newSession) {
      session = newSession;

      console.log("connected");

      main(session);

   };

   connection.onclose = function() {
      console.log("connection closed ", arguments);
   }

   connection.open();

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
