CREATE OR REPLACE PACKAGE BODY pkg_testee3
AS

   PROCEDURE raise_internal1 (x NUMBER)
   IS
      l_val    NUMBER;
   BEGIN
      l_val := 1 / x;
   END raise_internal1;

   PROCEDURE internal2 (x NUMBER, p_kill BOOLEAN)
   IS
   BEGIN
      IF x = 0 THEN
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     NULL,
                     p_kill_session => p_kill);
      END IF;
   END internal2;

   PROCEDURE internal3 (x NUMBER, p_kill BOOLEAN)
   IS
   BEGIN
      IF x = 0 THEN
         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     p_kill_session => p_kill);
      END IF;
   END internal3;

   PROCEDURE internal4 (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON_VALUE;
   BEGIN
      IF x = 0 THEN
         l_error_details := json_value(23);

         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END internal4;

   PROCEDURE internal5 (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON;
   BEGIN
      IF x = 0 THEN
         l_error_details := json();
         l_error_details.put('name', 'Joe Lennon');
         l_error_details.put('age', 24);
         l_error_details.put('awesome', true);

         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END internal5;

   PROCEDURE internal6 (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON_LIST;
   BEGIN
      IF x = 0 THEN
         l_error_details := json_list();
         FOR i IN 1..10
         LOOP
            l_error_details.append(i);
         END LOOP;

         webmq.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END internal6;



   PROCEDURE raise_internal2 (x NUMBER)
   IS
   BEGIN
      internal2(x, FALSE);
   END;

   PROCEDURE raise_internal2drop (x NUMBER)
   IS
   BEGIN
      internal2(x, TRUE);
   END;

   PROCEDURE raise_internal3 (x NUMBER)
   IS
   BEGIN
      internal3(x, FALSE);
   END;

   PROCEDURE raise_internal3drop (x NUMBER)
   IS
   BEGIN
      internal3(x, TRUE);
   END;

   PROCEDURE raise_internal4 (x NUMBER)
   IS
   BEGIN
      internal4(x, FALSE);
   END;

   PROCEDURE raise_internal4drop (x NUMBER)
   IS
   BEGIN
      internal4(x, TRUE);
   END;

   PROCEDURE raise_internal5 (x NUMBER)
   IS
   BEGIN
      internal5(x, FALSE);
   END;

   PROCEDURE raise_internal5drop (x NUMBER)
   IS
   BEGIN
      internal5(x, TRUE);
   END;

   PROCEDURE raise_internal6 (x NUMBER)
   IS
   BEGIN
      internal6(x, FALSE);
   END;

   PROCEDURE raise_internal6drop (x NUMBER)
   IS
   BEGIN
      internal6(x, TRUE);
   END;

END;
/
