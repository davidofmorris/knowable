// Dream-specific action handlers
const handlers = {
  "open-app": onShowDreamApp,
  "open-panel": onOpenPanel
};

// open-app handler for dream app - shows page 1
function onShowDreamApp(req) {
  return showPage1();
}

// open-panel handler for dream app - shows specific panel
function onOpenPanel(req) {
  const panel = req.data.panel;
  
  if (panel === 'page2') {
    return showPage2();
  } else {
    return showPage1();
  }
}

// Show Page 1 with navigation to Page 2
function showPage1() {
  const commands = [];
  
  const steps = [
    // Add the main title
    { 
      template: 'content-html', 
      data: { content: 'd r e a m<br>d r e a m' }, 
      flow: 'inside-top-center' 
    },
    // Add page 1 content
    { 
      template: 'text', 
      data: { arg: 'Page 1: The title is the thing.' }, 
      flow: 'inside-top-center' 
    },
    { 
      template: 'text', 
      data: { arg: 'This is easy.' }, 
      flow: 'inside-top-right', 
      'click-action': { action: 'open-panel', data: { panel: 'page2' }}
    },
    { 
      flow: 'inside-focus',
      template: 'text', 
      data: { arg: 'Now is the time for all good men to come to the aid of their party!' }
    },
    // Navigation button to Page 2
    {
      flow: 'inside-bottom-center',
      template: 'nav-button',
      data: { value: 'Go to Page 2' },
      'click-action': { action: 'open-panel', data: { panel: 'page2' }}
    },
    // Button to send an unknown action
    {
      flow: 'inside-bottom-right',
      template: 'text-input',
      data: { value: 'Default Value', placeholder: 'Type Something...', name: 'test-input' },
      'click-action': { action: 'open-panel', data: { panel: 'page2' }}
    },
    {
      flow: 'inside-bottom-right',
      template: 'nav-button',
      data: { value: 'Test!' },
      'click-action': { action: 'test-action', data: { input: '$[name="test-input"]'}}
    },
  ];

  commands.push({
    command: 'show-panel',
    steps: steps
  });

  return commands;
}

// Show Page 2 with navigation to Page 1
function showPage2() {
  const commands = [];
  
  const steps = [
    // Add the main title
    { 
      template: 'content-html', 
      data: { content: 'd r e a m<br>d r e a m' }, 
      flow: 'inside-top-center' 
    },
    // Add page 2 content
    { 
      template: 'text', 
      data: { arg: 'Page 2: Welcome to the second page!' }, 
      flow: 'inside-top-center' 
    },
    { 
      template: 'text', 
      data: { arg: 'This page shows different content.' }, 
      flow: 'inside-top-right' 
    },
    { 
      template: 'text', 
      data: { arg: 'Navigation between pages is working through the action-command protocol.' }, 
      flow: 'inside-focus' 
    },
    // Navigation button to Page 1
    {
      template: 'nav-button',
      data: { value: 'Go to Page 1' },
      flow: 'inside-bottom-center',
      'click-action': { 
        action: 'open-panel', 
        selector: 'button',
        data: { panel: 'page1' } 
      }
    }
  ];

  commands.push({
    command: 'show-panel',
    steps: steps
  });

  return commands;
}

module.exports = {
  handlers: handlers
};