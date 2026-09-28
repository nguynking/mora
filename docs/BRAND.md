# Mora brand guideline — v4

Status: pilot · 28/09/2026
Previous: v3 (monochrome, Grok Bot-style). The interactive
[`docs/brand/brand-book.html`](brand/brand-book.html) still shows v3 and is
kept as an archive until it is redrawn. An earlier v4 draft on the unmerged
branch `claude/zealous-maxwell-hp0j5m` kept the monochrome direction; this
guideline replaces it.

v4 keeps v3's layout and behavior and changes the feel: **paper and ink, with
paintings**. The interface is warm and quiet, set on paper tones with a serif
for titles. Color comes from public-domain paintings framed in rounded cards,
and from the bots.

## 1. Idea

| | |
| --- | --- |
| Promise | **Làm tiếp, không cần kể lại.** Pick up the work. No re-explaining. |
| Descriptor | Chat làm việc cùng đồng đội AI · Work chat with AI coworkers |
| Mood | An editorial, museum-label calm: paper, ink, oil paint, a hand-drawn flourish. |
| Design test | Does this help the team delegate, or give them one more thing to manage? If the second, remove it. |

Personality: calm, plain, accountable, a little literary. The interface stays
out of the way; the paintings, the bots and the conversation carry the
character.

## 2. Color

Warm neutrals carry the interface. There is no brand accent color; paintings
and bots are the color.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `background` | `#F5F3EE` paper | `#171613` | Conversation (with a faint dot grid), sign-in form |
| `sidebar` | `#ECE8E0` stone | `#1D1C19` | Room list, details panel |
| `card` / `bubble` | `#FFFFFF` | `#252420` / `#282621` | Everyone else's messages, plan cards, panel items |
| `bubble-own` | `#1C1B18` ink | `#E9E4D9` bone | Your messages |
| `foreground` | `#1C1B18` | `#EFEBE3` | Text |
| `muted-foreground` | `#67635A` | `#A59F93` | Previews, timestamps, captions |
| `muted` | `#E5E1D8` | `#2E2C27` | Secondary pills, `+` button |
| `field` | `#E3DFD6` | `#2A2823` | Search pill |
| `input` | `#8C867A` | `#7A7468` | Input borders (≥3:1 on their surface) |
| `sand` | `#D8D1C2` | `#23211D` | Sign-in page |
| `working` | `#7B5CA6` | `#B39DDB` | Only signal color: the details icon while a bot works |
| `destructive` | `#B42318` | `#F97066` | Errors only |

Rules:

- Selected rows and cards are white on stone, with a soft shadow, not a grey
  fill.
- Primary actions are ink pills (bone in dark mode). Secondary actions are
  stone pills. One primary action per view.
- Text contrast is at least 4.5:1 on every surface it sits on (muted on stone
  is 4.9:1 light, 6.5:1 dark). Muted text on `sand` uses `sand-muted`.
- State is carried by text or an icon as well as by color.

## 3. Type

| Style | Font | Size / weight | Use |
| --- | --- | --- | --- |
| Display | Newsreader | 36–64 px / 400, −2% tracking | Welcome and sign-in headlines |
| Title | Newsreader | 19–28 px / 400–500 | Chat header, panel and section titles, dialog titles, plan titles, empty states |
| Caption | Newsreader italic | 13–15 px | Art credits, the "Kế hoạch" kicker |
| Message | System sans | 16 px / 400, line height 1.5 | Bubbles, composer, inputs |
| Row | System sans | 14 px / 600 name, 13 px / 400 preview | Room list |
| Meta | System sans | 12–13 px / 400 | Timestamps, events, labels |

Newsreader is self-hosted at build time through `next/font` with the
Vietnamese subset; nothing is requested from Google at runtime. Its word space
is tight at title sizes, so serif titles add `word-spacing: .05em`. The system
sans (SF Pro, Segoe UI, Roboto) stays for everything you read in bulk.

Sentence case everywhere. No all-caps Vietnamese. Never strip diacritics.

## 4. The mark

The Mora flourish: one monoline stroke drawing a lowercase *m* with a curl in,
a loop on the first stem and a tail curl. Round caps and joins. Source:
`MARK_PATH` in [`app/brand.tsx`](../app/brand.tsx).

- On paper: ink. On paintings: white. App icon and favicon: bone mark on an
  ink tile ([`public/favicon.svg`](../public/favicon.svg),
  `public/apple-touch-icon.png`).
- Stroke is 2.6 units at 24–32 px, 2.2 at 40 px and larger.
- It heads the room list and sits in the lower left of art cards, as in a
  printed plate. There is still no wordmark in the app surface.
- Don't fill, outline, recolor with bot colors, or redraw it in a script font.

## 5. Paintings

