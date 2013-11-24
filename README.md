# Crossbar.io Demos

**Crossbar.io** comes with over a *dozen ready-to-run demos* that show different features.

The complete source-code for the demos can be found in this [repository](https://github.com/crossbario/crossbardemo) and are available as a [Python package](https://pypi.python.org/pypi/crossbardemo) that you can install into your existing **Crossbar.io**.

The demos are [open-source licensed](https://github.com/crossbario/crossbardemo/blob/master/LICENSE) under the Apache 2.0 license which allows you to reuse the code even in commercial projects for use as starting points in your development.

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
