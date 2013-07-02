BEGIN
   BEGIN
      EXECUTE IMMEDIATE 'webmq.remove_exports(''pkg_vote'')';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP PACKAGE pkg_vote';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;

   BEGIN
      EXECUTE IMMEDIATE 'DROP TABLE votes';
   EXCEPTION
      WHEN OTHERS THEN
         NULL;
   END;
END;
/
