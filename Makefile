all: clean install

bundle:
	scons

install: bundle
	python setup.py install

build: bundle
	python setup.py bdist_egg

clean:
	rm -rf webmqdemo/web
	rm -rf build
	rm -rf dist
	rm -rf webmqdemo.egg-info
	scons -uc

upload_test: clean build
	scp dist/*.egg www.tavendo.de:/usr/local/www/tavendo_download/webmq/test/eggs

upload_release: clean build
	scp dist/*.egg www.tavendo.de:/usr/local/www/tavendo_download/webmq/release/eggs
