/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *                                Apache License
 *                          Version 2.0, January 2004
 *                       http://www.apache.org/licenses/
 *
 ******************************************************************************/

var channelBaseUri = "io.crossbar.demo.sliders.",
    currentBaseUri = null,
    newWindowLink = null,
    currentMasterSubscription = null,
    currentEqSubscription = null;


function setupDemo() {

   newWindowLink = document.getElementById('new-window');

   $("#master").slider({
      value: 60,
      orientation: "horizontal",
      range: "min",
      animate: true
   });

   $("#master").slider({
      slide: function(event, ui) {
         sess.publish(currentBaseUri + "master", [ui.value]);
         sess.publish("io.crossbar.demo.gauges.0", [ui.value]);
      }
   });

   var i = 1;

   $("#eq > span").each(function() {
      // read initial values from markup and remove that
      var value = parseInt($(this).text(), 10);
      var k = i;

      $(this).empty().slider({
         value: value,
         range: "min",
         animate: true,
         orientation: "vertical",

         slide: function(event, ui) {
            sess.publish(currentBaseUri +  "eq", [{ idx: k, val: ui.value }]);
         }
      });
      i += 1;
   });

   $("#helpButton").click(function() { $(".info_bar").toggle() });
}


function onMaster(args, kwargs, details) {

   $("#master").slider({
      value: args[0]
   });
}


function onEq(args, kwargs, details) {

   $("#eq span:nth-child(" + args[0].idx + ")").slider({
      value: args[0].val
   });
}


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {
      // sess.unsubscribe("event:master");
      currentMasterSubscription.unsubscribe().then(
         function() {
            console.log("unsubscribed master");
         },
         function(error) {
            console.log("master unsubscribe failed", error);
         });
      currentEqSubscription.unsubscribe().then(
         function() {
            console.log("unsubscribed eq");
         },
         function(error) {
            console.log("eq unsubscribe failed", error);
         });
   }

   // sess.prefix("event", channelBaseUri + newChannelId + '#');
   // sess.subscribe("event:master", onMaster);
   // sess.subscribe("event:eq", onEq);
   currentBaseUri = channelBaseUri + newChannelId + ".";
   sess.subscribe(currentBaseUri + "master", onMaster).then(
      function(subscription) {
         currentMasterSubscription = subscription;
      },
      function(error) {
         console.log("subscription failed ", error);
      }
   );
   sess.subscribe(currentBaseUri + "eq", onEq).then(
      function(subscription) {
         currentEqSubscription = subscription;
      },
      function(error) {
         console.log("subscription failed ", error);
      }
   );

   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId);
}
