---
title: Capabilities and context
description: A proposed TypeScript capability model and context-aware command registration.
---

A capability has a stable identifier, a human-readable title, optional input metadata, an availability rule, and an execution function.

:::caution[Illustrative API]
The examples describe the intended developer experience. They are not a working SDK tutorial. Types and method names may change before implementation.
:::

## Proposed model

```ts
// Supporting types below are illustrative, not a finalized schema.
type JsonSchema = Record<string, unknown>;

interface CapabilityContext {
  app?: string;
  route?: string;
  context?: Record<string, unknown>;
}

interface Capability {
  id: string;
  title: string;
  description?: string;
  keywords?: string[];
  icon?: string;
  inputSchema?: JsonSchema;
  when?: (context: CapabilityContext) => boolean;
  run(input: unknown, context: CapabilityContext): Promise<unknown>;
}
```

The registry’s proposed API includes `register`, `unregister`, `getCommands`, `execute`, and `subscribe`.

## Register once

```ts
// Assume launcher is a registry and saveTimestamp is app-owned logic.
launcher.register({
  id: 'podcast.save-timestamp',
  title: 'Save current timestamp',
  keywords: ['episode', 'bookmark'],
  when: ({ context }) => typeof context?.episodeId === 'string',
  run: async (_input, { context }) => {
    return saveTimestamp(context!.episodeId);
  },
});
```

The same registration should power the local palette and global browser launcher. Before execution, the runtime must recheck availability and validate input; hiding an action in search alone is not sufficient.

## App-provided context

```ts
const currentContext = {
  app: 'podcast',
  route: '/episode/42',
  context: {
    episodeId: '42',
    playing: true,
  },
};
```

Context can filter commands, help rank active-tab actions, and pass known information into app-owned functions. Applications should publish only the context needed for the intended capability.

## Availability examples

- Episode actions appear when an episode is open.
- Customer actions appear on relevant customer routes.
- Repository actions use the current repository.
- General browser actions remain available where permitted.

Context should update as the route or application state changes. Handling stale state, disconnected tabs, registration cleanup, duplicate IDs, cancellation, and execution errors remains part of protocol design.
