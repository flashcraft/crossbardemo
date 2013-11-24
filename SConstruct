######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

BUILDNAME = 'crossbardemo'

STATICS = ["web"]


statics = []
for d in STATICS:
   statics.append(Command("%s/%s" % (BUILDNAME, d), d, Copy("$TARGET", "$SOURCE")))

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

import os

def getfiles(rdir):
   res = []
   for root, subdirs, files in os.walk(rdir):
      for file in files:
         f = os.path.join(root, file)
         res.append(f)
      for sdir in subdirs:
         res.extend(getfiles(sdir))
   return res

ff = getfiles("web")
print len(ff)

from crossbardemo import __version__
print __version__

def build_function(target, source, env):
   #print target, source
   #print target.name, source.name
   #print target.path, source.path
   #return
   setup_def['script_args'] = ['bdist_egg']
   setup(**setup_def)
   return None

#   # Code to build "target" from "source"
#   return None
bld = Builder(action = build_function)

env = Environment(BUILDERS = {'Egg' : bld})

#egg = env.Egg('dist/%s-%s-py2.7.egg' % (BUILDNAME, __version__), 'setup.py')

#Depends(egg, statics)
#Depends(egg, BUILDNAME)

#for s in statics:
#   for l in s:
#      print l, l.name

#Default(egg)
