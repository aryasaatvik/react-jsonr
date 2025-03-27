import { JsonNode, TransformVisitor, TransformContext, TransformOptions } from './types';

/**
 * Default transform options
 */
const defaultOptions: TransformOptions = {
  order: 'depthFirstPre',
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
  // Clone the input to avoid mutating the original
  const rootCopy = JSON.parse(JSON.stringify(root));
  
  // Use depth-first pre-order traversal by default
  const order = options.order || defaultOptions.order;
  
  switch (order) {
    case 'depthFirstPre':
      await depthFirstPreOrder(rootCopy, visitors);
      break;
    case 'depthFirstPost':
      await depthFirstPostOrder(rootCopy, visitors);
      break;
    case 'breadthFirst':
      await breadthFirst(rootCopy, visitors);
      break;
    default:
      await depthFirstPreOrder(rootCopy, visitors);
  }
  
  return rootCopy;
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