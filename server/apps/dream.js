// Dream-specific action handlers
const handlers = {
  "show-app": onShowDreamApp
};

// show-app handler for dream app
function onShowDreamApp(req) {
  const commands = [];
  
  // Create steps that replicate the current dream.html appearance
  const steps = [
    // Add the main title
    { 
      template: 'content-html', 
      data: { content: 'd r e a m<br>d r e a m' }, 
      flow: 'inside-top-center' 
    },
    // Add some example text content
    { 
      template: 'text', 
      data: { arg: 'The title is the thing.' }, 
      flow: 'inside-top-center' 
    },
    { 
      template: 'text', 
      data: { arg: 'This is easy.' }, 
      flow: 'inside-top-right' 
    },
    { 
      template: 'text', 
      data: { arg: 'Now is the time for all good men to come to the aid of their party!' }, 
      flow: 'inside-focus' 
    }
  ];

  // Return show-panel command with the steps
  commands.push({
    command: 'show-panel',
    steps: steps
  });

  return commands;
}

module.exports = {
  handlers: handlers
};