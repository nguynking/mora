# Mora brand guideline and design system — v4

Status: pilot · 27/09/2026
Interactive version: [`docs/brand/brand-book.html`](brand/brand-book.html) ·
Tokens: [`docs/brand/tokens.json`](brand/tokens.json) ·
Bot kit: [`docs/brand/bot-kit.json`](brand/bot-kit.json) ·
Reference: [Grok Bot design language](reference/GROK_BOT_DESIGN.md)

v4 keeps the v3 idea (a quiet black-and-white work chat where bots are the
only color) and replaces the bot characters, which were a near copy of Grok
Bot's, with Mora's own **arch family**. It also adds the specs needed to build
Mora on web, macOS, Windows, iOS and Android: tokens, type, layout, motion,
icons, components, platform rules, accessibility criteria and handoff files.

When this file, the tokens and the brand book disagree, this file wins. Change
the JSON files to match it, then the brand book.

---

## 1. Idea

| | |
| --- | --- |
| Promise | **Làm tiếp, không cần kể lại.** Pick up the work. No re-explaining. |
| Descriptor | Chat làm việc cùng đồng đội AI · Work chat with AI coworkers |
| Design test | Does this help the team delegate, or give them one more thing to manage? If the second, remove it. |
| Personality | Calm, plain, accountable. The interface stays out of the way; the bots and the conversation carry the character. |

## 2. Principles

From Grok Bot's design language (see the reference notes):

1. **Bots, not chats.** The sidebar is a roster you scan by face.
2. **Monochrome, bots in color.** Characters are the only saturated color.
3. **The avatar is the status.** The character shows the lifecycle, not badges.
4. **One mixed transcript.** Messages, events and cards share one timeline.
5. **Glance, don't supervise.** Status signal → side panel → full access.
6. **Take things away.** No dividers or per-message chrome until hover or focus.

Mora's own:

7. **Approve before it acts.** Bots propose plans; nothing runs until a person approves, and anyone in the room can stop it.
8. **Context stays in the room.** Goals, repos and decisions live in the room's shared context, so whoever picks up the work needs no recap.
9. **Vietnamese first.** Copy, formats, names and input methods are designed for Vietnamese, keeping the English terms teams already use.

## 3. Review of v3 (what v4 fixes)

| Severity | v3 finding | v4 fix |
| --- | --- | --- |
| High | Bot avatars reused Grok Bot's construction almost one to one (five primitive shapes, tall capsule eyes, "look up / bob and scan" motion). | The arch family (§6). |
| High | Purple `#A855F7` was a bot color while purple also means "a bot is working". | Purple removed; no bot hue within 45° of the working hue. |
| Medium | Input borders `#CFCFCF` (1.6:1 on white) and `#4A4A4A` (2.1:1 on `#141414`) fail the 3:1 boundary minimum. | `control-border` `#8A8A8A` / `#737373`. |
| Medium | Error text `#D92D20` is 4.2:1 on the grey banner. | `destructive` `#B42318` in light (5.8:1 on the banner). |
| Medium | Looks recomputed from an id hash: 8 bots have a 53% chance that two look identical. | Assigned once, preferring an unused silhouette and color, then stored. |
| Medium | State shown only by motion; invisible under reduced motion. | Each state has its own eye shape. |
| Medium | Three states for a seven-state lifecycle. | Seven states plus acknowledge. |
| Low | Doc and book disagreed on pane widths, message size and button height. | One token set. |
| Low | Three near-identical dark raised greys; solid hover invisible on `#232323`. | One `surface-raised`; translucent state layers. |
| Low | No spacing, radius, elevation, motion, icon, component, platform or handoff specs; eye color hard-coded. | All added; `bot-eye` token. |

---

## 4. Logo and app icon

- **Mark:** the Mora bot at rest: the arch silhouette with two arch eyes cut out
  of it. `#0A0A0A` on light, `#EDEDED` on dark. Never a bot color.
- **Wordmark:** `mora`, lowercase, system font, semibold, −2% tracking.
- **Lockup:** mark height = 1.2 × wordmark size; gap = 0.3 × mark height.
- **Clear space:** x = one quarter of the mark's width, on every side.
- **Minimum:** mark 16 px (favicon); lockup 64 px wide.
- The app surface shows no wordmark. The mark lives in the app icon, browser
  tab, invoices and marketing.
- Don't stretch, rotate, outline, recolor, add a mouth, gradient or shadow, or
  place the mark on photos or bot colors. Don't animate the logo outside the
  product; inside it, the Mora bot animates like any other bot.

**App icons:** white mark on a `#0A0A0A` tile, mark width 56% of the tile,
optically 2% below center.

