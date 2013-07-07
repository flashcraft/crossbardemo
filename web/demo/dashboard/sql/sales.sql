/*
Insert random record into sales table
*/

DROP TABLE test.sales
#

CREATE TABLE test.sales (
    trans_dt TIMESTAMP NOT NULL,
    product VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    units INTEGER NOT NULL,
    price DECIMAL NOT NULL
)
#

CREATE INDEX test.idx1_sales ON test.sales (trans_dt)
#


DROP PROCEDURE test.onsale_byproduct
#

CREATE PROCEDURE test.onsale_byproduct (IN p_period DECIMAL)
LANGUAGE SQLSCRIPT
AS
   l_units_by_product   VARCHAR(5000);
   l_asp_by_product     VARCHAR(5000);
   l_revenue_by_product VARCHAR(5000);

   l_now TIMESTAMP;
   l_cnt INTEGER;

   CURSOR c_cursor1 (v_current_u TIMESTAMP,
                     v_current_l TIMESTAMP,
                     v_last_u TIMESTAMP,
                     v_last_l TIMESTAMP) FOR
      SELECT
         COALESCE(c.product, l.product) product,
         COALESCE(c.units, 0) c_units,
         COALESCE(l.units, 0) l_units,
         COALESCE(c.revenue, 0) c_revenue,
         COALESCE(l.revenue, 0) l_revenue,
         COALESCE(c.asp, 0) c_asp,
         COALESCE(l.asp, 0) l_asp FROM
      (
         SELECT
            product,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_current_u AND trans_dt > :v_current_l
         GROUP BY
            product
     ) c FULL OUTER JOIN
     (
         SELECT
            product,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_last_u AND trans_dt > :v_last_l
         GROUP BY
            product
     ) l ON c.product = l.product
   ;
BEGIN
   l_now := NOW();
   l_cnt := 0;

   FOR row1 AS c_cursor1(l_now,
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -2*p_period))
   DO
      IF l_cnt = 0 THEN
         l_units_by_product := '{';
         l_asp_by_product := '{';
         l_revenue_by_product := '{';
      ELSE
         l_units_by_product := l_units_by_product || ',';
         l_asp_by_product := l_asp_by_product || ',';
         l_revenue_by_product := l_revenue_by_product || ',';
      END IF;
      l_cnt := l_cnt + 1;

      l_units_by_product := l_units_by_product || '"' ||
                               row1.product || '":[' ||
                               row1.c_units || ',' ||
                               row1.l_units || ']';

      l_asp_by_product := l_asp_by_product || '"' ||
                             row1.product || '":[' ||
                             row1.c_asp || ',' ||
                             row1.l_asp || ']';

      l_revenue_by_product := l_revenue_by_product || '"' ||
                                 row1.product || '":[' ||
                                 row1.c_revenue || ',' ||
                                 row1.l_revenue || ']';
   END FOR;

   l_units_by_product := l_units_by_product || '}';
   l_asp_by_product := l_asp_by_product || '}';
   l_revenue_by_product := l_revenue_by_product || '}';

   CALL webmq.push('http://example.com/sales#units-by-product',
                      l_units_by_product, 2);

   CALL webmq.push('http://example.com/sales#asp-by-product',
                      l_asp_by_product, 2);

   CALL webmq.push('http://example.com/sales#revenue-by-product',
                      l_revenue_by_product, 2);
END;
#


DROP PROCEDURE test.onsale_byregion
#

CREATE PROCEDURE test.onsale_byregion (IN p_period DECIMAL)
LANGUAGE SQLSCRIPT
AS
   l_units_by_region   VARCHAR(5000);
   l_asp_by_region     VARCHAR(5000);
   l_revenue_by_region VARCHAR(5000);

   l_now TIMESTAMP;
   l_cnt INTEGER;

   CURSOR c_cursor1 (v_current_u TIMESTAMP,
                     v_current_l TIMESTAMP,
                     v_last_u TIMESTAMP,
                     v_last_l TIMESTAMP) FOR
      SELECT
         COALESCE(c.region, l.region) region,
         COALESCE(c.units, 0) c_units,
         COALESCE(l.units, 0) l_units,
         COALESCE(c.revenue, 0) c_revenue,
         COALESCE(l.revenue, 0) l_revenue,
         COALESCE(c.asp, 0) c_asp,
         COALESCE(l.asp, 0) l_asp FROM
      (
         SELECT
            region,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_current_u AND trans_dt > :v_current_l
         GROUP BY
            region
     ) c FULL OUTER JOIN
     (
         SELECT
            region,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_last_u AND trans_dt > :v_last_l
         GROUP BY
            region
     ) l ON c.region = l.region
   ;
