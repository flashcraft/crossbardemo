all:
	@echo "Targets:"
	@echo ""
	@echo "test       Start Crossbar node."
	@echo "clean      Clean everything."
	@echo ""

test:
	crossbar start

clean:
	rm -rf *.egg-info
	rm -rf build
	rm -rf dist
	find . -name "*.pyc" -exec rm -f {} \;