| Platform | Deliver | Notes |
| --- | --- | --- |
| iOS, iPadOS | 1024 px layered icon from Icon Composer: default, dark, tinted | Square artwork; the system masks it. Dark: white mark on `#141414`. Tinted: greyscale mark layer. |
| macOS | Same layered icon (macOS 26+). Earlier: 1024 canvas, 824 px rounded rectangle, standard shadow | Keep the mark flat; no glass or bevel of our own. |
| Android | Adaptive icon: 108 dp layers, mark inside the 66 dp safe zone, plus a monochrome layer | Background `#0A0A0A`; monochrome layer is the arch with eye cut-outs. |
| Windows | ICO 16, 20, 24, 32, 40, 48, 64, 256; MSIX assets 100–400% | Plated tile, 18% corners; pixel-snap at 16 and 20. |
| Web | `favicon.svg` switching with `prefers-color-scheme`, 32 px PNG, 180 px `apple-touch-icon`, 192/512 manifest icons, 512 maskable (mark in central 80%) | Touch and manifest icons use the black tile, never transparency. |

---

## 5. Color

Monochrome. Greys carry every surface; there is no brand accent. Build with
token names, never hex values. Full set in `tokens.json` (dark values in
`$extensions.mora.dark`).

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `page` | `#FAFAFA` | `#0E0E0E` | Behind the app window on web; docs and marketing |
| `background` | `#FFFFFF` | `#141414` | Conversation, dialogs |
| `surface-sunken` | `#F7F7F7` | `#1B1B1B` | Sidebar, rail, details panel |
| `surface-raised` | `#FFFFFF` | `#232323` | Composer, menus, popovers, dialogs, sheets |
| `field` | `#EBEBEB` | `#262626` | Search field, filled inputs, skeletons |
| `selected` | `#E8E8E8` | `#2C2C2C` | Selected room row |
| `bubble` | `#F0F0F0` | `#262626` | Everyone else's messages, inline cards |
| `bubble-own` | `#0A0A0A` | `#3F3F3F` | Your messages |
| `on-bubble-own` | `#FFFFFF` | `#FFFFFF` | Text on your messages |
| `foreground` | `#0A0A0A` | `#EDEDED` | Text, active icons |
| `foreground-muted` | `#666666` | `#9B9B9B` | Previews, timestamps, events, help, idle icons |
| `border` | `#EBEBEB` | `#2A2A2A` | Pane dividers, decorative outlines |
| `border-strong` | `#CFCFCF` | `#4A4A4A` | Outline buttons, composer focus |
| `control-border` **new** | `#8A8A8A` | `#737373` | Text fields, checkboxes, radios, switch off (3:1) |
| `primary` / `primary-hover` | `#0A0A0A` / `#333333` | `#EDEDED` / `#FFFFFF` | Primary buttons, send |
| `on-primary` | `#FFFFFF` | `#0A0A0A` | On primary |
| `focus-ring` | `#0A0A0A` | `#EDEDED` | 2 px outline, 2 px offset |
| `working` | `#8B5CF6` | `#A78BFA` | The one signal color |
| `destructive` **changed** | `#B42318` | `#F97066` | Errors and destructive actions only |
| `bot-eye` **new** | `#141414` | `#141414` | Eyes on colored bots |
| `state-hover` | `rgb(10 10 10 / 5%)` | `rgb(237 237 237 / 7%)` | Hover layer over any surface |
| `state-pressed` | `rgb(10 10 10 / 10%)` | `rgb(237 237 237 / 12%)` | Pressed layer, Android ripple |
| `scrim` | `rgb(0 0 0 / 40%)` | `rgb(0 0 0 / 60%)` | Behind dialogs and sheets |

For the current web app: `hover` (`#EFEFEF` / `#242424`) maps to `state-hover`,
`input` maps to `border-strong`, `secondary` and `sidebar` map to
`surface-sunken`, `card`, `popover` and `composer` map to `surface-raised`.

**Rules**

- The only saturated color in the product is a bot's body. Nothing else
  borrows bot colors.
- Purple means one thing: a bot in this room is working. Not links, focus,
  selection or bots.
- Red means error. Errors always come with an icon and words.
- Never color alone: every state has words and a shape.

**Checked contrast (WCAG 2.2)**

| Pair | Light | Dark | Needs |
| --- | --- | --- | --- |
| `foreground-muted` on `selected` | 4.69 | 5.02 | 4.5 |
| `foreground-muted` on `bubble` | 5.04 | 5.44 | 4.5 |
| `on-bubble-own` on `bubble-own` | 19.8 | 10.5 | 4.5 |
| `destructive` on `bubble` | 5.77 | 5.43 | 4.5 |
| `control-border` on `background` | 3.45 | 3.89 | 3 |
| `working` on `surface-sunken` | 3.95 | 6.33 | 3 |

---

## 6. Bots: the arch family

Every bot is a flat silhouette standing on a shared baseline, with two
arch-shaped eyes taken from the Mora mark. Silhouette and color say who it is;
the eyes say what it is doing.

**Kept from Grok Bot's principles:** one flat colored character per bot; a
face reduced to eyes (no mouth or nose); controlled variation inside one
construction; generated in code; the avatar is the status; bots are the only
color.

