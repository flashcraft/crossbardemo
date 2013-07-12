-- publish a value to Gauge0
BEGIN
   webmq.publish('http://tavendo.de/webmq/demo/gauges#0', 60);
END;
/

-- publish random values to Gauges0-3
DECLARE
   l_val NUMBER;
BEGIN
   FOR i IN 0..3
   LOOP
      l_val := ROUND(DBMS_RANDOM.value(0, 100));
      webmq.publish('http://tavendo.de/webmq/demo/gauges#' || i, l_val);
   END LOOP;
END;
/

-- publish directly from a SQL query
SELECT
   webmq.publish('http://tavendo.de/webmq/demo/gauges#0', COUNT(*))
      FROM user_tables
/
