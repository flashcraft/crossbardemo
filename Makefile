all:
	@echo "Targets:"
	@echo ""
	@echo "   clean            Cleanup"
	@echo "   test             Test produced Web content (crossbar start --cbdataweb ./build/crossbardemo/web)"
	@echo "   package          Create package"
	@echo "   install          Create and install package locally"
	@echo "   update           Create and update package locally"
	@echo "   publish          Create and publish package to PyPI"
	@echo "   publish_s3       Create and publish package to Crossbar.io on S3"
	@echo ""

clean:
	rm -rf build
	scons -uc

test:
	scons ./build/crossbardemo/web

package:
	scons

install: package
	cd ./build/dist; easy_install -f . crossbardemo

update: package
	cd ./build/dist; easy_install -U -H None -f . crossbardemo

publish_s3: package
	scons publish

publish: clean package
	cd build; python setup.py register
	cd build; python setup.py sdist upload
	cd build; python setup.py bdist_egg upload
	cd build; python setup.py bdist_wininst upload