**Mora's own:** silhouettes grown from the Mora arch on one baseline; arch eyes
(flat bottom, round top); an expression alphabet where the eye shape changes
per state; a Vietnamese-named, equal-lightness palette; looks assigned once and
stored.

### 6.1 Construction (40 × 40 units)

1. **Canvas** 40 × 40. Path data never changes with size.
2. **Body box** x 5 → 35. The top varies per silhouette between y 4 and y 11.
3. **Baseline** every body ends flat at y 35 with 4-unit corners. Bots stand;
   they never float, tilt or stretch.
4. **Face line** eyes on y 22.5, centered at x 14.5 and 25.5 (11 apart).
5. **Arch eye** 5 × 5.4, round top (r 2.5), flat bottom with 0.8 corners, color
   `bot-eye`.
6. **Nothing else.** No mouth, nose, outline, gradient, shadow, text or
   accessories.

### 6.2 Silhouettes

| Key | Name | Profile | Path |
| --- | --- | --- | --- |
| `arch` | Vòm | Round. **Mora only.** | `M5 20A15 15 0 0 1 35 20V31A4 4 0 0 1 31 35H9A4 4 0 0 1 5 31Z` |
| `tile` | Gạch | Flat | `M5 16A9 9 0 0 1 14 7H26A9 9 0 0 1 35 16V31…Z` |
| `bud` | Búp | Pointed (lotus bud) | `M5 21C5 13.5 12 9.5 18.6 5.2Q20 4.3 21.4 5.2C28 9.5 35 13.5 35 21V31…Z` |
| `twin` | Đôi | Double | `M5 17A7.5 7.5 0 0 1 20 17A7.5 7.5 0 0 1 35 17V31…Z` |
| `bell` | Chuông | Narrow top, flared base | `M10 17A10 10 0 0 1 30 17C30 24 35 25 35 29V31…V29C5 25 10 24 10 17Z` |
| `cup` | Chén | Scooped | `M5 11Q5 7 9 7Q20 17 31 7Q35 7 35 11V31…Z` |

`…` is the shared base `A4 4 0 0 1 31 35H9A4 4 0 0 1 5 31`. Full strings are
in `bot-kit.json`. They use only M, L, H, V, C, Q, A and Z, so they work as SVG,
Android VectorDrawable `pathData` and XAML `Path.Data` without changes.

### 6.3 Colors

Near-equal OKLCH lightness, so no bot looks more important. Eyes keep 6.9:1 or
more on every color. A bot looks the same in both themes; only Mora flips
(foreground body, background-colored eyes).

| Key | Name | Hex | OKLCH | Paused tint |
| --- | --- | --- | --- | --- |
| `ot` | Ớt | `#F87966` | 0.72 0.16 30 | `#B39F9C` |
| `cam` | Cam | `#F99B44` | 0.77 0.15 60 | `#BFB1A6` |
| `nghe` | Nghệ | `#F1C035` | 0.83 0.155 88 | `#CEC7B7` |
| `com` | Cốm | `#A0D157` | 0.80 0.16 128 | `#B9C1B1` |
| `la` | Lá | `#4BC680` | 0.74 0.15 155 | `#A0AFA5` |
| `ngoc` | Ngọc | `#30C6BF` | 0.75 0.12 190 | `#A2B2B0` |
| `troi` | Trời | `#4BAEED` | 0.72 0.13 240 | `#9AA7B0` |
| `sen` | Sen | `#EC84B7` | 0.74 0.14 350 | `#B6A6AD` |

### 6.4 Expressions (states)

The eye shape carries the state on its own. Motion adds emphasis and stops
under reduced motion. Status text always sits beside the face in rows, headers
and the details panel.

| State | Status text | Eyes | Motion | When |
| --- | --- | --- | --- | --- |
| Idle | Sẵn sàng | Arch | Blink every 6 s (120 ms) | Nothing in progress |
| Thinking | Đang nghĩ | Arch, offset (1.2, −1.4) | Eyes drift side to side, 2.4 s | Drafting a reply (typing bubble shows) |
| Working | Đang làm | Bars (5.4 × 2.4), offset (0, 0.6) | Body nods 1.2 u every 0.8 s; eyes scan ±1.2 u | Running an approved plan; details icon turns purple |
| Waiting | Chờ duyệt | Arch, offset (0, −1.6) | One 3.2 u hop every 3.2 s; blink every 4 s | A plan or answer needs a person |
| Blocked | Cần giúp | Flipped arch, left +14°, right −14° | Three ±1 u shakes in 400 ms, every 3 s | Missing access, data or a decision |
| Done | Xong | Smile arcs (stroke 2) | One 480 ms bounce, hold 4 s, then idle | A task just finished |
| Paused | Tạm dừng | Closed lines | None; body uses the paused tint | Routine paused or bot switched off |
| Acknowledge | — | Current | One 320 ms hop | A mention or task lands |

