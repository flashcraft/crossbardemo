# Vote Demo

## What this is

![Screenshot of votes demo](/screenshot.png?raw=true)

A simple voting application: vote for one of three flavors of ice cream. Get immediate updates when other users vote.

Built to give the simplest possible introduction to doing RPC and PubSub over WAMP using Crossbar.io.


## Technological Background

The demo sends the votes to a Node.js backend, and vote updates are immediately pushed to all connected clients.

Voting is implemented via Remote Procedure Call (RPC) to the backend, while the vote updates are handled via Publish & Subscribe (PubSub), using [WAMP (Web Application Messaging protocol)](http://wamp.ws/).

RPC and PubSub events are routed via a WAMP router. This can be any WAMP router, but the demo is intended to be run using [Crossbar.io](http://crossbar.io/), and the instructions below are for this.


## Running the Demo

### Installing Node.js

You need to have Node.js installed, and install the Autobahn|JS library for Node.js

To install Node.js, just visit the [project's homepage](http://nodejs.org/) and follow the instructions there.

Once you have done so, open a command shell and do

`npm install -g autobahn`

which installs the Autobahn|JS library globally.

### Installing Crossbar.io

Crossbar.io requires [Python 2](https://www.python.org/download/releases/2.7.8/).

On *nix systems this should come preinstalled, and installing Crossbar.io is then as easy as doing

`pip install crossbar`

The process is a bit more involved for [Mac OSX](https://github.com/crossbario/crossbar/wiki/Installation-on-Mac-OS-X) and for [Windows](https://github.com/crossbario/crossbar/wiki/Installation-on-Windows).

### Starting the Demo

Once you have Node.js and Crossbar.io installed, open a command shell in the root directory of the demo and just do

`crossbar start`

The demo repo contains a configuration file for Crossbar.io which causes this to

* serve the demo page for the browser
* run the demo backend in Node.js

Just point your browser to `localhost:8080`to see the demo.

> Since WAMP uses WebSocket as its transport, a not too ancient version of Chrome, Safari, Firefox or Opera, or Internet Explorer 10+ is required.