CREATE OR REPLACE PACKAGE BODY pkg_testee1
AS
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


   FUNCTION add_number1 (x NUMBER, y NUMBER) RETURN NUMBER
   AS
   BEGIN
      RETURN x + y;
   END add_number1;

   FUNCTION add_number2 (x BINARY_FLOAT, y BINARY_FLOAT) RETURN BINARY_FLOAT
   AS
   BEGIN
      RETURN x + y;
   END add_number2;

   FUNCTION add_number3 (x BINARY_DOUBLE, y BINARY_DOUBLE) RETURN BINARY_DOUBLE
   AS
   BEGIN
      RETURN x + y;
   END add_number3;

   FUNCTION add_number4 (x JSON_VALUE, y JSON_VALUE) RETURN JSON_VALUE
   AS
   BEGIN
      RETURN JSON_VALUE(x.get_number() + y.get_number());
   END add_number4;


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


   FUNCTION len_string1 (s VARCHAR2) RETURN NUMBER
   AS
   BEGIN
      RETURN LENGTH(s);
   END len_string1;

   FUNCTION len_string2 (s NVARCHAR2) RETURN NUMBER
   AS
   BEGIN
      RETURN LENGTH(s);
   END len_string2;

   FUNCTION len_string3 (s CHAR) RETURN NUMBER
   AS
   BEGIN
      RETURN LENGTH(s);
   END len_string3;

   FUNCTION len_string4 (s NCHAR) RETURN NUMBER
   AS
   BEGIN
      RETURN LENGTH(s);
   END len_string4;


   FUNCTION reverse_string1 (s VARCHAR2) RETURN VARCHAR2
   AS
      res VARCHAR2(32767);
   BEGIN
      SELECT REVERSE(s) INTO res FROM dual;
      RETURN res;
   END reverse_string1;

   FUNCTION reverse_string2 (s NVARCHAR2) RETURN NVARCHAR2
   AS
      res NVARCHAR2(32767);
   BEGIN
      SELECT REVERSE(s) INTO res FROM dual;
      RETURN res;
   END reverse_string2;

   FUNCTION reverse_string3 (s CHAR) RETURN CHAR
   AS
      res CHAR(32767);
   BEGIN
      SELECT REVERSE(s) INTO res FROM dual;
      RETURN res;
   END reverse_string3;

   FUNCTION reverse_string4 (s NCHAR) RETURN NCHAR
   AS
      res NCHAR(32767);
   BEGIN
      SELECT REVERSE(s) INTO res FROM dual;
      RETURN res;
   END reverse_string4;


   FUNCTION concat_string1 (s1 VARCHAR2, s2 VARCHAR2) RETURN VARCHAR2
   IS
   BEGIN
      RETURN s1 || s2;
   END concat_string1;

   FUNCTION concat_string2 (s1 NVARCHAR2, s2 NVARCHAR2) RETURN NVARCHAR2
   IS
   BEGIN
      RETURN s1 || s2;
   END concat_string2;

   FUNCTION concat_string3 (s1 CHAR, s2 CHAR) RETURN CHAR
   IS
   BEGIN
      RETURN s1 || s2;
   END concat_string3;

   FUNCTION concat_string4 (s1 NCHAR, s2 NCHAR) RETURN NCHAR
   IS
   BEGIN
      RETURN s1 || s2;
   END concat_string4;


   FUNCTION echo_date1 (d DATE) RETURN DATE
   IS
   BEGIN
      RETURN d;
   END echo_date1;

   FUNCTION echo_date2 (d TIMESTAMP) RETURN TIMESTAMP
   IS
   BEGIN
      RETURN d;
   END echo_date2;

   FUNCTION echo_date3 (d TIMESTAMP WITH TIME ZONE) RETURN TIMESTAMP WITH TIME ZONE
   IS
   BEGIN
      RETURN d;
   END echo_date3;

   FUNCTION echo_date4 (d TIMESTAMP WITH LOCAL TIME ZONE) RETURN TIMESTAMP WITH LOCAL TIME ZONE
   IS
   BEGIN
      RETURN d;
   END echo_date4;


   FUNCTION echo_bool1 (b BOOLEAN) RETURN BOOLEAN
   IS
   BEGIN
      RETURN b;
   END echo_bool1;

   FUNCTION echo_bool2 (b NUMBER) RETURN NUMBER
   IS
   BEGIN
      IF b = 0 THEN
         RETURN 0;
      ELSE
         RETURN 1;
      END IF;
   END echo_bool2;


   FUNCTION xor_bool1 (b1 BOOLEAN, b2 BOOLEAN) RETURN BOOLEAN
   IS
   BEGIN
      RETURN XOR(b1, b2);
   END xor_bool1;

   FUNCTION xor_bool2 (b1 NUMBER, b2 NUMBER) RETURN NUMBER
   IS
   BEGIN
      IF (b1 = 0 AND b2 = 0) OR (b1 != 0 AND b2 != 0) THEN
         RETURN 0;
      ELSE
         RETURN 1;
      END IF;
   END xor_bool2;



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


   FUNCTION add_date1 (ts DATE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN DATE
   IS
   BEGIN
      RETURN ts + numtodsinterval(days, 'day')
                + numtodsinterval(hours, 'hour')
                + numtodsinterval(minutes, 'minute')
                + numtodsinterval(seconds, 'second');
   END add_date1;

   FUNCTION add_date2 (ts TIMESTAMP, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP
   IS
   BEGIN
      RETURN ts + numtodsinterval(days, 'day')
                + numtodsinterval(hours, 'hour')
                + numtodsinterval(minutes, 'minute')
                + numtodsinterval(seconds, 'second');
   END add_date2;

   FUNCTION add_date3 (ts TIMESTAMP WITH TIME ZONE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP WITH TIME ZONE
   IS
   BEGIN
      RETURN ts + numtodsinterval(days, 'day')
                + numtodsinterval(hours, 'hour')
                + numtodsinterval(minutes, 'minute')
                + numtodsinterval(seconds, 'second');
   END add_date3;

   FUNCTION add_date4 (ts TIMESTAMP WITH LOCAL TIME ZONE, days NUMBER, hours NUMBER, minutes NUMBER, seconds NUMBER) RETURN TIMESTAMP WITH LOCAL TIME ZONE
   IS
   BEGIN
      RETURN ts + numtodsinterval(days, 'day')
                + numtodsinterval(hours, 'hour')
                + numtodsinterval(minutes, 'minute')
                + numtodsinterval(seconds, 'second');
   END add_date4;

END;
/
