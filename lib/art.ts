// Public-domain paintings (CC0 open access) served from /public/art in two sizes.
// Rooms get a stable painting from their id; see docs/BRAND.md §5 for use.
export type Art = { slug: string; title: string; artist: string; date: string; museum: string; url: string; tone: string; focus: string };

export const ART = {
  loveLetter: { slug: 'fragonard-love-letter', title: 'The Love Letter', artist: 'Jean Honoré Fragonard', date: 'early 1770s', museum: 'The Met', url: 'https://www.metmuseum.org/art/collection/search/436322', tone: '#835c36', focus: '50% 28%' },
  curiosity: { slug: 'terborch-curiosity', title: 'Curiosity', artist: 'Gerard ter Borch', date: 'ca. 1660–62', museum: 'The Met', url: 'https://www.metmuseum.org/art/collection/search/435714', tone: '#37322c', focus: '48% 55%' },
  waterPitcher: { slug: 'vermeer-water-pitcher', title: 'Young Woman with a Water Pitcher', artist: 'Johannes Vermeer', date: 'ca. 1662', museum: 'The Met', url: 'https://www.metmuseum.org/art/collection/search/437881', tone: '#514e46', focus: '45% 30%' },
  moonlight: { slug: 'hammershoi-moonlight', title: 'Moonlight, Strandgade 30', artist: 'Vilhelm Hammershøi', date: '1900–1906', museum: 'The Met', url: 'https://www.metmuseum.org/art/collection/search/441933', tone: '#614e47', focus: '50% 60%' },
  reading: { slug: 'corot-interrupted-reading', title: 'Interrupted Reading', artist: 'Camille Corot', date: 'c. 1870', museum: 'Art Institute of Chicago', url: 'https://www.artic.edu/artworks/81512', tone: '#806a57', focus: '50% 30%' },
  hucksters: { slug: 'turner-hucksters', title: 'Fishing Boats with Hucksters Bargaining for Fish', artist: 'J. M. W. Turner', date: '1837–38', museum: 'Art Institute of Chicago', url: 'https://www.artic.edu/artworks/4796', tone: '#897b66', focus: '38% 50%' },
  whalers: { slug: 'turner-whalers', title: 'Whalers', artist: 'J. M. W. Turner', date: 'ca. 1845', museum: 'The Met', url: 'https://www.metmuseum.org/art/collection/search/437854', tone: '#b1a682', focus: '55% 50%' },
  lark: { slug: 'breton-song-lark', title: 'The Song of the Lark', artist: 'Jules Breton', date: '1884', museum: 'Art Institute of Chicago', url: 'https://www.artic.edu/artworks/94841', tone: '#6b5d49', focus: '50% 38%' },
  herringNet: { slug: 'homer-herring-net', title: 'The Herring Net', artist: 'Winslow Homer', date: '1885', museum: 'Art Institute of Chicago', url: 'https://www.artic.edu/artworks/25865', tone: '#625642', focus: '50% 55%' },
  wheat: { slug: 'monet-stacks-wheat', title: 'Stacks of Wheat (End of Summer)', artist: 'Claude Monet', date: '1890–91', museum: 'Art Institute of Chicago', url: 'https://www.artic.edu/artworks/64818', tone: '#8b867c', focus: '55% 55%' },
} satisfies Record<string, Art>;

// Room covers. The sign-in, welcome and empty states use their own fixed pieces.
const COVERS: Art[] = [ART.waterPitcher, ART.hucksters, ART.lark, ART.reading, ART.herringNet, ART.wheat, ART.whalers, ART.loveLetter, ART.moonlight, ART.curiosity];
export const coverFor = (id: string) => COVERS[Array.from(id).reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) >>> 0, 5381) % COVERS.length];
export const credit = (art: Art) => `${art.artist}, ${art.title}, ${art.date} · ${art.museum}`;
