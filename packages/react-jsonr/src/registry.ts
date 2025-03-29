import React from 'react';
import { createPortal } from 'react-dom';
import { ComponentRegistry, FRAGMENT, PORTAL } from './types';

// Define the base registry with special components
const baseRegistry = {
  [FRAGMENT]: React.Fragment,
  [PORTAL]: ({ container, children }: { container: string | Element, children: React.ReactNode }) => {
    let targetContainer: Element | DocumentFragment;
    
    if (typeof container === 'string') {
      const foundElement = document.querySelector(container);
      if (!foundElement) {
        console.warn(`Portal container not found: ${container}`);
        targetContainer = document.body;
      } else {
        targetContainer = foundElement;
      }
    } else {
      targetContainer = container || document.body;
    }
      
    return createPortal(children, targetContainer);
  }
};

/**
 * Creates a registry by merging custom components with automatic HTML element handling.
 * 
 * This function creates a registry that:
 * 1. Uses your custom components for registered types
 * 2. Automatically handles Fragment and Portal special components
 * 3. Treats any other string type as an HTML element (including custom elements)
 * 
 * Note: String-based component types like 'div', 'span', or even 'custom-element'
 * will be rendered as HTML elements. If you want to prevent certain string types
 * from becoming elements, you need to override them in your custom components.
 */
export function createRegistry(customComponents: ComponentRegistry = {}): ComponentRegistry {
  // Create a new proxy that first checks custom components, then falls back to defaults
  return new Proxy(customComponents, {
    get: (target, prop: string | symbol) => {
      // First check if the property is in custom components
      if (prop in target) {
        return Reflect.get(target, prop);
      }
      
      // Then check if it's one of our special components
      if (typeof prop === 'string' && prop in baseRegistry) {
        return baseRegistry[prop as keyof typeof baseRegistry];
      }
      
      // For string properties, return the property name to create HTML elements
      // This effectively enables ALL HTML elements including custom elements
      return typeof prop === 'string' ? prop : undefined;
    }
  });
} 