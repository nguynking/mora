# Mora brand restoration

Screenshots of the production build with local sample data, captured on
03/10/2026. These are UI previews, not production conversations.

- [Desktop, light](desktop-light.png)
- [Desktop, dark](desktop-dark.png)
- [Mobile chat list](mobile-chats.png)
- [Mobile conversation](mobile-conversation.png)
- [Welcome](welcome.png)
- [Sign in](signin.png)

Verified in Chromium: pane widths, sidebar collapse, diacritic-insensitive
search, per-room drafts, IME-safe desktop send, touch Return/newline, threads,
plan approval and handoff rendering, overlay focus trap and return, reduced
motion, 320 px reflow and 200% text. No browser runtime errors occurred.
The authenticated screens and email confirmation were exercised with mocked
API responses. Existing integration tests separately cover PostgreSQL,
authorization, messaging, uploads and approval concurrency.
