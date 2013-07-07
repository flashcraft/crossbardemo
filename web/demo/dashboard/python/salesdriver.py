# Windows
CONNECTSTR = 'DRIVER={HDBODBC32};SERVERNODE=54.247.126.11:30015;SERVERDB=HDB;UID=TEST;PWD=Abcd2366'
#CONNECTSTR = 'DSN=HANATEST;UID=SYSTEM;PWD=manager'

# Linux
#CONNECTSTR = 'DRIVER={HANA};SERVERNODE=54.247.126.11:30015;SERVERDB=HDB;UID=SYSTEM;PWD=manager'

regions = [('North', 10.), ('South', 12.), ('East', 5.), ('West', 2.)]
products = [('Product A', 169., 4), ('Product B', 99., 10), ('Product C', 599., 3)]


import pyodbc, time, random

conn = pyodbc.connect(CONNECTSTR)
conn.autocommit = True
cur = conn.cursor()
#cur.execute("DELETE FROM test.sales")

while True:
   product = random.choice(products)
   region = random.choice(regions)
   units = random.randint(1, product[2])
   uvp = product[1]
   discount = uvp * (region[1] / 100.)
   price = uvp - discount
   cur.execute("INSERT INTO test.sales (trans_dt, product, region, units, price) VALUES (NOW(), ?, ?, ?, ?)",
               [product[0], region[0], units, price])
   print product, region, units, uvp, discount, price
   time.sleep(2*random.expovariate(2))
