######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

from setuptools import setup, find_packages

## get version string
## See: http://stackoverflow.com/a/7071358/884770
##
import re
VERSIONFILE="crossbardemo/_version.py"
verstrline = open(VERSIONFILE, "rt").read()
VSRE = r"^__version__ = ['\"]([^'\"]*)['\"]"
mo = re.search(VSRE, verstrline, re.M)
if mo:
   verstr = mo.group(1)
else:
   raise RuntimeError("Unable to find version string in %s." % (VERSIONFILE,))


setup (
   name = 'crossbardemo',
   version = verstr,
   description = 'Crossbar.io Demo',
   author = 'Tavendo GmbH',
   url = 'http://crossbar.io',
   platforms = ('Any'),
   install_requires = [],
   packages = find_packages(),
   include_package_data = True,
   zip_safe = True
)
