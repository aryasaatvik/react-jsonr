# @react-jsonr/vite-plugin

A Vite plugin that transforms JSX/TSX files into JSON format compatible with react-jsonr.

## Installation

```bash
# npm
npm install @react-jsonr/vite-plugin

# yarn
yarn add @react-jsonr/vite-plugin

# pnpm
pnpm add @react-jsonr/vite-plugin
```

## Usage

Add the plugin to your Vite configuration:

```ts
import { defineConfig } from 'vite';
import reactJsonr from '@react-jsonr/vite-plugin';

export default defineConfig({
  plugins: [
    reactJsonr({
      // Optional configuration
      include: ['**/*.{jsx,tsx}'], // Files to transform
      exclude: ['node_modules/**', 'dist/**'], // Files to skip
      sourcemap: true, // Whether to generate source maps
    }),
  ],
});
```

## Example

Input JSX file (`App.tsx`):
```tsx
function App() {
  return (
    <div className="container">
      <h1>Hello World</h1>
      <p>This is a test</p>
    </div>
  );
}

export default App;
```

Transformed output:
```json
{
  "type": "div",
  "props": {
    "className": "container"
  },
  "children": [
    {
      "type": "h1",
      "props": {},
      "children": ["Hello World"]
    },
    {
      "type": "p",
      "props": {},
      "children": ["This is a test"]
    }
  ]
}
```

## Features

- Transforms JSX/TSX files to JSON format
- Supports nested components
- Handles props and children
- Generates source maps
- Configurable file inclusion/exclusion patterns
- TypeScript support

## License

MIT 