Eye glyphs cross-fade in 120 ms. Stop every loop when the app is in the
background or the face is off screen.

### 6.5 Sizes

| Size | Use | Behavior |
| --- | --- | --- |
| 16 | Mention chip | Idle face, still |
| 20 | Group author line | Idle face, still |
| 24 | Chat header | Expressions, no motion |
| 32 | Pickers, member lists | Full |
| 36 | Sidebar row | Full |
| 44 | Rail, mobile room list | Full |
| 72 | Details panel | Full |
| 96 | Empty states, onboarding, bot settings | Full |

### 6.6 Assigning a look

Assign once when the bot is created, store `{ silhouette, color }` on the bot,
never recompute. Renaming keeps the look; people can change it in bot settings.

1. `hash` = 32-bit FNV-1a over the UTF-8 bytes of the NFC-normalized bot id
   (NFC matters: macOS Vietnamese input can produce decomposed text).
2. `start = hash % 40`. Walk `i = (start + k × 17) % 40` for k = 0…39 (17 is
   coprime with 40, so all 40 looks are visited). Look `i` is silhouette
   `[tile, bud, twin, bell, cup][i % 5]`, color `[ot, cam, nghe, com, la, ngoc,
   troi, sen][⌊i / 5⌋]`.
3. Take the first look whose silhouette **and** color are unused in the
   workspace; else the first with an unused color; else the first unused pair;
   past 40 bots, the first in the order.

Result: the first five bots get five silhouettes, the first eight get eight
colors, and no two share a look until there are 40. A reference
implementation is in the brand book (§ Bots → Assigning a look).

### 6.7 People, bots, rooms

| Thing | Avatar |
| --- | --- |
| Mora | The arch, foreground color, background-colored eyes |
| Bot | Colored silhouette with dark eyes; labeled `AI` in headers, group author lines, pickers and member lists |
| Person | Grey circle (`field`) with initials. People never get color or eyes. |
| Group room | Grey rounded square (30% corners) with initials |

**Don't:** add a mouth, nose or cheeks; use gradients, outlines or shadows; use
purple; give people color; tilt, float or stretch a body; move, resize or
redraw the eyes.

---

## 7. Type

| Platform | UI font | Mono | Scaling |
| --- | --- | --- | --- |
| iOS, iPadOS, macOS | SF Pro (system) | SF Mono | Dynamic Type |
| Windows | Segoe UI Variable (Segoe UI on 10) | Cascadia Mono, Consolas | OS text size |
| Android | Roboto / system | Roboto Mono | `sp`, up to 200% |
| Web | `-apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace` | `rem`, 200% zoom |

| Token | Size / line / weight | Use | iOS | Android M3 | Windows |
| --- | --- | --- | --- | --- | --- |
| `display` | 44 / 52 / 600, −3% | Marketing only | — | — | — |
| `title-1` | 28 / 34 / 600, −2% | Onboarding, settings titles | Title 1 | headlineMedium | Title |
| `title-2` | 22 / 28 / 600, −1% | Mobile screen titles | Title 2 | titleLarge | Subtitle |
| `title-3` | 17 / 24 / 600 | Dialog titles, panel name, empty states | Headline | titleMedium | Body Large |
| `headline` | 15 / 22 / 600 | Chat and panel headers | Subheadline semibold | titleSmall | Body Strong |
| `body` | 16 / 24 / 400 | Messages, composer, inputs | Body (17) | bodyLarge | Body at 16 |
| `body-sm` | 15 / 22 / 400 | Plan steps, dialog body | Subheadline | bodyMedium | Body |
| `label` | 14 / 20 / 500 | Buttons, menu items | Callout | labelLarge | Body |
| `label-strong` | 14 / 20 / 600 | Room names | Callout semibold | labelLarge | Body Strong |
| `caption` | 13 / 18 / 400 | Previews, events, help | Footnote | bodySmall | Caption |
| `caption-strong` | 13 / 18 / 600 | Author names, section labels | Footnote semibold | labelMedium | Caption |
| `meta` | 12 / 16 / 400, tabular | Timestamps, kicker (600) | Caption 1 | labelSmall | Caption |
| `tag` | 11 / 16 / 600, +4% | The AI label only | Caption 2 | labelSmall | Caption |
| `code` | 14 / 20 mono | Code, ids, repos | — | — | — |

Sizes are px on web, pt on Apple, sp on Android. iOS messages use Body (17 pt)
so they scale with Dynamic Type.

**Vietnamese:** line height 1.5 for body, never below 1.2; never clip text
containers vertically (stacked marks like ệ, ổ, ẫ get cut); sentence case; no
all caps; no letter-spacing on body text; never strip diacritics anywhere a
person can see it (notifications and file names included); tabular numbers for
times, amounts and counts.

---

## 8. Layout

**Units:** px (web) = pt (Apple) = dp (Android) = epx (Windows).

