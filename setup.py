######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

__all__ = ['setup_def']


from setuptools import setup, find_packages

LONGDESC = """
Demos for Crossbar.io - The open-source multi-protocol application router.

Find out more at http://crossbar.io
Source code: https://github.com/crossbario/crossbardemo

Created by Tavendo GmbH. Get in contact at http://tavendo.com

Demos are open-source licensed under the Apache 2.0 license.
https://github.com/crossbario/crossbardemo/blob/master/LICENSE
"""

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



setup_def = {
   'name': 'crossbardemo',
   'version': verstr,
   'description': 'Crossbar.io Demos',
   'long_description': LONGDESC,
   'author': 'Tavendo GmbH',
   'author_email': 'autobahnws@googlegroups.com',
   'url': 'http://crossbar.io',
   'platforms': ('Any'),
   'install_requires': ['crossbar>=0.8.2'],
   'packages': find_packages(),
   'include_package_data': True,
   'data_files': [('.', ['LICENSE'])],
   'zip_safe': True,
   ## http://pypi.python.org/pypi?%3Aaction=list_classifiers
   ##
   'classifiers': ["License :: OSI Approved :: Apache Software License",
                   "Development Status :: 4 - Beta",
                   "Environment :: Console",
                   "Environment :: Web Environment",
                   "Framework :: Twisted",
                   "Intended Audience :: Developers",
                   "Operating System :: OS Independent",
                   "Programming Language :: Python",
                   "Programming Language :: JavaScript",
                   "Topic :: Documentation"
                   "Topic :: Internet",
                   "Topic :: Internet :: WWW/HTTP",
                   "Topic :: Communications",
                   "Topic :: Database",
                   "Topic :: Home Automation",
                   "Topic :: Software Development :: Libraries",
                   "Topic :: Software Development :: Libraries :: Application Frameworks",
                   "Topic :: Software Development :: Embedded Systems",
                   "Topic :: System :: Distributed Computing",
                   "Topic :: System :: Networking"],
   'keywords': 'crossbar router demo autobahn autobahn.ws websocket realtime rfc6455 wamp rpc pubsub oracle postgres postgresql'
}


if __name__ == '__main__':
   setup(**setup_def)
