import { JsonNode, TransformVisitor, TransformContext, TransformOptions } from './types';

/**
 * Default transform options
 */
const defaultOptions: TransformOptions = {
  order: 'depthFirstPre',
  clone: true,
};

/**
 * Creates a transform context object for a node
 */
function createContext(
  node: JsonNode,
  parent: JsonNode | null,
  index: number,
  depth: number
): TransformContext {
  let skipChildrenFlag = false;
  
  return {
    depth,
    parent,
    index,
    skipChildren() {
      skipChildrenFlag = true;
    },
    get shouldSkipChildren() {
      return skipChildrenFlag;
    },
  };
}

/**
 * Transforms a JSON tree using provided visitors
 */
export async function transformJsonTree(
  root: JsonNode,
  visitors: TransformVisitor[],
  options: TransformOptions = defaultOptions
): Promise<JsonNode> {
  // Clone the input only if requested (default) to avoid mutating the original
  const rootNode = options.clone ?? defaultOptions.clone 
    ? JSON.parse(JSON.stringify(root))
    : root;
  
  // Use depth-first pre-order traversal by default
  const order = options.order || defaultOptions.order;
  
  switch (order) {
    case 'depthFirstPre':
      await depthFirstPreOrder(rootNode, visitors);
      break;
    case 'depthFirstPost':
      await depthFirstPostOrder(rootNode, visitors);
      break;
    case 'breadthFirst':
      await breadthFirst(rootNode, visitors);
      break;
    default:
      await depthFirstPreOrder(rootNode, visitors);
  }
  
  return rootNode;
}

/**
 * Performs depth-first pre-order traversal of the JSON tree
 */
async function depthFirstPreOrder(
  node: JsonNode, 
  visitors: TransformVisitor[],
  parent: JsonNode | null = null,
  index = 0,
  depth = 0
): Promise<void> {
  // Create context for this node
  const context = createContext(node, parent, index, depth);
  
  // Run enter visitors
  for (const visitor of visitors) {
    if (visitor.enter) {
      await visitor.enter(node, context);
    }
  }
  
  // Process children if they exist and are not skipped
  if (node.children && !context.shouldSkipChildren) {
    for (let i = 0; i < node.children.length; i++) {
      await depthFirstPreOrder(node.children[i], visitors, node, i, depth + 1);
    }
  }
  
  // Run exit visitors
  for (const visitor of visitors) {
    if (visitor.exit) {
      await visitor.exit(node, context);
    }
  }
}

/**
 * Performs depth-first post-order traversal of the JSON tree
 */
async function depthFirstPostOrder(
  node: JsonNode, 
  visitors: TransformVisitor[],
  parent: JsonNode | null = null,
  index = 0,
  depth = 0
): Promise<void> {
  // Create context for this node
  const context = createContext(node, parent, index, depth);
  
  // Process children first if they exist and are not skipped
  if (node.children && !context.shouldSkipChildren) {
    for (let i = 0; i < node.children.length; i++) {
      await depthFirstPostOrder(node.children[i], visitors, node, i, depth + 1);
    }
  }
  
  // Run enter visitors
  for (const visitor of visitors) {
    if (visitor.enter) {
      await visitor.enter(node, context);
    }
  }
  
  // Run exit visitors
  for (const visitor of visitors) {
    if (visitor.exit) {
      await visitor.exit(node, context);
    }
  }
}

/**
 * Performs breadth-first traversal of the JSON tree
 */
async function breadthFirst(
  root: JsonNode, 
  visitors: TransformVisitor[]
): Promise<void> {
  const queue: Array<{
    node: JsonNode;
    parent: JsonNode | null;
    index: number;
    depth: number;
  }> = [{ node: root, parent: null, index: 0, depth: 0 }];
  
  while (queue.length > 0) {
    const { node, parent, index, depth } = queue.shift()!;
    const context = createContext(node, parent, index, depth);
    
    // Run visitors (enter only, as exit doesn't make sense in BFS)
    for (const visitor of visitors) {
      if (visitor.enter) {
        await visitor.enter(node, context);
      }
    }
    
    // Add children to queue if they exist and are not skipped
    if (node.children && !context.shouldSkipChildren) {
      for (let i = 0; i < node.children.length; i++) {
        queue.push({
          node: node.children[i],
          parent: node,
          index: i,
          depth: depth + 1
        });
      }
    }
  }
}

