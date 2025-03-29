import { describe, it, expect } from 'vitest';
import { type JsonNode, type ComponentRegistry, type TransformVisitor, type TransformContext, type RenderContext, isComponentNode } from '../src/types';

describe('Types', () => {
  it('should validate JsonNode structure', () => {
    // Valid minimal JsonNode
    const minimalNode: JsonNode = {
      type: 'div'
    };
    expect(minimalNode.type).toBe('div');
    
    // Valid complete JsonNode
    const fullNode: JsonNode = {
      type: 'div',
      props: { 
        className: 'container',
        key: 'unique-key',
        id: 'unique-id'
      },
      children: [
        { type: 'span' }
      ],

    };
    expect(fullNode.type).toBe('div');
    expect(fullNode.props?.className).toBe('container');
    if (Array.isArray(fullNode.children)) {
      expect(fullNode.children.length).toBe(1);
    }
    expect(fullNode.props?.key).toBe('unique-key');
    expect(fullNode.props?.id).toBe('unique-id');
  });
  
  it('should validate ComponentRegistry structure', () => {
    // Create a test registry with both string and component types
    const registry: ComponentRegistry = {
      div: 'div',
      span: 'span',
      customComponent: () => null
    };
    
    expect(typeof registry.div).toBe('string');
    expect(typeof registry.span).toBe('string');
    expect(typeof registry.customComponent).toBe('function');
  });
  
  it('should create a valid TransformContext', () => {
    // Mock a basic transform context
    const mockContext: TransformContext = {
      depth: 2,
      parent: { type: 'parent' },
      index: 1,
      skipChildren: () => {},
      customProp: 'test'
    };
    
    expect(mockContext.depth).toBe(2);
    expect(mockContext.parent).toEqual({ type: 'parent' });
    expect(mockContext.index).toBe(1);
    expect(typeof mockContext.skipChildren).toBe('function');
    expect(mockContext.customProp).toBe('test');
  });
  
  it('should validate RenderContext structure', () => {
    // Basic render context
    const basicContext: RenderContext = {};
    expect(basicContext).toBeDefined();
    
    // Context with event handlers
    const clickHandler = () => {};
    const contextWithHandlers: RenderContext = {
      eventHandlers: {
        onClick: clickHandler
      },
      theme: 'dark'
    };
    
    expect(contextWithHandlers.eventHandlers?.onClick).toBe(clickHandler);
    expect(contextWithHandlers.theme).toBe('dark');
  });
}); 