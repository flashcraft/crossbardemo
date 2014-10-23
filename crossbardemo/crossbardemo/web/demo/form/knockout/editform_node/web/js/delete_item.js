(function() {

   var self = vm;

   /**************************************
   *  Delete an item                     *
   ***************************************/

   // +
   // delete triggered locally via delete button on list item
   self.triggerDelete = function( listItem, event ) {
      self.session.call("form:delete", [listItem.id()], {}, { disclose_me: true }).then(
         function(res) {
            // console.log("item " + listItem.id() + " deleted on backend", res);
            var locallyTriggered = true;
            self.deleteListItem(listItem, locallyTriggered);
         },
         self.session.log // we should really have some error handling here - FIXME!
         );
   };

   self.deleteListItem = function (item, locallyTriggered) {

      item.itemState("isBeingDeleted");

      var timeout = locallyTriggered === true ? 500 : 1500;

      window.setTimeout(function() {
         // fade out item - CHECKME!
         item.itemState("nonDisplay");
         // set timeout to delete item after end of fade
         window.setTimeout(function() {
            var index = self.getIndexFromId(item.id());
            var id = item.id();
            self.listData.remove(item);
            self.changeFocusAfterDelete(id, index);
         }, 200);
      }, timeout);

   };

   self.changeFocusAfterDelete = function (id, index) {
      // we only need to change focus if the deleted item was currently in focus
      if (id != self.detailsCurrent.id()) {
         return;
      }
      
      // find new item to focus
      var newFocus = false;
      if (self.listData().length > 0) {
         newFocus = index < self.listData().length - 1 ? index : self.listData().length - 1;
      }

      // switch to list element or to blank view
      if (newFocus !== false) {
         self.displayDetails(self.listData()[newFocus]);
      }
      else {
         // clear the details view
         // detailsCurrent already gone --> referenced object deleted
         self.detailsIds.forEach(function(id) {
            self.detailsEditable[id].displayedValue("");
            self.detailsEditable[id].storedValue("");
         })
         // self.addListItem();
      }
   };

   // +
   // handle PubSub event for item deletiong
   self.onItemDeleted = function (args) {
   
      var id = args[0];
      console.log("onItemDeleted", id);   

      // get the item we need to delete
      var item = self.listData()[self.getIndexFromId(id)];
      var locallyTriggered = false;

      self.deleteListItem(item, locallyTriggered);
   }

})()