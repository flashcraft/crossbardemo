var sess = null;

function connect() {

   ab._Deferred = jQuery.Deferred;

   ab.connect("ws:191.168.1.132/ws",

      function (session) {
         sess = session;

         onConnect();
      },

      function (code, reason, detail) {

         // error handling
      }

   );
}

function onConnect() {
   sess.authreq().then(function () {

      sess.auth().then(onAuth, ab.log);

   }, ab.log);
}

function onAuth(permissions) {

   sess.subscribe("http://tavendo.de/webmq/demo/chat/" + channelID, onMessage);

};

function onMessage(topicUri, message) {

   // add message to the chat window

}

function sendMessage(message) {
   
   sess.publish("http://tavendo.de/webmq/demo/chat/" + channel, message);
   
};