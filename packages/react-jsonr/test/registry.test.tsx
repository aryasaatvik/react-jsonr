import React from 'react';
import { describe, it, expect } from 'vitest';
import { createRegistry } from '../src/registry';
import { renderNode } from '../src/rendering';
import { FRAGMENT, PORTAL } from '../src/types';
import { render } from '@testing-library/react';

describe('createRegistry', () => {
  it('should provide access to HTML elements', () => {
    const registry = createRegistry();
    
    // HTML elements should be accessible as properties
    expect(registry.div).toBe('div');
    expect(registry.span).toBe('span');
    expect(registry.h1).toBe('h1');
    expect(registry.button).toBe('button');
    expect(registry.input).toBe('input');
  });
  
  it('should include Fragment by default', () => {
    const registry = createRegistry();
    
    // Fragment should be included
    expect(registry[FRAGMENT]).toBe(React.Fragment);
  });
  
  it('should include Portal by default', () => {
    const registry = createRegistry();
    
    // Portal should be included
    expect(typeof registry[PORTAL]).toBe('function');
  });
  
  it('should allow custom components to be added', () => {
    const CustomComponent = () => <div>Custom Component</div>;
    
    const registry = createRegistry({
      Custom: CustomComponent
    });
    
    // Should include both HTML elements and custom components
    expect(registry.div).toBe('div');
    expect(registry.Custom).toBe(CustomComponent);
  });
  
  it('should allow custom components to override HTML elements', () => {
    const CustomDiv = (props: any) => <div className="custom-div" {...props} />;
    
    const registry = createRegistry({
      div: CustomDiv
    });
    
    // Custom div should override the default
    expect(registry.div).toBe(CustomDiv);
    expect(registry.span).toBe('span'); // Other elements should be unaffected
  });
  
  it('should render HTML elements correctly', () => {
    const registry = createRegistry();
    
    const node = {
      type: 'div',
      props: { 'data-testid': 'test-element' },
      children: 'Test content'
    };
    
    const element = renderNode(node, registry);
    const { getByTestId } = render(<>{element}</>);
    
    const divElement = getByTestId('test-element');
    expect(divElement).toBeDefined();
    expect(divElement.textContent).toBe('Test content');
  });
  
  it('should render Fragment correctly', () => {
    const registry = createRegistry();
    
    const node = {
      type: FRAGMENT,
      children: [
        {
          key: 'fragment-child-1',
          type: 'div',
          props: { 'data-testid': 'fragment-child-1' },
          children: 'Child 1'
        },
        {
          key: 'fragment-child-2',
          type: 'div',
          props: { 'data-testid': 'fragment-child-2' },
          children: 'Child 2'
        }
      ]
    };
    
    const element = renderNode(node, registry);
    const { getByTestId } = render(<div data-testid="wrapper">{element}</div>);
    
    const wrapper = getByTestId('wrapper');
    const child1 = getByTestId('fragment-child-1');
    const child2 = getByTestId('fragment-child-2');
    
    expect(child1.parentElement).toBe(wrapper);
    expect(child2.parentElement).toBe(wrapper);
  });
}); 