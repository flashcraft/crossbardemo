CREATE OR REPLACE PACKAGE pkg_testee1
AS
   /**
    * Copyright (c) 2013 Tavendo GmbH. Licensed under the Apache 2.0 license.
    *
    * Testee package for use with AutobahnTestsuite: Scalar Types.
    *
    * Cases: 3.1.*, 3.2.*, 3.3.*, 3.4.*
    */

   --
   -- 3.1 Argument and return types (Number)
   --
   FUNCTION echo_number1 (n NUMBER) RETURN NUMBER;

   FUNCTION echo_number2 (n BINARY_FLOAT) RETURN BINARY_FLOAT;

   FUNCTION echo_number3 (n BINARY_DOUBLE) RETURN BINARY_DOUBLE;

   FUNCTION echo_number4 (n JSON_VALUE) RETURN JSON_VALUE;


   FUNCTION add_number1 (x NUMBER, y NUMBER) RETURN NUMBER;

   FUNCTION add_number2 (x BINARY_FLOAT, y BINARY_FLOAT) RETURN BINARY_FLOAT;

   FUNCTION add_number3 (x BINARY_DOUBLE, y BINARY_DOUBLE) RETURN BINARY_DOUBLE;

   FUNCTION add_number4 (x JSON_VALUE, y JSON_VALUE) RETURN JSON_VALUE;


   --
   -- 3.2 Argument and return types (String)
   --
   FUNCTION echo_string1 (s VARCHAR2) RETURN VARCHAR2;

   FUNCTION echo_string2 (s NVARCHAR2) RETURN NVARCHAR2;

   FUNCTION echo_string3 (s CHAR) RETURN CHAR;

   FUNCTION echo_string4 (s NCHAR) RETURN NCHAR;


   FUNCTION len_string1 (s VARCHAR2) RETURN NUMBER;

   FUNCTION len_string2 (s NVARCHAR2) RETURN NUMBER;

   FUNCTION len_string3 (s CHAR) RETURN NUMBER;

   FUNCTION len_string4 (s NCHAR) RETURN NUMBER;


   FUNCTION reverse_string1 (s VARCHAR2) RETURN VARCHAR2;

   FUNCTION reverse_string2 (s NVARCHAR2) RETURN NVARCHAR2;

   FUNCTION reverse_string3 (s CHAR) RETURN CHAR;

   FUNCTION reverse_string4 (s NCHAR) RETURN NCHAR;


   FUNCTION concat_string1 (s1 VARCHAR2, s2 VARCHAR2) RETURN VARCHAR2;

   FUNCTION concat_string2 (s1 NVARCHAR2, s2 NVARCHAR2) RETURN NVARCHAR2;

   FUNCTION concat_string3 (s1 CHAR, s2 CHAR) RETURN CHAR;

   FUNCTION concat_string4 (s1 NCHAR, s2 NCHAR) RETURN NCHAR;


   --
   -- 3.3 Argument and return types (Datetime)
   --
   FUNCTION echo_date1 (d DATE) RETURN DATE;

   FUNCTION echo_date2 (d TIMESTAMP) RETURN TIMESTAMP;

   FUNCTION echo_date3 (d TIMESTAMP WITH TIME ZONE) RETURN TIMESTAMP WITH TIME ZONE;

   FUNCTION echo_date4 (d TIMESTAMP WITH LOCAL TIME ZONE) RETURN TIMESTAMP WITH LOCAL TIME ZONE;


   FUNCTION get_date1 RETURN DATE;

   FUNCTION get_date2 RETURN TIMESTAMP;

   FUNCTION get_date3 RETURN TIMESTAMP WITH TIME ZONE;

   FUNCTION get_date4 RETURN TIMESTAMP WITH LOCAL TIME ZONE;


   FUNCTION add_date1 (ts DATE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN DATE;

   FUNCTION add_date2 (ts TIMESTAMP, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP;

   FUNCTION add_date3 (ts TIMESTAMP WITH TIME ZONE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP WITH TIME ZONE;

   FUNCTION add_date4 (ts TIMESTAMP WITH LOCAL TIME ZONE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP WITH LOCAL TIME ZONE;


   --
   -- 3.4 Argument and return types (Boolean)
   --
   FUNCTION echo_bool1 (b BOOLEAN) RETURN BOOLEAN;

   FUNCTION echo_bool2 (b NUMBER) RETURN NUMBER;


   FUNCTION xor_bool1 (b1 BOOLEAN, b2 BOOLEAN) RETURN BOOLEAN;

   FUNCTION xor_bool2 (b1 NUMBER, b2 NUMBER) RETURN NUMBER;

END;
/
