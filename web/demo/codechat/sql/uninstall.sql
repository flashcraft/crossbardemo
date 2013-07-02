BEGIN
   BEGIN
      EXECUTE IMMEDIATE 'webmq.remove_exports(''pkg_codechat'')';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_codechat';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP TABLE codechat';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;
END;
/
