import type { TransformVisitor, JsonNode, TransformContext } from 'react-jsonr';

export interface EventHandlerPluginOptions {
  /**
   * Map of event handler names to functions
   */
  handlers: Record<string, Function>;
  
  /**
   * Custom prefix for event handlers (default: 'on')
   */
  prefix?: string;
  
  /**
   * Whether to warn when an event handler is not found (default: true)
   */
  warnOnMissing?: boolean;
}

/**
 * Creates a transform visitor that maps string event handlers to functions
 */
export function createEventHandlerPlugin(options: EventHandlerPluginOptions): TransformVisitor {
  const { 
    handlers, 
    prefix = 'on',
    warnOnMissing = true
  } = options;
  
  return {
    enter(node: JsonNode, context: TransformContext) {
      // Only process component nodes with props
      if (typeof node !== 'object' || node === null || Array.isArray(node)) {
        return;
      }
      
      const componentNode = node as { type: string; props?: Record<string, any> };
      if (!componentNode.props) {
        return;
      }
      
      // Look for props that start with the prefix and have string values
      for (const [key, value] of Object.entries(componentNode.props)) {
        if (key.startsWith(prefix) && typeof value === 'string') {
          // Try to find the corresponding function in handlers
          const handler = handlers[value];
          if (typeof handler === 'function') {
            componentNode.props[key] = handler;
          } else if (warnOnMissing) {
            console.warn(`Event handler not found: ${value}`);
          }
        }
      }
    }
  };
}

/**
 * Default export - a function that creates the event handler plugin
 */
export default createEventHandlerPlugin; 