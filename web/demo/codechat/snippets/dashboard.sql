-- generate fake sales event from PL/SQL
DECLARE
   l_event JSON := JSON();
   l_now TIMESTAMP := SYSTIMESTAMP AT TIME ZONE 'utc';
BEGIN
   l_event.put('id', 0);
   l_event.put('trans_dt', TO_CHAR(l_now, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
   l_event.put('product', 'Product A');
   l_event.put('region', 'West');
   l_event.put('units', 11);
   l_event.put('price', 8.99);
   webmq.publish('http://tavendo.de/webmq/demo/dashboard#onsale', l_event);
END;
/

-- direct insert into sales table, triggering publication of event
INSERT INTO sales
   (id, trans_dt, product, region, units, price) VALUES
      (sales_id.nextval,
       SYSTIMESTAMP AT TIME ZONE 'utc',
       'Product A',
       'West',
       11,
       8.99);
COMMIT;
/
