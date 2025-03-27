import React, { ReactNode, createElement } from 'react';
import { JsonNode, ComponentRegistry, RenderContext } from './types';

/**
 * Renders a JSON node to a React element
 */
export function renderNode(
  node: JsonNode,
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
  
  // Recursively render children if they exist
  let children: ReactNode[] = [];
  if (node.children && node.children.length > 0) {
    children = node.children.map((child, index) => 
      renderNode(child, registry, context)
    );
  }
  
  // Create the React element
  return createElement(
    component,
    processedProps,
    ...(children.length > 0 ? children : [])
  );
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