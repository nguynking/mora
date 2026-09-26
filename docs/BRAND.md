# Mora brand guideline — v2

Status: draft for the 12-week validation pilot · 26/09/2026
Interactive version: [`docs/brand/brand-book.html`](brand/brand-book.html)

This replaces the v1 guideline ("a quiet, familiar messenger"). v1 was written
for a generic chat app. The business now has a sharper job: an AI-native work
chat for Vietnamese teams that live on Zalo, where teammates and AI coworkers
share one project room and anyone can pick up the agent's work without
re-explaining it. Every rule below serves that job.

## 1. Brand core

| | |
| --- | --- |
| Promise | **Làm tiếp, không cần kể lại.** Pick up the work. No re-explaining. |
| Descriptor | Chat làm việc cùng đồng đội AI · Work chat with AI coworkers |
| Internal positioning | "Slack with AI coworkers, for teams that live on Zalo." Pitch decks and interviews only, never product copy. |
| Audience | 5–15-person Vietnamese product startups and software studios first; agencies, marketing and operations teams next. Buyer: founder or team lead. |
| The proof moment | A second teammate continues the agent's work from the room, with no briefing. Every screen should make that moment easier. |

**The name.** Mora reads close to *mở ra*, "to open up". Agent work is stuck in
one person's session; Mora opens it to the room. Use this reading in onboarding
and talks. Do not claim it as an etymology.

**Personality: a teammate you can trust.**

| Mora is | Mora is not |
| --- | --- |
| Clear: says what it will do before it does it | Magical: no "AI-powered" sparkle, no surprises |
| Accountable: shows evidence (plan, diff, test results) | Boastful: never claims success without proof |
| Local: Vietnamese first, VND, our date and number formats | Translated: not an English product with Vietnamese strings |
| Calm: quiet surfaces, one accent at a time | Loud: no gradients, confetti or mascot |

## 2. Logo

**The mark: two open arches.** A lowercase *m* drawn as two arches on a jade
tile. The left arch is white: a teammate. The right arch is turmeric: an AI
coworker. They share the middle stem, which is the handoff. The open arches
also read as doorways, the *mở ra* idea.

| Spec | Value |
| --- | --- |
| Tile | 32 × 32 grid, 9-unit corner radius, Jade `#0B6B57` |
| Arches | 3.4-unit stroke, round caps, 4-unit radius, baseline at y = 23 |
| Colors | White `#FFFFFF` (person), Turmeric 300 `#F0B45A` (agent). Turmeric is drawn first so the white stem sits on top. |
| Below 24 px | Use the mono mark (both arches white). Two colors blur at favicon size. |
| Clear space | One arch width (8 units at 32) on every side |
| Wordmark | `mora`, lowercase, Be Vietnam Pro Bold, tracking −3.5%, Ink. Lockup gap = ½ tile width. |

Show the mark in the room rail (workspace switcher), browser tab, app icon,
invoices and marketing. Do not repeat it inside conversations.

Never: recolor the arches (for example white agent, turmeric person), swap
their order, add a gradient or shadow, rotate, stretch, outline the tile, or
place the color mark on a turmeric background.

## 3. Color

Five materials from Vietnamese craft, used functionally: paper, ink, jade,
turmeric and lacquer. Each accent has exactly one meaning.

| Color | Meaning | Where |
| --- | --- | --- |
| **Ngọc · Jade** | A person acts or decides | Primary buttons (Duyệt, Gửi), links, focus ring, your own bubbles, selected state, success |
| **Nghệ · Turmeric** | The AI: its presence, work, requests and budget | Agent avatars, AI label, agent messages, "waiting for approval", "running", AI allowance |
| **Sơn · Lacquer** | Stop, failure, irreversible | Stop button, failed task, destructive confirmation |
| Giấy · Paper and Mực · Ink | Everything else | Surfaces, text, lines |

Screen proportion target: about 80% neutrals, 12% jade, 6% turmeric, 2% lacquer.
Do not add per-feature accent colors. State is always carried by an icon or
text too, never color alone.

### Tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `paper` | `#F5F4F0` | `#141412` | Conversation canvas |
| `surface` | `#FFFFFF` | `#1C1B18` | Panels, cards, received bubbles |
| `sunken` | `#EDEBE4` | `#25231F` | Search, code, hover |
| `select` | `#E7E4DC` | `#2A2824` | Selected room row |
| `line` | `#E2DED4` | `#35332D` | Dividers, card borders |
| `control` | `#8C8578` | `#7C766A` | Input and composer outlines (≥ 3:1) |
| `ink` | `#1D1C19` | `#F1EEE7` | Primary text |
| `ink-2` | `#5E5A51` | `#A8A294` | Previews, timestamps, metadata |
| `jade` | `#0B6B57` | `#43C29E` | Primary action, links, focus |
| `jade-hover` | `#08594A` | `#5FD0AF` | Hover and pressed |
| `on-jade` | `#FFFFFF` | `#0B1F1A` | Text on jade |
| `jade-tint` | `#E4F1EC` | `#15302A` | Own bubble, selected chip |
| `jade-ink` | `#0A5A49` | `#6FD6B6` | Jade text on tint |
| `turmeric` | `#E0A032` | `#F0B45A` | Decorative only in light (dots, marks). Never text. |
| `turmeric-tint` | `#FBEED3` | `#352914` | Agent avatar, approval header |
| `turmeric-soft` | `#FFF8EB` | `#231E14` | Agent message background |
| `turmeric-line` | `#EFD9AA` | `#4A3A1C` | Hairline border of agent messages and cards |
| `turmeric-ink` | `#80480A` | `#F4C47A` | AI label, agent icons, status text |
| `lacquer` | `#B42318` | `#F07A6E` | Stop, error text |
| `lacquer-tint` | `#FCEAE7` | `#3A1D1A` | Error banner |

