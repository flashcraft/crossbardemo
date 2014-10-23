(function() {

   var self = vm;

   /***************************************
   *  Update an Item                      *
   ***************************************/

   // handle PubSub event for item update
   self.onItemUpdated = function (args, kwargs, details) {

      var update = kwargs;
     
      var item = self.getItemFromId(update.id);

      // update locally stored values that habe been updated remotely
      for (var i in update) {
         if(update.hasOwnProperty(i)) {
            item[i](update[i]);
         }
      }

      // update the details view if this shows the updated item
      if (self.detailsCurrent.id() === update.id) {

         self.displayDetails(item);

         // temporary highlighting of the changed details
         for (var i in update) {
            if (update.hasOwnProperty(i) && i != "id" ){
               self.detailsEditable[i].hasBeenUpdated(true);
               (function(i) {
                     window.setTimeout(function() {
                        console.log(i + " hasBeenUpdated = false");
                           self.detailsEditable[i].hasBeenUpdated(false);
                     }, 1400);
               })(i);
            }
         }
      }

      // temporary highlighting of the list item
      var previousItemState = item.itemState();
      item.itemState("hasBeenEdited");
      window.setTimeout(function() { item.itemState(previousItemState); }, 1400);
   }

})()