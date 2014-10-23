(function() {

   var self = vm;


   /**************************************
   *  Fill the list                      *
   ***************************************/

   // +
   // fill items list after initial connect or reconnect
   self.fillList = function (res) {
      console.log("fillList", res);

      // clear list since this is also called after reconnect
      self.listData([]);

      // result list may be empty
      if(res === null || res.length === 0) {
         // needs some proper error handling
         return;
      }

      // fill grid with records
      res.forEach(function (itemData) {
         self.listData.push(new self.ListItem(itemData));
      })

      // set focus & display details for first list element
      self.displayDetails(vm.listData()[0]);
   }

   self.ListItem = function (data) {
      return {
         orderNumber: ko.observable(data.orderNumber),
         name: ko.observable(data.name),
         price: ko.observable(data.price),
         weight: ko.observable(data.weight),
         size: ko.observable(data.size),
         inStock: ko.observable(data.inStock),
         id: ko.observable(data.id),
         itemState: ko.observable(data.itemState || undefined)
      };
   }


})()