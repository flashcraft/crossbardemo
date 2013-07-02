BEGIN
   --
   -- WebMQ needs execute rights on package
   --
   EXECUTE IMMEDIATE 'GRANT EXECUTE ON pkg_vote TO ' || webmq.REPOUSER;

   --
   -- Register package procedures as RPC endpoints with WebMQ
   --
   webmq.remove_exports('pkg_vote');
   webmq.export('pkg_vote', 'vote',  pkg_vote.BASEURI || 'vote');
   webmq.export('pkg_vote', 'get',   pkg_vote.BASEURI || 'get');
   webmq.export('pkg_vote', 'reset', pkg_vote.BASEURI || 'reset');
END;
/
