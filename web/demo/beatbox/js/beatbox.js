/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

var channelBaseUri = "io.crossbar.demo.beatbox.";
var newWindowLink = null;

var currentSubscriptions = [];


// options checkboxes
var enable_audio = null;
var pub_trigger = null;
var direct_trigger = null;

var samples = [];
var buttons = [];

/**
 * For unclear reasons, Chrome will persistently fail to rewind the samples when
 * the media files are served from Flask/SocketServer.
 * When Flask is served from Twisted, this will fail on first load, but then
 * on refresh (F5) it succeeds. Needs further investigation.
 * With the sound files served from Apache, this does not happen ..
 */
//var samplesBaseUri = 'http://www.tavendo.de/static/snd/';
var samplesBaseUri = 'snd/';


function loadSample(btn, file) {
   samples[btn] = document.createElement('audio');
   samples[btn].setAttribute('src', samplesBaseUri + file);
   samples[btn].load();
   samples[btn].volume = 1;
   // samples[btn].loop = true;
   samples[btn].setAttribute('loop', true);
   samples[btn].initialTime = 0;
}


function setupDemo() {

   newWindowLink = document.getElementById('new-window');

   // if (ab.getBrowser().name === "MSIE") {

   //    // MSIE10 only supports MPEG formats
   //    console.log("MSIE detected .. using MP3 versions of samples");

   //    loadSample(0, 'demo_beatbox_sample_a.mp3');
   //    //      loadSample(1, 'demo_beatbox_sample_b_kick.mp3');
   //    loadSample(1, 'demo_beatbox_sample_b.mp3');
   //    loadSample(2, 'demo_beatbox_sample_c.mp3');
   //    loadSample(3, 'demo_beatbox_sample_d.mp3');

   // } else {

   //    // for Chrome/Firefox, we use WAV version, since
   //    // those appear to have a faster attack rate
   //    console.log("using WAV versions of samples");

      // loadSample(0, 'demo_beatbox_sample_a.wav');
      // //      loadSample(1, 'demo_beatbox_sample_b_kick.wav');
      // loadSample(1, 'demo_beatbox_sample_b.wav');
      // loadSample(2, 'demo_beatbox_sample_c.wav');
      // loadSample(3, 'demo_beatbox_sample_d.wav');

   // }

   // FF doesn't do mp3, IE doesn't do WAV, easiest do give mp3 to IE
   if(navigator.userAgent.indexOf("Trident") !== -1)  {
      console.log("loading mp3s");
      loadSample(0, 'demo_beatbox_sample_a.mp3');
      loadSample(1, 'demo_beatbox_sample_b.mp3');
      loadSample(2, 'demo_beatbox_sample_c.mp3');
      loadSample(3, 'demo_beatbox_sample_d.mp3');
   } else {
      loadSample(0, 'demo_beatbox_sample_a.wav');
      loadSample(1, 'demo_beatbox_sample_b.wav');
      loadSample(2, 'demo_beatbox_sample_c.wav');
      loadSample(3, 'demo_beatbox_sample_d.wav');
   }

   // check if audio enabled via URL switch
   if ("audio" in setupInfoDictionary && setupInfoDictionary.audio === "off") {
      //ab.log("audio set via URL");
      document.getElementById('enable_audio').checked = false;
   }

   enable_audio = document.getElementById('enable_audio');
   pub_trigger = document.getElementById('pub_trigger');
   direct_trigger = document.getElementById('direct_trigger');

   buttons[0] = { btn: document.getElementById('button-a'), pressed: false };
   setPadButtonHandlers(buttons[0].btn, 0);

   buttons[1] = { btn: document.getElementById('button-b'), pressed: false };
   setPadButtonHandlers(buttons[1].btn, 1);

   buttons[2] = { btn: document.getElementById('button-c'), pressed: false };
   setPadButtonHandlers(buttons[2].btn, 2);

   buttons[3] = { btn: document.getElementById('button-d'), pressed: false };
   setPadButtonHandlers(buttons[3].btn, 3);

   // for suppressing key-autorepeat events
   var keysPressed = {};

   window.onkeydown = function(e) {

      if (keysPressed[e.keyCode]) {
         return;
      } else {
         keysPressed[e.keyCode] = true;
      }

      switch (e.keyCode) {
         case 65:
            padButton(0, true);
            break;
         case 66:
            padButton(1, true);
            break;
         case 67:
            padButton(2, true);
            break;
         case 68:
            padButton(3, true);
            break;
      }
   };

   window.onkeyup = function(e) {

      keysPressed[e.keyCode] = false;

      switch (e.keyCode) {
         case 65:
            padButton(0, false);
            break;
         case 66:
            padButton(1, false);
            break;
         case 67:
            padButton(2, false);
            break;
         case 68:
            padButton(3, false);
            break;
      }
   };

   //$("#helpButton").click(toggleHelp);
   $("#helpButton").click(function() { $(".info_bar").toggle(); });
}

