var autobahn = require('autobahn');

var connection = new autobahn.Connection({
   url: 'ws://127.0.0.1:8080/ws',
   realm: 'realm1'}
);

var votes = {
   Banana: 0,
   Chocolate: 0,
   Lemon: 0
};

connection.onopen = function (session) {

   // define the procedures that we need

   var getVote = function() {
      var votesArr = [];
      for (var flavor in votes) {
         if (votes.hasOwnProperty(flavor)) {
            votesArr.push({
               subject: flavor,
               votes: votes[flavor]
            })
         }
      }
      return votesArr;
   };

   var submitVote = function(args, kwargs, details) {
      var flavor = args[0];
      votes[flavor] += 1;

      var res = {
         subject: flavor,
         votes: votes[flavor]
      };

      // publish the vote event
      session.publish("io.crossbar.demo.vote.onvote", [res]);

      return "voted for " + flavor;
   };

   var resetVotes = function() {
      for (var fl in votes) {
         if (votes.hasOwnProperty(fl)) {
            votes[fl] = 0;
         }
      }
      // publish the reset event
      session.publish("io.crossbar.demo.vote.onreset");

      return "votes reset";
   };


   // register the procedures

   session.register('io.crossbar.demo.vote.get', getVote).then(
      function (reg) {
         console.log("procedure getVote registered");
      },
      function (err) {
         console.log("failed to register procedure: " + err);
      }
   );

   session.register('io.crossbar.demo.vote.vote', submitVote).then(
      function (reg) {
         console.log("procedure submitVote registered");
      },
      function (err) {
         console.log("failed to register procedure: " + err);
      }
   );

   session.register('io.crossbar.demo.vote.reset', resetVotes).then(
      function (reg) {
         console.log("procedure resetVotes registered");
      },
      function (err) {
         console.log("failed to register procedure: " + err);
      }
   );

};

connection.open();
