CREATE OR REPLACE PACKAGE BODY pkg_testee2
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


   FUNCTION get_tables_var3 (maxrows NUMBER) RETURN json_list
   AS
      l_res    SYS_REFCURSOR;
   BEGIN
      OPEN l_res FOR
         SELECT owner, tablespace_name, table_name
           FROM all_tables where rownum <= maxrows;

      RETURN json_dyn.executeList(l_res);
   END;


   FUNCTION get_tables_var4 (maxrows NUMBER) RETURN json
   AS
      l_res    SYS_REFCURSOR;
   BEGIN
      OPEN l_res FOR
         SELECT owner, tablespace_name, table_name
           FROM all_tables where rownum <= maxrows;

      RETURN json_dyn.executeObject(l_res);
   END;


   FUNCTION get_person (id NUMBER) RETURN JSON
   AS
      l_obj    JSON := json();
   BEGIN
      l_obj.put('name', 'Joe Lennon');
      l_obj.put('age', 24);
      l_obj.put('awesome', true);
      RETURN l_obj;
   END;

   FUNCTION store_person (p_obj JSON) RETURN VARCHAR2
   AS
   BEGIN
      RETURN p_obj.get('forename').get_string || ' ' || p_obj.get('surname').get_string;
   END;

END;
/
