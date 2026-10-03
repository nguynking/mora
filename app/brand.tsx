import type { CSSProperties } from 'react';
import kit from '@/docs/brand/bot-kit.json';
import { assignLook, type BotLook, type BotState } from '@/lib/bot-look';

export const sized = (size?: number) => size ? { '--size': `${size}px` } as CSSProperties : undefined;

export function BotFace({ id, size, state = 'idle', look }: { id: string; size?: number; state?: BotState; look?: BotLook }) {
  const mora = id === 'mora';
  const expression = kit.states[size && size < 24 ? 'idle' : state];
  const appearance = look || assignLook(id, []);
  const color = kit.colors[appearance.color];
  const eye = kit.eyes[expression.eyes as Exclude<keyof typeof kit.eyes, '$description'>];
  const body = mora ? (state === 'paused' ? 'var(--muted-foreground)' : 'var(--foreground)') : state === 'paused' ? color.paused : color.hex;
  const eyeColor = mora ? 'var(--background)' : 'var(--bot-eye)';
  return <svg className={`bot-face is-${state}${mora ? ' is-mora' : ''}${size && size <= 24 ? ' is-still' : ''}`} style={sized(size)} viewBox="0 0 40 40" aria-hidden="true">
    <g className="bot-body">
      <path d={kit.silhouettes[mora ? 'arch' : appearance.silhouette].path} fill={body} />
      <g transform={`translate(${expression.eyeOffset.join(' ')})`}>
        <g className="eyes" fill={eyeColor} style={{ color: eyeColor }}>
          {[0, 11].map((offset, index) => <g key={offset} transform={`translate(${offset} 0)`}>
            <path d={eye.path} transform={expression.eyes === 'flip' ? `rotate(${index ? -14 : 14} 14.5 22.5)` : undefined} fill={expression.eyes === 'smile' ? 'none' : undefined} stroke={expression.eyes === 'smile' ? 'currentColor' : undefined} style={expression.eyes === 'smile' ? { strokeWidth: 2 } : undefined} strokeLinecap="round" />
          </g>)}
        </g>
      </g>
    </g>
  </svg>;
}

export function Mark({ size = 28, label }: { size?: number; label?: string }) {
  return <svg className="mora-mark" width={size} height={size} viewBox="0 0 40 40" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <path d={kit.silhouettes.arch.path} fill="currentColor" />
    <g fill="var(--background)"><path d={kit.eyes.arch.path} /><path d={kit.eyes.arch.path} transform="translate(11 0)" /></g>
  </svg>;
}

export function AiLabel() {
  return <span className="ai-label" aria-label="Đồng đội AI">AI</span>;
}
