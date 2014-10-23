(function() {

   var self = vm;

   /**************************************
   *  Reset the ViewModel                *
   ***************************************/

   // +   
   // local user requests data reset
   self.requestDataReset = function() {
      self.session.call("form:reset", [], {}, { disclose_me: true }).then(
         function(res) {
            self.resetData(res);
         }, self.session.log
      );
   };

   self.resetData = function (data) {
      console.log("resetData", data);

      self.displayResetNotice(true);
      setTimeout(function() {
         self.displayResetNotice(false);
      }, 1200);

      self.fillList(data);
   }; 

   // +
   // handle PubSub event for data reset
   self.onDataReset = function (args, kwargs, details) {
      self.resetData(args);
   };  
   
})()