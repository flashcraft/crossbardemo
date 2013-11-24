# Crossbar.io Demos

**Crossbar.io** comes with over a *dozen ready-to-run demos* that show off different features of [Crossbar.io](http://crossbar.io/) - the multi-protocol application router.

The complete demo bundle is available as a [Python package](https://pypi.python.org/pypi/crossbardemo) which you can install into your existing **Crossbar.io** installation (see below).

The source-code for the demos can be found in the repository [here](https://github.com/crossbario/crossbardemo/web) and is [open-source licensed](https://github.com/crossbario/crossbardemo/blob/master/LICENSE) under the Apache 2.0 license. This allows you to *reuse the code even in commercial projects* for use as starting points in your development.

## Get it

1. **Install**

	To install from [PyPI](https://pypi.python.org/pypi/crossbardemo):

        easy_install crossbardemo

	To upgrade an existing package from PyPI:
	
		easy_install -U crossbardemo

	To install from sources

		git clone git@github.com:crossbario/crossbardemo.git
		cd crossbardemo
		python setup.py install

2. **Restart** the server

		$ crossbar restart --server ws://127.0.0.1:9000 --password secret
		Restarting Crossbar.io ..
        ...

3. **Deploy** demos into Web directory

		$ crossbar scratchweb --server ws://127.0.0.1:9000 --password secret --demoinit
		Scratching Web directory ..
		Scratched Web directory and copied 918 files (22450455 bytes).

	> **Warning**: This will scratch any existing content under your Web directory!
	> 

4. **Open** demos at `http://127.0.0.1:8080` in your browser.
