BEGIN
   --
   -- Crossbar.io needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee2 TO ' || crossbar.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with Crossbar.io
   --
   crossbar.remove_exports('pkg_testee2');

--   crossbar.export('pkg_testee2', 'echo_string1',  pkg_testee_common.URI_CASE || '1.1.1');
END;
/
