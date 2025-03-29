import { ReactNode, ComponentType } from 'react';

/**
 * Base type for all possible nodes in the JSON representation
 */
export type JsonNode = 
  | string
  | number
  | boolean
  | null
  | undefined
  | ComponentNode
  | JsonNode[]; // For arrays of nodes

/**
 * Component node with type and props
 */
export interface ComponentNode {
  type: string;
  props?: Record<string, any>;
  children?: JsonNode | JsonNode[];
  key?: string;
  id?: string;
}

/**
 * Registry of allowed component types
 */
export type ComponentRegistry = { 
  [typeName: string]: ComponentType<any> | string 
};

/**
 * Context passed to transform visitors
 */
export interface TransformContext {
  depth: number;
  parent: ComponentNode | null;
  index: number;
  skipChildren(): void;
  [key: string]: any;
}

/**
 * Visitor interface for transform plugins
 */
export interface TransformVisitor {
  enter?(node: JsonNode, context: TransformContext): JsonNode | void | Promise<JsonNode | void>;
  exit?(node: JsonNode, context: TransformContext): JsonNode | void | Promise<JsonNode | void>;
}

/**
 * Options for transform operations
 */
export interface TransformOptions {
  order?: 'depthFirstPre' | 'depthFirstPost' | 'breadthFirst';
  clone?: boolean;  // Whether to clone the input object before transforming (default: true)
}

/**
 * Context for renderNode
 */
export interface RenderContext {
  eventHandlers?: Record<string, Function>;
  [key: string]: any;
}

/**
 * Built-in component types
 */
export const FRAGMENT = 'Fragment';
export const PORTAL = 'Portal';

/**
 * Type guard to check if a node is a ComponentNode
 */
export function isComponentNode(node: JsonNode): node is ComponentNode {
  return node !== null && 
    typeof node === 'object' && 
    !Array.isArray(node) && 
    typeof (node as ComponentNode).type === 'string';
}

/**
 * Type guard to check if a node is a primitive (string, number, boolean, null, undefined)
 */
export function isPrimitiveNode(node: JsonNode): node is string | number | boolean | null | undefined {
  return node === null || 
    node === undefined || 
    typeof node === 'string' || 
    typeof node === 'number' || 
    typeof node === 'boolean';
}

/**
 * Type guard to check if a node is an array of nodes
 */
export function isArrayNode(node: JsonNode): node is JsonNode[] {
  return Array.isArray(node);
}

/**
 * Creates a component node from the provided type, props, and children
 */
export function createComponentNode(
  type: string, 
  props?: Record<string, any>, 
  children?: JsonNode | JsonNode[],
  key?: string,
  id?: string
): ComponentNode {
  return {
    type,
    ...(props ? { props } : {}),
    ...(children !== undefined ? { children } : {}),
    ...(key ? { key } : {}),
    ...(id ? { id } : {})
  };
}

/**
 * Creates a fragment node with the provided children
 */
export function createFragment(
  children: JsonNode | JsonNode[],
  key?: string
): ComponentNode {
  return createComponentNode(FRAGMENT, {}, children, key);
}

/**
 * Creates a portal node with the provided container and children
 */
export function createPortal(
  container: string | Element,
  children: JsonNode | JsonNode[],
  key?: string
): ComponentNode {
  return createComponentNode(PORTAL, { container }, children, key);
} 