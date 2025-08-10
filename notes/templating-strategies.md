# Templating Strategies for Template Service

## Current Architecture

The template service provides a flexible foundation supporting multiple template paradigms:

- **Programmatic Templates**: Function-based templates with manual DOM manipulation
- **Declarative Templates**: HTML `<template>` elements with utility functions
- **Hybrid Approach**: Mix of string interpolation and DOM queries
- **Server Integration**: Action-command protocol drives template instantiation

## Extension Approach

### Strategy Pattern Implementation

The template service can support multiple building strategies through a unified registration interface:

```javascript
const templateStrategies = {
  'function': (id, templateFn) => templateFn,
  'interpolation': (id, templateHtml) => (data) => processInterpolation(templateHtml, data),
  'data-bind': (id, templateElement) => (data) => processDataBind(templateElement, data),
  'mustache': (id, templateHtml) => (data) => processMustache(templateHtml, data)
};

function register(id, template, strategy = 'function') {
  const templateFn = templateStrategies[strategy](id, template);
  templates.set(id, templateFn);
}
```

### External Template Processors

Specialized processors can be created as external utilities:

```javascript
// template-processors.js
export const interpolationProcessor = {
  register: (id, html) => templateService.register(id, (data) => {
    return parseHtml(html.replace(/\$\{(\w+)\}/g, (m, key) => data[key] || ''));
  })
};

export const dataBindProcessor = {
  register: (id, templateId) => templateService.register(id, (data) => {
    const template = document.getElementById(templateId);
    const clone = template.content.cloneNode(true);
    clone.querySelectorAll('[data-bind]').forEach(el => {
      el.textContent = data[el.getAttribute('data-bind')];
    });
    return clone;
  })
};
```

## Template Syntax Options

### 1. String Interpolation
```javascript
addTemplate('user-card', `
<div class="card">
  <h3>${name}</h3>
  <p>${description || 'No description'}</p>
</div>
`);
```

### 2. Data Attribute Binding
```html
<template id="smart-card">
  <div class="card">
    <h3 data-bind="name"></h3>
    <p data-bind="description" data-show-if="description"></p>
  </div>
</template>
```

### 3. Mustache/Handlebars Style
```html
<template id="post">
  <article>
    <h2>{{title}}</h2>
    <p>{{content}}</p>
    {{#if tags}}
      <div class="tags">
        {{#each tags}}<span>{{this}}</span>{{/each}}
      </div>
    {{/if}}
  </article>
</template>
```

## Benefits

- **Backward Compatibility**: Existing function-based templates continue to work
- **Progressive Enhancement**: Developers can choose appropriate complexity level
- **Unified Interface**: All strategies register through the same template service
- **Composable**: Multiple strategies can coexist in the same application
- **Migration Path**: Easy transition from manual DOM manipulation to declarative syntax

## Implementation Strategy

1. **Layer New Strategies**: Add processing functions without breaking existing templates
2. **External Processors**: Create specialized utilities for different syntax styles
3. **Mixed Usage**: Allow different strategies in the same template file
4. **Server Integration**: Maintain compatibility with action-command template instantiation

This approach preserves the elegance and versatility of the existing system while adding the intuitive declarative syntax that makes simple templates easier to create and maintain.