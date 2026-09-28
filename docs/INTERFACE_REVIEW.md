# Interface review

> **v4 revision (28/09/2026).** Paintings with people replaced by still
> lifes, seascapes, fields and an empty interior; credit captions removed.
> Avatars are circles: pigment discs for bots, initials without diacritics
> (first and last word) for people, and two-member diagonal pairs for groups,
> ordered by who spoke last. Removed the `AI` and `Mẫu` labels, the duplicate
> add-member button in the chat header, the panel's frosted pills and its
> repeated subtitle, and the second mark on sign-in. Added Vietnamese
> relative dates in the room list, compact plan actions in the panel, a pill
> reply composer, skeleton loading rows, a soft fade at the transcript edges
> and the room name in the browser tab. Verified with the same checks and
> screenshot set as below.

> **v4 update (28/09/2026).** The interface now follows `docs/BRAND.md` v4:
> paper and ink tones, Newsreader titles, the flourish mark, white cards on a
> dotted paper canvas, and CC0 paintings for the signed-out welcome, sign-in,
> empty states and room covers. Layout, behavior and copy are otherwise
> unchanged, plus a sign-out button. Verified with TypeScript, ESLint, the
> vitest suite, the production build, `tests/verify-layout.mjs` and Chromium
> screenshots against a mocked workspace API in light and dark at 1440, 1280,
> 1100 and 390 px. Screen readers and real touch devices were not tested.

> **v3 update (26/09/2026).** The interface now follows `docs/BRAND.md` v3: a
> monochrome Grok Bot-style layout with a collapsible room rail, generated bot
> avatars that show working and waiting states, inline plan cards, and a details
> panel that replaces the members and work dialogs. Verified with TypeScript,
> ESLint, the production build, `tests/verify-api.mjs`, `tests/verify-layout.mjs`
> and Chromium screenshots of a seeded local instance in light and dark at 1440,
> 1280 and 390 px. Screen readers and real touch devices were not tested. The
> review below describes the earlier two-pane version.

## Scope and coverage

Full review of the requested messenger flow: recent conversations, searching,
selecting chats, direct messages, bot creation, groups, adding members, compose,
errors and retained conversation details. React 19, plain CSS semantic tokens,
Tailwind utilities and the existing Radix Dialog primitive. Project conventions
were documented in README; there was no prior AGENTS or interface design guide.
The new brand reference is `docs/BRAND.md`.

This is a source and API review. The required browser-control capability was
unavailable, so it does not claim visual, touch, zoom or assistive-technology
verification of a rendered application.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Native controls, names, focus styles, Radix modal usage, live regions, reduced-motion styles | Source checked; runtime keyboard/screen-reader behavior not verified |
| Layout | Two-pane CSS, 700px mobile transition, error recovery and composer constraints | Source checked; rendered 320px/200% zoom not verified |
| Writing | Conversation list, forms, bot disclosure, missing-AI errors | Revised and checked |
| Typography | Native Vietnamese stack, 16px inputs/messages, metadata floor | Source checked; rendered glyphs not verified |
| Colors | Token values and calculated foreground/background pairs | Calculated text and control-boundary contrasts pass; rendered pairs not verified |
| UI polish | Shared radii, simple avatars, explicit transitions, overlay primitive | Source checked; motion and visual balance not verified |

## Findings addressed

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| Medium | Layout | `app/workspace.tsx`, `app/globals.css` | Workspace sections plus a context rail | Recent list and active conversation; details in dialogs | Main task is messaging |
| Medium | Writing | `app/workspace.tsx` | Beta, welcome slogan, keyboard instructions | Removed from primary flow | Avoid repeated visual clutter |
| High | Colors | `app/globals.css` | Several muted text pairs below 4.5:1 | Shared secondary token, 4.56:1 or higher on intended surfaces | Readable metadata |
| Medium | Typography | `app/globals.css` | 14px mobile dialog input text | 16px input/message text | Easier reading and avoids mobile input zoom |
| High | Accessibility | `app/workspace.tsx`, mobile CSS | Initial mobile error hidden with conversation | Error and recovery available in mobile list | Failed loads remain recoverable |
| Medium | Writing | Conversation preview | First name token, often a shared Vietnamese surname | Last two tokens | Distinguishable sender previews |
| Medium | UI polish | Refresh and selection logic | Missing selected room could reset during create/poll race | Initial selection only; preserve explicit room ID | Created chats remain selected |

## Considered but rejected

| Candidate | Rejected because |
| --- | --- |
| Keep a separate AI navigation category | Bots should be ordinary conversation participants |
| Delete all previous plan/context functionality | Moving it into chat details preserves saved work while simplifying primary navigation |
| Add unread badges or online dots without read receipts/presence data | They would imply state the backend does not establish |
| Remote branded font and decorative image | Native Vietnamese typography is sufficient for the requested minimal messenger |

## Verification

- TypeScript `tsc --noEmit`.
- ESLint on changed application components, API routes and schema.
- Production build through the Sites build helper.
- Disposable local Worker integration: authenticated shared chat, deduplicated sends,
  threads and task invariants; private DM and attachment isolation;
  concurrent DM starts; named bot roles; mixed groups and member additions;
  honest missing-AI failure; server-rendered application shell.
- Not verified: live OpenAI response quality, rendered browser layout, keyboard/touch
  flows, 200% zoom, screen reader announcements and optional WebMCP runtime.

## Screenshot correction

The supplied screenshot revealed an actual desktop regression: Sonner's in-flow
notification `section` occupied the first auto-placed CSS grid cell. The chat
list consequently appeared in column two and the conversation on a second row.
The notification component now renders outside the grid; the grid has named
areas, explicit pane assignments and a single constrained row. The app surface
contains no wordmark. Headers and rows are compact, with a neutral selection and
pill composer matching the reference structure.

`node tests/verify-layout.mjs` checks the actual production-rendered shell for
adjacent chat-list and conversation panes, absence of the wordmark, and retained
search/new-chat controls. This is a DOM regression check, not browser visual QA.

## Verdict

No actionable source-level interface findings remain in the inspected scope.
Runtime visual approval is outside the verified coverage above.

Approve
