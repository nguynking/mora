import kit from '@/docs/brand/bot-kit.json';

export type BotState = keyof typeof kit.states;
export type BotLook = { silhouette: Exclude<keyof typeof kit.silhouettes, 'arch'>; color: Exclude<keyof typeof kit.colors, '$description'> };
const silhouettes = kit.assignableSilhouettes as BotLook['silhouette'][];
const colors = Object.keys(kit.colors).filter(key => key !== '$description') as BotLook['color'][];

// The brand book's FNV-1a walk visits all 40 pairs before repeating.
export function assignLook(id: string, taken: BotLook[]): BotLook {
  let hash = 0x811c9dc5;
  for (const byte of new TextEncoder().encode(id.normalize('NFC'))) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  const count = silhouettes.length * colors.length;
  const order = Array.from({ length: count }, (_, k) => {
    const index = (hash % count + k * 17) % count;
    return { silhouette: silhouettes[index % silhouettes.length], color: colors[Math.floor(index / silhouettes.length)] };
  });
  const usedShapes = new Set(taken.map(look => look.silhouette));
  const usedColors = new Set(taken.map(look => look.color));
  const pairs = new Set(taken.map(look => `${look.silhouette}:${look.color}`));
  return order.find(look => !usedShapes.has(look.silhouette) && !usedColors.has(look.color))
    || order.find(look => !usedColors.has(look.color))
    || order.find(look => !pairs.has(`${look.silhouette}:${look.color}`))
    || order[0];
}

// Creation order is immutable in the current API. New bots append without
// changing existing looks, and names, room order and client state play no part.
export function workspaceLooks(bots: { id: string; created?: number }[]) {
  const looks = new Map<string, BotLook>();
  const ordered = [...bots].filter(bot => bot.id !== 'mora').sort((a, b) => (a.created || 0) - (b.created || 0) || a.id.localeCompare(b.id));
  for (const bot of ordered) looks.set(bot.id, assignLook(bot.id, [...looks.values()]));
  return looks;
}

export const botStatusText = (state: BotState) => kit.states[state].vi;