/**
 * Options for JSON tree traversal using generator
 */
export interface TraverseOptions extends TransformOptions {
  nodeTypes?: string[];  // Types of nodes to yield (empty = all)
}

/**
 * Generator function that traverses a JSON tree and yields each node
 * Allows the caller to modify nodes during traversal
 */
export function* traverseJsonTree(
  root: JsonNode,
  options: TraverseOptions = {}
): Generator<{node: JsonNode, context: TransformContext}, void, void> {
  // Clone the input if requested (default: false for traverseJsonTree)
  const shouldClone = options.clone !== undefined ? options.clone : false;
  const rootNode = shouldClone 
    ? JSON.parse(JSON.stringify(root))
    : root;
    
  // Use depth-first pre-order traversal by default
  const order = options.order || defaultOptions.order;
  
  switch (order) {
    case 'depthFirstPre':
      yield* traverseDepthFirstPre(rootNode, options.nodeTypes);
      break;
    case 'depthFirstPost':
      yield* traverseDepthFirstPost(rootNode, options.nodeTypes);
      break;
    case 'breadthFirst':
      yield* traverseBreadthFirst(rootNode, options.nodeTypes);
      break;
    default:
      yield* traverseDepthFirstPre(rootNode, options.nodeTypes);
  }
}

/**
 * Generator for depth-first pre-order traversal
 */
function* traverseDepthFirstPre(
  node: JsonNode, 
  nodeTypes?: string[],
  parent: JsonNode | null = null,
  index = 0,
  depth = 0
): Generator<{node: JsonNode, context: TransformContext}, void, void> {
  // Create context for this node
  const context = createContext(node, parent, index, depth);
  
  // Yield the node if it matches the filter or if no filter is provided
  if (!nodeTypes || nodeTypes.length === 0 || nodeTypes.includes(node.type)) {
    yield { node, context };
  }
  
  // Process children if they exist and are not skipped
  if (node.children && !context.shouldSkipChildren) {
    for (let i = 0; i < node.children.length; i++) {
      yield* traverseDepthFirstPre(node.children[i], nodeTypes, node, i, depth + 1);
    }
  }
}

/**
 * Generator for depth-first post-order traversal
 */
function* traverseDepthFirstPost(
  node: JsonNode, 
  nodeTypes?: string[],
  parent: JsonNode | null = null,
  index = 0,
  depth = 0
): Generator<{node: JsonNode, context: TransformContext}, void, void> {
  // Create context for this node
  const context = createContext(node, parent, index, depth);
  
  // Process children first if they exist and are not skipped
  if (node.children && !context.shouldSkipChildren) {
    for (let i = 0; i < node.children.length; i++) {
      yield* traverseDepthFirstPost(node.children[i], nodeTypes, node, i, depth + 1);
    }
  }
  
  // Yield the node if it matches the filter or if no filter is provided
  if (!nodeTypes || nodeTypes.length === 0 || nodeTypes.includes(node.type)) {
    yield { node, context };
  }
}

/**
 * Generator for breadth-first traversal
 */
function* traverseBreadthFirst(
  root: JsonNode, 
  nodeTypes?: string[]
): Generator<{node: JsonNode, context: TransformContext}, void, void> {
  const queue: Array<{
    node: JsonNode;
    parent: JsonNode | null;
    index: number;
    depth: number;
  }> = [{ node: root, parent: null, index: 0, depth: 0 }];
  
  while (queue.length > 0) {
    const { node, parent, index, depth } = queue.shift()!;
    const context = createContext(node, parent, index, depth);
    
    // Yield the node if it matches the filter or if no filter is provided
    if (!nodeTypes || nodeTypes.length === 0 || nodeTypes.includes(node.type)) {
      yield { node, context };
    }
    
    // Add children to queue if they exist and are not skipped
    if (node.children && !context.shouldSkipChildren) {
      for (let i = 0; i < node.children.length; i++) {
        queue.push({
          node: node.children[i],
          parent: node,
          index: i,
          depth: depth + 1
        });
      }
    }
  }
} 