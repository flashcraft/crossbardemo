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

#tmpath = pkg_resources.resource_filename('taschenmesser', '..')
tmpath = "../../infrequent/taschenmesser"
env = Environment(tools = ['default', 'taschenmesser'],
                  toolpath = [tmpath],
                  ENV = os.environ)

#print env.findfiles

#print "XXX", tmpath
#for s in dir(env):
#   print s
#print dir(env)
#print env.taschenmesser

#from setup import setup_def

#import setuptools
#from setuptools import setup
#from setuptools.sandbox import run_setup

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

#print env.Copy

#from taschenmesser.fileutil import findfiles, copyfiles

env['REVISION'] = env.GetRevision()
#print rev

def version_action(target, source, env):
   contents = open(source[0].path).read()
   contents = contents.replace('__REVISION__', env['REVISION'])
   fd = open(target[0].path, 'w')
   fd.write(contents)
   fd.close()

#build_version = env.Command('build/' + PACKAGE + '/rev.py', PACKAGE + '/_version.py', Action(version_action))
#env.AlwaysBuild(build_version)

# .git/refs/heads/master

#env.VersionStamp('build/' + PACKAGE + '/rev.py', PACKAGE + '/_version.py')

env.VersionStamp2('build/' + PACKAGE + '/rev.py', ['.git/refs/heads/master', PACKAGE + '/_version.py'])

#v = env.PyVersion(PACKAGE + '/_version2.py')
#print v

pkgfiles = []
pkgfiles.extend(env.CopyFiles(env.FindFiles(PACKAGE), 'build'))
#pkgfiles.extend(env.CopyFiles(env.FindFiles("web"), 'build/' + PACKAGE))
#pkgfiles.extend(env.CopyFiles(["LICENSE", "MANIFEST.in", "setup.py"], 'build'))

#from crossbardemo import __version__
#print __version__


# egg = env.Egg('build/dist/%s-%s-py2.7.egg' % (PACKAGE, __version__), 'build/setup.py')

# Depends(egg, pkgfiles)

# artifacts = [egg]


# ## Generate checksum files
# ##
# checksums = []
# checksums.append(env.MD5("build/CHECKSUM.MD5", artifacts))
# checksums.append(env.SHA1("build/CHECKSUM.SHA1", artifacts))
# checksums.append(env.SHA256("build/CHECKSUM.SHA256", artifacts))

# ## The default target consists of all artifacts that
# ## would get published
# ##
# uploads = artifacts + checksums
# Default(uploads)

# ## Upload to Amazon S3
# ##
# env['S3_BUCKET'] = 'crossbar.io'
# env['S3_BUCKET_PREFIX'] = 'download/eggs/' # note the trailing slash!
# env['S3_OBJECT_ACL'] = 'public-read'

# ## The uploaded stuff is always considered stale
# ##
# publish = AlwaysBuild(env.S3("build/.S3UploadDone", uploads))

# Depends(publish, uploads)
# Alias("publish", publish)

# # http://pythonhosted.org/setuptools/formats.html
# # https://pythonhosted.org/setuptools/easy_install.html#package-index-api
# # http://docs.python.org/3.2/distutils/packageindex.html
# # 