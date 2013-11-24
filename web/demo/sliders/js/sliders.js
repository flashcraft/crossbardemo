/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH. 
 *
 *                                Apache License
 *                          Version 2.0, January 2004
 *                       http://www.apache.org/licenses/
 *
 ******************************************************************************/

var channelBaseUri = "http://autobahn.tavendo.de/public/demo/sliders/";
var newWindowLink = null;


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
         sess.publish("event:master", ui.value);
         sess.publish("http://tavendo.de/webmq/demo/gauges#0", ui.value);
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
            sess.publish("event:eq", { idx: k, val: ui.value });
         }
      });
      i += 1;
   });

   $("#helpButton").click(function() { $(".info_bar").toggle() });
}


function onMaster(topicUri, event) {

   $("#master").slider({
      value: event
   });
}


function onEq(topicUri, event) {

   $("#eq span:nth-child(" + event.idx + ")").slider({
      value: event.val
   });
}


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {
      sess.unsubscribe("event:master");
   }

   sess.prefix("event", channelBaseUri + newChannelId + '#');
   sess.subscribe("event:master", onMaster);
   sess.subscribe("event:eq", onEq);

   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId);
}
