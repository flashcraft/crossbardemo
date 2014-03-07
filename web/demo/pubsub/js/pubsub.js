/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

var hubRestApi = "http://localhost:8080",
   // hubRestApi = get_appliance_url("hub-web", "http://127.0.0.1:8090"),
    channelBaseUri = "io.crossbar.demo.pubsub.",

    sendTime = null,
    recvTime = null,

    receivedMessages = null,
    receivedMessagesClear = null,

    curlLine = null,

    pubTopic = null,
    pubMessage = null,
    pubMessageBtn = null,

    currentSubscription = null;

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
      // sess.publish("event:" + $("#pub_topic").val(), $("#pub_message").val(), false);
      sess.publish(channelBaseUri + $("#pub_topic").val(), [$("#pub_message").val()], {}, {exclude_me: false});
      // sess.publish(channelBaseUri + $("#pub_topic").val(), [$("#pub_message").val()], {}, {acknowledge: true, exclude_me: false}).then(
      //    function(publication) {
      //       console.log("published", publication);

      //    },
      //    function(error) {
      //       console.log("publication error", error);
      //    }
      // );
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


function onMessage(args, kwargs, details) {
   var event = args[0];
   console.log("event received");

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
   console.log("onChannelSwitch", oldChannelId, newChannelId);

   if (oldChannelId) {

      currentSubscription.unsubscribe();

   } else {
      console.log("initial setup");
      // initial setup
      //
      $("#pub_topic").val(newChannelId);
      $("#pub_topic_full").text(channelBaseUri + newChannelId);
      updateCurl();
   }

   sess.subscribe(channelBaseUri + newChannelId, onMessage).then(
      function(subscription) {
         console.log("subscribed", subscription, newChannelId);
         currentSubscription = subscription;
      },
      function(error) {
         console.log("subscription error", error);
      }
   );
   console.log("post subscribe");

   $('#new-window').attr('href', window.location.pathname + '?channel=' + newChannelId);
   $('#pubsub_new_window_link').html(window.location.protocol + "//" + window.location.host + window.location.pathname + '?channel=' + newChannelId);
   $("#sub_topic_full").text(channelBaseUri + newChannelId);
}



var testreceive = function(args, kwargs, details) {
   console.log("testreceive", args, kwargs, details);
}