BEGIN
   l_now := NOW();
   l_cnt := 0;

   FOR row1 AS c_cursor1(l_now,
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -2*p_period))
   DO
      IF l_cnt = 0 THEN
         l_units_by_region := '{';
         l_asp_by_region := '{';
         l_revenue_by_region := '{';
      ELSE
         l_units_by_region := l_units_by_region || ',';
         l_asp_by_region := l_asp_by_region || ',';
         l_revenue_by_region := l_revenue_by_region || ',';
      END IF;
      l_cnt := l_cnt + 1;

      l_units_by_region := l_units_by_region || '"' ||
                               row1.region || '":[' ||
                               row1.c_units || ',' ||
                               row1.l_units || ']';

      l_asp_by_region := l_asp_by_region || '"' ||
                             row1.region || '":[' ||
                             row1.c_asp || ',' ||
                             row1.l_asp || ']';

      l_revenue_by_region := l_revenue_by_region || '"' ||
                                 row1.region || '":[' ||
                                 row1.c_revenue || ',' ||
                                 row1.l_revenue || ']';
   END FOR;

   l_units_by_region := l_units_by_region || '}';
   l_asp_by_region := l_asp_by_region || '}';
   l_revenue_by_region := l_revenue_by_region || '}';

   CALL webmq.push('http://example.com/sales#units-by-region',
                      l_units_by_region, 2);

   CALL webmq.push('http://example.com/sales#asp-by-region',
                      l_asp_by_region, 2);

   CALL webmq.push('http://example.com/sales#revenue-by-region',
                      l_revenue_by_region, 2);
END;
#


DROP PROCEDURE test.onsale_total
#

CREATE PROCEDURE test.onsale_total (IN p_period DECIMAL)
LANGUAGE SQLSCRIPT
AS
   l_units_total   VARCHAR(5000);
   l_asp_total     VARCHAR(5000);
   l_revenue_total VARCHAR(5000);

   l_now TIMESTAMP;
   l_cnt INTEGER;

   CURSOR c_cursor1 (v_current_u TIMESTAMP,
                     v_current_l TIMESTAMP,
                     v_last_u TIMESTAMP,
                     v_last_l TIMESTAMP) FOR
      SELECT
         COALESCE(c.dim, l.dim) dim,
         COALESCE(c.units, 0) c_units,
         COALESCE(l.units, 0) l_units,
         COALESCE(c.revenue, 0) c_revenue,
         COALESCE(l.revenue, 0) l_revenue,
         COALESCE(c.asp, 0) c_asp,
         COALESCE(l.asp, 0) l_asp FROM
      (
         SELECT
            'total' dim,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_current_u AND trans_dt > :v_current_l
     ) c FULL OUTER JOIN
     (
         SELECT
            'total' dim,
            SUM(units) units,
            ROUND(SUM(units * price), 0) revenue,
            ROUND(SUM(units * price) / SUM(units), 2) asp
         FROM
            test.sales
         WHERE
            trans_dt <= :v_last_u AND trans_dt > :v_last_l
     ) l ON c.dim = l.dim
   ;
BEGIN
   l_now := NOW();
   l_cnt := 0;

   FOR row1 AS c_cursor1(l_now,
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -p_period),
                         ADD_SECONDS(l_now, -2*p_period))
   DO
      IF l_cnt = 0 THEN
         l_units_total := '';
         l_asp_total := '';
         l_revenue_total := '';
      ELSE
         l_units_total := l_units_total || ',';
         l_asp_total := l_asp_total || ',';
         l_revenue_total := l_revenue_total || ',';
      END IF;
      l_cnt := l_cnt + 1;

      l_units_total := l_units_total || '[' ||
                               row1.c_units || ',' ||
                               row1.l_units || ']';

      l_asp_total := l_asp_total || '[' ||
                             row1.c_asp || ',' ||
                             row1.l_asp || ']';

      l_revenue_total := l_revenue_total || '[' ||
                                 row1.c_revenue || ',' ||
                                 row1.l_revenue || ']';
   END FOR;

   CALL webmq.push('http://example.com/sales#units',
                      l_units_total, 2);

   CALL webmq.push('http://example.com/sales#asp',
                      l_asp_total, 2);

   CALL webmq.push('http://example.com/sales#revenue',
                      l_revenue_total, 2);
END;
#


DROP PROCEDURE test.onsale
#

CREATE PROCEDURE test.onsale
LANGUAGE SQLSCRIPT
AS
   CURSOR c_cursor1 FOR
      SELECT product, region, units, ROUND(units * price, 2) revenue FROM test.sales
      ORDER BY trans_dt DESC LIMIT 1;
BEGIN
   FOR row1 AS c_cursor1
   DO
      CALL webmq.push('http://example.com/sales#sale',
                      '{' ||
                      '"product": "' || row1.product || '",' ||
                      '"region": "' || row1.region || '",' ||
                      '"units": ' || row1.units || ',' ||
                      '"revenue": ' || row1.revenue ||
                      '}', 2);
   END FOR;
END;
#


CREATE TRIGGER test.trg_onsale
AFTER INSERT ON test.sales
BEGIN
   CALL test.onsale;
   CALL test.onsale_total(60);
   CALL test.onsale_byproduct(60);
   CALL test.onsale_byregion(60);
