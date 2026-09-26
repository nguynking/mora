# Mora brand guideline — v3

Status: pilot · 26/09/2026
Reference: [Grok Bot design language](reference/GROK_BOT_DESIGN.md) ·
Interactive version: [`docs/brand/brand-book.html`](brand/brand-book.html)

v3 replaces the colorful v2 guideline. Mora now follows the Grok Bot design
language: a quiet black-and-white messenger where the bots are the only color.
Mora adapts it for what the business needs that Grok Bot does not have:
Vietnamese teams, people and bots in the same room, shared context, and
approval before an agent acts.

## 1. Idea

| | |
| --- | --- |
| Promise | **Làm tiếp, không cần kể lại.** Pick up the work. No re-explaining. |
| Descriptor | Chat làm việc cùng đồng đội AI · Work chat with AI coworkers |
| Design test | Does this help the team delegate, or give them one more thing to manage? If the second, remove it. |

Personality: calm, plain, accountable. The interface stays out of the way; the
bots and the conversation are the only things with character.

## 2. Color

Monochrome. Black, white and greys carry the entire interface. There is no
brand accent color.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#FFFFFF` | `#141414` | Conversation, dialogs |
| `sidebar` | `#F7F7F7` | `#1B1B1B` | Room list, details panel |
| `field` | `#EBEBEB` | `#262626` | Search field |
| `hover` | `#EFEFEF` | `#242424` | Row and icon hover |
| `selected` | `#E8E8E8` | `#2C2C2C` | Selected room |
| `bubble` | `#F0F0F0` | `#262626` | Everyone else's messages, inline cards |
| `bubble-own` | `#0A0A0A` | `#3F3F3F` | Your messages (white text) |
| `foreground` | `#0A0A0A` | `#EDEDED` | Text |
| `muted-foreground` | `#666666` | `#9B9B9B` | Previews, timestamps, events |
| `border` | `#EBEBEB` | `#2A2A2A` | Pane dividers, composer outline |
| `primary` | `#0A0A0A` | `#EDEDED` | Primary buttons, send |
| `working` | `#8B5CF6` | `#A78BFA` | Only signal color: the details icon while a bot works |
| `destructive` | `#D92D20` | `#F97066` | Errors only |

Rules:

- The only saturated color in the product is a bot's avatar. Nothing else
  may borrow bot colors.
- Purple means one thing: a bot in this room is working right now.
- Secondary text is at least 4.5:1 on every surface it sits on (light
  `#666666` is 4.7:1 on the selected row; dark `#9B9B9B` is 5.1:1).
- State is carried by text or an icon as well as by color.

## 3. Bots, people and rooms

Shape tells you what something is before you read its name.

| Thing | Avatar |
| --- | --- |
| Bot | A flat colored shape with two capsule eyes, generated from the bot's id. Shapes: rounded square, circle, pill, rounded triangle, tall capsule. Eight colors. |
| Mora (default bot) | The **arch**: a black dome with two eyes (white in dark mode). The arch is reserved for Mora. |
| Person | Grey circle with initials. People never get color. |
| Group room | Grey rounded square with initials. |

The avatar is the status indicator:

| State | Motion |
| --- | --- |
| Idle | Still |
| Waiting for approval | Eyes look up, occasional blink |
| Working (replying or running a task) | Gentle bob, eyes scan; the details icon turns purple |

Under reduced motion the avatars stay still and the text ("Chờ duyệt",
"Đang làm") carries the state. Bots are also labelled `AI` in the header and in
group messages; Mora never disguises a bot as a person.

## 4. The mark

The logo is the Mora arch character: black on light backgrounds, off-white on
dark. The favicon switches with the system theme. Wordmark: `mora`, lowercase,
system font, semibold. The app surface shows no wordmark; the mark lives in the
browser tab, app icon, invoices and marketing.

## 5. Type

The platform system font, like Grok Bot: SF Pro on Apple devices, Segoe UI on
Windows, Roboto on Android. All three cover Vietnamese; no web font is loaded.

| Style | Size / weight | Use |
| --- | --- | --- |
| Message | 16 px / 400, line height 1.5 | Bubbles, composer, mobile inputs |
| Title | 15 px / 600 | Chat header, panel header |
| Row | 14 px / 600 name, 13 px / 400 preview | Room list |
| Meta | 12–13 px / 400 | Timestamps, events, labels |

Sentence case everywhere. No all-caps Vietnamese. Never strip diacritics.

## 6. Layout

Three panes on desktop, like Grok Bot:

1. **Sidebar (288 px, or a 76 px rail).** Collapse toggle and `+` on top,
   search, one row per room (avatar, name, time, one-line preview), the
   signed-in person at the bottom. The rail shows avatars only.
2. **Conversation.** Plain header with small avatar, name and `AI` label; the
   details icon on the right. No divider. Message column up to 896 px.
3. **Details panel (344 px).** Mora's equivalent of the bot's screen panel:
   the room's identity, its work (plans and their status), the shared context,
   and members. It is pinned beside the conversation on wide screens, slides
   over the conversation on narrower ones, and is a full screen on phones.

Mobile shows one pane at a time with a back button.

## 7. Transcript

- Your messages: right, black bubble. Everyone else: left, grey bubble.
  Radius 18 px, no tails, 4 px between consecutive bubbles, 14 px between
  authors.
- One-to-one chats show no names or avatars beside bubbles. Group chats show a
  small avatar and name above each run of messages.
- Timestamps sit centered between sessions ("Hôm nay 09:41"). Per-message time,
  like and reply appear on hover or focus, and stay visible once a message has
  likes or replies.
- **Events** are small centered grey lines: "Linh Trần đã duyệt kế hoạch …".
- **Plans are inline cards**: a grey card with a white inner list of numbered
  steps, a status, and actions (Duyệt, Dừng, Chỉnh kế hoạch, Tiếp nhận). The
  same plans are listed in the details panel.
- While a bot replies, a grey bubble with three dots appears and its avatar
  starts working.

## 8. Composer

A pill with a soft shadow: round grey `+` on the left (upload a file, mention a
bot, create a plan), the text field, and a round black send button (grey when
empty). Placeholder: "Nhắn {tên}".

## 9. Voice

Plain Vietnamese, first person for bots (*mình*), people addressed by name,
never a guessed *anh / chị / em*. Keep the English words teams use (PR, review,
deploy). Restate the request, ask one question at a time, show evidence, mark
estimates as estimates. No emoji from bots. Errors say what failed, what did
not change and what to do next.

Local formats: `4.000.000 ₫`, `26/09/2026`, 24-hour time.

## 10. What changed from v2

| Area | v2 | v3 |
| --- | --- | --- |
| Color | Jade, turmeric, lacquer on warm paper | Black, white, greys; bots are the only color |
| Bots | Turmeric rounded square with an arch glyph | Generated character per bot, animated by state |
| Type | Be Vietnam Pro + JetBrains Mono | System font |
| Layout | Three panes, plan cards with side rails | Grok-style sidebar with rail mode, pill composer, details panel |
| Logo | Two-arch *m* on a jade tile | The Mora arch character |
