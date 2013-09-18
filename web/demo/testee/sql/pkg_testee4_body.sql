CREATE OR REPLACE PACKAGE BODY pkg_testee4
AS

   PROCEDURE initiate_dispatch (topic VARCHAR2, event JSON_VALUE, options JSON)
   IS
   BEGIN
      IF topic = 'http://example.com/foobar' OR SUBSTR(topic, 1, 25) = 'http://example.com/simple' THEN
         webmq.publish(topic, event);
         null;
      END IF;
   END initiate_dispatch;

END;
/