Checked contrast (WCAG 2.2): ink on paper 15.5:1; ink-2 on paper 6.2:1, on
sunken 5.7:1, on select 5.5:1; white on jade 6.5:1; jade-ink on jade-tint 7.0:1;
turmeric-ink on turmeric-tint 6.4:1; lacquer on surface 6.6:1; control on
surface 3.7:1. Dark: ink-2 on sunken 6.2:1; on-jade on jade 7.7:1;
turmeric-ink on turmeric-tint 8.8:1. Light `turmeric` is 2.3:1 on white, so it
is never used for text or as the only signal of a state.

Why jade: every tool this segment compares us with is blue or purple (Zalo,
Teams, Discord, Telegram, Linear, Copilot) or aubergine (Slack). v1's iris sat
in that crowd.

## 4. Typography

- **Be Vietnam Pro** (OFL, designed in Vietnam) for all UI and marketing.
  Self-host it in the app; fall back to `"Segoe UI", -apple-system, Roboto, Arial, sans-serif`.
- **JetBrains Mono** for code, branch names, file paths and diffs.

| Style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| Display | 40 / 48 | 700, −2% | Marketing only |
| Title | 24 / 32 | 600 | Dialog and page titles |
| Heading | 18 / 28 | 600 | Card titles, panel headings |
| Body | 16 / 26 | 400 | Messages, inputs (16 px minimum on mobile) |
| UI | 14 / 22 | 500 | Room rows, buttons, chips |
| Meta | 12 / 18 | 500 | Timestamps, labels, counts |
| Code | 14 / 22 | 400 mono | Paths, branches, diffs |

Vietnamese rules:

- Line height at least 1.5 for Vietnamese running text and 1.2 for display and titles. Stacked marks (Ặ, Ẫ, Ữ, Ỡ) need the room.
- Sentence case everywhere. **No all-caps Vietnamese**: capital letters with
  diacritics collide and look like shouting. Small uppercase labels are allowed
  only for English or ASCII (`PR`, `AI`, `VND`).
- Never strip diacritics in names or UI. Search must match with and without them.
- Let long names wrap in full where the whole name matters (member lists, handoff credits).

## 5. Shape, space and elevation

Shape tells you who is who at a glance, before you read a label:

| Shape | Means |
| --- | --- |
| Circle | A person |
| Rounded square (30% radius), turmeric tint | An AI coworker. Always with the `AI` label. |
| Rounded tile with `#` | A project room |

- People avatars use three muted tones (warm grey, slate, mauve), never jade or turmeric, so the agent stays the only warm accent.
- Spacing: 4 px base. Steps 4, 8, 12, 16, 24, 32, 48.
- Radius: 6 (chips, inline code), 10 (buttons, inputs), 14 (cards, rows),
  20 (dialogs), full (people avatars, composer). Bubbles 16 with a 4 px corner
  toward the author.
- Elevation: flat in the page. Borders separate panes. Shadow
  (`0 12px 40px rgb(29 28 25 / 16%)`) only on overlays: dialogs, menus, the
  mention picker.

## 6. Layout

- Desktop: three panes. Rooms 272 px on the left, conversation in the center
  (message column max 680 px), the agent's work panel 360 px on the right
  (shared context, current plan, progress, results). The work panel can be
  collapsed; the conversation never can.
- Tablet: rooms collapse into a drawer.
- Mobile: one pane at a time with a back button; the work panel is a bottom
  sheet opened from the room header.
- Headers 56 px. Composer is a pill anchored to the bottom of the conversation.

## 7. Components

- **Messages.** People: bubble on `surface` (theirs) or `jade-tint` (yours).
  Agent: `turmeric-soft` background, hairline turmeric border, rounded-square
  avatar, `AI` label next to the name. Never disguise an agent as a person,
  never style a person as an agent. No colored side rails.
- **Plan card (Kế hoạch).** Numbered steps, the context it used, and two
  actions: **Duyệt kế hoạch** (jade, primary) and **Sửa kế hoạch** (secondary).
  Status chip "Chờ duyệt" in turmeric. Nothing runs before a person approves.
- **Progress card.** One live card per task, updated in place. Steps tick
  as they finish. **Dừng** (lacquer outline) is always visible while running.
- **Result card.** Draft PR number, title, files changed, `+/−`, test results,
  "Mở trên GitHub". Humans review and merge in GitHub.
