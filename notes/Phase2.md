
# Phase Two accomplishments
Phase Two shifts toward signal-based asynchronous client-server interactions.

## Action - Command protocol
The stateful server presents a single endpoint /server. Each request is interpreted as an "action" or event that took place in the client. The server considers each action within the context of the session's current state, updates the state and a returns one or more "commands" to the client. The processing of commands returned by the server should result in updates to the visible state of the application to reflect the changes to the session state on the server.

## Asynchronous client-server protocol
Client-server communications are accomplished through Web Sockets.


