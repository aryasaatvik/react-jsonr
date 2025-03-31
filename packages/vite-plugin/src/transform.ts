import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';

interface SerializableJsonNode {
  type: string;
  props: Record<string, any>;
  children: (string | SerializableJsonNode)[];
}

interface TransformResult {
  code: string;
}

function expressionToSerializable(expr: t.Expression): any {
  if (t.isStringLiteral(expr)) {
    return expr.value;
  }
  if (t.isNumericLiteral(expr) || t.isBooleanLiteral(expr)) {
    return expr.value;
  }
  if (t.isNullLiteral(expr)) {
    return null;
  }
  if (t.isObjectExpression(expr)) {
    const obj: Record<string, any> = {};
    expr.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        obj[prop.key.name] = expressionToSerializable(prop.value as t.Expression);
      }
    });
    return obj;
  }
  if (t.isArrayExpression(expr)) {
    return expr.elements.map(el => expressionToSerializable(el as t.Expression));
  }
  const { code } = generate(expr);
  return code;
}

function convertJsxAttributeValue(value: t.JSXAttribute['value']): any {
  if (t.isStringLiteral(value)) {
    return value.value;
  }
  if (t.isJSXExpressionContainer(value)) {
    if (t.isExpression(value.expression)) {
      return expressionToSerializable(value.expression);
    }
  }
  if (t.isJSXElement(value)) {
    return buildSerializableJson(value);
  }
  return true;
}

function buildSerializableJson(node: t.JSXElement): SerializableJsonNode {
  const jsonNode: SerializableJsonNode = {
    type: '',
    props: {},
    children: [],
  };

  if (t.isJSXIdentifier(node.openingElement.name)) {
    jsonNode.type = node.openingElement.name.name;
  } else if (t.isJSXMemberExpression(node.openingElement.name)) {
    jsonNode.type = generate(node.openingElement.name).code;
  } else {
    jsonNode.type = 'Unknown';
  }

  node.openingElement.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      const name = attr.name.name;
      jsonNode.props[name] = convertJsxAttributeValue(attr.value);
    }
  });

  node.children.forEach((child) => {
    if (t.isJSXText(child)) {
      const text = child.value.trim();
      if (text) {
        jsonNode.children.push(text);
      }
    } else if (t.isJSXElement(child)) {
      jsonNode.children.push(buildSerializableJson(child));
    } else if (t.isJSXExpressionContainer(child) && t.isExpression(child.expression)) {
      jsonNode.children.push(expressionToSerializable(child.expression));
    }
  });

  return jsonNode;
}

export function transformJsxToJson(code: string, id: string): TransformResult {
  let rootJsonNode: SerializableJsonNode | null = null;

  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  });

  traverse(ast, {
    JSXElement(path) {
      if (!path.findParent((p) => p.isJSXElement())) {
        rootJsonNode = buildSerializableJson(path.node);
        path.stop();
      }
    },
  });

  if (!rootJsonNode) {
    return { code: '' };
  }

  const jsonCode = JSON.stringify(rootJsonNode, null, 2);

  return {
    code: jsonCode,
  };
} 