- **Failure card.** What failed, what did not change, what to do next,
  and **Thử lại**.
- **Shared context panel (Bối cảnh chung).** Repo, confirmed decisions (with
  who added them and when), current plan. Anyone in the room can edit.
- **Status chips.** Đang lên kế hoạch (neutral) · Chờ duyệt (turmeric, clock)
  · Đang chạy (turmeric, pulse) · Hoàn thành (jade, check) · Cần thử lại
  (lacquer, alert) · Đã dừng (neutral, square).
- **Composer.** Pill, `control` outline, jade outline on focus. `@` opens a
  picker that shows people (circles) and agents (rounded squares) together.
- **AI allowance meter.** One jade bar on a `sunken` track with the amount in
  VND. At 80% the bar and text switch to turmeric with "Sắp hết hạn mức". At
  100% running tasks finish and new ones wait for a top-up.

## 8. Voice

Write like a capable Vietnamese colleague in a work chat: short, direct,
ordinary words.

- **Vietnamese first, mixed where teams mix.** Keep the English terms developers
  actually say: PR, commit, branch, review, deploy, test. Do not translate them
  into forms nobody uses ("yêu cầu kéo").
- **Pronouns.** The agent calls itself *mình* and addresses people by name. It
  never guesses *anh / chị / em*, since it cannot know age or seniority. A team
  can set its own house style.
- **Show the work.** State what will happen before it happens, and what
  happened after, with evidence.
- **Errors** say what failed, what did not change, and what to do next. No
  apologies, no vague "Có lỗi xảy ra".
- **No emoji from the agent** by default. No "trợ lý ảo thông minh".

| Say | Avoid |
| --- | --- |
| Mình sẽ sửa menu trong `NavMenu.tsx`, giữ nguyên API. Minh duyệt là mình bắt đầu. | Đã hiểu! Mình sẽ xử lý ngay nhé 🚀 |
| Đã mở PR nháp #48 · 12/12 test đạt · chưa merge. | Xong rồi! Mọi thứ hoạt động hoàn hảo. |
| Chưa tạo được PR: GitHub từ chối quyền ghi. Chưa có thay đổi nào được đẩy lên. Nhờ quản trị repo cấp quyền rồi bấm Thử lại. | Đã có lỗi xảy ra. Vui lòng thử lại sau. |
| Đồng đội AI | Trợ lý ảo, bot thông minh |
| Bối cảnh chung · Kế hoạch · Duyệt · PR nháp · Hạn mức AI · Làm tiếp | Context · Phê chuẩn · Yêu cầu kéo |

**Local formats.** Money `4.000.000 ₫` (dot thousands, ₫ after, no decimals).
Dates `26/09/2026`, times 24-hour `14:05`, relative "hôm qua", "3 phút trước".
Invoices in VND with an e-invoice (hóa đơn điện tử).

## 9. Motion

- Hover and press: 120 ms ease-out. Panels and sheets: 200 ms.
- The agent's **working pulse** (turmeric dot, 1.6 s) is the only looping
  animation, and only while a task is running.
- New messages appear without animation. Cards update in place, never jump.
- Under `prefers-reduced-motion`, the pulse becomes a static dot and the
  "Đang chạy" text carries the state.

## 10. Icons

Lucide-style line icons, 1.75 stroke, round caps, 20 px in UI (16 px in chips).
The agent has no robot, sparkle or brain icon; its symbol is the turmeric arch
from the mark.

## 11. What changed from v1

| Area | v1 | v2 | Why |
| --- | --- | --- | --- |
| Idea | Quiet, familiar messenger | AI-native work chat; the handoff is the hero | Matches the canvas' value proposition |
| Accent | Iris `#6254C8` | Jade + turmeric + lacquer, one meaning each | Iris blended with Teams, Discord, Linear |
| Agents | Same bubble as people, small text label | Own shape, color and label | Canvas: "agents visually distinct from people" |
| Layout | Two panes, context hidden in a dialog | Three panes with the agent's work panel | Shared context must be visible to enable handoff |
| Type | System font stack | Be Vietnam Pro + JetBrains Mono | Vietnamese-designed face; code is first-class |
| Logo | White *m* on iris, no wordmark | Two-arch mark, white + turmeric, wordmark `mora` | The mark now tells the product story |
| Voice | Ordinary Vietnamese | Plus mixed dev vocabulary, pronoun rule, evidence-first agent | Teams speak mixed Vietnamese–English |
| Local | — | VND, e-invoice, Vietnamese formats | Local billing is the wedge |

## 12. Implementation checklist

1. Replace the v1 tokens in `app/globals.css` with the tokens above; add the dark set.
2. Self-host Be Vietnam Pro (400, 500, 600, 700) and JetBrains Mono (400).
3. Replace `public/favicon.svg` with the mono mark; add the color mark for larger icons.
4. Agent avatars and messages: rounded square, turmeric tint, `AI` label.
5. Add the right-hand work panel and move context out of the dialog.
6. Rewrite status text to the six chips above; audit copy against the voice table.
