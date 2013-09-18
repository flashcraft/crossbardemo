BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_testee4 TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_testee4');

   webmq.export('pkg_testee4', 'initiate_dispatch',  'http://api.testsuite.wamp.ws/testee/control#dispatch');
END;
/
