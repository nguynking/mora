# Mora

Mora is a familiar place to talk and work with coworkers, including AI coworkers.
The interface should feel quiet, capable and easy to recognize. Conversation is
always the main activity.

## Identity

- Write **Mora** in sentences and use **mora.** for the wordmark.
- Use a lowercase wordmark with an iris dot. The favicon uses a white m on iris.
- No tagline, promotional badge, workspace banner or decorative AI imagery inside chat.
- Human and AI participants use the same avatar scale, message bubbles, conversation list and member picker. Identify AI with a small text label, never disguise a bot as a real person.

## Color

| Token | Value | Role |
| --- | --- | --- |
| Surface | `#FFFFFF` | Sidebar, header and received bubbles |
| Canvas | `#FAFAFC` | Conversation background |
| Ink | `#24232B` | Primary text |
| Secondary text | `#6F6B79` | Previews, timestamps and supporting text |
| Border | `#E8E7ED` | Structural dividers |
| Input outline | `#928E9E` | Form and composer boundaries |
| Iris | `#6254C8` | Primary action and focus |
| Iris hover | `#5143B1` | Hover and selected name |
| Selection | `#F1EFFB` | Selected chat and sent bubbles |

Keep color functional. White-on-iris is approximately 5.8:1. Secondary text is
at least 4.5:1 on each intended light surface, including selection. Use text or
shape as well as color for state. Do not introduce new accent colors per feature.

## Typography and spacing

Use a native sans-serif stack with Vietnamese support: Segoe UI, Apple system,
Arial and sans-serif. Avoid a remote-font dependency. Messages and all mobile
inputs are 16px or larger, line height 1.6; routine names and previews 14–16px;
secondary metadata 12–13px. Preserve all Vietnamese diacritics and let long
names and role descriptions wrap where full content is needed.

Use a 4px base spacing rhythm. Circular avatars, 10px controls, 12px conversation
rows, 16px bubbles and 20px modal corners. A narrow structural border separates
the chat list from the conversation. Shadows are reserved for overlays.

## Interaction and voice

- One list of recent conversations, sorted by latest message. Do not separate bots into another navigation section.
- Desktop has a chat list and conversation. Mobile shows one at a time, with a back button.
- New conversation exposes three actions: Tìm thành viên, Tạo bot, Tạo nhóm.
- A bot needs only a name and role. Its role guides server-side replies.
- In a direct conversation the bot replies naturally. In a group it replies when mentioned by name; the @ picker avoids typing long names.
- Use ordinary Vietnamese: Nhập tin nhắn, Thêm thành viên, Tạo nhóm.
- Keep shortcuts operational but do not explain them persistently.
- Preserve drafts per conversation. Explain errors where they happen and never claim an unavailable AI service is connected.
- Extra project context and existing saved work live in a dialog reached from chat information. They do not create a third pane.
- Respect reduced motion; never animate routine message arrivals.
