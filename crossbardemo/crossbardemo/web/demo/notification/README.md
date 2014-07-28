# Notification Demo

Sending real-time notifications to clients.

## Frontend

All the HTML5 assets for the frontend reside in this folder. You can start the demo by opening the `index.html` in your browser.

## Backend

There is no backend for this demo. All messaging is mediated by Tavendo WebMQ, and clients use Publish & Subscribe to send and receive notifications.

You can however also trigger notifications from Oracle. Open the demo in your browser and then issue the following PL/SQL block from Oracle:

	BEGIN
	   webmq.publish('http://crossbar.io/crossbar/demo/notifications/368001', 'Hello from Oracle!!!');
	END;
	/

This assumes you have the demo running and listening on channel `368001`:


	http://<Your WebMQ hostname>/demo/notification/?channel=368001
