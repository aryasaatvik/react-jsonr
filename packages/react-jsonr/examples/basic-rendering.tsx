import React from 'react';
import { renderNode, JsonNode } from '../src';

// Basic JSON definition for a simple UI
const jsonDefinition: JsonNode = {
  type: 'div',
  props: { className: 'card', style: { padding: '20px', border: '1px solid #eee', borderRadius: '5px' } },
  children: [
    {
      type: 'h2',
      props: { style: { color: '#333' } },
      children: 'Basic Rendering Example'
    },
    {
      type: 'p',
      children: 'This UI is defined in JSON and rendered to React components.'
    },
    {
      type: 'div',
      props: { className: 'buttons', style: { marginTop: '15px' } },
      children: [
        {
          type: 'button',
          props: { 
            className: 'primary', 
            style: { 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              padding: '10px 15px',
              marginRight: '10px',
              border: 'none',
              borderRadius: '4px'
            },
            onClick: () => alert('Primary button clicked!')
          },
          children: 'Primary Action'
        },
        {
          type: 'button',
          props: { 
            className: 'secondary', 
            style: { 
              backgroundColor: '#f5f5f5', 
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            onClick: () => alert('Secondary button clicked!')
          },
          children: 'Secondary Action'
        }
      ]
    }
  ]
};

// Define component registry
const registry = {
  div: 'div',
  h2: 'h2',
  p: 'p',
  button: 'button',
  span: 'span'
};

export default function BasicRenderingExample() {
  // Render the JSON definition to React components
  const element = renderNode(jsonDefinition, registry);
  
  return (
    <div className="example-container">
      <h1>Basic Rendering Example</h1>
      <div className="example-description">
        <p>This example demonstrates rendering a JSON definition to React components.</p>
        <p>The JSON definition describes a card with a heading, paragraph, and two buttons.</p>
      </div>
      
      <div className="original">
        <h3>Original JSON</h3>
        <pre>{JSON.stringify(jsonDefinition, null, 2)}</pre>
      </div>
      
      <div className="result">
        <h3>Rendered Result</h3>
        {element}
      </div>
    </div>
  );
} 