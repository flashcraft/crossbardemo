/******************************************************************************
 *
 *  Copyright 2012-2013 Tavendo GmbH.
 *
 *  Licensed under the Apache 2.0 license
 *  http://www.apache.org/licenses/LICENSE-2.0.html
 *
 ******************************************************************************/

/*
   Requires the following elements to be present in the HTML:
      - .statusline - displays the connection state
      - #controller-channel - to display the currently used channel
      - #controller-channel-switch - button to start switch to another channel
      - #controller-channel-cancel - button to cancel changing to another channel
*/
/*
   Checks for channel information encoded in the URL to automatically switch to that channel
*/

var wsuri = get_appliance_url("hub-websocket", "ws://127.0.0.1:8080/ws");
var sess = null;
var retryCount = 0;
var retryDelay = 2;

var _idchars = "0123456789";
var _idlen = 6;
var _idpat = /^\d*$/;


function randomChannelId() {
   var id = "";
   for (var i = 0; i < _idlen; i += 1) {
      id += _idchars.charAt(Math.floor(Math.random() * _idchars.length));
   }
   return id;
};

function checkChannelId(id) {
   return id != null && id != "" && id.length == _idlen && _idpat.test(id);
}

function isValueChar(e) {

   //alert(evt);
   var kc = e.keyCode;
   if ((kc > 8 && kc < 46 && kc !== 32) || (kc > 90 && kc < 94) || (kc > 111 && kc < 186) ) {
      return false;
   } else {
      return true;
   }
}

var controllerChannelId = null;
var controllerChannel = null;
var controllerChannelSwitch = null;
var controllerChannelCancel = null;


function switchChannel(newChannelId) {

   onChannelSwitch(controllerChannelId, newChannelId);

   controllerChannelId = newChannelId;
   controllerChannel.disabled = false;
   controllerChannelSwitch.disabled = true;
   controllerChannelCancel.disabled = true;
   controllerChannel.value = controllerChannelId;
}


function updateStatusline(status) {
   $(".statusline").text(status);
};


function connect() {

   ab._Deferred = jQuery.Deferred;

   ab.connect(wsuri,

      function (session) {
         sess = session;
         ab.log("connected!");
         onConnect0();
      },

      function (code, reason, detail) {

         sess = null;
         switch (code) {
            case ab.CONNECTION_UNSUPPORTED:
               window.location = "https://webmq.tavendo.de:9090/help/browsers";
               //alert("Browser does not support WebSocket");
               break;
            case ab.CONNECTION_CLOSED:
               window.location.reload();
               break;
            default:
               ab.log(code, reason, detail);

               controllerChannelId = null;
               controllerChannel.value = "";
               controllerChannel.disabled = true;
               controllerChannelSwitch.disabled = true;
               controllerChannelCancel.disabled = true;

               retryCount = retryCount + 1;
               updateStatusline("Connection lost. Reconnecting (" + retryCount + ") in " + retryDelay + " secs ..");

               break;
         }
      },

      {'maxRetries': 60, 'retryDelay': 2000}
   );
}


function onConnect0() {
   console.log("onConnect0");
   sess.authreq().then(function () {
      console.log("authreqresult");
      sess.auth().then(onAuth, ab.log);
   }, function() { console.log("autrequest failure") });
}


function onAuth(permissions) {
   ab.log("authenticated!", permissions);

   updateStatusline("Connected to " + wsuri);
   retryCount = 0;

   if (checkChannelId(controllerChannel.value)) {
      switchChannel(controllerChannel.value);
   } else {
      switchChannel(randomChannelId());
   }

   afterAuth();

};

var setupInfoDictionary = {};

$(document).ready(function()
{
   updateStatusline("Not connected.");

   controllerChannelSwitch = document.getElementById('controller-channel-switch');
   controllerChannelCancel = document.getElementById('controller-channel-cancel');
   controllerChannel = document.getElementById('controller-channel');

   // check for additional demo setup data in the URL
   //var windowUrl = window.location.href; // writable reference
   windowUrl = document.URL; // string

   // check if '?' fragment is present
   // then make dictionary of values here
   if (windowUrl.indexOf('?') !== -1) {
      var setupInfoRaw = windowUrl.split('?')[1];
      var setupInfoSeparated = setupInfoRaw.split('&');

      for (var i = 0; i < setupInfoSeparated.length; i++) {
         var pair = setupInfoSeparated[i].split('=');
         var key = pair[0];
         var value = pair[1];
         setupInfoDictionary[key] = value;
      }

   }
   if ("channel" in setupInfoDictionary) {
      controllerChannel.value = setupInfoDictionary.channel;
   }

   controllerChannel.onkeyup = function (e) {

      if (controllerChannel.value != controllerChannelId) {

         controllerChannelCancel.disabled = false;

         if (controllerChannel.value.length == _idlen && _idpat.test(controllerChannel.value)) {
            controllerChannelSwitch.disabled = false;
         } else {
            controllerChannelSwitch.disabled = true;
         }
      } else {
         controllerChannelCancel.disabled = true;
         controllerChannelSwitch.disabled = true;
      }
   };

   controllerChannelCancel.onclick = function () {
      controllerChannel.value = controllerChannelId;
      controllerChannelSwitch.disabled = true;
      controllerChannelCancel.disabled = true;
   }

   controllerChannelSwitch.onclick = function () {

      switchChannel(controllerChannel.value);
      controllerChannelSwitch.disabled = true;
      controllerChannelCancel.disabled = true;
   }

   setupDemo();

   connect();

});