**Spacing** (4-point grid, 2-point half steps): `space-0-5` 2 · `1` 4 · `1-5` 6 ·
`2` 8 · `2-5` 10 · `3` 12 · `3-5` 14 · `4` 16 · `5` 20 · `6` 24 · `8` 32 · `10` 40 ·
`12` 48 · `16` 64 · `20` 80.

**Radius:** `xs` 6 (AI label, inline code) · `sm` 8 (menu items, tooltips) · `md`
10 (icon buttons, search) · `lg` 12 (rows, inputs, inner cards, images) · `xl` 18
(bubbles, plan and question cards) · `2xl` 20 (dialogs, sheets) · `composer` 26 ·
`full` (buttons, avatars, pills) · group avatar 30%. Nested corners get smaller.

**Elevation:** `0` panes, bubbles, transcript cards · `1` composer (`0 2 14 / 6%`;
dark: none) · `2` menus, popovers, tooltips (`0 8 24 / 12%`; dark 50%) · `3`
dialogs, sheets, toasts (`0 12 40 / 12%`; dark 50%). In dark mode raised
surfaces are lighter and take a 1 px `border`.

**Window classes** (Material 3 aligned):

| Class | Width | Layout |
| --- | --- | --- |
| Compact | 0–599 | One pane at a time: list → chat → details |
| Medium | 600–839 | Rail + conversation; details slide over |
| Expanded | 840–1199 | Sidebar + conversation; details slide over |
| Large | 1200+ | Sidebar + conversation + pinned details |

**Regions:** sidebar 288 · rail 72 (44 avatars) · details 344 · message column
max 896 (24 side padding, 14 at compact) · bubble max 608 or 78% (86% compact) ·
header 52 (56 on mobile + safe area) · desktop window min 760 × 540, opens at
1200 × 800.

**Targets:** pointer 32 min (24 for inline meta actions), iOS 44 pt, Android
48 dp. Room rows 52 on pointer (36 avatar), 64 on touch (44 avatar). A control
may look smaller than its target.

---

## 9. Iconography

Lucide on every platform, 24 grid, round caps and joins, stroke 1.75 (kept at
16 px). Sizes 16 (buttons, status, menus), 20 (toolbars), 24 (mobile nav bars).
Color `foreground-muted` at rest, `foreground` on hover or active, `working`
only on the details toggle, `destructive` only next to error text. Icon-only
buttons always have an accessible name and, on desktop, a tooltip. Where the OS
draws the UI, use the platform symbol:

| Meaning | Lucide | SF Symbol | Material |
| --- | --- | --- | --- |
| New, add | `plus` | `plus` | `add` |
| Search | `search` | `magnifyingglass` | `search` |
| Send | `arrow-up` | `arrow.up` | `arrow_upward` |
| Stop | `square` | `stop.fill` | `stop` |
| Upload | `paperclip` | `paperclip` | `attach_file` |
| Mention bot | `at-sign` | `at` | `alternate_email` |
| Plan | `list-checks` | `checklist` | `checklist` |
| Approve | `check` | `checkmark` | `check` |
| Edit | `pencil` | `pencil` | `edit` |
| Waiting | `clock` | `clock` | `schedule` |
| Working | `loader-circle` | ProgressView | CircularProgressIndicator |
| Done | `circle-check` | `checkmark.circle` | `check_circle` |
| Needs help | `circle-help` | `questionmark.circle` | `help` |
| Error | `circle-alert` | `exclamationmark.circle` | `error` |
| Paused | `pause` | `pause` | `pause` |
| Sidebar | `panel-left` | `sidebar.left` | `left_panel_close` |
| Details | `panel-right` | `sidebar.right` | `right_panel_open` |
| Close | `x` | `xmark` | `close` |
| Back | `chevron-left` | `chevron.left` | `arrow_back` |
| Like | `heart` | `heart` | `favorite` |
| Reply | `reply` | `arrowshape.turn.up.left` | `reply` |
| More | `ellipsis` | `ellipsis` | `more_horiz` |
| Mute | `bell-off` | `bell.slash` | `notifications_off` |
| Settings | `settings` | `gearshape` | `settings` |

---

## 10. Motion

The interface moves only to explain a change; personality belongs to the bots.

| Token | Value | Use |
| --- | --- | --- |
| `duration-fast` | 120 ms | Color, hover, press, eye crossfade |
| `duration-base` | 200 ms | Fades, menus, tooltips, rail, meta row |
| `duration-slow` | 320 ms | Details panel, sheets, dialogs, mobile pushes |
| `easing-standard` | `cubic-bezier(.2, 0, 0, 1)` | Anything that moves |
| `easing-enter` / `easing-exit` | `(0, 0, 0, 1)` / `(.3, 0, 1, 1)` | Arrivals / exits (20% shorter) |
| `easing-bot` | `(.45, 0, .55, 1)` | Nod, hop |
| `press-scale` | 0.96, 100 ms | Web and desktop buttons |
| Native springs | response 0.35 s, damping 0.8 | Sheets, bot hop |

