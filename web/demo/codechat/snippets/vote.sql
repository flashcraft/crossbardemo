-- vote on "Lemon" and print total votes on that
DECLARE
   l_num NUMBER;
BEGIN
   l_num := pkg_vote.vote('Lemon');
   DBMS_OUTPUT.put_line('Total votes on Lemon: ' || l_num);
END;
/

-- get current votes
DECLARE
   l_res JSON_LIST;
BEGIN
   l_res := pkg_vote.get();
   json_list.print(l_res);
END;
/

-- 10 random votes
DECLARE
   l_num NUMBER;
   l_idx PLS_INTEGER;
   TYPE array_t IS VARRAY(3) OF VARCHAR2(10);
   l_arr array_t := array_t('Lemon', 'Banana', 'Chocolate');
BEGIN
   FOR i IN 1..10
   LOOP
      l_idx := DBMS_RANDOM.value(low => 1, high => 3);
      l_num := pkg_vote.vote(l_arr(l_idx));
   END LOOP;
END;
/
