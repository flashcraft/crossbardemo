all:
	@echo "Targets:"
	@echo ""
	@echo "   clean            Cleanup"
	@echo "   install          Local install"
	@echo "   publish          Clean build, register and publish to PyPi"
	@echo ""

install:
	python setup.py install

img:
	scons

clean:
	rm -rf ./crossbardemo.egg-info
	rm -rf ./build
	rm -rf ./dist
	find . -name "*.egg" -type f -exec rm -f {} \;
	find . -name "*.pyc" -type f -exec rm -f {} \;
	find . -name "*__pycache__" -type d -exec rm -rf {} \;

publish: clean
	python setup.py register
	python setup.py sdist upload

find_autobahn:
	find . -name "autobahn.min.js"

update_autobahn:
	cp ../../../autobahn/AutobahnJS/build/autobahn.* ./crossbardemo/web/js/
	cp ../../../autobahn/AutobahnJS/build/autobahn.* ./crossbardemo/web/demo/vote_node/web/js/
	cp ../../../autobahn/AutobahnJS/build/autobahn.* ./crossbardemo/web/demo/videocontrol/cbvideocontrol/web/
	cp ../../../autobahn/AutobahnJS/build/autobahn.* ./crossbardemo/web/demo/form/knockout/editform_node/web/js/