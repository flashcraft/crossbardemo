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
         updateStatusline(reason);
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



// var arrows = {};

// // initially contains line numbers
// arrows.codeContainer = "codeContainer";
// arrows.left = "JSCode";
// arrows.right = "PLSQLCode";

// arrows.fromLeft = {
//    get: {
//       color: "#92D050",
//       direction: "lr",
//       start: 12,
//       end: 4,
//       border: "top",
//       fromLeft: 30,
//       rightFudge: -7,
//       arrowHead: "img/greenright.png",
//       arrowHeadPosition: "top",
//       arrowHeadFudge: { left: -20, top: -11}
//    },
//    vote: {
//       color: "#92D050",
//       direction: "lr",
//       start: 25,
//       end: 21,
//       border: "top",
//       fromLeft: 30,
//       rightFudge: -7,
//       arrowHead: "img/greenright.png",
//       arrowHeadPosition: "top",
//       arrowHeadFudge: { left: -20, top: -11}
//    },
//    reset: {
//       color: "#92D050",
//       direction: "lr",
//       start: 42,
//       end: 54,
//       border: "bottom",
//       fromLeft: 30,
//       rightFudge: -7,
//       arrowHead: "img/greenright.png",
//       arrowHeadPosition: "bottom",
//       arrowHeadFudge: { left: -20, top: -11}
//    }
// };

// arrows.fromRight = {
//    onVote: {
//       color: "#00B0F0",
//       direction: "rl",
//       start: 48,
//       end: 5,
//       border: "bottom",
//       fromLeft: -120,
//       topFudge: 15,
//       arrowHead: "img/blueup.png",
//       arrowHeadPosition: "top",
//       arrowHeadFudge: { left: -11, top: -6}
//    },
//    onReset: {
//       color: "#00B0F0",
//       direction: "rl",
//       start: 64,
//       end: 31,
//       border: "bottom",
//       fromLeft: -90,
//       topFudge: 15,
//       arrowHead: "img/blueup.png",
//       arrowHeadPosition: "top",
//       arrowHeadFudge: { left: -11, top: -6}
//    }
// };

// arrows.drawArrows = function(obj) {
//    var codeContainer = document.getElementById(arrows.codeContainer),
//        ccOffset = {
//          top: $(codeContainer).offset().top,
//          left: $(codeContainer).offset().left
//        };
//    // whereIs(ccOffset.left, ccOffset.top);


//    // loop over the arrows in the object
//    for(var i in obj) {
//       if(obj.hasOwnProperty(i)) {
//          var arrow = obj[i];

//          // get the start & end lines
//          var startHalf = arrow.direction === "lr" ? arrows.left : arrows.right;
//          var endHalf = arrow.direction === "lr" ? arrows.right : arrows.left;
//          var startElementId = ("#" + startHalf + " .code .line.number" + arrow.start),
//              endElementId = ("#" + endHalf + " .code .line.number" + arrow.end);
//          arrow.startElement = $(startElementId)[0];
//          arrow.endElement = $(endElementId)[0];

//          // get the offSet within the viewport for these
//          var startOffSet = $(arrow.startElement).offset();
//          var endOffSet = $(arrow.endElement).offset();
//          var addY = 5;
//          arrow.startOffSet = startOffSet;
//          arrow.endOffSet = endOffSet;

//          // calculate the offset depending on where on the element the arrow starts & ends
//          // add fromLeft to get additional horizontal distance, e.g. to avoid arrows overlapping
//          var startAddX = arrow.direction === "lr" ? $(arrow.startElement).width() - arrow.fromLeft : 0;
//          var startX = startOffSet.left + startAddX;
//          var startY = startOffSet.top + addY;

//          arrow.startCoords = { x: startX, y: startY };

//          var endAddX = arrow.direction === "lr" ? 0 : $(arrow.startElement).width() - arrow.fromLeft;
//          var endX = endOffSet.left + endAddX;
//          var endY = endOffSet.top + addY;

//          arrow.endCoords = { x: endX, y: endY };

//          // draw arrowBox
//          var arrowBox = document.createElement("div");
//          $(arrowBox).addClass("arrowBox");

//          arrow.border === "top" ? arrowBox.style.borderTop = "3px solid " + arrow.color : arrowBox.style.borderBottom = "3px solid " + arrow.color;
//          arrowBox.style.borderLeft = "3px solid " + arrow.color;

//          // fudge factors set the displacement for the beginning/end relative to the line start/middle 
//          rightFudge = arrow.rightFudge ? arrow.rightFudge : 0;
//          topFudge = arrow.topFudge ? arrow.topFudge : 0;

//          arrowBox.style.height = Math.abs(arrow.startCoords.y - arrow.endCoords.y) - topFudge + "px"; // decrease arrowBox height by fudhe factor
//          arrowBox.style.width = Math.abs(arrow.startCoords.x - arrow.endCoords.x) + rightFudge + "px";

//          arrowBox.style.top = Math.min(arrow.startCoords.y, arrow.endCoords.y) + topFudge - ccOffset.top + "px"; // move box down, since the offset should be at the top
//          arrowBox.style.left = Math.min(arrow.startCoords.x, arrow.endCoords.x) - ccOffset.left + "px";

//          // add the arrowhead graphic and position this
//          var arrowHead = document.createElement("img");
//          arrowHead.src = arrow.arrowHead;
//          $(arrowHead).addClass("arrowHead");
//          var ahLeft = arrow.direction === "lr" ? parseInt(arrowBox.style.width, 10) : 0;
//          var ahTop = arrow.arrowHeadPosition === "bottom" ? parseInt(arrowBox.style.height, 10) : 0;
//          arrowHead.style.left = ahLeft + arrow.arrowHeadFudge.left + "px";
//          arrowHead.style.top = ahTop + arrow.arrowHeadFudge.top +  "px";
//          arrowBox.appendChild(arrowHead);

//          // document.getElementsByTagName("body")[0].appendChild(arrowBox);
//          codeContainer.appendChild(arrowBox);

//       }
//       console.log(obj[i]);
//    }
// };

// window.onload = function() {
//    // syntaxhighlighter seems to be slow, so draw arrows here
//    window.setTimeout(function() {
//       arrows.drawArrows(arrows.fromLeft);
//       arrows.drawArrows(arrows.fromRight);
//    }, 0) // without the timer, IE10 tries to draw arrows before syntaxhighlighter has completed   
// };

// function whereIs (x, y) {
//    var dot = document.createElement("div");
//    $(dot).addClass("dot");
//    dot.style.left = x + "px";
//    dot.style.top = y + "px";
//    document.getElementsByTagName("body")[0].appendChild(dot);
// }
