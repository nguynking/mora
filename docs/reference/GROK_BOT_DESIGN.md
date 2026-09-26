# Grok Bot design language (reconstructed reference)

A working reconstruction of the design language behind xAI's Grok Bot, used as
the reference for Mora's v3 interface. It is not an official xAI document.

**How this was built.** xAI's post [Designing Grok Bot for a world of
persistent agents](https://x.ai/news/designing-grok-bot) could not be fetched
from our build environment, so the principles below come from search excerpts
of that post and of third-party write-ups (sources at the end). Visual values
(colors, sizes, radii) were measured from three product screenshots supplied
by the team (light "Amazon Bot" and "Haggle Bot" windows, dark "Kenny"
window). Treat measured values as approximate.

## 1. The core idea

The interface is built for agents that persist beyond one session and carry
responsibility on their own. Chat history becomes a **roster of bots**, each
with presence, memory, its own tools and its own computer, and some work starts
without a prompt. The post frames every decision around one question: *did
this help someone delegate, or give them one more thing to manage?* Much of
the late design work was removing things: window and panel controls,
computer-view options, agent metadata.

## 2. Objects

Five objects, in order of importance:

| Object | Meaning |
| --- | --- |
| Bots | The persistent agents. Name, avatar, title, memory, tools, computer. |
| Chats | Conversations with a bot. Pushed down; the bot is the thing you return to. |
| Prompts | Instructions and context. |
| Tools | Connectors, APIs, shell, computer use. |
| Artifacts | Durable outputs: documents, designs, code, data. |

Routines tell a bot when to run a workflow, on a schedule or after an event.
Skills are reusable instructions that can be used once, saved, or triggered by
a routine.

## 3. Layout

Deliberately iMessage-shaped: a sidebar of bots, one conversation, and the
same thread continuing across desktop and phone.

- **Sidebar.** Search on top, then one row per bot: avatar, name, time, one
  line of preview. The selected row is a soft grey fill. A new-chat `+` sits
  in the top corner. The signed-in person and plugins sit at the bottom.
  The sidebar can collapse to a rail of avatars only, with `+` and the
  person's photo at the bottom.
- **Conversation.** A plain header: small avatar and bot name on the left, one
  icon on the right. No divider line. Centered small timestamps separate
  sessions ("9:41 AM"). The composer is a floating pill.
- **The bot's computer.** Four placements were considered (floating window,
  side by side, modal, full screen). The more prominent the computer, the more
  it invited supervision, so it stays the bot's workspace with three levels of
  access: a status signal (the title-bar icon turns purple while the computer is
  active), a preview (a pinned side panel you can follow without leaving the
  conversation), and full access when something needs you. The side panel also
  lists the bot's routines with their schedule or "Paused".

## 4. Color

Monochrome. Black, white and greys carry the whole interface; the bot avatars
are the only saturated color, plus one purple activity signal.

| Role | Light (measured) | Dark (measured) |
| --- | --- | --- |
| Window | white | near-black `#141414` |
| Sidebar | very light grey | `#1b1b1b` |
| Selected row, search field | light grey | `#2c2c2c` |
| Bot bubble | light grey `#f0f0f0` | dark grey `#262626` |
| Your bubble | black, white text | mid grey `#3f3f3f`, white text |
| Secondary text | mid grey | mid grey |
| Activity signal | purple | purple |

## 5. Type

The platform system font (SF Pro on Apple), in few sizes: about 16 px for
messages, 14 px for names and rows, 12–13 px for previews, timestamps and
events. Semibold for names and titles only. Sentence case throughout.

## 6. Bot avatars

The team studied initials, emoji, pixel art, watercolor, clay, line art,
silhouettes and identicons. Rich styles had too much detail at sidebar size;
simple ones made bots look interchangeable. The chosen system:

- One simple, flat, colored shape per bot.
- A face reduced to two tall capsule eyes. No mouth or nose, so it reads as a
  character rather than a portrait.
- Distinction through controlled variation (shape, color, accessories) inside
  one construction, so every bot is recognizable at a glance and all of them
  look like one family.
- Generated in code.

**The avatar is the status indicator.** A bot can be idle, thinking, working,
waiting, blocked or done. The avatar's motion carries that lifecycle instead of
separate badges: calm and slightly curious at rest, it acknowledges new work,
kicks into gear while working, changes again when it is waiting or needs help,
and settles when done.

## 7. The transcript

One timeline holds conversation, system events, interactive objects and
visualizations.

- **Bubbles.** Yours on the right, the bot's on the left. No avatars beside
  bubbles in a one-to-one chat. Consecutive bot messages stack as separate
  bubbles with a small gap. Corner radius around 18 px, no tails.
- **Inline cards and widgets.** Prose when prose fits, structured UI when it
  does not: forecasts, task lists, emails, boards, editable artifacts.
- **Questions.** A bot's question is a grey bubble with a white answer field
  inside it; the chosen option shows a letter chip and a check.
- **Events.** When a bot creates a routine, changes a setting or messages
  another bot, a small centered grey line appears in the transcript ("Created
  routine · Tech reorder from SF new hires") and can be opened for detail.

## 8. Composer

A white pill (dark grey in dark mode) with a soft shadow. A round grey `+` on
the left for attachments and actions, a round black send button with an up
arrow on the right (a microphone when empty, in the dark screenshot).

## 9. Voice

Bots speak plainly and first-person, restate what they understood, ask one
question at a time, and state numbers and sources exactly. "Got it. … One
question before I set it up." Estimates are marked as estimates, and the bot
says what it is still checking.

## Sources

- [Designing Grok Bot for a world of persistent agents](https://x.ai/news/designing-grok-bot), xAI (via search excerpts)
- [Introducing Grok Bot](https://x.ai/news/introducing-grok-bot), xAI
- [Grok Bot docs: bots, skills and routines](https://docs.x.ai/grok-bot/overview), xAI
- [Grok Bot, Rounded Square Eyes](https://designcompass.org/en/2026/08/12/grok-bot-ai-teammate/), Design Compass
- [xAI introduces new Grok Bot design for persistent AI agents](https://agentlocker.ai/news/xai-introduces-new-grok-bot-design-for-persistent-ai-agents), AgentLocker
- [A Guide to Grok Bot](https://composio.dev/content/guide-to-frok-bot), Composio
- Three product screenshots supplied by the Mora team (26/09/2026)
