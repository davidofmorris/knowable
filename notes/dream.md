# Card rendering page
Design goal: a single HTML page that:
  1. Knowable is able to ingest
  2. Renders itself with test data if loaded into a browser
  
# Working backward from <body><script>test();</script></body>
 - we're designing a MVC app
   - client sends 'actions' and server returns 'commands'
   - command:show-panel
     - full panel structure expressed in terms of template-id and params
     - element updates expressed in terms of:
       - selector (relative to container)
       - step: 
       
       
# command: show-panel example
{
  command:'show-panel',
  root   :'#view-frame',
  content:[
    
  ]
}


# pseduo code
    ```
    const rootElement = document.select(command.root);
    const nodeStack = [];
    stack.push({parent:rootElement, node:command.content});
    while (nodeStack.length > 0) {
      const currentNode = stack.pop();
      
      if (content is array) {
        for (const child of content) {
          
        }
      }
    }
    ```
**Example content structure**
    {
        template: 'panel-layout',  // root content references the main template to be loaded into the root element
        children: [
            { flow: "inside-top-middle", template: 'title', arg: 'My Title' }, // simple subst of 'value' as ${arg1}
            {
                flow: "outside-left-upper", template: 'button-list', arg: 'Parents',
                childTemplate: 'button',
                childAction: 'select-panel',
                children: [
                    { label: 'B', target: 'B-dir' },
                    { label: 'A', target: 'A-dir' }
                ]
            },
            {
                flow: "inside-left-lower", template: 'button-list', arg: 'Subs',
                childTemplate: 'button',
                childAction: 'select-panel',
                children: [
                    { label: 'B', target: 'B-dir' },
                    { label: 'A', target: 'A-dir' }
                ]
            }
        ]
    }

    
**Thinking: tail-recursion**
var stack = [] // will hold node from 'show-panel.context'
stack.push(command.content)

<body>
<script>
  // load panel-layout
  
  // script expected build sequence:
  
</script>
</body>

