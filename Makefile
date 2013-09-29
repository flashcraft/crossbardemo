all: clean install

bundle:
	scons

build: bundle
	python setup.py bdist_egg

install: bundle
	python setup.py install

clean:
	rm -rf webmqdemo/web
	rm -rf build
	rm -rf dist
	rm -rf webmqdemo.egg-info
	scons -uc

eggs_upload_test:
	scp dist/*.egg www.tavendo.de:/usr/local/www/tavendo_download/webmq/test/eggs

eggs_upload_release:
	scp dist/*.egg www.tavendo.de:/usr/local/www/tavendo_download/webmq/release/eggs
