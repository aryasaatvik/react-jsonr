import React, { ReactNode, createElement } from 'react';
import { createPortal } from 'react-dom';
import { 
  JsonNode, 
  ComponentNode, 
  ComponentRegistry, 
  RenderContext,
  isPrimitiveNode,
  isArrayNode,
  FRAGMENT,
  PORTAL
} from './types';

/**
 * Renders a JSON node to a React element
 */
export function renderNode(
  node: JsonNode,
  registry: ComponentRegistry,
  context: RenderContext = {}
): ReactNode {
  // Handle primitives directly
  if (isPrimitiveNode(node)) {
    return node;
  }
  
  // Handle arrays
  if (isArrayNode(node)) {
    return node.map((child, index) => {
      // Add stable keys to array children to avoid React warnings
      const element = renderNode(child, registry, context);
      
      // For component nodes, the key is already handled in renderComponentNode
      return element;
    });
  }
  
  // From here, we know it's a ComponentNode
  return renderComponentNode(node, registry, context);
}

/**
 * Renders a component node to a React element
 */
function renderComponentNode(
  node: ComponentNode,
  registry: ComponentRegistry,
  context: RenderContext = {}
): ReactNode {
  // Check if the node type exists in the registry
  const component = registry[node.type];
  if (!component) {
    console.warn(`Unknown component type: ${node.type}`);
    return null;
  }

  // Process props, handling event handlers and keys
  const processedProps = processProps(node.props || {}, context);
  
  // Extract key if present
  const key = node.key || node.id || undefined;
  if (key) {
    processedProps.key = key;
  }
  
  // Handle special component types
  if (node.type === FRAGMENT) {
    return React.createElement(
      React.Fragment,
      processedProps,
      renderNodeChildren(node.children, registry, context)
    );
  }
  
  if (node.type === PORTAL) {
    const target = typeof processedProps.container === 'string'
      ? document.querySelector(processedProps.container)
      : processedProps.container || document.body;
      
    return createPortal(
      renderNodeChildren(node.children, registry, context),
      target
    );
  }
  
  // Create the React element
  return createElement(
    component,
    processedProps,
    renderNodeChildren(node.children, registry, context)
  );
}

/**
 * Renders children nodes
 */
function renderNodeChildren(
  children: JsonNode | JsonNode[] | undefined,
  registry: ComponentRegistry,
  context: RenderContext
): ReactNode {
  if (!children) {
    return null;
  }
  
  if (isArrayNode(children)) {
    return children.map((child, index) => {
      // Add stable keys to array children to avoid React warnings
      const element = renderNode(child, registry, context);
      
      // For component nodes, the key is already handled in renderComponentNode
      return element;
    });
  }
  
  return renderNode(children, registry, context);
}

/**
 * Process props, mapping event handlers and performing any necessary transformations
 */
function processProps(
  props: Record<string, any>,
  context: RenderContext
): Record<string, any> {
  const result: Record<string, any> = {};
  const eventHandlers = context.eventHandlers || {};
  
  // Process each prop
  for (const [key, value] of Object.entries(props)) {
    // Check if it's an event handler (starts with "on" and is a string)
    if (key.startsWith('on') && typeof value === 'string') {
      // Try to find the corresponding function in eventHandlers
      const handler = eventHandlers[value];
      if (typeof handler === 'function') {
        result[key] = handler;
      } else {
        console.warn(`Event handler not found: ${value}`);
        // Still add the prop without transformation
        result[key] = value;
      }
    } else {
      // Regular prop, pass through as is
      result[key] = value;
    }
  }
  
  return result;
} 