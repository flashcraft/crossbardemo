(function() {

   var self = vm;

   /**************************************
   *  Display & Switch details           *
   ***************************************/

   self.displayDetails = function(listItem, event) {

      self.switchWarning(false);

      // fill detailsEditable
      self.detailsIds.forEach(function(key) {

         var property = self.detailsEditable[key];

         property.displayedValue(listItem[key]());

         property.storedValue(listItem[key]());

         // reset updated state
         property.hasBeenUpdated(false);
      })

      // store for other checks
      self.detailsCurrent = listItem;
      
      // switch highlighting to displayed
      if (listItem.itemState() !== 'isNew') {
         listItem.itemState('isBeingDisplayed');
      }

      // if previously highlighted item !== current item, and not shown as being deleted, remove highlighting
      if (self.detailsPrevious && self.detailsPrevious.id() !== listItem.id() && self.detailsPrevious.itemState() !== "isBeingDeleted") {
         self.detailsPrevious.itemState('');
      }
      self.detailsPrevious = self.detailsCurrent;

      self.focusOnOrderNumber(true); // browser scrolls if focussed element not in view!

   };

   self.switchDetailsDisplayed = function(listItem, event) {

      // exclude clicks on an already displayed item
      if (self.detailsCurrent === listItem) {
         console.log("clicked on already selected item");
         return;
      }

      // special case: new item and no data entered yet
      // --> simply delete item
      if (self.detailsCurrent.itemState() === "isNew" && !self.detailsDirty() && listItem.itemState() !== "isNew") {

         // delete the new item, no notification sent
         self.listData.splice(-1, 1);
         self.displayDetails(listItem, event);

         self.addButtonVisible(true);
      }
      // no data changed: switch to new item
      else if (!self.detailsDirty()) {
         self.displayDetails(listItem, event);
      }
      // data changed, would we be lost on switch
      // --> display switch warning
      else {
         self.switchWarning(true);
      }
   };

})()