Public-domain paintings, CC0 open access from The Metropolitan Museum of Art
and the Art Institute of Chicago. Subjects: letters and reading, quiet
interiors, sea and fields. They live in [`public/art`](../public/art) as WebP
at 720 and 1400 px (about 0.9 MB for all ten), with credits and focal points
in [`lib/art.ts`](../lib/art.ts).

| Where | Painting | Treatment |
| --- | --- | --- |
| Signed-out welcome | Winslow Homer, *The Herring Net* (1885) | Full pane, serif headline top left, mark and credit bottom left, bone "Đăng nhập" pill |
| Sign-in | Jean Honoré Fragonard, *The Love Letter* (early 1770s) | Tall card beside the form on sand |
| No room selected | Vilhelm Hammershøi, *Moonlight, Strandgade 30* (1900–06) | Card above "Chọn một cuộc trò chuyện" |
| Each room | One of ten, chosen from the room id | Details panel cover with frosted pills (members, plans); empty-room state |

Rules:

- Always a rounded frame (20–28 px). The frame shows the painting's average
  tone until the image loads.
- Text on a painting is white serif over a soft scrim, never on a busy area.
- Labels on paintings are **frosted pills**: translucent white, blurred, white
  text, with a white inner pill for a number (`Thành viên 4`).
- Credit the work wherever it is shown large: artist, title, date · museum, in
  italic serif caption. Covers link to the museum page.
- Paintings are decorative (`alt=""`); the credit is visible text.
- Add paintings only from CC0 sources, and record the museum URL in
  `lib/art.ts`.

## 6. Bots, people and rooms

Shape tells you what something is before you read its name.

| Thing | Avatar |
| --- | --- |
| Bot | A flat shape with two capsule eyes, generated from the bot's id, in one of eight oil-paint pigments: madder `#C4553A`, ochre `#D09A3B`, sap green `#6E8A4B`, verdigris `#3E8C80`, ultramarine `#4A67A6`, rose `#C7727C`, sienna `#9C5F33`, slate `#8FA3AD`. Ink eyes. |
| Mora (default bot) | The ink arch with two eyes (bone in dark mode). |
| Person | Stone circle with initials. People never get color. |
| Group room | Stone rounded square with initials. |

The avatar is the status indicator: idle is still; waiting for approval looks
up and blinks; working bobs and scans, and the details icon turns
`working`. Under reduced motion the avatars stay still and the text ("Chờ
duyệt", "Đang làm") carries the state. Bots are labelled `AI`; Mora never
disguises a bot as a person.

## 7. Layout

Unchanged from v3: a 288 px room list (or 76 px rail), the conversation (up to
896 px), and a 344 px details panel that pins on wide screens, slides over on
narrower ones and is a full screen on phones. Signed out, the welcome painting
takes the whole window.

- Conversation: paper with a 24 px dot grid; the header has no divider.
- Details panel: the room's painting, then identity, work, shared context and
  members as white cards.

## 8. Transcript and composer

- Your messages: right, ink bubble. Everyone else: left, white bubble with a
  hairline shadow. Radius 20 px, no tails, 4 px between consecutive bubbles,
  14 px between authors.
- Timestamps sit centered between sessions on a paper pill ("Hôm nay 09:41").
  Per-message time, like and reply appear on hover or focus.
- Events are small centered grey lines.
- Plans are white cards: italic serif kicker "Kế hoạch", serif title, a
  paper step list, status, and pill actions (Duyệt, Dừng, Chỉnh kế hoạch,
  Tiếp nhận).
- Composer: a white pill with a soft shadow, a round stone `+`, the text field,
  and a round ink send button (stone when empty). Placeholder "Nhắn {tên}".

## 9. Voice

Plain Vietnamese, first person for bots (*mình*), people addressed by name,
never a guessed *anh / chị / em*. Keep the English words teams use (PR, review,
deploy). Restate the request, ask one question at a time, show evidence, mark
estimates as estimates. No emoji from bots. Errors say what failed, what did
not change and what to do next.

Local formats: `4.000.000 ₫`, `28/09/2026`, 24-hour time.

## 10. What changed from v3

| Area | v3 | v4 |
| --- | --- | --- |
| Color | Black, white, greys | Paper, stone and ink; paintings and bots are the color |
| Type | System font only | Newsreader serif for titles and captions; system sans for reading |
| Mark | The arch character | The flourish *m*; the arch remains Mora the bot |
| Art | None | Ten CC0 paintings: welcome, sign-in, empty states, room covers |
| Surfaces | Grey bubbles and cards | White cards and bubbles on paper, dot grid, pill controls, frosted labels |
| Bot colors | Saturated UI hues | Oil-paint pigments; purple kept only for "working" |
| Signed out | Error banner with a sign-in button | A welcome painting with the promise and a sign-in pill |
| Account | No sign-out control | Sign-out button beside your name |
