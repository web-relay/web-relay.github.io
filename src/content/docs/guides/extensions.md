---
title: Enable an extension provider
description: Add capabilities to an existing Chromium extension with the SDK and explicitly pair it with the launcher.
---

Keep your extension in its own folder or repository. Install the [SDK](/guides/sdk/) in that project and use its existing browser bundler. The launcher does not require the example PWA or GitHub provider.

## Register in the service worker

At worker startup, call `createExtensionProvider` synchronously to attach the external listener. Its `register` callback and action functions may be asynchronous:

```ts
import {
  createExtensionProvider,
  LAUNCHER_ID,
  CapabilityError,
} from '@web-relay/sdk/extension';

createExtensionProvider({
  providerId: 'my-extension',
  name: 'My extension',
  launcherId: LAUNCHER_ID,
  register(registry) {
    registry.register({
      id: 'my-extension.open-help',
      title: 'Open help for this page',
      when: context => !!context && /^https?:\/\//.test(context.url),
      run: async context => {
        if (!context) throw new CapabilityError('NO_CONTEXT', 'Open a website first.');
        await chrome.tabs.create({
          url: 'https://example.com/help?url=' + encodeURIComponent(context.url),
        });
        return { message: 'Opened help.' };
      },
    });
  },
});
```

Choose your own provider/capability IDs and application behavior. `context` is an optional `{ tabId, url }` snapshot. The SDK verifies that supplied context still matches the active tab before discovery/execution. Re-evaluate application state in `when` or your action; the SDK does not own your domain state.

For `input: 'text'` commands, `run(context, input)` receives the validated text. Results must be JSON or void. Keep errors actionable. A timeout is not cancellation, so do not automatically repeat an account write after an uncertain result.

## Commands from saved configuration

You can read browser storage directly inside `register`. The SDK awaits the callback before listing or executing commands, with a new registry for each request. Call `createExtensionProvider` at the top level; do not await storage before calling it.

```ts
createExtensionProvider({
  providerId: 'workspaces',
  launcherId: LAUNCHER_ID, // Replace with your paired launcher's actual ID.
  async register(registry) {
    // This extension owns and validates the saved workspace schema.
    const workspaces = await loadSavedWorkspaces();
    for (const workspace of workspaces.filter(item => item.enabled)) {
      registry.register({
        id: `workspaces.open-${workspace.id}`,
        title: `Open ${workspace.name}`,
        run: () => openWorkspace(workspace.id),
      });
    }
  },
});
```

`loadSavedWorkspaces` and `openWorkspace` are your extension's functions. Use stable IDs that satisfy the capability ID rules, and keep titles within 120 characters. The launcher accepts at most 50 commands per provider. Validate saved configuration rather than silently truncating the list.

Registration runs on discovery and again on execution. A removed or disabled workspace is therefore absent from the execution registry and returns `NOT_FOUND`. Thrown registration errors are returned using the same error contract as action failures; use `CapabilityError` for an actionable message. Keep registration free of action side effects and fast enough for the launcher's three-second response timeout. Requests may overlap, so keep request-specific data in the callback rather than a shared mutable registry.

Supplied tab context is checked before and after registration. Changes made after registration, including during the action itself, still require provider-owned checks when relevant. The launcher refreshes on open, manual refresh, and after invocation; saved changes do not automatically update an already-open palette.

Async registration requires SDK **0.1.2 or later**. Install it with `pnpm add @web-relay/sdk@0.1.2`, or build a development tarball from the [runtime source](https://github.com/web-relay/web-relay/blob/main/packages/sdk/src/extension.ts). Older installed SDKs do not await registration.

## Manifest and build

Merge these fields into your existing Manifest V3 manifest:

```json
{
  "manifest_version": 3,
  "background": { "service_worker": "background.js", "type": "module" },
  "permissions": ["tabs"],
  "externally_connectable": {
    "ids": ["ofefgdigmcogchpijmpljpkkbkgdcedd"]
  }
}
```

This is a manifest fragment, not a complete extension manifest. Preserve your app's name/version and required permissions. `tabs` lets the SDK validate supplied tab URLs. Add action-specific host permissions only when the action needs them. The manifest ID above and `launcherId` must match the actual installed launcher.

Bundle the SDK into the worker using your existing build. Install the resulting extension via `chrome://extensions` → Developer mode → Load unpacked. Read its actual extension ID there. A stable manifest public key can preserve a development ID across source-folder moves; it does not provide production enrollment or protect modified local source.

## Pair it with the launcher

Install [launcher 0.0.2 or later](https://github.com/web-relay/web-relay/releases/tag/launcher-v0.0.2) once to enable settings-based pairing. Open **Capability sources → Manage extension providers**, or open the launcher's **Options** page from `chrome://extensions`.

1. Paste the provider's installed 32-letter extension ID.
2. Select **Check connection**. The launcher checks the protocol response and reported identity without sharing tab context or executing an action.
3. Review the name, provider ID, extension ID, and protocol version. Names are self-reported: compare the extension ID with the extension you installed.
4. Choose whether to **Share the current tab's URL**. This is off by default. If enabled, the provider receives the tab ID and full URL on discovery and execution; page contents are not shared.
5. Select **Approve pairing**, then refresh the launcher to discover commands.

Approved pairings are saved in this browser profile and survive browser/service-worker restarts. Adding another extension does not require source edits or rebuilding the launcher. Settings lets you disable, enable, or remove saved pairings. Removing/disabling a provider prevents future invocation of its old displayed commands; it does not cancel an action already delivered. To change URL sharing, remove the pairing and approve it again with the desired choice.

The provider must still allow the launcher's actual ID in both its manifest and SDK `launcherId`. A failed connection check points to an unloaded extension, mismatched IDs, or an incompatible/malformed protocol response. No additional launcher host permissions or automatic scan of installed extensions are needed. Pairings are limited to 20 additional providers, with unique provider IDs and extension IDs; built-in identities are reserved.

SDK **0.1.3** adds optional `name` and a sender-validated `describe` response, so an extension can pair even when it has no commands. This response does not run `register` or actions. Older SDK providers can pair through discovery when at least one command is available; the provider ID becomes the review label. Protocol version 1 remains in use.

Bundled GitHub/LLM defaults remain in `apps/launcher-extension/src/providers.ts`. An optional `contextOrigins` filters context for those defaults; `enabledSetting` retains the GitHub preference. [PWA origins](/guides/pwa/) still require source and manifest configuration. Installing the SDK alone never approves pairing.

## Verify

Load the real launcher and your provider in Chromium. Check discovery, one invocation, no-context availability, stale page rejection, returned errors, and removal when the provider is unavailable. Disable the provider extension and confirm its commands disappear after refresh. Use fixtures for account writes unless a live action is explicitly authorized. The [LLM integration](/project/showcase/#separate-llm-provider) demonstrates an independently installed provider.
