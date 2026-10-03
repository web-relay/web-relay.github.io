---
title: SDK installation and API
description: Build and consume the standalone SDK package, and distinguish package artifacts from npm publication.
---

## Distribution status

`@web-relay/sdk` version **0.1.3** provides bundled ESM JavaScript and TypeScript declarations for both PWAs and Chromium extensions, with no runtime npm dependencies. Install the published package in your existing project:

```sh
pnpm add @web-relay/sdk@0.1.3
# or: npm install @web-relay/sdk@0.1.3
```

For development, build and install a tarball from the runtime source.

Use Node.js >=22.12 and pnpm 12.8.1 for reference tooling. Build the development package in the runtime checkout:

```sh
pnpm install --frozen-lockfile
pnpm pack:sdk
```

This creates `artifacts/web-relay-sdk-0.1.3.tgz`. Install it from a separate project:

```sh
pnpm add /absolute/path/to/web-relay/artifacts/web-relay-sdk-0.1.3.tgz
```

CI also uploads a `web-relay-sdk` tarball artifact in the [runtime repository](https://github.com/web-relay/web-relay/actions). Download and install that file when testing development changes. A CI artifact is distinct from an npm release. Tarball installation adds the SDK to your project's package dependencies. Use your existing browser bundler; no workspace TypeScript path aliases or private core/protocol packages are required.

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

Extension `createExtensionProvider` attaches its listener immediately and accepts an asynchronous `register` callback in SDK 0.1.2 or later. Registration is awaited for discovery and execution, so saved workspaces can supply commands. See [commands from saved configuration](/guides/extensions/#commands-from-saved-configuration). Older installed packages may not await registration.

## Pairing and limits

SDK installation does not automatically register a provider with the launcher. Launcher **0.0.2** supports [extension pairing through settings](/guides/extensions/#pair-it-with-the-launcher): check an installed extension ID, review the identity, then approve. Additional pairings are saved locally, with tab-URL sharing off by default. Settings can disable or remove them. New extension pairings need no launcher rebuild.

SDK **0.1.3** responds to `describe` with `{providerId, name, protocolVersion: 1}`, without loading commands or running actions. `createExtensionProvider` accepts optional `name`, defaulting to the provider ID. This allows pairing when no commands are available. Older providers can pair through validated discovery if they expose at least one command.

The provider must still authorize the actual launcher ID. Bundled defaults and [PWA origins](/guides/pwa/) remain in `apps/launcher-extension/src/providers.ts`. PWAs at new hosts still require matching launcher manifest access and a rebuild/reload. This release does not scan installed extensions or add general input schemas, workflow composition, or PWA enrollment UI.

## Coding agents

The SDK includes `skills/web-relay-integration/SKILL.md`. Copy the skill directory from `node_modules/@web-relay/sdk/skills/web-relay-integration` into your project's `.agents/skills/` or your agent's supported skill directory. The reference repository's `AGENTS.md` points to it. An agent can use it to integrate an existing extension or PWA, select the correct API, pair identities/origins, and verify discovery and invocation.

A useful request is:

> Use the web-relay-integration skill to add launcher capabilities to this project. Inspect the installed SDK and existing app first, keep action functions in the app, register the required actions, and explain the launcher pairing changes. Verify discovery and execution without performing live account writes.

## Validation and release

`pnpm test:sdk` packs the SDK and installs it offline in an isolated project. It checks public imports and declarations, PWA messaging, extension discovery/execution, and sender rejection. CI runs this alongside the real Chromium showcase tests.

The runtime's `Publish SDK release` GitHub Actions workflow runs the required checks and publishes through npm trusted publishing. A tarball or CI artifact is not an npm release; publication requires a new package version and an explicit release decision.
