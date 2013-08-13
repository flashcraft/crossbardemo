/*********************************************************************
**
**   Copyright (c) 2012 Tavendo GmbH. All rights reserved.
**
 *********************************************************************/

CREATE OR REPLACE PACKAGE rpc1
AS
   FUNCTION add2 (x NUMBER, y NUMBER) RETURN NUMBER;
END;
/
 
CREATE OR REPLACE PACKAGE BODY rpc1
AS
   FUNCTION add2 (x NUMBER, y NUMBER) RETURN NUMBER
   AS
   BEGIN
      RETURN x + y;
   END add2;
END;
/
 
--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc1 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.export('rpc1', 'add2', 'http://tavendo.de/webmq/demo/sandbox#add2');
END;
/


CREATE OR REPLACE PACKAGE rpc2
AS
   FUNCTION now RETURN TIMESTAMP WITH TIME ZONE;
   
   FUNCTION get_date RETURN DATE;
   
   FUNCTION add_hours (ts TIMESTAMP, hours NUMBER) RETURN TIMESTAMP;
END;
/
 
CREATE OR REPLACE PACKAGE BODY rpc2
AS
   FUNCTION now RETURN TIMESTAMP WITH TIME ZONE
   AS
   BEGIN
      RETURN systimestamp AT TIME ZONE 'utc';
   END now;
   
   FUNCTION get_date RETURN DATE
   IS
   BEGIN
      RETURN sysdate;
   END get_date;
   
   FUNCTION add_hours (ts TIMESTAMP, hours NUMBER) RETURN TIMESTAMP
   IS
   BEGIN
      RETURN ts + numtodsinterval(hours, 'hour');
   END add_hours;
   
END;
/

--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc2 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc2');
   webmq.export('rpc2', 'now', 'http://tavendo.de/webmq/demo/sandbox#now');
   webmq.export('rpc2', 'get_date', 'http://tavendo.de/webmq/demo/sandbox#getdate');
   webmq.export('rpc2', 'add_hours', 'http://tavendo.de/webmq/demo/sandbox#addhours');
END;
/


CREATE OR REPLACE PACKAGE rpc3
AS
   FUNCTION get_tables (maxrows NUMBER) RETURN SYS_REFCURSOR;
END;
/

CREATE OR REPLACE PACKAGE BODY rpc3
AS
   FUNCTION get_tables (maxrows NUMBER) RETURN SYS_REFCURSOR
   AS
      l_res    SYS_REFCURSOR;
   BEGIN
      OPEN l_res FOR
         SELECT owner, tablespace_name, table_name
           FROM all_tables where rownum <= maxrows;
      RETURN l_res;
   END;
END;
/

--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc3 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc3');
   webmq.export('rpc3', 'get_tables', 'http://tavendo.de/webmq/demo/sandbox#getTables1');
END;
/


CREATE OR REPLACE PACKAGE rpc4
AS
   -- returns list of objects
   --
   FUNCTION get_tables_var1 (maxrows NUMBER) RETURN json_list;
   
   -- returns object of lists
   --
   FUNCTION get_tables_var2 (maxrows NUMBER) RETURN json;
END;
/
 
CREATE OR REPLACE PACKAGE BODY rpc4
AS
   FUNCTION get_tables_var1 (maxrows NUMBER) RETURN json_list
   AS
      l_params json := json();
      l_res    json_list;
   BEGIN
      l_params.put('maxrows', maxrows);

      l_res := json_dyn.executeList(
         'SELECT owner, tablespace_name, table_name FROM all_tables where rownum <= :maxrows',
         l_params);

      RETURN l_res;
   END;

   FUNCTION get_tables_var2 (maxrows NUMBER) RETURN json
   AS
      l_params json := json();
      l_res    json;
   BEGIN
      l_params.put('maxrows', maxrows);

      l_res := json_dyn.executeObject(
         'SELECT owner, tablespace_name, table_name FROM all_tables where rownum <= :maxrows',
         l_params);

      RETURN l_res;
   END;
END;
/
 
--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc4 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc4');
   webmq.export('rpc4', 'get_tables_var1', 'http://tavendo.de/webmq/demo/sandbox#getTables2');
   webmq.export('rpc4', 'get_tables_var2', 'http://tavendo.de/webmq/demo/sandbox#getTables3');
END;
/


CREATE OR REPLACE PACKAGE rpc5
AS
   FUNCTION get_tables_var1 (maxrows NUMBER) RETURN json_list;

   FUNCTION get_tables_var2 (maxrows NUMBER) RETURN json;
END;
/
 
CREATE OR REPLACE PACKAGE BODY rpc5
AS
   FUNCTION get_tables_var1 (maxrows NUMBER) RETURN json_list
   AS
      l_res    SYS_REFCURSOR;
   BEGIN
      OPEN l_res FOR
         SELECT owner, tablespace_name, table_name
           FROM all_tables where rownum <= maxrows;

      RETURN json_dyn.executeList(l_res);
   END;

   FUNCTION get_tables_var2 (maxrows NUMBER) RETURN json
   AS
      l_res    SYS_REFCURSOR;
   BEGIN
      OPEN l_res FOR
         SELECT owner, tablespace_name, table_name
           FROM all_tables where rownum <= maxrows;

      RETURN json_dyn.executeObject(l_res);
   END;
END;
/

--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc5 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc5');
   webmq.export('rpc5', 'get_tables_var1', 'http://tavendo.de/webmq/demo/sandbox#getTables4');
   webmq.export('rpc5', 'get_tables_var2', 'http://tavendo.de/webmq/demo/sandbox#getTables5');
END;
/


CREATE OR REPLACE PACKAGE rpc6
AS
   FUNCTION get_person (id NUMBER) RETURN JSON;
END;
/

CREATE OR REPLACE PACKAGE BODY rpc6
AS
   FUNCTION get_person (id NUMBER) RETURN JSON
   AS
      l_obj    JSON := json();
   BEGIN
      l_obj.put('name', 'Joe Lennon');
      l_obj.put('age', 24);
      l_obj.put('awesome', true);
      RETURN l_obj;
   END;
END;
/

--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc6 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc6');
   webmq.export('rpc6', 'get_person', 'http://tavendo.de/webmq/demo/sandbox#getPerson');
END;
/


CREATE OR REPLACE PACKAGE rpc7
AS
   FUNCTION store_person (p_obj JSON) RETURN VARCHAR2;
END;
/

CREATE OR REPLACE PACKAGE BODY rpc7
AS
   FUNCTION store_person (p_obj JSON) RETURN VARCHAR2
   AS
   BEGIN
      RETURN p_obj.get('forename').get_string || ' ' || p_obj.get('surname').get_string;
   END;
END;
/

--
-- WebMQ needs execute rights on package
--
BEGIN
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON rpc7 TO ' || webmq.REPOUSER;
END;
/

--
-- Register package procedure as RPC endpoint with WebMQ
--
BEGIN
   webmq.remove_exports('rpc7');
   webmq.export('rpc7', 'store_person', 'http://tavendo.de/webmq/demo/sandbox#storePerson');
END;
/
