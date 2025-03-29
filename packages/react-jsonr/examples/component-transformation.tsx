import React, { useState } from 'react';
import { 
  renderNode, 
  transformJsonTree, 
  TransformVisitor, 
  isComponentNode, 
  createComponentNode, 
  JsonNode 
} from '../src';
import { createRegistry } from '../src';

// Example JSON with various components
const jsonDefinition: JsonNode = {
  type: 'div',
  props: { className: 'article', style: { maxWidth: '600px', margin: '0 auto' } },
  children: [
    {
      type: 'h1',
      children: 'Article Title'
    },
    {
      type: 'p',
      children: 'This is the first paragraph with some text content.'
    },
    {
      type: 'p',
      children: 'This is another paragraph that contains important information that could be highlighted.'
    },
    {
      type: 'ul',
      children: [
        {
          type: 'li',
          children: 'List item one'
        },
        {
          type: 'li',
          children: 'List item two'
        },
        {
          type: 'li',
          children: 'List item three'
        }
      ]
    },
    {
      type: 'button',
      props: { className: 'action-button' },
      children: 'Click Me'
    }
  ]
};

// Define component registry with HTML elements automatically included
const registry = createRegistry();

// Transform 1: Add styles to all headers
const headerStyleTransform: TransformVisitor = {
  enter(node, context) {
    if (isComponentNode(node) && node.type === 'h1') {
      return {
        ...node,
        props: {
          ...node.props,
          style: { 
            ...((node.props?.style as object) || {}), 
            color: '#2c3e50',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
            marginBottom: '20px'
          }
        }
      };
    }
  }
};

// Transform 2: Add hover effects to buttons
const buttonEnhanceTransform: TransformVisitor = {
  enter(node, context) {
    if (isComponentNode(node) && node.type === 'button') {
      return {
        ...node,
        props: {
          ...node.props,
          style: {
            ...((node.props?.style as object) || {}),
            backgroundColor: '#3498db',
            color: 'white',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          },
          onMouseOver: (e: React.MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = '#2980b9';
          },
          onMouseOut: (e: React.MouseEvent) => {
            (e.target as HTMLElement).style.backgroundColor = '#3498db';
          }
        }
      };
    }
  }
};

// Transform 3: Highlight paragraphs with important content
const highlightImportantTransform: TransformVisitor = {
  enter(node, context) {
    if (
      isComponentNode(node) && 
      node.type === 'p' && 
      typeof node.children === 'string' && 
      node.children.includes('important')
    ) {
      // Create a span with highlight style wrapped around the text
      return createComponentNode('p', {
        style: { backgroundColor: '#ffeaa7', padding: '10px', borderRadius: '4px' }
      }, node.children);
    }
  }
};

export default function ComponentTransformationExample() {
  const [transformedElement, setTransformedElement] = useState<React.ReactNode>(null);
  const [originalElement, setOriginalElement] = useState<React.ReactNode>(null);
  
  React.useEffect(() => {
    // Render original
    setOriginalElement(renderNode(jsonDefinition, registry));
    
    // Apply transformations and render
    const applyTransforms = async () => {
      const transformedJson = await transformJsonTree(
        jsonDefinition,
        [
          headerStyleTransform,
          buttonEnhanceTransform,
          highlightImportantTransform
        ]
      );
      
      setTransformedElement(renderNode(transformedJson, registry));
    };
    
    applyTransforms();
  }, []);
  
  return (
    <div className="example-container">
      <h1>Component Transformation Example</h1>
      <div className="example-description">
        <p>This example demonstrates transforming JSON components before rendering.</p>
        <p>Transformations:</p>
        <ul>
          <li>Style headers with colors and borders</li>
          <li>Enhance buttons with hover effects</li>
          <li>Highlight paragraphs containing the word "important"</li>
        </ul>
      </div>
      
      <div className="comparison" style={{ display: 'flex', gap: '20px' }}>
        <div className="original" style={{ flex: 1 }}>
          <h3>Original Rendering</h3>
          {originalElement || <div>Loading...</div>}
        </div>
        
        <div className="transformed" style={{ flex: 1 }}>
          <h3>Transformed Rendering</h3>
          {transformedElement || <div>Loading...</div>}
        </div>
      </div>
    </div>
  );
} 