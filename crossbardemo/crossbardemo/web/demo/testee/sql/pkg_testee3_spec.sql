CREATE OR REPLACE PACKAGE pkg_testee3
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Exceptions.
    *
    * Cases: 3.6.*, 3.7.*
    */

   PROCEDURE raise_internal (x NUMBER);

   PROCEDURE raise_custom_u (x NUMBER);
   PROCEDURE raise_custom_ud (x NUMBER);
   PROCEDURE raise_custom_udd_s (x NUMBER);
   PROCEDURE raise_custom_udd_o (x NUMBER);
   PROCEDURE raise_custom_udd_a (x NUMBER);

   PROCEDURE raise_drop_custom_u (x NUMBER);
   PROCEDURE raise_drop_custom_ud (x NUMBER);
   PROCEDURE raise_drop_custom_udd_s (x NUMBER);
   PROCEDURE raise_drop_custom_udd_o (x NUMBER);
   PROCEDURE raise_drop_custom_udd_a (x NUMBER);

   PROCEDURE raise_echo (x NUMBER, uri VARCHAR2, descr VARCHAR2, details JSON_VALUE);
   PROCEDURE raise_drop_echo (x NUMBER, uri VARCHAR2, descr VARCHAR2, details JSON_VALUE);

END;
/
