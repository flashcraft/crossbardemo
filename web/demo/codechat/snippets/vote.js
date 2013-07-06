// get current votes
session.call("http://tavendo.de/webmq/demo/vote#get").then(
   function (res) {
      console.log("Votes", res);
   },
   ab.log
);

// vote on "Lemon" and print total votes on that
session.call("http://tavendo.de/webmq/demo/vote#vote", "Lemon").then(
   function (res) {
      console.log("Current votes on Lemon:", res);
   }
);

// subscribe to votes
session.subscribe("http://tavendo.de/webmq/demo/vote#onvote",
   function (topic, event) {
      console.log("New Vote", event);
   }
);

// unsubscribe from votes
session.unsubscribe("http://tavendo.de/webmq/demo/vote#onvote");
