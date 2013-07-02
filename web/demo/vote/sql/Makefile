# When on Windows and starting GNU make from Git bash,
# we need to set this:
ifdef COMSPEC
   SHELL=C:/Windows/System32/cmd.exe
endif

all: uninstall install

install:
	exit | sqlplus -L -S ${WEBMQ_ORACLE} @install.sql

uninstall:
	exit | sqlplus -L -S ${WEBMQ_ORACLE} @uninstall.sql
