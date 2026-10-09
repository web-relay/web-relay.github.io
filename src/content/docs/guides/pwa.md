---
title: Enable a PWA or web app
description: Register app-owned capabilities using the SDK and configure the launcher's exact-origin page bridge.
---

Use this integration in an existing web app or PWA. Install the [SDK](/guides/sdk/) and include it in your normal browser bundle. PWA installation is optional: the bridge works in a normal browser tab on a configured origin.

## Own the registry in the app

```ts
import { createLauncher } from '@web-relay/sdk';

const app = createLauncher({
  providerId: 'my-notes',
  name: 'My notes',
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

## Pair in launcher settings

Development launcher **0.0.3** supports PWA pairing without editing source or rebuilding for each host:

1. Open exactly one tab at the app URL, such as `https://page-apps.github.io/`.
2. Open launcher Options (Capability sources → Manage extension providers), then **Pair a web app**.
3. Enter the full app URL and click **Check app connection**. Approve Chromium's host access prompt.
4. Review the self-reported provider identity, exact origin, and path, then click **Approve app pairing**.
5. Open or refresh the launcher on any tab. Existing app tabs receive the bridge on demand.

Reload the built launcher once when upgrading from 0.0.2. Host access alone does not enroll an app. Pairing proposals expire after five minutes, belong to the settings document, and are rechecked before saving. Missing permission, multiple matching tabs, missing SDK listeners, changed identities and invalid responses appear as actionable diagnostics.

The root path `/` pairs only the home page. Other paths, such as `/quick-log/`, match that path and its subpages, with segment boundaries. Pair sibling GitHub Pages apps separately; pairing `https://page-apps.github.io/` does not pair `/quick-log/`. Exact scheme, host and port still matter. Chromium host permission covers more paths and ports than app routing; Web Relay checks the approved origin and path independently. Paths route apps but are not a security boundary between same-origin scripts.

Launcher **0.0.5** shows enabled paired apps across tabs. Discovery reads each app's own tab and caches its available command metadata. If the app is closed, its saved actions remain visible; running one opens the approved app path in a background tab and checks live availability before execution. Listing actions never opens pages. Existing pairings need no new approval: open each app once to populate its catalog after upgrading. Commands that depend on app state may be unavailable after reopening; functions and live state stay in the app.

Requests use the owning app's tab, URL, and document rather than the caller's page. If multiple app tabs match, open the launcher inside the intended app tab or close duplicates. Redirects outside the paired origin/path, stale caller context, removed or disabled pairings, and revoked permission block execution. Execution is sent once; discovery may wait for an app's bridge to load. A timeout does not cancel a delivered action.

Saved apps can be disabled, enabled, or removed in settings. Removing a pairing stops routing; host permission remains until revoked in Chromium extension site settings because another app may share the host. Revoking host permission prevents further discovery and execution.

SDK 0.1.4 adds optional `name` and PWA `describe`, plus requests addressed with `providerId`. A mounted registry ignores another provider's addressed requests. Published SDK 0.1.3 can pair via nonempty validated discovery and supports separate apps on different paths. Multiple registries mounted simultaneously on one page need SDK 0.1.4 or later.

Bundled development defaults remain in `apps/launcher-extension/src/providers.ts`; they retain their manifest access. Launcher 0.0.2 and older still require source `pwaProviders`, matching manifest host permissions/content scripts, rebuild, and reload for additional PWA hosts.

## Registration and lifecycle

Use at most 50 registered commands per PWA/extension registry. IDs are at most 80 characters; titles are nonblank and at most 120; descriptions are nonblank and at most 300. SDK 0.1.4 rejects invalid metadata and the 51st command during registration, matching discovery validation.

`dispose()` removes the listener but does not cancel already-running actions; an in-flight reply can still be posted after disposal. Request IDs are not deduplicated, so repeated requests can repeat side effects. A navigation timer does not acknowledge that the extension received a result. Reliable result-before-navigation acknowledgement remains future work.

## Verify

Open the app in a normal Chromium tab and invoke the launcher. Check that your provider appears, that an action executes in the app, and that changes to selected state affect availability after refresh. Execute a stale selection and confirm the registry checks `when` again. Test returned errors, app teardown/remount, and an unconfigured origin. Same-origin code is trusted; the bridge is not a defense against malicious scripts already running inside your app.

The app does not require a backend, a global registry, or an always-running extension worker. Discovery is pulled when the launcher opens/refreshes and before execution. Automatic push updates, structured input schemas beyond bounded text, duplicate invocation handling, and navigation acknowledgement remain future work.

The committed [Chromium PWA pairing test](https://github.com/web-relay/web-relay/blob/main/tests/pwa-pairing.mjs) covers actual launcher discovery/execution, stale context, approval rejection, shared-origin routing, cross-tab execution, closed-app catalog persistence and background reopening, duplicate-tab rejection, provider addressing, errors, disable/remove and teardown/remount. Run `pnpm test:e2e` after building. `pnpm test:hub` additionally checks the deployed Personal Hub and intercepts child navigation to avoid account writes. The disposable test launcher pregrants only the fixture host because headless CI cannot approve Chromium's native host permission prompt; production settings request permission interactively.
