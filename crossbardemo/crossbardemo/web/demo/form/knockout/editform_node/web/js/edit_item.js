(function() {

   var self = vm;

   /*********************************************
   *  Edit details, cancel edit & store edited  *
   *********************************************/

   // format input on fields in item details box
   self.mangleInputs = function(viewmodel, event) {
      
      // block non-numeric input on numeric input fields
      if (self.inputs[event.target.id] === "num") {
         // self.session.log("evt", event.keyCode);
         if (event.keyCode > 57 && event.keyCode !== 190) {
            return false;
         }
      }
      
      return true; // knockout.js otherwise prevents the default action
   };

   self.normalizeSet = function(set) {
      
      for (var i in set) {
         
         // backend expects numerical values for certain fields
         // either parse to numerical, or remove field from save set
         if (self.inputs[i] === "num" && set[i] !== "") {
            set[i] = parseFloat(set[i], 10);
         }
         else if (self.inputs[i] === "num" && set[i] === "") {
            delete set[i];
         }

      }
      return set;
   };

   // +
   // store new item or update stored item
   self.saveDetailsEdits = function() {

      var saveSet = {};
      for (var i in self.inputs) {
         saveSet[i] = self.detailsEditable[i].displayedValue();
      }
      // if we're updating an existing item, we need to add its id
      if (self.detailsCurrent.itemState() != 'isNew') {
         saveSet.id = self.detailsCurrent.id();
      }

      self.normalizeSet(saveSet);

      // set call URI depending on creating new item or updating existing one
      var callURI = self.detailsCurrent.itemState() === 'isNew' ? 'form:create' : 'form:update';

      self.session.call(callURI, [], saveSet, { disclose_me: true }).then(
         function(res) {
            console.log("res", res);

            //// use return from DB for this
            for (var i in res) {
               if (res.hasOwnProperty(i)) {
                  self.detailsCurrent[i](res[i]);   
               }                  
            }

            // display details to clear field states + set button states
            self.displayDetails(self.detailsCurrent);

            // additional actions when we've created a new item
            if (self.detailsCurrent.itemState() === 'isNew') {
               // re-enable the 'add item' button
               self.addButtonVisible(true);
               // set item state
               self.detailsCurrent.itemState('isBeingDisplayed');
            }

         },
         self.session.log
      );
      
   };

   // +
   // cancel editing of the item in details view
   self.cancelDetailsEdits = function() {
      // check whether this is a new item
      if (self.detailsCurrent.itemState() === 'isNew') {
         // delete item from list
         self.listData.remove(self.detailsCurrent);
         // set focus to top of the list and display the details for this
         self.displayDetails(self.listData()[0]);
         // re-enable the 'add item' button
         self.addButtonVisible(true);
      }
      else {
         self.displayDetails(self.detailsCurrent);
      }
   };

})()