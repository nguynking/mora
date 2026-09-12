# Mora

A writing canvas made of light. Keystrokes create ripples, completed words send sparks into a luminous orbit, and words fade in place. Finished paragraphs leave temporary stars.

[Open Mora](https://mora.nguynking.chatgpt.site)

Hold the glowing circle or logo to draw your writing into the orbit and start again. Keyboard: hold Space/Enter with either control focused. “Together” opens a private invitation: visitors share presence, never their words. Reduced motion keeps the orbit still and removes moving effects.

Text stays only in page memory until cleared, reloaded, or closed. The server stores anonymous presence; inactive visitors disappear after 12 seconds, and stale rows are pruned on subsequent activity.

Vanilla HTML/CSS/JS in `public/`, a small Worker in `server/`, and D1 for presence. `npm ci`, then `npm run build`. Change `lifetime` in `public/app.js` to adjust fading. Schema changes: `npm run db:generate`. No runtime packages.
