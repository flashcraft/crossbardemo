var wsuri = get_appliance_url("hub-websocket", "ws://localhost/ws");
var sess = null;

window.onload = function() {
   ab.debug(true, false);
   connect();
   

   $("#helpButton").click(function() { $(".info_bar").toggle() });
};

// connect to WebMQ
function connect() {

   ab.connect(wsuri,

      function(session) {
         sess = session;
         ab.log("connected to " + wsuri, sess.sessionid());
         onConnect0();
         // color SHIMCONSOLE green
         document.getElementById("SHIMCONSOLE").style.backgroundColor = "#44C044";
      },

      function(code, reason, detail) {
         sess = null;
         switch (code) {
            default:
               ab.log("connection lost", code, reason, detail);
               break;
         }
         // color SHIMCONSOLE red
         document.getElementById("SHIMCONSOLE").style.backgroundColor = "#B60000";
      },
      { 'maxRetries': 60, 'retryDelay': 2000 }
   );
}

// authenticate as "anonymous"
//
function onConnect0() {
   sess.authreq().then(function() {
      sess.auth().then(onAuth, ab.log);
   }, ab.log);
}

// authenticate as "heinz"
//
function onConnect1() {
   sess.authreq("heinz").then(function(challenge) {

      // direct sign or AJAX to 3rd party
      var signature = sess.authsign(challenge, "geheim");

      sess.auth(signature).then(onAuth, ab.log);
   }, ab.log);
}

// authenticate as "foobar", providing extra data
//
function onConnect2() {

   var extra = { user: 'otto', role: 'author', age: 24 };
   sess.authreq("foobar", extra).then(function(challenge) {

      // direct sign or AJAX to 3rd party
      var signature = sess.authsign(challenge, "secret");

      sess.auth(signature).then(onAuth, ab.log);
   }, ab.log);
}

var myTopic = "http://example.com/events#evt2";

function onAuth(permissions) {
   ab.log("authenticated!", permissions);
   sess.subscribe(myTopic, function(topic, evt) {
      ab.log("received", topic, evt);
   });
   ab.log("\nREADY!\n");
};

function publishToMyTopic() {
   sess.publish(myTopic, "Hello, world!");
   ab.log("published to", myTopic);
};