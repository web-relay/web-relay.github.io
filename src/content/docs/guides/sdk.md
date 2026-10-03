---
title: SDK installation and API
description: Build and consume the standalone SDK package, and distinguish package artifacts from npm publication.
---

## Distribution status

`@web-relay/sdk` version **0.1.0** builds bundled ESM JavaScript and TypeScript declarations for both PWAs and Chromium extensions. It has no runtime npm dependencies. It is **not published on npm**. The earlier showcase bundled workspace TypeScript source directly; a separate package build and tarball are now available.

Use Node.js >=22.12 and pnpm 12.8.1 for reference tooling. Build the development package in the runtime checkout:

```sh
pnpm install --frozen-lockfile
pnpm pack:sdk
```

This creates `artifacts/web-relay-sdk-0.1.0.tgz`. Install it from a separate project:

```sh
pnpm add /absolute/path/to/web-relay/artifacts/web-relay-sdk-0.1.0.tgz
```

CI also uploads a `web-relay-sdk` tarball artifact in the [runtime repository](https://github.com/web-relay/web-relay/actions). Download and install that file; do not assume `pnpm add @web-relay/sdk` will work until an npm release exists. Tarball installation adds the SDK to your project's package dependencies. Use your existing browser bundler; no workspace TypeScript path aliases or private core/protocol packages are required.

## Public APIs

| Import | Use |
| --- | --- |
| `createLauncher` from `@web-relay/sdk` | A PWA registry and same-origin page bridge. |
| `Registry`, `CapabilityError` from `@web-relay/sdk` | Local palette execution and actionable errors. |
| `Capability`, `CapabilityDescriptor`, `JsonValue`, `ProviderKind` from `@web-relay/sdk` | Public TypeScript types. |
| `createExtensionProvider`, `LAUNCHER_ID` from `@web-relay/sdk/extension` | Extension discovery and invocation listener. |
| `TabContext`, `JsonValue`, `CapabilityError` from `@web-relay/sdk/extension` | Extension action context, results, and errors. |

The exported `LAUNCHER_ID` identifies the current local development launcher. Pair against the actual installed launcher's identity; this is not a universal production ID.

Capabilities use `id`, `title`, optional `description`, optional `input: 'text'`, optional `when(context)`, and `run(context, input)`. IDs begin with a lowercase letter and contain lowercase letters, digits, dots, or hyphens, up to 80 characters. Titles are nonblank and at most 120 characters. Text input is nonblank and at most 2000 characters. Functions and live app state remain in the provider. Results are JSON or void; a thrown `CapabilityError(code, message)` is returned to the launcher. Missing replies do not prove success, and timeouts do not cancel actions.

## Pairing and limits

SDK installation does not automatically register a provider with the launcher. The explicit local configuration is `apps/launcher-extension/src/providers.ts`. [Extension pairing](/guides/extensions/) requires the actual provider extension ID. [PWA pairing](/guides/pwa/) requires an exact origin and provider ID, plus matching launcher manifest access. Rebuild and reload the launcher after editing these files.

This configuration centralizes discovery and routing; it is not a user-facing enrollment UI or automatic scan of installed extensions. General schemas, workflow composition, and production enrollment remain deferred.

## Coding agents

The SDK includes `skills/web-relay-integration/SKILL.md`. Copy the skill directory from `node_modules/@web-relay/sdk/skills/web-relay-integration` into your project's `.agents/skills/` or your agent's supported skill directory. The reference repository's `AGENTS.md` points to it. An agent can use it to integrate an existing extension or PWA, select the correct API, pair identities/origins, and verify discovery and invocation.

A useful request is:

> Use the web-relay-integration skill to add launcher capabilities to this project. Inspect the installed SDK and existing app first, keep action functions in the app, register the required actions, and explain the launcher pairing changes. Verify discovery and execution without performing live account writes.

## Validation and release

`pnpm test:sdk` packs the SDK and installs it offline in an isolated project. It checks public imports and declarations, PWA messaging, extension discovery/execution, and sender rejection. CI runs this alongside the real Chromium showcase tests.

npm publication remains a separate release step requiring an authorized account for the `@web-relay` scope. A tarball or CI artifact is not an npm release; publication should use the tested package and an explicit version/release decision.
