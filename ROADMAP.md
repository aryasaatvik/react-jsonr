# React JSON-R Roadmap

This document outlines the planned features and improvements for `react-jsonr` as we work towards making it the standard for rendering React components from JSON data.

## Phase 1: Core Enhancements & Foundation

*   **Schema Validation:**
    *   Adopt the **Standard Schema** interface ([standardschema.dev](https://standardschema.dev/)).
    *   Allow users to pass any Standard Schema compliant validator (e.g., Zod, Valibot, ArkType) via an optional `schema` prop.
    *   Validate input JSON against the provided schema before transformation/rendering.
    *   Provide clear validation error messages based on the standardized `FailureResult.issues`.
*   **Plugin Architecture:**
    *   Define a clear `ReactJsonrPlugin` interface (in `types.ts`).
        *   Plugins can provide `TransformVisitor` objects.
        *   Plugins can register components (`ComponentRegistry`).
    *   Refactor core rendering logic to accept an array of `plugins`.
    *   Collect and run visitors via `transformJsonTree`.
    *   Merge plugin components into the main registry.
    *   **Proof-of-Concept:** Build a simple logger plugin (`@react-jsonr/plugin-logger`).
*   **Improved Error Handling & Debugging:**
    *   Enhance runtime error messages (unknown components, rendering errors) with more context (component type, JSON path).
    *   Implement a `debug` prop for verbose logging during transformation and rendering.
    *   Add specific error types for easier catching and handling.

## Phase 2: Integrations & Developer Experience

*   **CMS Integrations (Plugins):**
    *   Develop dedicated plugin packages (`@react-jsonr/plugin-sanity`, `@react-jsonr/plugin-contentful`, etc.).
    *   Plugins will handle:
        *   Data transformation (CMS structure -> `react-jsonr` structure).
        *   Component registration for CMS-specific elements (e.g., Portable Text, Rich Text blocks).
    *   **Initial Targets:** Sanity, Contentful.
    *   **Future Targets:** Strapi, Storyblok, Kontent.ai, etc.
*   **Documentation Overhaul (`apps/docs`):**
    *   Use a modern documentation generator (e.g., Nextra, Docusaurus).
    *   Comprehensive "Getting Started" guide.
    *   Detailed API Reference (Rendering, Transformation, Types, Plugins).
    *   Plugin Development Guide.
    *   Recipes & Examples for common patterns (conditionals, loops, CMS usage).
    *   Consider live, interactive examples.
*   **Storybook Addon (`@react-jsonr/storybook-addon`):**
    *   Allow rendering components within Storybook stories directly from a JSON source (URL, local file, text input).
    *   Integrate with Storybook controls/args to potentially manipulate the input JSON or select different sources.
    *   Greatly simplifies testing and visualizing components designed for CMS integration.

## Phase 3: Advanced Features & Optimization

*   **Advanced Rendering Capabilities (via Transformation Plugins):**
    *   Standardize patterns for conditional rendering (`renderIf` prop?).
    *   Explore helpers/visitors for complex list/looping scenarios.
    *   Investigate context propagation mechanisms.
    *   Explore component composition/"slot" patterns defined in JSON.
*   **Performance Optimization:**
    *   Establish performance benchmarks.
    *   Investigate memoization strategies within the rendering process.
    *   Explore potential for lazy-loading components or parts of the JSON tree.
*   **CLI Tool (`@react-jsonr/cli`):**
    *   JSON validation against a schema.
    *   Project bootstrapping helper.
    *   Potential code generation/scaffolding for plugins or components.

## Guiding Principles

*   **Developer Experience:** Prioritize ease of use, clear errors, and excellent documentation.
*   **Extensibility:** The plugin architecture should be robust and flexible.
*   **Performance:** Keep the core rendering fast and efficient.
*   **Maintainability:** Ensure the codebase remains clean and well-tested.

---

This roadmap is a living document and priorities may shift based on feedback and development progress. 