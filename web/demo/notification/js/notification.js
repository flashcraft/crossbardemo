/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

var channelBaseUri = "http://tavendo.de/webmq/demo/notifications/";

var notificationCount = null;

// notification-related variables

var ad;
var ad_countdown;
var ad_hide;
var ad_shown = false;
var ad_width = 600;
var ad_time_to_hide = 6;
var ad_time_remaining = 0;


function abChangeFavicon() {
   //ab.log("called");
   //var links = document.getElementsByTagName("link");
   //ab.log(links);
   //for (var i = 0; i < links.length; i++) {
   //   if (links[i].getAttribute("rel") === "shortcut icon") {
   //      if (links[i].getAttribute("href") === "favicon.ico") {
   //         ab.log("favicon.ico to record.ico");
   //         links[i].href = "record.ico";
   //      }
   //      else if (links[i].getAttribute("href") === "record.ico") {
   //         ab.log("record.ico to favicon.ico");
   //         links[i].href = "favicon.ico";
   //      }
   //      console.log("1", links[i]);
   //      console.log("2", links[i].href);
   //      console.log("3", links[i].getAttribute("href"));
   //   };
   //}

   var currentIcon = $("#favicon").attr("href");
   //ab.log(currentIcon);
   $("#favicon").remove();
   var newIcon;
   if (currentIcon === "record.ico") {
      ab.log("1");
      newIcon = "<link id='favicon' rel='shortcut icon' href='favicon.ico'>";
   }
   else {
      ab.log("2");
      newIcon = "<link id='favicon' rel='shortcut icon' href='record.ico'>";
   }
   $(newIcon).appendTo("head");

}


function setupDemo() {

   $("#notification_message").val("Hello World!");

   // initialize any variables

   // set up event handlers
   $("#send_notification").click(sendNotification);

   Tinycon.setOptions({
      background: '#000000',
      font: '12px arial',
      width: 8,
      height: 11,
      fallback: true
   });

   // add elements
   ad = document.getElementById('webmqad');
   ad_countdown = document.getElementById('webmqad_countdown');

   // allow manual slide in/out
   ad.onclick = toggle;

   ad_countdown.style.visibility = 'hidden';

   $("#helpButton").click(function() { $(".info_bar").toggle(); });
}

function onChannelSwitch(oldChannelId, newChannelId) {
   // gets called during initialization of the demo and on each channel switch

   if (oldChannelId) {

      sess.unsubscribe("event:" + oldChannelId);

   } else {

      // initial setup
      //
      $("#pub_topic").val(newChannelId);
      $("#pub_topic_full").text(channelBaseUri + newChannelId);

   }

   sess.prefix("event", channelBaseUri);
   sess.subscribe("event:" + newChannelId, onNotification);

   $('#new-window').attr('href', window.location.pathname + '?channel=' + newChannelId);
   //$('#pubsub_new_window_link').html(window.location.origin + window.location.pathname + '?channel=' + newChannelId);
   $("#sub_topic_full").text(channelBaseUri + newChannelId);
}

function sendNotification () {

   //ab.log("send", arguments);
   sess.publish("event:" + $("#pub_topic").val(), $("#notification_message").val(), false);

}

function onNotification(topicUri, event) {
   ab.log(topicUri, event);

   notificationCount += 1;

   // change Favicon
   Tinycon.setBubble(notificationCount);
   //Notificon(notificationCount);

   // display side-scrolling notification
   $("#webmqad_message").text(event);
   toggle("emptyEvent", true);

}

// reset persistent state
function reset() {
   delete localStorage["webmq_ad_hidden"];
}

function countdown() {
   window.setTimeout(function() {
      if (ad_shown && ad_time_remaining > 0) {
         ad_time_remaining = ad_time_remaining - 1;
         ad_countdown.innerHTML = ad_time_remaining;

         if (ad_time_remaining > 0) {
            countdown();
         }
      }
   }, 1000);
}

function toggle(event, newNotification) {

   // if already displayed  & new notification, do nothing
   // P: this does not reset the counter on receiving additional notifications
   //    within an initial countdown period - FIXME
   if (newNotification && ad_shown) {
      return;
   }

   // toggle the slide in/out
   if (ad_shown) {
      ad.style.right = '-' + (ad_width + 25) + 'px';
      ad_shown = false;
      ad_countdown.style.visibility = 'hidden';
      // switch arrow to pointing left
      window.setTimeout(function() {
         ad.style.backgroundImage = "url('img/slide_in_left_arrow_d.png')";
      }, 500);

   } else {
      ad.style.right = '0px';
      ad_shown = true;
      // switch arrow to pointing right
      window.setTimeout(function() {
         ad.style.backgroundImage = "url('img/slide_in_right_arrow_d.png')";
      }, 500);
   }

   // if triggered based on a new notification,
   // start the countdown and hide after this
   if (newNotification) {
      ab.log("new", ad_shown);
      ad_time_remaining = ad_time_to_hide;
      ad_countdown.innerHTML = ad_time_remaining;

      window.setTimeout(function() {
         if (ad_shown) {
            // slide out
            ad.style.right = '-' + (ad_width + 25) + 'px';
            ad_shown = false;
            ad_countdown.style.visibility = 'hidden';
            window.setTimeout(function() {
               ad.style.backgroundImage = "url('img/slide_in_left_arrow.png')";
            }, 500);
         }
      }, 1000 * ad_time_to_hide);

      ad_countdown = document.getElementById('webmqad_countdown');
      ad_countdown.style.visibility = 'visible';
      countdown();
   }
}
