import { ReactNode, ComponentType } from 'react';

/**
 * Represents a JSON node that can be rendered to a React component
 */
export interface JsonNode {
  type: string;
  props?: Record<string, any>;
  children?: JsonNode[];
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
  parent: JsonNode | null;
  index: number;
  skipChildren(): void;
  [key: string]: any;
}

/**
 * Visitor interface for transform plugins
 */
export interface TransformVisitor {
  enter?(node: JsonNode, context: TransformContext): void | Promise<void>;
  exit?(node: JsonNode, context: TransformContext): void | Promise<void>;
}

/**
 * Options for transform operations
 */
export interface TransformOptions {
  order?: 'depthFirstPre' | 'depthFirstPost' | 'breadthFirst';
}

/**
 * Context for renderNode
 */
export interface RenderContext {
  eventHandlers?: Record<string, Function>;
  [key: string]: any;
} 