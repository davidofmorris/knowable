# Musings about the topic of client actions.
Our application model defines an asynchronous protocol between the server and its clients. The protocol is asymetrical in that clients send actions to the server and the server sends commands. In each case, the recipient finds an appropriate handler, and the handler may update some state and it might emit more messages across the client-server channel. The end user is one reason for the asymetry, the one-to-many relationship between the server and its clients another, and there's the server's privileged position within the security of the hosting environment, its access to persistent storage and other services. And so the primary responsibility of the client is to pass along the end user's actions (or interactions) and the server's main purpose is to deliver up context to the client to be shown or otherwise delivered to the user. Another asymetry between server and client is that the server is responsible for defining both commands and actions. The semantic meaning of display elements comes from the business logic implemented in the server.

# Navigation example
Consider navigation buttons - display elements that take the user to a different panel when they click. The server will add a step for each button, providing the client with a template name and the data to be merged into it. To make the button do something, the server should provide it with an action name and its arguments. Further, the arguments should be able to reference other UI elements so that their values will be passed back with the action when the display element is clicked.

```json
[
  {
    "command": "show-panel",
    "layout": "default",
    "steps": [
      {
        "flow": "inside-top-center",
        "template": "nav-button",
        "data": { "value": "test!" },
        "click-action": { "action": "open-panel", "data": { "panel":"test-panel"} }
      },
      {
        "flow": "inside-focus",
        "template": "text",
        "data": { "arg": "Click the button above to find out where it takes you!" },
      }
    ]
  }
]
```

The server includes "click-action" data for the nav-button "test!" placed top and center, that includes the action name and the parameters to be sent along with it.

The client's command handler for "show-panel" must respond to the "click-action" argument by attaching a click handler to the element. The click handler should call serverConnection.sendWebSocketMessage(action, data) to fire the event back to the server.

# Out of scope
    - "click-action" argument could be an array if multiple actions were to be associated with the element
    - "click-action" elements could include a 'selector' parameter to specify a sub-element within the element created from the template
    - "click-action" could include an array of "internal-commands" which would be processed immediately in the client