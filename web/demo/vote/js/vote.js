/******************************************************************************
 *
 *  Copyright 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
 *
 ******************************************************************************/

// startConnect();

"use strict";
var session = null;
start();


function start() {
   // set link to open a second instance
   document.getElementById("secondInstance").href = window.location.pathname;

   // turn on WAMP debug output
   // ab.debug(true, false, false);

   // use jQuery deferreds
   ab.Deferred = $.Deferred;

   // Connect to Tavendo WebMQ ..
   //
   ab.launch(
      // WAMP app configuration
      {
         // Tavendo WebMQ server URL
         wsuri: ab.getServerUrl(),
         // authentication info
         appkey: null, // authenticate as anonymous
         appsecret: null,
         appextra: null,
         // additional session configuration
         sessionConfig: {maxRetries: 10,
                         sessionIdent: "Vote"}
      },
      // session open handler
      function (newSession) {
         session = newSession;
         main(session);
      },
      // session close handler
      function (code, reason, detail) {
         session = null;
      }
   );
}

function main (session) {
   // subscribe to future vote event
   session.subscribe("http://tavendo.de/webmq/demo/vote#onvote",
      function(topicUri, event) {
         document.getElementById("votes" + event.subject).value =
            event.votes;
      });

   // get the current vote count
   session.call("http://tavendo.de/webmq/demo/vote#get").then(
      function(res){
         for(var i = 0; i < res.length; i++) {
            document.getElementById("votes" + res[i].subject).value =
               res[i].votes;
         }
   }, session.log);

   // wire up vote buttons
   var voteButtons = document.getElementById("voteContainer").
      getElementsByTagName("button");
   for (var i = 0; i < voteButtons.length; i++) {
      voteButtons[i].onclick = function(evt) {
         session.call("http://tavendo.de/webmq/demo/vote#vote",
               evt.target.id).then(session.log, session.log);
      };
   }

   // subscribe to vote reset event
   session.subscribe("http://tavendo.de/webmq/demo/vote#onreset",
      function() {
         var voteCounters = document.getElementById("voteContainer").
            getElementsByTagName("input");
         for(var i = 0; i < voteCounters.length; i++) {
            voteCounters[i].value = 0;
         }
      });

   // wire up reset button   
   document.getElementById("resetVotes").onclick = function() {
      session.call("http://tavendo.de/webmq/demo/vote#reset").
         then(session.log, session.log);
   };
}