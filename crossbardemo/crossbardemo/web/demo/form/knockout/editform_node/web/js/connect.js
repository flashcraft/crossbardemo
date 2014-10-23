(function() {

   console.log("connect loaded");

   var self = vm;

   /***************************************
   *  Establish connection to WAMP Router *
   ***************************************/

   // determine URI of WAMP router
   self.wsuri = null;
   // - locally run router when loaded from file for development purposes
   if (document.location.origin == "file://") {
      self.wsuri = "ws://127.0.0.1:8080/ws";
   // - else based on the IP addess the HTML is served from
   } else {
      self.wsuri = (document.location.protocol === "http:" ? "ws:" : "wss:") + "//" +
               document.location.host + "/ws";
   }

   // WAMP session object
   self.session = null;

   // the WAMP connection to the Router
   //
   self.connection = new autobahn.Connection({
      url: self.wsuri,
      realm: "realm1"
   });

   // fired when connection is established and session attached
   //
   self.connection.onopen = function (sess, details) {

      console.log("Connected");

      self.session = sess;

      // $('#new-window').attr('href', window.location.pathname);
      document.getElementById('secondInstance').setAttribute('href', window.location.pathname);

      self.connectionStatus("Connected to " + self.wsuri + " in session " + self.session.id);

      // set an URI prefix
      self.session.prefix("form", "io.crossbar.crossbar.demo.product");

      // request full data set initially and fill grid
      self.session.call("form:read", [], {start: 0, limit: 25}).then(self.fillList, self.session.log);

      // subscribe to data change events
      self.session.subscribe("form:oncreate", self.onItemCreated);
      self.session.subscribe("form:onupdate", self.onItemUpdated);
      self.session.subscribe("form:ondelete", self.onItemDeleted);
      self.session.subscribe("form:onreset", self.onDataReset);

   };


   // fired when connection was lost (or could not be established)
   //
   self.connection.onclose = function (reason, details) {
      console.log("Connection lost: " + reason, details);
      self.connectionStatus("Connection lost!");
   }


   // now actually open the connection
   //
   self.connection.open();

})()