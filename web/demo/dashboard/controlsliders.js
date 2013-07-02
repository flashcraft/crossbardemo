/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

/***********
 *    websocket connection to appliance
 ***********/

var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var sess = null;
var retryCount = 0;
var retryDelay = 2;

function connect() {

   ab._Deferred = jQuery.Deferred;

   updateStatusline("Connecting ..");

   ab.connect(wsuri,

      function (session) {
         sess = session;
         onConnect0();
      },

      function (code, reason, detail) {

         sess = null;
         switch (code) {
            case ab.CONNECTION_UNSUPPORTED:
               window.location = "/webmq/unsupportedbrowser"; // FIXME
               break;
            case ab.CONNECTION_CLOSED:
               window.location.reload();
               break;
            default:

               retryCount = retryCount + 1;
               updateStatusline("Connection lost. Reconnecting (" + retryCount + ") in " + retryDelay + " secs ..");

               break;
         }
      },

      {'maxRetries': 60, 'retryDelay': 2000}
   );
}


function onConnect0() {
   sess.authreq().then(function () {
      sess.auth().then(onAuth, function (error) {
         updateStatusline("Auth Request failed: " + error.desc);
      });
   }, function (error) {
      updateStatusline("Auth failed: " + error.desc);
   });
}

function onAuth(permissions) {

   updateStatusline("Connected to " + wsuri);
   retryCount = 0;

   /** define session prefixes ***/
   sess.prefix("sales", "http://autobahn.tavendo.de/public/demo/dashboard#");

   /** subscribe to events ***/
   sess.subscribe("sales:revenue", onEqTr);
   sess.subscribe("sales:revenue-by-product", onEqRbp);
   sess.subscribe("sales:revenue-by-region", onEqUbp);
   sess.subscribe("sales:asp-by_region", onEqAbr);
   sess.subscribe("sales:units-by-product", onEqRbr);

};


function updateStatusline(status) {
   $(".statusline").text(status);
};

$(document).ready(function()
{
   updateStatusline("Not connected.");

   setupDemo();

   connect();
});


var channelBaseUri = "http://autobahn.tavendo.de/public/demo/sliders/";
var newWindowLink = null;


function setupDemo() {

   newWindowLink = document.getElementById('new-window');

   // Total Revenue Sliders

   var i = 1;

   $( "#eq_tr > span" ).each(function() {
      // read initial values from markup and remove that
      var value = parseInt( $( this ).text(), 10 );
      var k = i;

      $( this ).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish("sales:revenue", { idx: k, val: ui.value });
            //ab.log("event:eq_tr", {idx: k, val: ui.value})
         }
      });
      i += 1;
   });


   // Revenue by Product Sliders

   var n = 1;

   $( "#eq_rbp > span" ).each(function() {
      // read initial values from markup and remove that
      var value = parseInt( $( this ).text(), 10 );
      var k = n;

      $( this ).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish("sales:revenue-by-product", { idx: k, val: ui.value });
            //ab.log("event:eq_rbp", {idx: k, val: ui.value})
         }
      });
      n += 1;
   });


   // Units by Product Sliders

   var s = 1;

   $("#eq_ubp > span").each(function() {
      // read initial values from markup and remove that
      var value = parseInt($(this).text(), 10);
      var k = s;

      $(this).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish("sales:units-by-product", { idx: k, val: ui.value });
            //ab.log("event:eq_rbp", {idx: k, val: ui.value})
         }
      });
      s += 1;
   });


   // ASP by Region Sliders

   var t = 1;

   $("#eq_abr > span").each(function() {
      // read initial values from markup and remove that
      var value = parseInt($(this).text(), 10);
      var k = t;

      $(this).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish("sales:asp-by-region", { idx: k, val: ui.value });
            //ab.log("event:eq_rbp", {idx: k, val: ui.value})
         }
      });
      t += 1;
   });


   // Revenue by Region Sliders

   var u = 1;

   $("#eq_rbr > span").each(function() {
      // read initial values from markup and remove that
      var value = parseInt($(this).text(), 10);
      var k = u;

      $(this).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish("sales:revenue-by-region", { idx: k, val: ui.value });
            //ab.log("event:eq_rbp", {idx: k, val: ui.value})
         }
      });
      u += 1;
   });

   $("#helpButton").click(function() { $(".info_bar").toggle() });
}

function send_activity() {

   var data = {};

   data.product = document.getElementById("product_select").value;
   data.units = document.getElementById("units").value;
   data.region = document.getElementById("region_select").value;
   data.revenue = document.getElementById("revenue").value;

   sess.publish("sales:sale", data);
}

function switch_dashboard(number) {
   ab.log(number);
   sess.publish("sales:switch-dashboard", number);
}


// Set slider positions on remote value changes, e.g. when using multiple control boards

function onEqTr(topicUri, event) {

   $("#eq_tr span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}

function onEqRbp(topicUri, event) {

   $("#eq_rbp span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}

function onEqUbp(topicUri, event) {

   $("#eq_ubp span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}

function onEqAbr(topicUri, event) {

   $("#eq_abr span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}

function onEqRbr(topicUri, event) {

   $("#eq_rbr span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}
