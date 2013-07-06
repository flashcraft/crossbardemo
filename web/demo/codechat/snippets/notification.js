// send a notification 
session.publish('http://tavendo.de/webmq/demo/notifications/123456',
                'Sent from CodeChat!');

// subscribe to notifications
session.subscribe('http://tavendo.de/webmq/demo/notifications/123456',
   function(topic, event) {
      console.log('received notification', event);
});
