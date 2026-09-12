# Mora

A quiet writing space. Words fade in place with a little dust, typing stirs the page edges, and finished paragraphs leave temporary stars.

[Open Mora](https://mora.nguynking.chatgpt.site)

Hold the logo (or hold Space/Enter while it is focused) to let everything go. The small circle opens a private invitation: visitors share presence, never their writing. Reduced-motion preferences are respected.

Text stays only in page memory until cleared, reloaded, or closed. The server stores anonymous presence; inactive visitors disappear after 12 seconds, and stale rows are pruned on subsequent activity.

Vanilla HTML/CSS/JS in `public/`, a small Worker in `server/`, and D1 for presence. `npm ci`, then `npm run build`. Change `lifetime` in `public/app.js` to adjust fading. Schema changes: `npm run db:generate`. No runtime packages.
