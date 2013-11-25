all:
	@echo "Targets:"
	@echo ""
	@echo "   clean            Cleanup"
	@echo "   test             Test produced Web content (crossbar start --cbdataweb ./build/crossbardemo/web)"
	@echo "   package          Create package"
	@echo "   install          Create and install package"
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
	python build/setup.py install

publish_s3: package
	scons publish

publish: clean package
	python build/setup.py register
	python build/setup.py sdist upload
	python build/setup.py bdist_egg upload
	python build/setup.py bdist_wininst upload
