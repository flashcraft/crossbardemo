BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_codechat TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_codechat');
   webmq.export('pkg_codechat', 'post',     pkg_codechat.BASEURI || 'post');
   webmq.export('pkg_codechat', 'get',      pkg_codechat.BASEURI || 'get');
   webmq.export('pkg_codechat', 'channels', pkg_codechat.BASEURI || 'channels');
   webmq.export('pkg_codechat', 'purge',    pkg_codechat.BASEURI || 'purge');
END;
/
