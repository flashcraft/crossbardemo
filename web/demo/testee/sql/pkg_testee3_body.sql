CREATE OR REPLACE PACKAGE BODY pkg_testee3
AS

   PROCEDURE raise_internal (x NUMBER)
   IS
      l_val    NUMBER;
   BEGIN
      l_val := 1 / x;
   END raise_internal;


   PROCEDURE do_raise_custom_u (x NUMBER, p_kill BOOLEAN)
   IS
   BEGIN
      IF x = 0 THEN
         crossbar.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     NULL,
                     p_kill_session => p_kill);
      END IF;
   END do_raise_custom_u;


   PROCEDURE do_raise_custom_ud (x NUMBER, p_kill BOOLEAN)
   IS
   BEGIN
      IF x = 0 THEN
         crossbar.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     p_kill_session => p_kill);
      END IF;
   END do_raise_custom_ud;


   PROCEDURE do_raise_custom_udd_s (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON_VALUE;
   BEGIN
      IF x = 0 THEN
         l_error_details := json_value(23);

         crossbar.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END do_raise_custom_udd_s;


   PROCEDURE do_raise_custom_udd_o (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON;
   BEGIN
      IF x = 0 THEN
         l_error_details := json();
         l_error_details.put('type', 'arithmetic');
         l_error_details.put('severity', 6);
         l_error_details.put('bad', true);

         crossbar.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END do_raise_custom_udd_o;


   PROCEDURE do_raise_custom_udd_a (x NUMBER, p_kill BOOLEAN)
   IS
      l_error_details JSON_LIST;
   BEGIN
      IF x = 0 THEN
         l_error_details := json_list();
         FOR i IN 1..10
         LOOP
            l_error_details.append(i);
         END LOOP;

         crossbar.raise(pkg_testee_common.URI_ERROR || 'DivisionByZero',
                     'Arithmetic error: division by zero',
                     l_error_details,
                     p_kill);
      END IF;
   END do_raise_custom_udd_a;


   PROCEDURE raise_custom_u (x NUMBER)
   IS
   BEGIN
      do_raise_custom_u(x, FALSE);
   END raise_custom_u;


   PROCEDURE raise_drop_custom_u (x NUMBER)
   IS
   BEGIN
      do_raise_custom_u(x, TRUE);
   END raise_drop_custom_u;


   PROCEDURE raise_custom_ud (x NUMBER)
   IS
   BEGIN
      do_raise_custom_ud(x, FALSE);
   END raise_custom_ud;


   PROCEDURE raise_drop_custom_ud (x NUMBER)
   IS
   BEGIN
      do_raise_custom_ud(x, TRUE);
   END raise_drop_custom_ud;


   PROCEDURE raise_custom_udd_s (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_s(x, FALSE);
   END raise_custom_udd_s;


   PROCEDURE raise_drop_custom_udd_s (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_s(x, TRUE);
   END raise_drop_custom_udd_s;


   PROCEDURE raise_custom_udd_o (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_o(x, FALSE);
   END raise_custom_udd_o;


   PROCEDURE raise_drop_custom_udd_o (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_o(x, TRUE);
   END raise_drop_custom_udd_o;


   PROCEDURE raise_custom_udd_a (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_a(x, FALSE);
   END raise_custom_udd_a;


   PROCEDURE raise_drop_custom_udd_a (x NUMBER)
   IS
   BEGIN
      do_raise_custom_udd_a(x, TRUE);
   END raise_drop_custom_udd_a;


   PROCEDURE do_raise_echo (x NUMBER, uri VARCHAR2, descr VARCHAR2, details JSON_VALUE, p_kill BOOLEAN)
   IS
   BEGIN
      IF x = 0 THEN
         crossbar.raise(uri, descr, details, p_kill);
      END IF;
   END do_raise_echo;


   PROCEDURE raise_echo (x NUMBER, uri VARCHAR2, descr VARCHAR2, details JSON_VALUE)
   IS
   BEGIN
      do_raise_echo(x, uri, descr, details, FALSE);
   END raise_echo;


   PROCEDURE raise_drop_echo (x NUMBER, uri VARCHAR2, descr VARCHAR2, details JSON_VALUE)
   IS
   BEGIN
      do_raise_echo(x, uri, descr, details, TRUE);
   END raise_drop_echo;

END;
/
