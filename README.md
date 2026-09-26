# Mora

A minimal Vietnamese messenger for coworkers and AI coworkers.

- One recent-conversation list, search, direct messages and groups.
- Create a named bot with a role. Talk to it directly or add it to an ordinary group.
- In groups, mention a bot by name or use the @ picker.
- Shared messages, replies, reactions and file attachments up to 5 MB.
- Existing project context, plans and handoffs remain available through chat information.
- Responsive two-pane desktop layout and list-to-chat mobile navigation.

[Brand guidelines](docs/BRAND.md) describe the identity, palette, typography and interaction rules.

## Data and access

Messages, bots and membership are stored in Cloudflare D1; attachments in R2.
Clients synchronize every four seconds. ChatGPT identity is supplied by Sites.
New direct messages and groups are restricted to their explicit members. Reads,
mutations and file downloads check conversation access on the server. Legacy
project rooms retain their existing workspace-wide visibility and saved data.
Sample conversations remain labelled “Mẫu”; they are not real member accounts.

The member picker lists people who have already been granted Site access and
signed in, plus saved bots. Copying the URL does not itself grant Site access.
The Site remains owner-private until its owner changes sharing. All admitted
users share the member and bot directory. This remains a single-team pilot.
Hosting must replace incoming identity headers. Do not expose the Worker directly
with client-trusted identity headers.

## AI behavior

Bots send ordinary replies through the server-side OpenAI Responses integration.
Name and role are included in the instruction, together with the current chat's
last 40 messages. A group bot only replies when mentioned in a sent message.
Bots cannot execute code, send emails, inspect repositories or read attachments.

`OPENAI_API_KEY` must be configured as a hosting secret for actual replies.
Without it, the message is saved and the UI says the bot is not connected. It
never substitutes a canned response for a real AI answer. `OPENAI_MODEL` is
optional and defaults to the existing `gpt-4.1-mini` configuration. Live provider
calls were not exercised by local verification. Legacy plan/handoff demo mode
remains explicitly labelled as sample output.

## Development

React 19, Vinext, TypeScript, Tailwind, Radix dialogs, Cloudflare Workers, D1, R2
and Drizzle migrations. Use Node 22.13+ and the committed pnpm lockfile.

```sh
pnpm install
pnpm run db:generate
pnpm run build
node tests/verify-api.mjs
```

Migrations are additive. Apply every committed SQL migration in order to an
existing local database. Sites applies committed migrations during deployment.
No production authentication fallback is provided for local development.

The integration script builds on a disposable local database, applies all
migrations, and tests messages, old task flows, DM isolation, private attachments,
concurrent DM creation, bot roles, mixed groups and membership. It verifies that
an unconnected bot reports an error instead of fabricating an answer.

The browser automation capability was unavailable for this update. Visual
rendering, touch interaction and screen-reader behavior have not been checked in
a live browser. TypeScript, production compilation and local Worker integration
are checked separately. The pilot loads the latest 1,500 accessible messages and
100 tasks; search covers conversation names and their latest message previews.
