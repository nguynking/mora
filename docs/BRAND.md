# Mora brand guideline — v4

Status: pilot · 28/09/2026 (revised: people-free paintings, no captions, avatar system)
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
| Title | Newsreader | 19–28 px / 400–500, word-spacing .09em | Chat header, panel and section titles, dialog titles, plan titles, empty states |
| Kicker | Newsreader italic | 15 px | The "Kế hoạch" label on plan cards |
| Message | System sans | 16 px / 400, line height 1.5 | Bubbles, composer, inputs |
| Row | System sans | 14 px / 600 name, 13 px / 400 preview | Room list |
| Meta | System sans | 12–13 px / 400 | Timestamps, events, labels |

Newsreader is self-hosted at build time through `next/font` with the
Vietnamese subset; nothing is requested from Google at runtime. Its word space
is tight at title sizes (0.2 em), so serif titles add `word-spacing: .09em`. The system
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
and the Art Institute of Chicago. **No people in any of them**: still lifes,
seascapes, fields and an empty interior. They live in
[`public/art`](../public/art) as WebP at 720 and 1400 px (about 1.8 MB for all
twelve), cropped to the painted surface, with titles, sources and focal points
in [`lib/art.ts`](../lib/art.ts).

| Where | Painting | Treatment |
| --- | --- | --- |
| Signed-out welcome | Willem Claesz Heda, *Still Life with Oysters, a Silver Tazza, and Glassware* (1635) | Full window, serif headline top left, mark bottom left, bone "Đăng nhập" pill bottom right |
| Sign-in | Édouard Manet, *Peonies* (1864–65) | Tall card beside the form on sand, headline and mark on the painting |
| No room selected | Vilhelm Hammershøi, *Moonlight, Strandgade 30* (1900–06) | Card above "Chọn một cuộc trò chuyện" |
| Each room | One of ten, chosen from the room id: Courbet *The Calm Sea*; Homer *Northeaster*, *Cannon Rock*; Monet *Stacks of Wheat*, *Stack of Wheat (Snow)*, *Water Lilies*; Fantin-Latour *Still Life with Flowers and Fruit*; Cézanne *Apples and a Pot of Primroses*; Van Gogh *Roses*; Heda | Details panel cover; the empty-room state when the panel is closed |

Rules:

- No people, not even small figures in a landscape. Check at full size before
  adding a painting.
- No captions or credit lines in the product. Titles and sources stay in
  `lib/art.ts` and this guideline.
- Always a rounded frame (20–28 px). The frame shows the painting's average
  tone until the image loads.
- Text on a painting is white serif, placed over a dark area; use the soft
  scrim only when the painting is light where the text sits.
- A room's painting appears once on screen: in the panel when it is open,
  otherwise in the empty-room state.
- Paintings are decorative (`alt=""`).
- Add paintings only from CC0 sources.

## 6. Avatars: bots, people and rooms

Every avatar is a circle, so rows line up whatever is in them.

| Thing | Avatar |
| --- | --- |
| Bot | A disc in one of eight oil-paint pigments, generated from the bot's id, with two ink capsule eyes (spacing also varies by id): madder `#C4553A`, ochre `#D09A3B`, sap green `#6E8A4B`, verdigris `#3E8C80`, ultramarine `#4A67A6`, rose `#C7727C`, sienna `#9C5F33`, slate `#8FA3AD`. |
| Mora (default bot) | The ink disc with paper eyes (bone disc with ink eyes in dark mode). |
| Person | Stone disc with initials: the first letter of the first and last word, without diacritics ("Thanh Ý" → TY, "Nguyễn Văn An" → NA). People never get color. |
| Group room | Two of its members on the diagonal, each 62% of the avatar: the most recent speaker in front, the one before behind, then other people, then bots. In a room of two, you sit behind the other member. The front face has a 2 px ring in the surface color; the back face is a shade deeper. A group with fewer than two members shows its name's initials. |

Sizes: 36 px in the room list (44 px in the rail), 32 px in the chat header,
20 px beside names in group transcripts, 28–32 px in lists and pickers, 64–72
px in the details panel and empty states.

The avatar is the status indicator: idle is still; waiting for approval looks
up and blinks; working bobs and scans, and the details icon turns `working`.
Under reduced motion the avatars stay still and the text ("Chờ duyệt", "Đang
làm") carries the state.

No text labels beside names: no `AI` badge and no `Mẫu` (sample) marker. A
bot's face already says it is a bot, and its role is shown where it helps
(details panel, member lists, pickers).

## 7. Layout

Unchanged from v3: a 288 px room list (or 76 px rail), the conversation (up to
896 px), and a 344 px details panel that pins on wide screens, slides over on
narrower ones and is a full screen on phones. Signed out, the welcome painting
takes the whole window.

- Conversation: paper with a 24 px dot grid; the header has no divider.
- Details panel: the room's painting, then its avatar, name and one line (the
  bot's role, or the member count), then work, shared context and members as
  white cards. Plan actions in the panel are compact: "Duyệt" plus icon
  buttons for stop and edit.
- Adding members lives in the panel's members section, not the chat header.

## 8. Transcript and composer

- Your messages: right, ink bubble. Everyone else: left, white bubble with a
  hairline shadow. Radius 20 px, no tails, 4 px between consecutive bubbles,
  14 px between authors.
- Timestamps sit centered between sessions ("Hôm nay 09:41", "Hôm qua 17:33",
  "Thứ Ba 08:10", then "26/09 08:10"). The room list shows the time today,
  "Hôm qua", the weekday within a week (T2 … CN), then "26/09".
  Per-message time, like and reply appear on hover or focus.
- Events are small centered grey lines.
- Plans are white cards: italic serif kicker "Kế hoạch", serif title, a
  paper step list, status, and pill actions (Duyệt, Dừng, Chỉnh kế hoạch,
  Tiếp nhận).
- Composer: a white pill with a soft shadow, a round stone `+`, the text field,
  and a round ink send button (stone when empty). Placeholder "Nhắn {tên}".
  Thread replies use the same pill.
- While a bot replies in a group, its face and name sit above the typing dots.
- Loading shows skeleton rows, not text. The browser tab shows the open room.

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
| Art | None | Twelve CC0 paintings without people: welcome, sign-in, empty states, room covers; no captions |
| Surfaces | Grey bubbles and cards | White cards and bubbles on paper, dot grid, pill controls |
| Avatars | Bot silhouettes, grey rounded-square groups, `AI` badges | Circles only: pigment discs for bots, member pairs for groups, no badges |
| Signed out | Error banner with a sign-in button | A welcome painting with the promise and a sign-in pill |
| Account | No sign-out control | Sign-out button beside your name |
