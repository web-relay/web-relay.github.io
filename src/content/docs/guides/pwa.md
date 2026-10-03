---
title: Enable a PWA or web app
description: Register app-owned capabilities using the SDK and configure the launcher's exact-origin page bridge.
---

Use this integration in an existing web app or PWA. Install the [SDK tarball](/guides/sdk/) and include it in your normal browser bundle. PWA installation is optional: the bridge works in a normal browser tab on a configured origin.

## Own the registry in the app

```ts
import { createLauncher } from '@web-relay/sdk';

const app = createLauncher({
  providerId: 'my-notes',
  context: () => ({ selected: notesStore.selectedNote }),
});

app.registry.register({
  id: 'my-notes.pin',
  title: 'Pin selected note',
  when: context => !!context.selected && !context.selected.pinned,
  run: context => {
    notesStore.pin(context.selected!.id);
    return { message: 'Pinned the note.' };
  },
});

// During app/integration teardown:
// app.dispose();
```

`notesStore` is your application's existing state/store; adapt the example to it. Read live state in `context()`, rather than capturing a selected note at registration time. Keep action functions inside the app. The SDK installs a same-window, same-origin message listener and returns `{ registry, dispose }`. Mount it once, and dispose it when an SPA integration is torn down to avoid duplicate listeners.

An optional local palette can use `app.registry.list()` and `app.registry.execute(id, input)` without the browser extension. Use the same registrations so availability and behavior stay consistent. Registration returns an unregister function for capabilities that are removed during the app's lifecycle.

## Configure the launcher

In `apps/launcher-extension/src/providers.ts`, add the exact origin and matching provider ID:

```ts
export const pwaProviders = [
  // Keep existing entries as needed.
  {
    providerId: 'my-notes',
    name: 'My notes app',
    origins: ['https://notes.example.com'],
  },
];
```

Origins include scheme, host, and port, but no path or trailing slash. `http://localhost:5173` is different from `http://127.0.0.1:5173`. Configure one provider identity per origin; the first matching entry is used. Arbitrary page scripts are not auto-enrolled.

Also add the host to `apps/launcher-extension/public/manifest.json`:

- `host_permissions`: add `https://notes.example.com/*`.
- Existing bridge `content_scripts[0].matches`: add `https://notes.example.com/*`.

Keep existing hosts that you still use. The browser match pattern grants host access; the bridge separately checks the exact configured origin and top frame. Do not replace this with unrestricted access to all sites.

Rebuild the launcher (`pnpm build`), reload the extension, and reload the app tab so its bridge script is installed. The PWA build owns the app's SDK code; the launcher build owns provider configuration and content-script access.

## Verify

Open the app in a normal Chromium tab and invoke the launcher. Check that your provider appears, that an action executes in the app, and that changes to selected state affect availability after refresh. Execute a stale selection and confirm the registry checks `when` again. Test returned errors, app teardown/remount, and an unconfigured origin. Same-origin code is trusted; the bridge is not a defense against malicious scripts already running inside your app.

The app does not require a backend, a global registry, or an always-running extension worker. Discovery is pulled when the launcher opens/refreshes and before execution. Automatic push updates, structured input schemas beyond bounded text, and generalized enrollment UI remain future work.
