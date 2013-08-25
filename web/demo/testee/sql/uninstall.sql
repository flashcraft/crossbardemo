BEGIN
   BEGIN
      EXECUTE IMMEDIATE 'webmq.remove_exports(''pkg_testee3'')';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_testee3';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'webmq.remove_exports(''pkg_testee2'')';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_testee2';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'webmq.remove_exports(''pkg_testee1'')';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_testee1';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;


   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_testee_common';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP TABLE testee1';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;
END;
/
