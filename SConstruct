######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

import os
import pkg_resources

#taschenmesser = pkg_resources.resource_filename('taschenmesser', '..')
taschenmesser = "../../infrequent/taschenmesser"
env = Environment(tools = ['default', 'taschenmesser'],
                  toolpath = [taschenmesser],
                  ENV = os.environ)

## package name
PACKAGE = 'crossbardemo'

## files that will get packaged up in Python package - the package files
## will be prepared in ./build
pkgfiles = []

## package root files
pkgfiles.extend(env.CopyFiles('build', ["LICENSE", "MANIFEST.in"]))

## setup.py & __init__py files with __VERSION__ and __REVISION__ replaced
pkgfiles.append(env.VersionStamp('build/setup.py', ['setup.py', 'version.txt', '.git/refs/heads/master']))
pkgfiles.append(env.VersionStamp('build/' + PACKAGE + '/__init__.py', [PACKAGE + '/__init__.py', 'version.txt', '.git/refs/heads/master']))

## web files
pkgfiles.extend(env.CopyFiles('build/' + PACKAGE, env.FindFiles("web")))

## the Egg
env['__VERSION__'] = open('version.txt').read().strip()
egg = env.PyEgg('build/dist/%s-%s-py2.7.egg' % (PACKAGE, env['__VERSION__']), 'build/setup.py')

## the Egg depends on all package files
Depends(egg, pkgfiles)

## these files will get fingerprinted
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
