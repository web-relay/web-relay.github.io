---
title: Enable an extension provider
description: Add capabilities to an existing Chromium extension with the SDK and explicitly pair it with the launcher.
---

Keep your extension in its own folder or repository. Install the [SDK tarball](/guides/sdk/) in that project and use its existing browser bundler. The launcher does not require the example PWA or GitHub provider.

## Register in the service worker

At worker startup, register the external listener synchronously. Action functions may be asynchronous:

```ts
import {
  createExtensionProvider,
  LAUNCHER_ID,
  CapabilityError,
} from '@web-relay/sdk/extension';

createExtensionProvider({
  providerId: 'my-extension',
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

In the launcher checkout, edit `apps/launcher-extension/src/providers.ts`:

```ts
export const extensionProviders: ExtensionProvider[] = [
  // Keep existing entries as needed.
  {
    providerId: 'my-extension',
    name: 'My extension',
    extensionId: 'the-actual-32-letter-extension-id',
  },
];
```

Use the same `providerId` as the SDK registration and a real Chromium ID. The SDK package is not a discovery mechanism. Rebuild the launcher with `pnpm build` and reload it in `chrome://extensions`.

By default, the provider receives active-tab context. An optional `contextOrigins: ['https://example.com']` limits which origins receive that context; global commands may still be discovered with `undefined` context elsewhere. The launcher validates descriptor ownership and routes by the configured provider ID. An optional `enabledSetting` links an entry to a persisted preference; the current UI exposes only the GitHub preference, not a general provider settings screen.

## Verify

Load the real launcher and your provider in Chromium. Check discovery, one invocation, no-context availability, stale page rejection, returned errors, and removal when the provider is unavailable. Disable the provider extension and confirm its commands disappear after refresh. Use fixtures for account writes unless a live action is explicitly authorized. The [LLM integration](/project/showcase/#separate-llm-provider) demonstrates an independently installed provider.
