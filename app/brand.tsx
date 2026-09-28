import type { CSSProperties, ReactNode } from 'react';
import type { Art } from '@/lib/art';

// The Mora flourish: one monoline stroke, a lowercase m with a curl in, a loop and a tail.
export const MARK_PATH = 'M5.5 14.5C5.5 11.8 8.8 10.6 10.6 12.6C11.4 13.5 11.6 14.7 11.6 16V27.5C11.6 30.5 9.2 31.4 7.9 30C6.9 28.9 7.7 27 9.6 26.4C10.8 26 11.6 25 11.6 23.6V18.5C11.6 14.3 13.9 12 16.6 12C19.3 12 20.6 13.9 20.6 16.8V29V18.5C20.6 14.3 22.9 12 25.6 12C28.3 12 29.6 13.9 29.6 16.8V26C29.6 29.8 31.4 31.4 33.6 31C35.6 30.6 36 28 34.2 27.3';

export function Mark({ size = 28, weight = 2.6, className = '', label }: { size?: number; weight?: number; className?: string; label?: string }) {
  return <svg className={`mora-mark ${className}`} width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" style={{ strokeWidth: weight }} strokeLinecap="round" strokeLinejoin="round" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}><path d={MARK_PATH} /></svg>;
}

// A painting in a rounded frame. The tone fills the frame until the image arrives.
export function ArtFrame({ art, sizes, className = '', eager, children }: { art: Art; sizes: string; className?: string; eager?: boolean; children?: ReactNode }) {
  return <div className={`art-frame ${className}`} style={{ '--tone': art.tone } as CSSProperties}>
    {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized static art with its own srcset */}
    <img src={`/art/${art.slug}-sm.webp`} srcSet={`/art/${art.slug}-sm.webp 720w, /art/${art.slug}-lg.webp 1400w`} sizes={sizes} alt="" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined} decoding="async" draggable={false} style={{ objectPosition: art.focus }} />
    {children}
  </div>;
}
