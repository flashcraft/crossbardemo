CREATE OR REPLACE PACKAGE pkg_testee1
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Scalar Types.
    */

   FUNCTION echo_string1 (s VARCHAR2) RETURN VARCHAR2;

   FUNCTION echo_string2 (s NVARCHAR2) RETURN NVARCHAR2;

   FUNCTION echo_string3 (s CHAR) RETURN CHAR;

   FUNCTION echo_string4 (s NCHAR) RETURN NCHAR;


   FUNCTION concat_string1 (s1 VARCHAR2, s2 VARCHAR2) RETURN VARCHAR2;


   FUNCTION echo_number1 (n NUMBER) RETURN NUMBER;

   FUNCTION echo_number2 (n BINARY_FLOAT) RETURN BINARY_FLOAT;

   FUNCTION echo_number3 (n BINARY_DOUBLE) RETURN BINARY_DOUBLE;


   FUNCTION echo_bool1 (b BOOLEAN) RETURN BOOLEAN;


   FUNCTION echo_date1 (d DATE) RETURN DATE;


   FUNCTION get_date1 RETURN DATE;

   FUNCTION get_date2 RETURN TIMESTAMP;

   FUNCTION get_date3 RETURN TIMESTAMP WITH TIME ZONE;

   FUNCTION get_date4 RETURN TIMESTAMP WITH LOCAL TIME ZONE;


   FUNCTION add_date1 (ts TIMESTAMP, hours NUMBER) RETURN TIMESTAMP;


   FUNCTION add_number1 (x NUMBER, y NUMBER) RETURN NUMBER;

   FUNCTION add_number2 (x NUMBER, y NUMBER, z NUMBER) RETURN NUMBER;

END;
/
