BEGIN
   --
   -- Crossbar.io needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee4 TO ' || crossbar.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with Crossbar.io
   --
   crossbar.remove_exports('pkg_testee4');

   crossbar.export('pkg_testee4', 'initiate_dispatch',  'http://api.testsuite.wamp.ws/testee/control#dispatch');
END;
/
