######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

PACKAGE = 'crossbardemo'

STATICS = ["web", "LICENSE", "MANIFEST.in", "setup.py"]

import os
import pkg_resources

#taschenmesser = pkg_resources.resource_filename('taschenmesser', '..')
taschenmesser = "../../infrequent/taschenmesser"
env = Environment(tools = ['default', 'taschenmesser'],
                  toolpath = [taschenmesser],
                  ENV = os.environ)


from setup import setup_def

import setuptools
from setuptools import setup
from setuptools.sandbox import run_setup

# http://stackoverflow.com/questions/12966147/how-can-i-install-python-modules-programmatically-through-a-python-script

#setup_def['script_args'] = ['install']
#setup_def['script_args'] = ['bdist_egg']
#setup(**setup_def)

# dist/crossbardemo-0.1.2-py2.7.egg
# python setup.py bdist_egg

# http://docs.python.org/release/2.4.1/dist/module-distutils.core.html
# run_setup(   script_name[, script_args=None, stop_after='run'])
#print run_setup("setup.py", ".", ["install"])
#print run_setup("setup.py", ["bdist_egg"], 'init')
# python setup.py bdist_egg
   #setup_def['script_args'] = ['bdist_egg']
   #setup(**setup_def)


import os

def _getfiles(rdir):
   res = []
   for root, subdirs, files in os.walk(rdir):
      for file in files:
         f = os.path.join(root, file)
         res.append(f)
      for sdir in subdirs:
         res.extend(_getfiles(sdir))
   return res

def findfiles(paths, recurse = True, patterns = None):
   res = []
   if not type(paths) == list:
      paths = [paths]
   for path in paths:
      if os.path.isfile(path):
         res.append(path)
      elif os.path.isdir(path) and recurse:
         res.extend(_getfiles(path))
      else:
         pass
   return res

def copyfiles(files, targetdir = ''):
   res = []
   for f in files:
      fp = os.path.join('build', targetdir,  f)
      res.append(Command(fp, f, Copy("$TARGET", "$SOURCE")))
   return res



pkgfiles = []
pkgfiles.extend(copyfiles(findfiles(PACKAGE)))
pkgfiles.extend(copyfiles(findfiles("web"), PACKAGE))
pkgfiles.extend(copyfiles(["LICENSE", "MANIFEST.in", "setup.py"]))

from crossbardemo import __version__
#print __version__


egg = env.Egg('build/dist/%s-%s-py2.7.egg' % (PACKAGE, __version__), 'build/setup.py')

Depends(egg, pkgfiles)

artifacts = [egg]


## Generate checksum files
##
checksums = []
checksums.append(env.MD5("build/CHECKSUM.MD5", artifacts))
checksums.append(env.SHA1("build/CHECKSUM.SHA1", artifacts))
checksums.append(env.SHA256("build/CHECKSUM.SHA256", artifacts))

## The default target consists of all artifacts that
## would get published
##
uploads = artifacts + checksums
Default(uploads)

## Upload to Amazon S3
##
env['S3_BUCKET'] = 'crossbar.io'
env['S3_BUCKET_PREFIX'] = 'download/eggs/' # note the trailing slash!
env['S3_OBJECT_ACL'] = 'public-read'

## The uploaded stuff is always considered stale
##
publish = AlwaysBuild(env.S3("build/.S3UploadDone", uploads))

Depends(publish, uploads)
Alias("publish", publish)

# http://pythonhosted.org/setuptools/formats.html
# https://pythonhosted.org/setuptools/easy_install.html#package-index-api
# http://docs.python.org/3.2/distutils/packageindex.html
# 