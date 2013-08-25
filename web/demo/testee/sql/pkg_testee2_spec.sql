CREATE OR REPLACE PACKAGE pkg_testee2
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Scalar Types.
    */

   /**
    * RPC/Event URI prefix
    */
   BASEURI CONSTANT VARCHAR2(200) := 'http://testsuite.wamp.ws#';

   FUNCTION get_tables (maxrows NUMBER) RETURN SYS_REFCURSOR;

   -- returns list of objects
   --
   FUNCTION get_tables_var1 (maxrows NUMBER) RETURN json_list;
   
   -- returns object of lists
   --
   FUNCTION get_tables_var2 (maxrows NUMBER) RETURN json;


   FUNCTION get_tables_var3 (maxrows NUMBER) RETURN json_list;

   FUNCTION get_tables_var4 (maxrows NUMBER) RETURN json;

   FUNCTION get_person (id NUMBER) RETURN JSON;


   FUNCTION store_person (p_obj JSON) RETURN VARCHAR2;
END;
/
