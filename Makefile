all: clean build

build:
	scons
	python setup.py install

clean:
	rm -rf webmqdemo/web
	rm -rf build
	rm -rf dist
	rm -rf webmqdemo.egg-info
	scons -uc
