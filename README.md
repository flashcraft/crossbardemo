# Crossbar.io Demos

Demos for **Crossbar.io**


1. Install

        easy_install crossbardemo

	To upgrade an existing package
	
		easy_install -U crossbardemo

2. Restart the server

		$ crossbar restart --password secret
		Restarting Crossbar.io ..
        ...

3. Deploy demos into Web directory

		$ crossbar scratchweb --password secret --demoinit
		Scratching Web directory ..
		Scratched Web directory and copied 918 files (22450455 bytes).

4. Open demos at `http://127.0.0.1:8080` in your browser.
