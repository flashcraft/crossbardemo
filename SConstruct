######################################################################
##
##   Copyright (C) 2013 Tavendo GmbH.
##   Licensed under Apache 2.0 license
##   See: http://www.apache.org/licenses/LICENSE-2.0.html
##
######################################################################

BUILDNAME = 'crossbardemo'

STATICS = ["web"]


for d in STATICS:
   Command("%s/%s" % (BUILDNAME, d), d, Copy("$TARGET", "$SOURCE"))