Scroll to a new message only if the reader is within 80 px of the bottom;
otherwise show the jump button with a count. Update cards in place.
**Reduced motion:** no loops, hops, bounces, shimmer or slides; 120 ms
crossfades; typing dots still at half opacity; bot eye glyphs still change.

---

## 11. Components

Use the same names on every platform. Heights are pointer / touch.

| Component | Spec |
| --- | --- |
| `MoraButton` | Heights 32 / 40 / 48; padding 12 / 16 / 20; `radius-full`; `label` 14/500 (13 sm, 15 lg); icon 16, gap 6. Primary (`primary`), outline (1 px `border-strong`), ghost, destructive (outline with `destructive` text; filled only to confirm a delete), link. Hover `primary-hover` or `state-hover`; press 0.96; focus ring; loading keeps width and sets `aria-busy`; disabled 40%. One primary per view. |
| `IconButton` | Toolbar 36/40 square, `radius-md`, icon 20 muted. Round 40 for composer plus (`bubble`) and send (`primary`; `bubble` when empty; Stop while a bot replies). The details toggle turns `working` and its label says so. |
| `SegmentedControl` | `field` track, `radius-full`, 3 px padding; selected segment `background` + 1 px shadow. Native on iOS/Android. |
| `TextField` | 40 / 48, text 16/24, 1 px `control-border`, `radius-lg`; label above (14/500), help below (`caption`); focus border `foreground` + ring; error `destructive` border + icon + fix-it message, validate on blur or submit; disabled `field` fill. Textarea 3–8 rows. |
| `SearchField` | 36, `field`, `radius-md`, no border; 14 px (16 on mobile web); ⌘K hint; 150 ms debounce; diacritic-insensitive; Esc clears then blurs. |
| `Checkbox` · `Radio` · `Switch` | 18 px, 1.5 px `control-border`, checked `primary`; switch 36 × 20 on web/Windows, native elsewhere; whole label row is the target. Switches apply immediately. |
| `MessageBubble` | `radius-xl`, padding 10 × 16, `body`; max 608 / 78% (86% compact); others `bubble`, yours `bubble-own`; 4 px within a run, 14 px between authors, runs break after 5 min. Author line in groups only (20 avatar, `caption-strong`, AI label, time). Meta row (time, like, reply, more) on hover/focus, sticky when there are reactions or replies; long-press sheet on touch. Sending 60% + "Đang gửi"; failed `destructive` inset + "Chưa gửi được." + Thử lại; "đã sửa"; deleted outlined. Reactions: 24 pill, `field`. |
| `MessageContent` · `FileChip` | Mentions semibold, no color; links underlined; inline code mono 14 on `background`, `radius-xs`; code blocks mono 13/20, scroll sideways, copy on hover; files: icon, name, size "2,4 MB"; images `radius-lg`, max 320. Bots use bold, lists, links and code only; tables become cards. |
| `DateDivider` · `EventLine` · `TypingIndicator` · `JumpButton` | Divider `meta` centered ("Hôm nay 09:41"); event `caption` centered, max 576, names in `foreground`; "Tin nhắn mới" marker between `border-strong` rules; typing bubble with three 6 px dots + bot Thinking face; jump 40 circle, `surface-raised`, `elevation-2`, count badge. |
| `Composer` | `surface-raised`, 1 px `border` (`border-strong` on focus), `radius-composer` 26, padding 6, `elevation-1`; text 16, 1–6 lines then scroll; placeholder "Nhắn {tên}"; plus menu: Tải tệp lên · Nhắc bot · Tạo kế hoạch; attachment chips (36) + 2 px progress; "@" picker (bots first, 32 avatars); desktop Enter sends, Shift+Enter new line, ↑ edits last; **ignore Enter while an IME composes** (`isComposing` / keyCode 229) for Telex and VNI; mobile Return adds a line; drafts kept per room. |
| `PlanCard` | `bubble`, `radius-xl`, padding 14, gap 10, max 608 / 90%. Kicker "Kế hoạch" + status; title 16/600; steps on a `background` inner list (`radius-lg`, 15 px) with number / current (bold) / done check / skipped strike. States and actions: Chờ duyệt (Duyệt, Chỉnh kế hoạch) · Đang làm (Dừng) · Cần giúp (question + Trả lời) · Hoàn thành (output + Tiếp nhận) · Lỗi (what failed, "nothing changed", Thử lại). Mirrored in the details panel. |
| `QuestionCard` | Plan-card shell; 2–5 options (44 min, `radius-lg`, `border-strong`, letter chip 22); selected = 2 px `foreground` outline + filled chip + check; free-text answer always offered; collapses to question + answer after; `radiogroup` semantics. |
| `StatusText` · `AiLabel` | Icon 16 + `caption`; active in `foreground`, settled in `foreground-muted`, errors in `destructive`. Words: Chờ duyệt · Đang làm · Cần giúp · Hoàn thành · Đã dừng · Tạm dừng · Lỗi. AI label: `tag`, 1 px `border-strong`, `radius-xs`, 16 high. |
| `RoomRow` | 52 / 64, padding 8, gap 12, `radius-lg`; name `label-strong`, time `meta`, preview `caption` one line. Selected `selected` + `aria-current`; unread: `foreground` name and 600 preview + 8 px dot (counts only for mentions); bot state on the face, and the preview starts with status words when a person is needed; muted bell-off; "Bản nháp:" draft; "Bạn:" and the sender's name prefix in groups; context menu: Ghim, Tắt thông báo, Đánh dấu đã đọc, Rời phòng. |
| `ChatHeader` | 52 / 56 + safe area; 24 face + `headline` name + AI label, opens details; mobile adds back and a status line; no divider until content scrolls under it. |
| `Sidebar` · `Rail` · `DetailsPanel` | Sidebar 288 `surface-sunken`: collapse + new chat, search, rows, you + settings. Rail 72, 44 avatars, unread dot, tooltips. Details 344 `surface-sunken`: identity (72 face, `title-3`, "Đồng đội AI · {status}" or member count, role) · Công việc · Bối cảnh chung · Thành viên · Tệp · Lịch chạy for bots (schedule or "Tạm dừng" + Bật lại). Esc closes the overlay and returns focus. |
| `Menu` | `surface-raised`, 1 px `border`, radius 14, padding 6, `elevation-2`, min 192; items 36 / 44, `radius-sm`, icon 16 muted, shortcut in `meta`; destructive last after a separator; arrow keys, Enter, Esc, type-to-jump. |
| `Dialog` · `Sheet` | Dialog 440 / 560 / 640, `radius-2xl`, padding 24, `elevation-3` over `scrim`; title a question; body says what changes and what doesn't; button order per platform (primary right on web, Apple, Android; first on Windows); focus trapped. Compact: bottom sheet, 20 top corners, 36 × 5 grabber, safe area, iOS medium/large detents. |
| `Toast` · `Banner` · `Tooltip` | Toast: `primary` pill, 14 px, bottom center 16 above the composer, 4 s (6 s with an action), one at a time, past tense. Banner: top of the pane, `bubble` fill, `destructive` text + icon, one action, stays until fixed. Tooltip: pointer only, 500 ms, `primary`, 12 px, includes the shortcut. |
| `EmptyState` · `Skeleton` · `Spinner` | Empty: 72 Mora face, `title-3`, one muted line saying what will appear, one primary action. Skeleton: real shapes in `field`, 1.2 s shimmer, show after 300 ms for at least 500 ms. Spinner for actions under 10 s; longer work becomes a plan card. |

