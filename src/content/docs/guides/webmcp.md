---
title: WebMCP preview
description: Register native WebMCP sites and use their tools from any tab, without adding a site SDK.
---

The launcher supports native WebMCP tools through an opt-in adapter. A site that already registers WebMCP tools does **not** need `@web-relay/sdk`. Register the site once to use its tools from any tab, even after closing its page. The [PWA SDK](/guides/pwa/) remains available independently.

## Register a site

1. Launcher **0.0.4** adds required-field forms. Build the runtime with `pnpm build` and reload `apps/launcher-extension/dist` in `chrome://extensions`.
2. Enable `chrome://flags/#enable-webmcp-testing` in a Chrome build supporting the preview, then relaunch. See [Chrome's WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp).
3. Open Web Relay, expand **Capability sources**, and choose **Manage WebMCP sites**. You can also open the extension's Options page directly.
4. Under **Register a WebMCP site**, enter the exact page URL, such as `https://cmwen.dev/`, and an optional site name.
5. Click **Check WebMCP site**, approve the browser's site-access request, and review the URL and discovered tools. Checking opens the page in a background tab if it is closed; no tool runs during registration.
6. Click **Register site**. The saved tools now appear in the launcher from any tab.

Select a tool, fill its required fields, and click **Run action**. The launcher reads the tool contract and builds the JSON arguments for you. For `cmwen.dev`, enter your search text in **Query**.

The browser validates the arguments against the site's schema. The launcher checks required controls and basic string lengths and numeric bounds before sending. Arguments must fit within 2000 JSON characters. Results are shown as plain text, limited to 8000 characters. A page result cannot instruct the launcher to copy content or open another tab.

## Form limitations

Forms show **only fields listed in the root object's `required` array**. Supported controls are text inputs for strings, number inputs for numbers/integers, and dropdowns for booleans and homogeneous scalar enums. Labels and help text come from the property's `title` and `description`; readable property names are the fallback. Declared scalar defaults prefill supported controls.

Optional fields are omitted from the arguments, including optional nested filters. For the blog's search tool, only Query is shown; kinds, language, tags, and limit are not configurable in this version. If no root fields are required, the tool receives `{}`.

**Nested objects and arrays are not supported.** Required object/array fields, type unions, `$ref`, and constant-only and conditional/composed schemas do not generate a form. The launcher explains the limitation and disables Run action; it does not silently omit required inputs. There is no raw-JSON editor or optional-field editor in this version. The browser remains responsible for full JSON Schema validation, including constraints beyond the basic checks in the form.

## Saved pages and tools

Saved sites persist in this browser profile. Web Relay stores tool metadata, including schemas; the site's functions and live state stay in its page. A source marked **registered** means its catalog is saved, not that the page is currently open or its tools are guaranteed available.

Opening or refreshing the launcher lists the saved catalog without opening sites. Running a saved tool reuses a tab at the exact saved URL, or opens that URL in a background tab. It waits for page loading and tool registration, rediscovers the selected tool, rechecks the reviewed metadata and schema, and invokes it once. It leaves the page open and keeps the source tab active. The current tab's URL is not shared with the saved site's tools.

The site may require login or visible-page interaction. If no tools appear, finish loading or signing into the page and use **Refresh site tools** in settings. If multiple tabs have the exact saved page open, close duplicates so routing is unambiguous. Redirects are rejected: register the final page URL instead.

If a tool changes or disappears, invocation stops and refreshes the saved metadata. Refresh the launcher and review the new tool before running again. A saved tool can execute in a newly loaded document after closure; it is always rediscovered and bound to that current document before execution. Same-named tools on different saved sites remain separate.

Settings provide **Disable site**, **Remove site**, **Refresh site tools**, and **Restore site access**. Disabled sites and revoked permissions prevent listing and invocation; removed sites cannot be invoked by an old selection. Removing a registration retains browser host access until you revoke it in extension site settings, because other integrations can share that host. You can register at most 20 page URLs with up to 50 tools each.

## Current-page discovery

For occasional use without saving a site, open its toolbar launcher and enable **WebMCP preview tools on the current page** under Capability sources. This mode uses `activeTab` access and discovers tools on open, refresh, and before execution. Switching tabs changes the available current-page tools; closing or reloading a page invalidates a selection from that document. This toggle is independent of saved site registrations.

## Scope and delivery

Both modes use top-level page tools and filter out iframe tools, including same-origin frames. Saved registrations route only to the exact approved URL; browser host access can cover more paths and ports, but does not enroll them. Page query strings, fragments, credentials, wildcards, and encoded paths are not accepted for registration. Registration requires both site access and a reviewed approval from the extension settings document.

Every invocation requires an explicit **Run action** after reviewing the inputs. Site-provided safety hints do not cause automatic execution. Missing replies and timeouts do not prove cancellation or success; do not automatically retry actions that may have been delivered. Navigation or switching away from the source tab can remove the launcher before a result arrives. Background execution is subject to the site's and browser's normal requirements for focus, login, and user activation.

## Preview compatibility

The adapter supports `document.modelContext.getTools()` and `executeTool()`. Before Chrome 155 it passes serialized JSON arguments; from Chrome 155 it passes an object, following the documented API change. It also feature-detects the earlier `navigator.modelContextTesting.listTools()` / `executeTool(name, JSON)` surface. Schemas returned as JSON strings or objects are normalized; property order does not count as a schema change. Execution is never retried with a different signature.

When the preview API is unavailable, other launcher sources continue working. Nested/optional input controls, iframe tools, pushed `toolchange` updates, agent execution, and exposing SDK capabilities through WebMCP remain future work.

## Verification

[Native adapter](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/webmcp.ts) · [Saved-site routing](https://github.com/web-relay/web-relay/blob/main/apps/launcher-extension/src/webmcp-sites.ts) · [Saved-site Chromium test](https://github.com/web-relay/web-relay/blob/main/tests/webmcp-sites.mjs)

Run `pnpm test:e2e` after building. Tests enable Chromium's native preview and load both extensions. They cover required root-field forms, scalar/choice types, optional-field omission, unsupported nested fields, current-page execution, registration review, global invocation, tab reuse and reopening, delayed registration, duplicate tabs, changed schemas and removed tools, disabled/removed sites, and permission rejection. Account writes use local fixtures; permission revocation is simulated because the disposable fixture uses required loopback access.

Run `node tests/webmcp-sites.mjs --live-site` to additionally verify registration of `https://cmwen.dev/` and global discovery after closing its page, without invoking any live site tool. The optional live check pregrants only that host in a disposable launcher copy because headless Chromium cannot approve the native host-access prompt.
