all:
	@echo "Targets:"
	@echo ""
	@echo "   clean            Cleanup"
	@echo "   install          Local install"
	@echo "   build            Clean build"
	@echo "   publish          Clean build and publish to PyPI"
	@echo ""

bundle:
	scons

build: bundle
	python setup.py bdist_egg

install: bundle
	python setup.py install

clean:
	rm -rf crossbardemo/web
	rm -rf build
	rm -rf dist
	rm -rf crossbardemo.egg-info
	scons -uc

publish: clean bundle
	python setup.py register
	python setup.py sdist upload
	python setup.py bdist_egg upload
	python setup.py bdist_wininst upload
