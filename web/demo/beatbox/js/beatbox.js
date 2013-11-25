/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

var channelBaseUri = "http://crossbar.io/crossbar/demo/colorpicker/";
var newWindowLink = null;


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
   samples[btn].loop = true;
}


function setupDemo() {

   newWindowLink = document.getElementById('new-window');

   if (ab.getBrowser().name === "MSIE") {

      // MSIE10 only supports MPEG formats
      console.log("MSIE detected .. using MP3 versions of samples");

      loadSample(0, 'demo_beatbox_sample_a.mp3');
      //      loadSample(1, 'demo_beatbox_sample_b_kick.mp3');
      loadSample(1, 'demo_beatbox_sample_b.mp3');
      loadSample(2, 'demo_beatbox_sample_c.mp3');
      loadSample(3, 'demo_beatbox_sample_d.mp3');

   } else {

      // for Chrome/Firefox, we use WAV version, since
      // those appear to have a faster attack rate
      console.log("using WAV versions of samples");

      loadSample(0, 'demo_beatbox_sample_a.wav');
      //      loadSample(1, 'demo_beatbox_sample_b_kick.wav');
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

function onPadButtonDown(topicUri, event) {

   if (!buttons[event.b].pressed) {

      if (enable_audio.checked) {
         // do NOT change order/content of the following 2 lines!
         samples[event.b].currentTime = samples[event.b].initialTime;
         samples[event.b].play();
      }

      buttons[event.b].pressed = true;
      // buttons[event.b].btn.style.background = "#ff6600";
      buttons[event.b].btn.style.background = "#d0b800";
   }
}


function onPadButtonUp(topicUri, event) {

   if (buttons[event.b].pressed) {

      if (enable_audio.checked) {
         // do NOT change order/content of the following 2 lines!
         samples[event.b].currentTime = samples[event.b].initialTime;
         samples[event.b].pause();
      }

      buttons[event.b].pressed = false;
      buttons[event.b].btn.style.background = "#666";
   }
}


function padButton(btn, down) {

   var evt = { b: btn, t: 0 };

   if (down) {
      if (direct_trigger.checked) {
         onPadButtonDown(null, evt);
      }
      if (pub_trigger.checked) {
         sess.publish("event:pad-down", evt, direct_trigger.checked);
      }
   } else {
      if (direct_trigger.checked) {
         onPadButtonUp(null, evt);
      }
      if (pub_trigger.checked) {
         sess.publish("event:pad-up", evt, direct_trigger.checked);
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
      sess.unsubscribe("event:pad-down");
      sess.unsubscribe("event:pad-up");
   }

   sess.prefix("event", channelBaseUri + newChannelId + '#');
   sess.subscribe("event:pad-down", onPadButtonDown);
   sess.subscribe("event:pad-up", onPadButtonUp);

   newWindowLink.setAttribute('href', window.location.pathname + '?channel=' + newChannelId + '&audio=off');
}