---

## 12. Platforms

| | Web | macOS | Windows | iOS, iPadOS | Android |
| --- | --- | --- | --- | --- | --- |
| Structure | Three panes by window class | Three-column split view | Three panes, custom title bar | iPhone stack; iPad split view + inspector | List-detail; stack on phones |
| Chrome | Browser | Hidden title bar; traffic lights in the sidebar header | 32 px title bar in `surface-sunken`, system caption buttons | System nav bar | Edge-to-edge |
| Type | System stack | SF Pro | Segoe UI Variable | SF Pro + Dynamic Type | Roboto, `sp` |
| Targets | 32 | 28–32 | 32 | 44 pt | 48 dp |
| Back | Browser back → rooms | ⌘[ | Alt+← | Edge swipe | Predictive back |
| Haptics | — | — | — | Light impact on send; success when an approved plan finishes; selection on options | `CONFIRM` / `REJECT`; ripple `state-pressed` |
| Notifications | Ask only after opt-in in settings | UserNotifications | App notifications | Communication notifications with the bot face | MessagingStyle, bot faces as Person icons |

System chrome keeps the platform's own material (Liquid Glass on Apple's 26
releases, Mica on Windows 11, Material 3 on Android). Mora's own surfaces stay
solid: no blur, glass or vibrancy on the sidebar, bubbles or cards.

**Shortcuts** (Ctrl on Windows): ⌘K jump/search · ⌘N new chat · ⌘\ sidebar ·
⌘I details · ⌥↑/⌥↓ previous/next room · ⌘U upload · ↑ edit last message · Esc
stop a bot's reply · ⌘/ shortcut list.

---

## 13. Voice and content

Plain Vietnamese, first person for bots (*mình*), people addressed by name,
never a guessed *anh / chị / em*. Keep English terms teams use (PR, review,
deploy). Restate the request, ask one question at a time, show evidence, mark
estimates. No emoji from bots. Bots introduce themselves as "đồng đội AI" and
never pretend to be people.

