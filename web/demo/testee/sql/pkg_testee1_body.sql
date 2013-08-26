CREATE OR REPLACE PACKAGE BODY pkg_testee1
AS

   FUNCTION echo_string1 (s VARCHAR2) RETURN VARCHAR2
   AS
   BEGIN
      RETURN s;
   END echo_string1;

   FUNCTION echo_string2 (s NVARCHAR2) RETURN NVARCHAR2
   AS
   BEGIN
      RETURN s;
   END echo_string2;

   FUNCTION echo_string3 (s CHAR) RETURN CHAR
   AS
   BEGIN
      RETURN s;
   END echo_string3;

   FUNCTION echo_string4 (s NCHAR) RETURN NCHAR
   AS
   BEGIN
      RETURN s;
   END echo_string4;

   FUNCTION concat_string1 (s1 VARCHAR2, s2 VARCHAR2) RETURN VARCHAR2
   IS
   BEGIN
      RETURN s1 || s2;
   END concat_string1;


   FUNCTION echo_number1 (n NUMBER) RETURN NUMBER
   AS
   BEGIN
      RETURN n;
   END echo_number1;

   FUNCTION echo_number2 (n BINARY_FLOAT) RETURN BINARY_FLOAT
   AS
   BEGIN
      RETURN n;
   END echo_number2;

   FUNCTION echo_number3 (n BINARY_DOUBLE) RETURN BINARY_DOUBLE
   AS
   BEGIN
      RETURN n;
   END echo_number3;

   FUNCTION echo_number4 (n JSON_VALUE) RETURN JSON_VALUE
   IS
   BEGIN
      RETURN n;
   END echo_number4;

   FUNCTION echo_bool1 (b BOOLEAN) RETURN BOOLEAN
   IS
   BEGIN
      RETURN b;
   END echo_bool1;


   FUNCTION echo_date1 (d DATE) RETURN DATE
   IS
   BEGIN
      RETURN d;
   END echo_date1;


   FUNCTION get_date1 RETURN DATE
   IS
   BEGIN
      RETURN sysdate;
   END get_date1;

   FUNCTION get_date2 RETURN TIMESTAMP
   IS
   BEGIN
      RETURN systimestamp AT TIME ZONE 'utc';
   END get_date2;

   FUNCTION get_date3 RETURN TIMESTAMP WITH TIME ZONE
   IS
   BEGIN
      RETURN systimestamp AT TIME ZONE 'utc';
   END get_date3;

   FUNCTION get_date4 RETURN TIMESTAMP WITH LOCAL TIME ZONE
   IS
   BEGIN
      RETURN systimestamp AT TIME ZONE 'utc';
   END get_date4;


   FUNCTION add_date1 (ts TIMESTAMP, hours NUMBER) RETURN TIMESTAMP
   IS
   BEGIN
      RETURN ts + numtodsinterval(hours, 'hour');
   END add_date1;


   FUNCTION add_number1 (x NUMBER, y NUMBER) RETURN NUMBER
   AS
   BEGIN
      RETURN x + y;
   END add_number1;

   FUNCTION add_number2 (x NUMBER, y NUMBER, z NUMBER) RETURN NUMBER
   AS
   BEGIN
      RETURN x + y + z;
   END add_number2;

END;
/
