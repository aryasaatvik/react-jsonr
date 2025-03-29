import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderNode } from '../src/rendering';
import { createRegistry } from '../src/registry';
import type { JsonNode, ComponentRegistry, RenderContext } from '../src/types';
import { render } from '@testing-library/react';

// Mock console.warn to avoid cluttering test output
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('renderNode', () => {
  it('should render a simple component', () => {
    // Define a simple JSON node
    const node: JsonNode = {
      type: 'div',
      props: { className: 'container', 'data-testid': 'test-div' },
      children: []
    };

    // Create a registry using createRegistry
    const registry = createRegistry();

    // Render the node
    const element = renderNode(node, registry);
    const { getByTestId } = render(<>{element}</>);
    
    // Assert that the element was rendered with the correct props
    const divElement = getByTestId('test-div');
    expect(divElement).toBeDefined();
    expect(divElement.tagName).toBe('DIV');
    expect(divElement.className).toBe('container');
  });

  it('should render nested components', () => {
    // Define a nested JSON structure
    const node: JsonNode = {
      type: 'section',
      props: { className: 'outer', 'data-testid': 'nested-test-section' },
      children: [
        {
          key: 'nested-test-div',
          type: 'div',
          props: { className: 'inner', 'data-testid': 'nested-test-div' },
          children: []
        }
      ]
    };

    // Create a registry using createRegistry
    const registry = createRegistry();

    // Render the node
    const element = renderNode(node, registry);
    const { getByTestId } = render(<>{element}</>);
    
    // Assert that the elements were rendered correctly
    const sectionElement = getByTestId('nested-test-section');
    expect(sectionElement).toBeDefined();
    expect(sectionElement.tagName).toBe('SECTION');
    
    const divElement = getByTestId('nested-test-div');
    expect(divElement).toBeDefined();
    expect(divElement.tagName).toBe('DIV');
    expect(divElement.parentElement).toBe(sectionElement);
  });

  it('should handle event handlers', () => {
    // Create a mock event handler
    const handleClick = vi.fn();
    
    // Define a JSON node with an event handler
    const node: JsonNode = {
      type: 'button',
      props: { 
        className: 'btn', 
        'data-testid': 'test-button',
        onClick: 'handleClick'
      },
      children: []
    };

    // Create a registry using createRegistry
    const registry = createRegistry();
    
    const context: RenderContext = {
      eventHandlers: {
        handleClick
      }
    };

    // Render the node
    const element = renderNode(node, registry, context);
    const { getByTestId } = render(<>{element}</>);
    
    // Get the button and click it
    const buttonElement = getByTestId('test-button');
    buttonElement.click();
    
    // Assert that the event handler was called
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle both registered and unregistered component types', () => {
    // Create a custom component class
    class CustomComponent extends React.Component {
      render() {
        return <div data-testid="custom-class-component">Custom Component</div>;
      }
    }
    
    // Create a registry with the custom component
    const registry = createRegistry({
      CustomComponent
    });
    
    // Test with registered component - should render the component
    const registeredNode: JsonNode = {
      type: 'CustomComponent',
      props: {},
      children: []
    };
    
    const registeredElement = renderNode(registeredNode, registry);
    const { getByTestId } = render(<>{registeredElement}</>);
    const customElement = getByTestId('custom-class-component');
    expect(customElement).toBeDefined();
    
    // Test with unregistered component name
    const unregisteredNode: JsonNode = {
      type: 'UnregisteredComponent',
      props: { 'data-testid': 'html-fallback' },
      children: 'Should render as HTML element'
    };
    
    const unregisteredElement = renderNode(unregisteredNode, registry);
    const { getByTestId: getByTestId2 } = render(<>{unregisteredElement}</>);
    const fallbackElement = getByTestId2('html-fallback');
    expect(fallbackElement).toBeDefined();
    expect(fallbackElement.tagName.toLowerCase()).toBe('unregisteredcomponent');
  });

  it('should create custom HTML elements for unknown string types', () => {
    // Define a JSON node with a string type that's not a registered component
    // but should be treated as a custom HTML element
    const node: JsonNode = {
      type: 'custom-element',
      props: { 'data-testid': 'custom-element-test' },
      children: 'Custom element content'
    };

    // Create a registry with no custom components
    const registry = createRegistry();

    // Render the node
    const element = renderNode(node, registry);
    const { getByTestId } = render(<>{element}</>);
    
    // Assert that a custom HTML element was created
    const customElement = getByTestId('custom-element-test');
    expect(customElement).toBeDefined();
    expect(customElement.tagName.toLowerCase()).toBe('custom-element');
    expect(customElement.textContent).toBe('Custom element content');
    expect(console.warn).not.toHaveBeenCalled();
  });
}); 