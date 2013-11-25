/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

var hubRestApi = get_appliance_url("hub-web", "http://127.0.0.1:8090");
var channelBaseUri = "http://crossbar.io/crossbar/demo/pubsub/";

var sendTime = null;
var recvTime = null;

var receivedMessages = null;
var receivedMessagesClear = null;

var curlLine = null;

var pubTopic = null;
var pubMessage = null;
var pubMessageBtn = null;


function updateCurl() {
   //var cbody = encodeURI('"' + $("#pub_message").val() + '"');
   var cbody = $("#pub_message").val();
   curlLine.value = "curl -d 'topic=" + channelBaseUri + $("#pub_topic").val() + "&event=\"" + cbody + "\"' " + hubRestApi;
}


function setupDemo() {

   receivedMessages = document.getElementById('sub_message');
   receivedMessages.value = "";
   receivedMessages.disabled = true;

   receivedMessagesClear = document.getElementById('sub_message_clear');
   receivedMessagesClear.disabled = true;

   receivedMessagesClear.onclick = function () {
      receivedMessages.value = "";
      receivedMessages.scrollTop = receivedMessages.scrollHeight;
      receivedMessagesClear.disabled = true;
   }

   curlLine = document.getElementById('pub_curl');
   //curlLine.disabled = true;
   curlLine.readOnly = true;

   pubTopic = document.getElementById('pub_topic');
   pubMessage = document.getElementById('pub_message');

   $("#pub_message").val("Hello, world.");

   pubMessageBtn = document.getElementById('pub_publish');

   pubMessageBtn.onclick = function () {

      sendTime = (new Date).getTime();
      sess.publish("event:" + $("#pub_topic").val(), $("#pub_message").val(), false);
   }
   pubMessageBtn.disabled = false;


   // using jQuery because IE8 handles .onkeyup differently
   $(pubTopic).keyup(function(e) {

      ab.log(e);
      if (isValueChar(e)) {
         if (checkChannelId(pubTopic.value)) {
            updateCurl();
            $("#pub_topic_full").text(channelBaseUri + pubTopic.value);
            pubMessageBtn.disabled = false;
         } else {
            pubMessageBtn.disabled = true;
         }
      }
   });

   $(pubMessage).keyup(function(e) {

      if (isValueChar(e)) {
         updateCurl();
      }
   });

   $("#helpButton").click(function() { $(".info_bar").toggle() });

}


function onMessage(topicUri, event) {

   //console.log(topicUri);
   //console.log(event);

   if (sendTime) {
      recvTime = (new Date).getTime();
      $("#sub_message_details_time").text((recvTime - sendTime) + " ms / " + event.length + " bytes");
      sendTime = null;
   } else {
      $("#sub_message_details_time").text(" - / " + event.length + " bytes");
   }

   receivedMessages.value += event + "\r\n";
   receivedMessages.scrollTop = receivedMessages.scrollHeight;

   receivedMessagesClear.disabled = false;
}


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {

      sess.unsubscribe("event:" + oldChannelId);

   } else {

      // initial setup
      //
      $("#pub_topic").val(newChannelId);
      $("#pub_topic_full").text(channelBaseUri + newChannelId);
      updateCurl();
   }

   sess.prefix("event", channelBaseUri);
   sess.subscribe("event:" + newChannelId, onMessage);

   $('#new-window').attr('href', window.location.pathname + '?channel=' + newChannelId);
   //$('#pubsub_new_window_link').html(window.location.origin + window.location.pathname + '?channel=' + newChannelId);
   $('#pubsub_new_window_link').html(window.location.protocol + "//" + window.location.host + window.location.pathname + '?channel=' + newChannelId);
   $("#sub_topic_full").text(channelBaseUri + newChannelId);
}
