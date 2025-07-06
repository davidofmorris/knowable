# Phase One accomplishments
Phase One delivers a proof of concept that substantially derisks many potential obstacles to rapid future progress.

**Language:**
The project is written in plain JavaScript. The client is loaded into a browser from static HTML/JS files and then connects to a stateful Node.js server.

**Platforms:**
The stateful app server runs in Node.js.
Test harnesses for the backend server also run in Node.js.
The client runs in a browser and is tested manually.

## Frameworks: 
**Client**
The client runs in a modern browser using plain HTML and JavaScript. 

**Server**
The Node.js stateful server implements an 'express' application.
```
const express = require('express');
const cors = require('cors');
require('dotenv').config();
```

**Sessions:**
The Node.js stateful server maintains a state object for each session. The session key is provided by the client. A blank session key loads the "default" session's state object.

## Services:
**Source Control:**
The project is in GitHub at [github.com/davidofmorris/knowable](https://github.com/davidofmorris/knowable/).

**Static web hosting:**
The project uses GitHub Pages to host the static HTML and JavaScript files that implement the web client.
The public URL for the project is [davidofmorris.github.io/knowable/](https://davidofmorris.github.io/knowable/).

**Backend Node.js stateful server hosting:**
The project uses Railway to host its Node.js backend server. The URL for the backend is [knowable-api.up.railway.app](https://knowable-api.up.railway.app/).

## Summary
Phase One lays the foundation for reasonably rapid iterations over a comprehensible client/server architecture, written in JavaScript, and hosted almost effortlessly by GitHub and Railway.

