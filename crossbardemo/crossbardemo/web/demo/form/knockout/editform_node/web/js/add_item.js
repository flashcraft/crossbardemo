(function() {

   var self = vm;

   /**************************************
   *  Add an Item                        *
   ***************************************/

   // +
   // add a new, blank item
   self.addListItem = function() {
      // block the 'add item' button
      self.addButtonVisible(false);

      // create the item
      var itemData = {
         "orderNumber": "",
         "name": "",
         "weight": "",
         "size": "",
         "inStock": "",
         "itemState": "isNew",
         "price": ""
      };
      var item = new self.ListItem(itemData);

      // add to our model
      self.listData.push(item);
     
      // display in details view
      self.displayDetails(item);
   };

   // +
   // handle PubSub event for item creation
   self.onItemCreated = function (args, kwargs, details) {
      
      var itemData = kwargs;
      var item = new self.ListItem(itemData)
      self.listData.push(item);

      // highlight the newly created item
      item.itemState("hasBeenCreated");
      window.setTimeout(function() { item.itemState(''); }, 1000);
   }


})()