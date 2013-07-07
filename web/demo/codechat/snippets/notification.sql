-- publish from Oracle PL/SQL
BEGIN
   webmq.publish('http://tavendo.de/webmq/demo/notifications/778738',
                 'Hello from Oracle!!!');
END;
/
