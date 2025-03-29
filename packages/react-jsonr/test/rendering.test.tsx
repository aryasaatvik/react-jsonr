import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderNode } from '../src/rendering';
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

    // Create a registry with the div component
    const registry: ComponentRegistry = {
      div: 'div'
    };

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

    // Create a registry with the components
    const registry: ComponentRegistry = {
      section: 'section',
      div: 'div'
    };

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

    // Create a registry and context with event handlers
    const registry: ComponentRegistry = {
      button: 'button'
    };
    
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

  it('should return null for unknown component types', () => {
    // Define a JSON node with an unknown type
    const node: JsonNode = {
      type: 'unknown',
      props: {},
      children: []
    };

    // Create an empty registry
    const registry: ComponentRegistry = {};

    // Render the node
    const element = renderNode(node, registry);
    
    // Assert that null was returned
    expect(element).toBeNull();
    expect(console.warn).toHaveBeenCalledWith('Unknown component type: unknown');
  });
}); 