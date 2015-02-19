# Crossbar.io Demos

**Crossbar**.io comes with [*ready-to-run demos*](https://demo.crossbar.io/) that show off different features of [**Crossbar**.io](http://crossbar.io/).

The complete demo bundle is available as a [Python package](https://pypi.python.org/pypi/crossbardemo) which you can install into your existing **Crossbar**.io installation and try yourself - see below.

For installation of **Crossbar**.io itself, please see the [Getting Started](https://github.com/crossbario/crossbar/wiki#getting-started).

> The source-code for the demos can be found in the repository [here](https://github.com/crossbario/crossbardemo/tree/master/crossbardemo/crossbardemo/web) and is [open-source licensed](https://github.com/crossbario/crossbardemo/blob/master/crossbardemo/LICENSE) under the Apache 2.0 license. This allows you to *reuse the code even in commercial projects* for use as starting points in your development.
> 

## Try it

### Install the demos package

To install from [PyPI](https://pypi.python.org/pypi/crossbardemo)

```shell
pip install crossbardemo
```

To upgrade an existing package from PyPI
	
```shell
pip install --upgrade crossbardemo
```

### Create a new Crossbar.io node

```shell
mkdir -p $HOME/demo1/.crossbar
```

Add a node configuration file `$HOME/demo1/.crossbar/config.json`:

```json
{
   "controller": {
   },
   "workers": [
      {
         "type": "router",
         "realms": [
            {
               "name": "crossbardemo",
               "roles": [
                  {
                     "name": "anonymous",
                     "permissions": [
                        {
                           "uri": "io.crossbar.demo.*",
                           "publish": true,
                           "subscribe": true,
                           "call": true,
                           "register": true
                        }
                     ]
                  }
               ]
            }
         ],
         "transports": [
            {
               "type": "web",
               "endpoint": {
                  "type": "tcp",
                  "port": 8080
               },
               "paths": {
                  "/": {
                     "type": "static",
                     "package": "crossbardemo",
                     "resource": "web"
                  },
                  "ws": {
                     "type": "websocket"
                  }
               }
            }
         ],
         "components": [
            {
               "type": "class",
               "classname": "crossbardemo.votes.VotesBackend",
               "realm": "crossbardemo",
               "role": "anonymous"
            }
         ]
      }
   ]
}
```

and start the node

```shell
cd $HOME/demo1
crossbar start
```

**Crossbar**.io will log startup

```shell
(python279_1)oberstet@thinkpad-t430s:~/nodes/node4$ crossbar start
2015-02-19 11:20:00+0100 [Controller   5204] Log opened.
2015-02-19 11:20:00+0100 [Controller   5204] ==================== Crossbar.io ====================
    
2015-02-19 11:20:00+0100 [Controller   5204] Crossbar.io 0.10.2 starting
2015-02-19 11:20:00+0100 [Controller   5204] Running on CPython using EPollReactor reactor
2015-02-19 11:20:00+0100 [Controller   5204] Starting from node directory /home/oberstet/nodes/node4/.crossbar
2015-02-19 11:20:00+0100 [Controller   5204] Starting from local configuration '/home/oberstet/nodes/node4/.crossbar/config.json'
2015-02-19 11:20:00+0100 [Controller   5204] Warning, could not set process title (setproctitle not installed)
2015-02-19 11:20:00+0100 [Controller   5204] No WAMPlets detected in enviroment.
2015-02-19 11:20:00+0100 [Controller   5204] Starting Router with ID 'worker1' ..
2015-02-19 11:20:00+0100 [Controller   5204] Entering reactor event loop ...
2015-02-19 11:20:00+0100 [Router       5213] Log opened.
2015-02-19 11:20:00+0100 [Router       5213] Warning: could not set worker process title (setproctitle not installed)
2015-02-19 11:20:01+0100 [Router       5213] Running under CPython using EPollReactor reactor
2015-02-19 11:20:01+0100 [Router       5213] Entering event loop ..
2015-02-19 11:20:01+0100 [Controller   5204] Router with ID 'worker1' and PID 5213 started
2015-02-19 11:20:01+0100 [Controller   5204] Router 'worker1': realm 'realm1' started
2015-02-19 11:20:01+0100 [Controller   5204] Router 'worker1': role 'role1' started on realm 'realm1'
2015-02-19 11:20:01+0100 [Router       5213] VotesBackend: 3 procedures registered!
2015-02-19 11:20:01+0100 [Controller   5204] Router 'worker1': component 'component1' started
2015-02-19 11:20:01+0100 [Router       5213] Loaded static Web resource 'web' from package 'crossbardemo 0.3.7' (filesystem path /home/oberstet/python279_1/lib/python2.7/site-packages/crossbardemo-0.3.7-py2.7.egg/crossbardemo/web)
2015-02-19 11:20:01+0100 [Router       5213] Site starting on 8080
2015-02-19 11:20:01+0100 [Controller   5204] Router 'worker1': transport 'transport1' started
...
```

### Test the Demos

Open the demos entry page at `http://127.0.0.1:8080` in your browser

![](design/shot_demos_home.png)

Then, for example, open the "Chat" demos in two browser tabs to see it communicate in real-time

![](design/shot_demos_chat.png)

