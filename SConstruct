###############################################################################
##
##  Copyright 2013 Tavendo GmbH. All rights reserved
##
###############################################################################

BUILDNAME = 'webmqdemo'

#OPTLEVEL = "NONE"
#OPTLEVEL = "WHITESPACE_ONLY"
#OPTLEVEL = "SIMPLE_OPTIMIZATIONS"
OPTLEVEL = "ADVANCED_OPTIMIZATIONS"

HTMLS = []

STATICS = ["web"]

DEFINES = {}

SOURCES = []

### END OF CONFIG ##########################################


import os, subprocess, re
from SCons.Errors import *


def html_builder(target, source, env):
   """
   """
   ## for some reason scons changes into subdir, so we prefix ".."
   outfile = str(os.path.abspath("../../" + str(target[0])))
   infile = str(os.path.abspath("../../" + str(source[0])))
   of = open(outfile, 'w')
   s = open(infile).read()
   il = len(s)
   s = re.sub(r"(<!--#).*(#-->)", "", s, flags = re.DOTALL)
   s = re.sub(r"(<!--\+)(.*)(\+-->)", r"\2", s, flags = re.DOTALL)
   ol = len(s)
   of.write(s)
   of.close()
   print "Stripped %s [%d] to %s [%d] " % (infile, il, outfile, ol)


def js_builder(target, source, env):
   """
   SCons builder for Google Closure.

   NONE | WHITESPACE_ONLY | SIMPLE_OPTIMIZATIONS | ADVANCED_OPTIMIZATIONS
   """
   if env['JS_COMPILATION_LEVEL'] == 'NONE':
      outfile = str(target[0])
      of = open(outfile, 'w')
      for file in source:
         of.write(open(str(file)).read())
         of.write("\n")
      of.close()

   else:
      cmd = []
      cmd.append(os.path.join(env['JAVA_HOME'], 'bin', 'java'))

      cmd.extend(['-jar', env['JS_COMPILER']])

      for define in env['JS_DEFINES']:
         cmd.append('--define="%s=%s"' % (define, env['JS_DEFINES'][define]))

      for file in source:
         cmd.extend(["--js", str(file)])

      cmd.extend(["--js_output_file", str(target[0])])

      #cmd.append("--warning_level=VERBOSE")
      #cmd.append("--jscomp_warning=missingProperties")
      #cmd.append("--jscomp_warning=checkTypes")
      cmd.append("--language_in=ECMASCRIPT5")

      print ' '.join(cmd)
      subprocess.call(cmd)



env = Environment()
env.Append(BUILDERS = {'JavaScript': Builder(action = js_builder),
                       'HTML': Builder(action = html_builder)})

if os.environ.has_key('JAVA_HOME'):
   env['JAVA_HOME'] = os.environ['JAVA_HOME']
else:
   raise SCons.Errors.UserError, "Need to have a Java Run-time - please set JAVA_HOME ennvironment variable."

if os.environ.has_key('JS_COMPILER'):
   env['JS_COMPILER'] = os.environ['JS_COMPILER']
else:
   raise SCons.Errors.UserError, "Need path to Google Closure Compiler JAR (compiler.jar) in JS_COMPILER environment variable."

env['JS_DEFINES'] = DEFINES


if SOURCES and len(SOURCES) > 0:
   lib = env.JavaScript("%s/web/js/%s.js" % (BUILDNAME, BUILDNAME), SOURCES, JS_COMPILATION_LEVEL = OPTLEVEL)

for d in STATICS:
   Command("%s/%s" % (BUILDNAME, d), d, Copy("$TARGET", "$SOURCE"))

for h in HTMLS:
   env.HTML("%s/%s" % (BUILDNAME, h), h, env)
