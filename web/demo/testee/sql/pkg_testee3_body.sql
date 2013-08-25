CREATE OR REPLACE PACKAGE BODY pkg_testee3
AS

   PROCEDURE raise_internal1 (val NUMBER)
   IS
      l_val    NUMBER;
   BEGIN
      l_val := 1 / val;
   END raise_internal1;

   PROCEDURE raise_internal2 (val NUMBER)
   IS
   BEGIN
      IF val = 0 THEN
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero', NULL);
      END IF;
   END raise_internal2;

   PROCEDURE raise_internal3 (val NUMBER)
   IS
   BEGIN
      IF val = 0 THEN
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero', 'arithmetic error: division by zero');
      END IF;
   END raise_internal3;

   PROCEDURE raise_internal4 (val NUMBER)
   IS
      l_error_details JSON_VALUE;
   BEGIN
      IF val = 0 THEN
         l_error_details := json_value(23);
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero', 'arithmetic error: division by zero', l_error_details);
      END IF;
   END raise_internal4;

   PROCEDURE raise_internal5 (val NUMBER)
   IS
      l_error_details JSON;
   BEGIN
      IF val = 0 THEN
         l_error_details := json();
         l_error_details.put('name', 'Joe Lennon');
         l_error_details.put('age', 24);
         l_error_details.put('awesome', true);
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero', 'arithmetic error: division by zero', l_error_details);
      END IF;
   END raise_internal5;

   PROCEDURE raise_internal6 (val NUMBER)
   IS
      l_error_details JSON_LIST;
   BEGIN
      IF val = 0 THEN
         l_error_details := json_list();
         FOR i IN 1..10
         LOOP
            l_error_details.append(i);
         END LOOP;
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero', 'arithmetic error: division by zero', l_error_details);
      END IF;
   END raise_internal6;

END;
/
