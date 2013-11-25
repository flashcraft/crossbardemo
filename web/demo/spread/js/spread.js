/******************************************************************************
 *
 *  Copyright 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
 *
 ******************************************************************************/
/* global document: false, console: false, ab: true, $: true */

"use strict";

var session = null;
var spread = null;
var sheet = null;


$(document).ready(function() {
   start();
});


function start() {

   // create wijspread control
   $("#ss").wijspread({sheetCount: 1});

   // get instance of wijspread control
   spread = $("#ss").wijspread("spread");

   // get active worksheet of the wijspread control
   sheet = spread.getActiveSheet();

   // turn on WAMP debug output
   // ab.debug(true, false, false);

   // use jQuery deferreds
   ab.Deferred = $.Deferred;

   // Connect to Crossbar.io ..
   //
   ab.launch(
      // WAMP app configuration
      {
         // Crossbar.io URL
         wsuri: ab.getServerUrl("ws", "ws://127.0.0.1:8080/ws"),
         // authentication info
         appkey: null // authenticate as anonymous
      },
      // session open handler
      function (newSession) {
         session = newSession;
         console.log("Connected!");
         main(session);
      },
      // session close handler
      function (code, reason, detail) {
         session = null;
         console.log(reason);
      }
   );
}


function main (session) {

   spread.isPaintSuspended(true);

   sheet.getColumn(0).locked(false);
   sheet.getColumn(1).locked(false);
   sheet.getColumn(2).locked(false);
   sheet.getColumn(3).locked(false);
   sheet.getColumn(4).locked(false);

   // Ticker
   sheet.getCell(0, 0).value(0);
   sheet.getCell(0, 1).text("Ticks");
   var ticks = 0;
   window.setInterval(function () {
      ticks += 1;
      sheet.getCell(0, 0).value(ticks);
   }, 1000);

   var slidersbaseUri = "http://crossbar.io/crossbar/demo/sliders/123456#";

   // Master volume
   sheet.getCell(2, 0).value(0);
   sheet.getCell(2, 1).text("Master");
   session.subscribe(slidersbaseUri + "master", function (topic, event) {
      //console.log(topic, event);
      sheet.getCell(2, 0).value(event);
   });

   // Graphic EQ
   for (var i = 1; i < 8; ++i) {
      sheet.getCell(3 + i, 0).value(0);
      sheet.getCell(3 + i, 1).text("EQ-" + i);
   }
   session.subscribe(slidersbaseUri + "eq", function (topic, event) {
      //console.log(topic, event);
      //spread.isPaintSuspended(true);
      sheet.getCell(3 + event.idx, 0).value(event.val);
      //spread.isPaintSuspended(false);
      //sheet.repaint();
   });

   // Create some formulas
   sheet.getCell(12, 1).text("Sum");
   sheet.getCell(12, 0).formula("=SUM(A5:A12)");
   sheet.getCell(13, 1).text("Average");
   sheet.getCell(13, 0).formula("=ROUND(AVERAGE(A5:A12); 1)");

   setupCustomFuns();

   spread.isPaintSuspended(false);
}


var subs = {};
var pubs = {};

function setupCustomFuns () {

   // create custom SUBSCRIBE spreadsheet function
   var sub = $.ce.createFunction("SUBSCRIBE", function (args) {

      //console.log("SUBSCRIBE", args);

      var uri = args[0];

      if (subs[uri] !== undefined) {

         //console.log("SUBSCRIBE", "Value cached");
         return subs[uri];

      } else {

         //console.log("SUBSCRIBE", "Setting up subscription");

         var row = sheet.getActiveRowIndex();
         var col = sheet.getActiveColumnIndex();

         subs[uri] = 0;

         session.subscribe(uri, function (topic, event) {

            subs[uri] = event;

            spread.isPaintSuspended(true);

            var cell = sheet.getCell(row, col);
            cell.value(event);

            spread.isPaintSuspended(false);

            //sheet.repaint();
         });

         return subs[uri];
      }

   }, {minArg: 1, maxArg: 1});

   spread.addCustomFunction(sub);


   // create custom PUBLISH spreadsheet function
   var pub = $.ce.createFunction("PUBLISH", function (args) {

      //console.log("PUBLISH", args);

      var uri = args[0];
      var evt = args[1];

      if (pubs[uri] !== undefined && pubs[uri] === evt) {

         //console.log("PUBLISH", "Value already published");

      } else {

         pubs[uri] = evt;
         session.publish(uri, evt);
         return evt;
      }

   }, {minArg: 2, maxArg: 2});

   spread.addCustomFunction(pub);


   // this is how to listen on cell changes
   if (false) {
      spread.bind($.wijmo.wijspread.Events.CellChanged, function (event, data) {
         console.log(data.col);
         console.log(data.row);
         console.log(data);
         var cell = sheet.getCell(data.row, data.col);
         console.log(cell);
         console.log(cell.value());
      });
   }
}
