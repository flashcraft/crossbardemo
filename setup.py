######################################################################
##
##   Copyright (c) 2013 Tavendo GmbH. All rights reserved.
##   Author(s): Tobias Oberstein
##
######################################################################

from setuptools import setup, find_packages

## get version string from "autobahn/_version.py"
## See: http://stackoverflow.com/a/7071358/884770
##
import re
VERSIONFILE="webmqdemo/_version.py"
verstrline = open(VERSIONFILE, "rt").read()
VSRE = r"^__version__ = ['\"]([^'\"]*)['\"]"
mo = re.search(VSRE, verstrline, re.M)
if mo:
   verstr = mo.group(1)
else:
   raise RuntimeError("Unable to find version string in %s." % (VERSIONFILE,))


setup (
   name = 'webmqdemo',
   version = verstr,
   description = 'Tavendo WebMQ Demo',
   author = 'Tavendo GmbH',
   url = 'http://www.tavendo.de/webmq',
   platforms = ('Any'),
   install_requires = ['webmq>=0.6.32'],
   packages = find_packages(),
   include_package_data = True,
   zip_safe = True
)
