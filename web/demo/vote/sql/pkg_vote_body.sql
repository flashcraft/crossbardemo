CREATE OR REPLACE PACKAGE BODY pkg_vote
AS

   FUNCTION get RETURN JSON_LIST
   AS
      l_res       SYS_REFCURSOR;
   BEGIN
      -- open cursor from query
      --
      OPEN l_res FOR
         SELECT subject AS "subject",
                votes   AS "votes"
           FROM votes ORDER BY subject;

      -- transform result set into JSON list of object
      --
      RETURN json_dyn.executeList(l_res);
   END get;


   FUNCTION vote (p_subject VARCHAR2) RETURN NUMBER
   IS
      l_votes     NUMBER;
      l_res       JSON := JSON();
   BEGIN
      -- check args
      --
      IF p_subject NOT IN ('Banana', 'Lemon', 'Chocolate') THEN
         -- raise custom exception, this gets transformed into
         -- a proper RPC error return
         --
         webmq.raise(BASEURI || 'invalid_argument',
                     'No subject "' || p_subject || '" to vote on.');
      END IF;

      -- update votes, returing new count
      --
      UPDATE votes SET votes = votes + 1
         WHERE subject = p_subject
            RETURNING votes INTO l_votes;
      COMMIT;

      -- create and publish PubSub event
      --
      l_res.put('subject', p_subject);
      l_res.put('votes', l_votes);
      webmq.publish(BASEURI || 'onvote', l_res);

      RETURN l_votes;
   END vote;


   PROCEDURE reset
   AS
   BEGIN
      -- reset all votes
      --
      UPDATE votes SET votes = 0;
      COMMIT;

      -- publish event with no payload
      --
      webmq.publish(BASEURI || 'onreset');
   END reset;

END;
/