| Thing | Format |
| --- | --- |
| Date | `27/09/2026`; `22/09` this year; "Hôm nay", "Hôm qua", weekday for the last 7 days |
| Time | 24-hour `09:05`; rows use "Vừa xong", "5 phút", "2 giờ" |
| Numbers | `1.250`, `4,5`, `12%` |
| Money | `4.000.000 ₫` |
| File size | `2,4 MB` |
| Phone | `0901 234 567` |
| Counts | No plural form: `1 thành viên`, `4 thành viên` |
| Names | Full name as written; a separate "Tên gọi" (what to call you), defaulting to the last word of the full name |
| Initials | First letters of the first and last words as written; keep Đ; drop tone marks (`Linh Trần → LT`, `Đặng Ánh → ĐA`) |
| Search | Match with and without diacritics |

**Glossary:** Đồng đội AI (AI coworker; not "trợ lý ảo") · Kế hoạch (plan) ·
Duyệt (approve) · Chỉnh kế hoạch (edit plan) · Dừng / Tiếp tục (stop / resume) ·
Tiếp nhận (take over) · Bối cảnh chung (shared context) · Công việc (work) ·
Chi tiết (details) · Nhắn {tên} (message {name}) · Thử lại (try again).

**Errors:** what failed, what did not change, what to do. "Chưa gửi được tin
nhắn. Tin vẫn nằm trong ô soạn. Thử lại." Bots add "Chưa có thay đổi nào được
thực thi." Never "Đã có lỗi xảy ra" alone; never blame the person.
**Empty states:** say what will appear and offer the one action that fills it.
**Notifications:** title = room; body = who and what. Only for mentions,
approvals needed, blocked bots and finished work you approved.

---

## 14. Accessibility (acceptance criteria, WCAG 2.2 AA)

- Text 4.5:1; large text, icons and input boundaries 3:1.
- State never by color alone.
- Works in forced colors / high contrast (bubbles get a border, the selected
  row an outline).
- `lang="vi"` on the app, `lang="en"` on English fragments.
- Layout holds at 200% text on every platform; nothing clips.
- Everything works by keyboard; visible 2 px focus; order sidebar → header →
  transcript → composer → details.
- Targets 44 pt iOS, 48 dp Android, 24 px minimum on web (32 preferred).
- No action depends on hover or a gesture alone.
- New messages in a polite live region ("{tên}: {nội dung}"), not your own.
- Bot state changes announced once ("Mora đang làm"); bot faces are
  decorative, the name and status carry meaning ("Kiểm thử, đồng đội AI, cần
  giúp").
- Reduced motion respected; nothing flashes more than 3 times a second.
- Tested with VoiceOver, TalkBack, Narrator and NVDA with a Vietnamese voice.

---

## 15. Handoff

| File | Contains |
| --- | --- |
| `docs/BRAND.md` | This guideline (source of truth) |
| `docs/brand/tokens.json` | W3C DTCG tokens: gray primitives, semantic colors (dark in `$extensions.mora.dark`), bot colors, space, radius, sizes, type, motion, elevation, breakpoints, z-index |
| `docs/brand/bot-kit.json` | Silhouette and eye paths, palette and paused tints, states, motion, sizes, assignment rule |
| `docs/brand/brand-book.html` | The interactive brand book |

Generate platform tokens with Style Dictionary v4 (CSS variables, Swift, Compose,
XAML via a custom format). Naming: `color.bubble-own` → `--color-bubble-own` /
`Color.mora.bubbleOwn` / `MoraColors.bubbleOwn` / `MoraBubbleOwnBrush`.

**Before a screen ships:** tokens only (no raw hex, px or ms); light and dark;
empty, loading, error and offline states; compact, medium and large windows;
Vietnamese copy reviewed by a native speaker; keyboard, screen reader, 200% text
and reduced motion checked; bot faces have status text beside them.

**Open item:** the web app in `app/` still renders the v3 faces (`BotFace` in
`app/workspace.tsx`) and v3 color values (`app/globals.css`). Port both from
`bot-kit.json` and `tokens.json`.

---

## 16. What changed from v3

| Area | v3 | v4 |
| --- | --- | --- |
| Bots | Five primitive shapes, capsule eyes, motion-only status | Arch family: five silhouettes on one baseline, arch eyes, seven expressions |
| Bot colors | Eight, including purple and an error-like red | Eight named equal-lightness colors, no purple, paused tints |
| Bot identity | Recomputed from an id hash | Assigned once without collisions, stored, editable |
| Logo | Arch with capsule eyes | Arch with arch eyes; clear space, minimums, app icons |
| Color | 13 tokens, some failing contrast | Primitives + semantic tokens, `control-border`, `destructive` `#B42318`, state layers |
| Type | Four styles | Named scale, platform mapping, Vietnamese rules |
| Layout | Pane widths only | Spacing, radius, elevation, window classes, targets |
| Components | Three described in prose | 34 specified with states |
| New | — | Iconography, motion, platforms, shortcuts, accessibility, handoff |