function onPadButtonDown(args, kwargs, details) {

   console.log("onPadButtonDown", args, kwargs, details);

   if (!buttons[kwargs.b].pressed) {

      if (enable_audio.checked) {
         // do NOT change order/content of the following 2 lines!
         samples[kwargs.b].currentTime = samples[kwargs.b].initialTime;
         samples[kwargs.b].play();
      }

      buttons[kwargs.b].pressed = true;
      // buttons[kwargs.b].btn.style.background = "#ff6600";
      buttons[kwargs.b].btn.style.background = "#d0b800";
   }
}


function onPadButtonUp(args, kwargs, details) {

   console.log("onPadButtonUp", args, kwargs, details);

   if (buttons[kwargs.b].pressed) {

      if (enable_audio.checked) {
         // do NOT change order/content of the following 2 lines!
         samples[kwargs.b].currentTime = samples[kwargs.b].initialTime;
         samples[kwargs.b].pause();
      }

      buttons[kwargs.b].pressed = false;
      buttons[kwargs.b].btn.style.background = "#666";
   }
}


function padButton(btn, down) {

   if (down) {
      if (direct_trigger.checked) {
         onPadButtonDown(null, { "b": btn, "t": 0 });
      }
      if (pub_trigger.checked) {
         sess.publish(channelBaseUri + controllerChannelId + ".pad_down", [], { "b": btn, "t": 0 }, { exclude_me: false, acknowledge: true }).then(
            function(publication) {
               console.log("published", publication);
            },
            function(error) {
               console.log("publication error");
            }
         );
      }
   } else {
      if (direct_trigger.checked) {
         onPadButtonUp(null, { "b": btn, "t": 0});
      }
      if (pub_trigger.checked) {
         sess.publish(channelBaseUri + controllerChannelId + ".pad_up", [], { "b": btn, "t": 0}, { exclude_me: false, acknowledge: true }).then(
         // sess.publish(channelBaseUri + "pad_up", [6, 23], { "b": btn, "t": 0});
            function(publication) {
               console.log("published", publication);
            },
            function(error) {
               console.log("publication error");
            }
         );
      }
   }
}


function setPadButtonHandlers(button, btn) {
   button.onmousedown = function() {
      padButton(btn, true);
   };
   button.onmouseup = function() {
      padButton(btn, false);
   };
   // prevent buttons from getting stuck on mouseout, since mouseup no longer on button
   button.onmouseout = function() {
      padButton(btn, false);
   };
}


function onChannelSwitch(oldChannelId, newChannelId) {

   if (oldChannelId) {
      // sess.unsubscribe("event:pad_down");
      // sess.unsubscribe("event:pad_up");
      currentSubscriptions[0].unsubscribe();
      currentSubscriptions[1].unsubscribe();
   }

   // sess.prefix("event", channelBaseUri + newChannelId + '#');
   // sess.subscribe("event:pad_down", onPadButtonDown);
   // sess.subscribe("event:pad_up", onPadButtonUp);

   sess.subscribe(channelBaseUri + newChannelId + ".pad_down", onPadButtonDown).then(
      function(subscription) {
         console.log("subscribed pad_down", subscription);
         currentSubscriptions[0] = subscription;
      },
      function(error) {
         console.log("subscription error pad_down", error);
      }
   );
   sess.subscribe(channelBaseUri + newChannelId + ".pad_up", onPadButtonUp).then(
      function(subscription) {
         console.log("subscribed pad_up", subscription);
         currentSubscriptions[1] = subscription;
      },
      function(error) {
         console.log("subscription error pad_up", error);
      }
   );

   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId + '&audio=off');
}


