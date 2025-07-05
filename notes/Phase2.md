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


# Phase Two design goals
Phase Two will see a shift toward signal-based asynchronous client-server interactions.

## Action - Command protocol
The stateful server will present a single endpoint /server. Each request will be interpreted as an "action" or event that took place in the client. The server will consider the action within the context of the session's current state, the state will be updated and a response with one or more "commands" is returned to the client. The processing of commands returned by the server should result in updates to the visible state of the application to reflect the changes to the session state on the server.

## Asynchronous client-server protocol
Explore the use of Web Sockets to connect client's to their active server sessions asynchronously.

### Phase 2 WebSocket Implementation Plan
1. Add WebSocket dependency - Install ws library to existing server
2. Integrate with Express server - Add WebSocket server alongside existing HTTP routes
3. Implement action-command protocol - Create WebSocket message handlers for client actions and server commands 
4. Update client - Add WebSocket connection and message handling to frontend
5. Maintain backward compatibility - Keep existing HTTP endpoints during transition
6. Test integration - Verify WebSocket communication works with session state management

This approach builds on the existing Express/session architecture while adding real-time capabilities. 

