# React JSONR Monorepo

A monorepo for React JSONR - a library that allows you to create React components from JSON definitions.

## Repository Structure

- `packages/react-jsonr/` - The core library
- `apps/docs/` - Documentation website built with Next.js and Fumadocs

## Getting Started

This repository uses [pnpm](https://pnpm.io/) for package management.

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run the documentation site
pnpm docs:dev
```

## Core Concepts

React JSONR is built around a few key concepts:

1. **JSON Nodes** - A JSON structure describing UI components with their properties and children
2. **Component Registry** - A whitelist of allowed components that can be referenced in the JSON
3. **Transformation Pipeline** - A system to process and modify the JSON before rendering
4. **Plugins** - Modular transformers that can alter the JSON tree
5. **Event Handler Mapping** - A secure approach to map string-based event references to actual functions

## Documentation

For detailed documentation, visit the documentation site by running `pnpm docs:dev` or see the README in the [packages/react-jsonr](packages/react-jsonr) directory.

## License

MIT 