END;
#


DROP PROCEDURE test.echo
#

CREATE PROCEDURE test.echo (IN msg VARCHAR(5000))
AS
BEGIN
   SELECT msg FROM dummy;
END;
#

DROP PROCEDURE test.add2
#

CREATE PROCEDURE test.add2 (IN x INTEGER, IN y INTEGER)
LANGUAGE SQLSCRIPT
AS
BEGIN
   SELECT x + y FROM dummy;
END
#

CREATE TABLE test.launchpadstate (INTEGER x NOT NULL, INTEGER y NOT NULL, INTEGER r NOT NULL, INTEGER g NOT NULL)
#

CREATE INDEX test.launchpadstate_idx1 ON test.launchpadstate (x, y)
#

DROP PROCEDURE test.launchpad_reset
#

CREATE PROCEDURE test.launchpad_reset
LANGUAGE SQLSCRIPT
AS
BEGIN
   DELETE FROM test.launchpadstate;
   FOR x IN 0..8 DO
      FOR y IN 0..8 DO
         INSERT INTO test.launchpadstate (x, y, r, g) VALUES (x, y, 0, 0);
      END LOOP;
   END FOR;
   CALL webmq.push('http://autobahn.tavendo.de/public/demo/launchpad#reset', NULL, 2);
END
#

CALL test.launchpad_reset;
#

CREATE PROCEDURE test.launchpad_getstate
LANGUAGE SQLSCRIPT
AS
BEGIN
   SELECT x, y, r, g FROM test.launchpadstate ORDER BY x, y;
END
#

CREATE PROCEDURE test.launchpad_set (IN x INTEGER, IN y INTEGER, IN r INTEGER, IN g INTEGER)
LANGUAGE SQLSCRIPT
AS
   l_result VARCHAR(5000) := NULL;
BEGIN
   IF x >= 0 AND x < 9 AND y >= 0 AND y < 9 AND r >= 0 AND r < 4 AND g >= 0 AND g < 4 THEN
      UPDATE test.launchpadstate t SET t.r = r, t.g = g WHERE t.x = x AND t.y = y;
      l_result := '{"x":' || x || ',"y":' || y || ',"r":' || r || ',"g":' || g || '}';
      CALL webmq.push('http://autobahn.tavendo.de/public/demo/launchpad#light', l_result, 2);
   END IF;
   SELECT l_result FROM dummy;
END
#

DROP PROCEDURE test.onlaunchpad
#

CREATE PROCEDURE test.onlaunchpad (IN x INTEGER, IN y INTEGER, IN v INTEGER, IN t INTEGER)
LANGUAGE SQLSCRIPT
AS
  l_result VARCHAR(5000) := NULL;
BEGIN
   IF v = 1 THEN
      l_result := '{"x":' || x || ',"y":' || y || ',"r":3,"g":3}';
   ELSEIF v = 0 THEN
      l_result := '{"x":' || x || ',"y":' || y || ',"r":0,"g":0}';
   END IF;
   IF l_result IS NOT NULL THEN
      CALL webmq.push('http://autobahn.tavendo.de/public/demo/launchpad#light', l_result, 2);
   END IF;
   IF y = 7 AND x = 8 THEN
      CALL webmq.push('http://autobahn.tavendo.de/public/demo/dashboard#switch-dashboard', 0, 2);
   END IF;
   IF y = 6 AND x = 8 THEN
      CALL webmq.push('http://autobahn.tavendo.de/public/demo/dashboard#switch-dashboard', 1, 2);
   END IF;
   IF y = 5 AND x = 8 THEN
      CALL webmq.push('http://autobahn.tavendo.de/public/demo/dashboard#switch-dashboard', 2, 2);
   END IF;
   SELECT l_result FROM dummy;
END
#



DROP PROCEDURE test.onlaunchpad
#

CREATE PROCEDURE test.onlaunchpad (IN x INTEGER, IN y INTEGER, IN v INTEGER, IN t INTEGER)
LANGUAGE SQLSCRIPT
AS
  l_result VARCHAR(5000) := NULL;
  CURSOR c_cursor1 (v_skipy INTEGER) FOR
     SELECT x, y, r, g FROM test.launchpadstate WHERE x = 8 AND y != :v_skipy;
BEGIN
   IF x == 8 THEN
      IF v == 1 AND y >= 0 AND y < 9 THEN
         FOR row1 AS c_cursor1(y) DO
	        IF row1.r > 0 OR row1.g > 0 THEN
	           CALL test.launchpad_set(row1.x, row1.y, 0, 0);
	        END IF;
	     END FOR;
         CALL test.launchpad_set(x, y, 0, 3);
      END IF;
   ELSE
	   IF v = 1 THEN
	      CALL test.launchpad_set(x, y, 3, 3);
	   ELSEIF v = 0 THEN
          CALL test.launchpad_set(x, y, 0, 0);
	   END IF;
   END IF;
   SELECT l_result FROM dummy;
END
#
