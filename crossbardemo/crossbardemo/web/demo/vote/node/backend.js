var autobahn = require('autobahn');

var connection = new autobahn.Connection({
   url: process.argv[2], // 'ws://127.0.0.1:8080/ws',
   realm: process.argv[3] // 'realm1'
});

var votes = {
   Banana: 0,
   Chocolate: 0,
   Lemon: 0
};

function main (session) {

   // return set of present votes on request
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

   // handle vote submission
   var submitVote = function(args) {
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

   // reset vote count
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
   session.register('io.crossbar.demo.vote.get', getVote);
   session.register('io.crossbar.demo.vote.vote', submitVote);
   session.register('io.crossbar.demo.vote.reset', resetVotes);
}

connection.onopen = function (session) {
   main(session);
};

connection.open();
