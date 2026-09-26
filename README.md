# Mora

Vietnamese-first work chat for people and a shared AI coworker.

## This MVP

- Shared project rooms, messages, threads, mentions, reactions and search.
- Durable shared context: project goal, repository reference and team decisions.
- Editable plans with explicit approval, stop, recoverable failure and handoff notes.
- File upload/download, up to 5 MB each.
- ChatGPT identity, attributed messages and one workspace protected by the Site's access policy.
- Responsive desktop workspace and mobile drawers.

Data is stored in Cloudflare D1 and R2, not browser storage. Open tabs synchronize every four seconds. Sample conversations are marked **Mẫu** and use fictional teammates. Real users are identified by the hosting platform, never by a profile switcher.

## Current boundary

The deployed agent starts in **clearly labelled demo mode**. It creates a saved example plan and handoff note. It does not inspect or change code, run tests or create pull requests. The GitHub repository link is only a reference. There is no billing or invoicing.

A server-side OpenAI Responses integration is implemented for genuine plan and handoff document generation. It is enabled only after `OPENAI_API_KEY` is configured as a hosting secret. That optional integration still does not execute code or create a draft PR. The OpenAI connection was not configured or exercised for this delivery.

The Site starts owner-private. Copying an invite link does not grant access: grant collaborators access through Sites first. All authorized Site members share all rooms. Do not publish this workspace publicly without adding an explicit server-side workspace membership policy. Hosting must strip/replace incoming identity headers; never expose the Worker directly with client-trusted identity headers.

## Stack

React 19, Vinext, TypeScript, Tailwind, shadcn/Radix, Cloudflare Workers, D1, R2 and Drizzle migrations.

## Development

Use Node 22.13+ and pnpm with the committed lockfile.

```sh
pnpm install
pnpm run db:generate
pnpm run build
```

For a local database, apply each pending SQL migration once to the local Worker configuration:

```sh
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_warm_meltdown.sql
pnpm start
```

The local server does not authenticate users. Production identity is provided by the Sites dispatcher. Do not add fake production identity fallbacks.

Copy `.env.example` to `.env` only for local environment configuration. Never commit secrets. In Sites, configure runtime values through the hosting secret settings:

- `OPENAI_API_KEY`: optional, enables real plan/document generation.
- `OPENAI_MODEL`: optional, defaults to `gpt-4.1-mini`.

The `.openai/hosting.json` manifest contains logical `DB` and `BUCKET` bindings. Sites provisions the actual resources and applies the committed migrations at deployment.

## Safety and state

- APIs require authenticated identity and reject cross-origin mutations.
- SQL values are bound parameters. User text is rendered as text, not HTML.
- Context writes check a revision number to prevent silently overwriting another edit.
- Plan approval checks the current context revision. Editing a plan clears approval.
- Runs are claimed atomically. A stop prevents later generated output from overwriting the stopped status.
- Files are served as authenticated downloads with `nosniff`, never as executable inline content.
- WebMCP exposes one read/navigation tool, `read_mora_room`, when the browser supports it. Its runtime was unavailable for verification in this delivery.

## Pilot limits / next slice

This is a single-team pilot, not a production multi-tenant messenger. It loads the latest 1,500 messages and 100 tasks. Search is limited to loaded messages. Notifications are in-app; there is no email, push or background worker. Runs resume while a client is open. The next product slice is a scoped GitHub installation, sandboxed code execution, inspectable changes and a real draft-PR approval flow, followed by pooled usage accounting.

## Verification

The TypeScript check and production build pass. Local Worker integration checks cover anonymous access rejection, two-user shared messages, duplicate-send protection, thread validation, cross-origin writes, stale context conflicts, stale approvals, stop behavior, saved handoffs, file storage and server rendering. Run `node tests/verify-api.mjs` after building. The script uses a disposable local database and deletes it afterward.

Browser visual QA and WebMCP runtime validation were unavailable in the delivery environment; mobile behavior is implemented in responsive CSS but was not browser-verified. Real OpenAI calls were not tested because no API key was connected.
