/******************************************************************************
 *
 *  Copyright 2012 Tavendo GmbH. All rights reserved.
 *
 ******************************************************************************/

var channelBaseUri = "http://autobahn.tavendo.de/public/demo/controllerpad/";
var vlccmd = null;
var vlchost = null;
var buttons = [];


function setupDemo() {

   vlccmd = document.getElementById("vlccmd");
   vlchost = document.getElementById("vlchost");

   buttons[0] = { btn: document.getElementById('button-a'), pressed: false };
   setPadButtonHandlers(buttons[0].btn, 0);

   buttons[1] = { btn: document.getElementById('button-b'), pressed: false };
   setPadButtonHandlers(buttons[1].btn, 1);

   buttons[2] = { btn: document.getElementById('button-c'), pressed: false };
   setPadButtonHandlers(buttons[2].btn, 2);

   buttons[3] = { btn: document.getElementById('button-d'), pressed: false };
   setPadButtonHandlers(buttons[3].btn, 3);

   buttons[4] = { btn: document.getElementById('button-e'), pressed: false };
   setPadButtonHandlers(buttons[4].btn, 4);

   //$("#helpButton").click(toggleHelp);
   $("#helpButton").click(function() { $(".info_bar").toggle() });
};


/**
 * Control locally running VLC via it's builtin HTTP interface.
 *
 * VLC doesn't implement CORS headers .. so we use this IFrame hack.
 * http://trac.videolan.org/vlc/ticket/5482
 */
function execute(cmd) {
   vlccmd.setAttribute('src', 'http://' + vlchost.value + '/requests/status.xml?command=pl_' + cmd);
}


function onPadButtonDown(topicUri, event) {

   switch (event.b) {
      case 0:
         execute('play');
         break;
      case 1:
         execute('previous');
         break;
      case 2:
         execute('pause');
         break;
      case 3:
         execute('next');
         break;
      case 4:
         execute('stop');
         break;
      default:
         break;
   }

   if (!buttons[event.b].pressed) {
      buttons[event.b].pressed = true;
      buttons[event.b].btn.className = "button vlc_control vlc_control_pressed";
   }
}


function onPadButtonUp(topicUri, event) {

   buttons[event.b].pressed = false;
   buttons[event.b].btn.className = "button vlc_control";
}


function padButton(btn, down) {
   if (down) {
      sess.publish("event:pad-down", { b: btn, t: 0 }, false);
   } else {
      sess.publish("event:pad-up", { b: btn, t: 0 }, false);
   }
}


function setPadButtonHandlers(button, btn) {
   button.onmousedown = function() {
      padButton(btn, true);
   };
   button.onmouseup = function() {
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
}
