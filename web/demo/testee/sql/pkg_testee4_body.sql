CREATE OR REPLACE PACKAGE BODY pkg_testee4
AS

   PROCEDURE initiate_dispatch (topic VARCHAR2, event JSON_VALUE, options JSON)
   IS
      l_exclude  webmq_sessionids := webmq_sessionids();
      l_eligible  webmq_sessionids := webmq_sessionids();
      l_cnt NUMBER;
      l_ids JSON_LIST;
   BEGIN
      IF topic = 'http://example.com/foobar' OR SUBSTR(topic, 1, 25) = 'http://example.com/simple' THEN

/*
         IF FALSE AND options.exist('exclude') THEN

            l_ids := json_list(options.get('exclude'));
            FOR i IN 1..l_ids.COUNT
            LOOP
               l_exclude.extend();
               l_exclude(i) := l_ids.get(i).get_string;
            END LOOP;

         ELSE

            IF options.exist('excludeMe') AND NOT options.get('excludeMe').get_bool THEN
               NULL;
            ELSE
*/            
               l_exclude.extend();
               l_exclude(1) := options.get('me').get_string;
               webmq.publish(topic, event, p_exclude => l_exclude);
/*               
            END IF;

         END IF;

         IF options.exist('eligible') THEN

            l_ids := json_list(options.get('eligible'));
            FOR i IN 1..l_ids.COUNT
            LOOP
               l_eligible.extend();
               l_eligible(i) := l_ids.get(i).get_string;
            END LOOP;

         END IF;

         webmq.publish(topic, event, p_exclude => l_exclude, p_eligible => l_eligible);
*/
      END IF;
   END initiate_dispatch;

END;
/
