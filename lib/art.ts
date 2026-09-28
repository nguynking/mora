// Public-domain paintings (CC0 open access) served from /public/art in two sizes.
// No people in any of them. Rooms get a stable painting from their id; see docs/BRAND.md §5.
export type Art = { slug: string; title: string; artist: string; date: string; source: string; tone: string; focus: string };

export const ART = {
  oysters: { slug: 'heda-oysters', title: 'Still Life with Oysters, a Silver Tazza, and Glassware', artist: 'Willem Claesz Heda', date: '1635', source: 'https://www.metmuseum.org/art/collection/search/438376', tone: '#251b0e', focus: '62% 50%' },
  peonies: { slug: 'manet-peonies', title: 'Peonies', artist: 'Édouard Manet', date: '1864–65', source: 'https://www.metmuseum.org/art/collection/search/436961', tone: '#595648', focus: '50% 30%' },
  moonlight: { slug: 'hammershoi-moonlight', title: 'Moonlight, Strandgade 30', artist: 'Vilhelm Hammershøi', date: '1900–1906', source: 'https://www.metmuseum.org/art/collection/search/441933', tone: '#614e47', focus: '50% 60%' },
  calmSea: { slug: 'courbet-calm-sea', title: 'The Calm Sea', artist: 'Gustave Courbet', date: '1869', source: 'https://www.metmuseum.org/art/collection/search/436005', tone: '#c2bc9b', focus: '50% 62%' },
  northeaster: { slug: 'homer-northeaster', title: 'Northeaster', artist: 'Winslow Homer', date: '1895', source: 'https://www.metmuseum.org/art/collection/search/11130', tone: '#6d7c81', focus: '40% 50%' },
  cannonRock: { slug: 'homer-cannon-rock', title: 'Cannon Rock', artist: 'Winslow Homer', date: '1895', source: 'https://www.metmuseum.org/art/collection/search/11113', tone: '#84908e', focus: '50% 45%' },
  wheat: { slug: 'monet-stacks-wheat', title: 'Stacks of Wheat (End of Summer)', artist: 'Claude Monet', date: '1890–91', source: 'https://www.artic.edu/artworks/64818', tone: '#8b867c', focus: '62% 55%' },
  snow: { slug: 'monet-stack-snow', title: 'Stack of Wheat (Snow Effect, Overcast Day)', artist: 'Claude Monet', date: '1890–91', source: 'https://www.artic.edu/artworks/16560', tone: '#8d868d', focus: '35% 55%' },
  waterLilies: { slug: 'monet-water-lilies', title: 'Water Lilies', artist: 'Claude Monet', date: '1906', source: 'https://www.artic.edu/artworks/16568', tone: '#517381', focus: '50% 50%' },
  flowersFruit: { slug: 'fantin-latour-flowers', title: 'Still Life with Flowers and Fruit', artist: 'Henri Fantin-Latour', date: '1866', source: 'https://www.metmuseum.org/art/collection/search/436293', tone: '#6e5b48', focus: '50% 42%' },
  primroses: { slug: 'cezanne-primroses', title: 'Still Life with Apples and a Pot of Primroses', artist: 'Paul Cézanne', date: 'ca. 1890', source: 'https://www.metmuseum.org/art/collection/search/435882', tone: '#617e78', focus: '55% 55%' },
  roses: { slug: 'vangogh-roses', title: 'Roses', artist: 'Vincent van Gogh', date: '1890', source: 'https://www.metmuseum.org/art/collection/search/436534', tone: '#7f9176', focus: '50% 38%' },
} satisfies Record<string, Art>;

// Room covers. The welcome, sign-in and empty states use their own fixed pieces.
const COVERS: Art[] = [ART.calmSea, ART.waterLilies, ART.flowersFruit, ART.northeaster, ART.wheat, ART.primroses, ART.cannonRock, ART.roses, ART.snow, ART.oysters];
export const coverFor = (id: string) => COVERS[Array.from(id).reduce((hash, char) => (hash * 33 + char.charCodeAt(0)) >>> 0, 5381) % COVERS.length];
