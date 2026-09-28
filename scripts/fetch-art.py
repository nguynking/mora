# Temporary: downloads public-domain (CC0) paintings from The Met and the Art
# Institute of Chicago into art-staging/ with a manifest, for review. Runs in
# GitHub Actions because the museum hosts are not reachable from the dev box.
import io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image

OUT = 'art-staging'
UA = {'User-Agent': 'mora-art-fetch/1.0 (github.com/nguynking/mora)', 'AIC-User-Agent': 'mora-art-fetch (github.com/nguynking/mora)'}
MET = [
    ('fragonard-love-letter', 'Fragonard The Love Letter', r'Fragonard', r'Love Letter'),
    ('terborch-curiosity', 'ter Borch Curiosity', r'Borch', r'Curiosity'),
    ('vermeer-water-pitcher', 'Vermeer Young Woman with a Water Pitcher', r'Vermeer', r'Pitcher'),
    ('vermeer-maid-asleep', 'Vermeer Maid Asleep', r'Vermeer', r'Asleep'),
    ('hammershoi-moonlight', 'Hammershoi Moonlight Strandgade', r'Hammersh', r'Moonlight'),
    ('friedrich-moon', 'Friedrich Two Men Contemplating the Moon', r'Friedrich', r'Contemplating'),
    ('homer-northeaster', 'Winslow Homer Northeaster', r'Homer', r'Northeaster'),
    ('chardin-soap-bubbles', 'Chardin Soap Bubbles', r'Chardin', r'Soap'),
    ('cassatt-mother-sewing', 'Cassatt Young Mother Sewing', r'Cassatt', r'Sewing'),
    ('corot-ville-davray', "Corot Ville-d'Avray", r'Corot', r'Avray'),
    ('dehooch-couple', 'de Hooch Interior with a Young Couple', r'Hooch', r'Couple'),
    ('boudin-trouville', 'Boudin Beach Trouville', r'Boudin', r'Trouville|Beach'),
    ('turner-whalers', 'Turner Whalers', r'Turner', r'Whalers'),
    ('monet-bridge', 'Monet Bridge over a Pond of Water Lilies', r'Monet', r'Bridge'),
    ('vangogh-cypresses', 'Van Gogh Wheat Field with Cypresses', r'Gogh', r'Wheat Field with Cypresses'),
    ('vigee-lebrun-grand', 'Vigee Le Brun Madame Grand', r'Vig', r'Grand'),
]
AIC = [
    ('turner-hucksters', 'Fishing Boats with Hucksters Bargaining for Fish', r'Turner'),
    ('homer-herring-net', 'The Herring Net', r'Homer'),
    ('breton-song-lark', 'The Song of the Lark', r'Breton'),
    ('caillebotte-rainy-day', 'Paris Street; Rainy Day', r'Caillebotte'),
    ('cassatt-childs-bath', "The Child's Bath", r'Cassatt'),
    ('monet-stacks-wheat', 'Stacks of Wheat (End of Summer)', r'Monet'),
    ('renoir-two-sisters', 'Two Sisters (On the Terrace)', r'Renoir'),
    ('corot-interrupted-reading', 'Interrupted Reading', r'Corot'),
]

def get(url, raw=False):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as response:
                body = response.read()
                return body if raw else json.loads(body)
        except Exception as error:
            print('retry', url, error, file=sys.stderr); time.sleep(2 ** attempt)
    raise RuntimeError(url)

def save(slug, image_bytes, meta):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    image.thumbnail((1800, 1800), Image.LANCZOS)
    image.save(f'{OUT}/{slug}.jpg', quality=84, optimize=True, progressive=True)
    meta.update(slug=slug, width=image.width, height=image.height)
    print('saved', slug, image.size, meta.get('title'), '-', meta.get('artist'))
    return meta

def met(slug, query, artist, title):
    ids = get('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=' + urllib.parse.quote(query)).get('objectIDs') or []
    for object_id in ids[:25]:
        item = get(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}')
        if item.get('isPublicDomain') and item.get('primaryImage') and re.search(artist, item.get('artistDisplayName', ''), re.I) and re.search(title, item.get('title', ''), re.I):
            return save(slug, get(item['primaryImage'], raw=True), {'museum': 'The Metropolitan Museum of Art', 'id': object_id, 'title': item['title'], 'artist': item['artistDisplayName'], 'date': item['objectDate'], 'url': item['objectURL'], 'license': 'CC0 (Met Open Access)'})
    print('MISS', slug, file=sys.stderr)

def aic(slug, title, artist):
    fields = 'id,title,artist_title,date_display,image_id,is_public_domain'
    result = get('https://api.artic.edu/api/v1/artworks/search?limit=10&fields=' + fields + '&q=' + urllib.parse.quote(title))
    for item in result.get('data', []):
        if item.get('is_public_domain') and item.get('image_id') and re.search(artist, item.get('artist_title') or '', re.I):
            image = get(f"https://www.artic.edu/iiif/2/{item['image_id']}/full/1686,/0/default.jpg", raw=True)
            return save(slug, image, {'museum': 'The Art Institute of Chicago', 'id': item['id'], 'title': item['title'], 'artist': item['artist_title'], 'date': item['date_display'], 'url': f"https://www.artic.edu/artworks/{item['id']}", 'license': 'CC0 (AIC Open Access)'})
    print('MISS', slug, file=sys.stderr)

os.makedirs(OUT, exist_ok=True)
manifest = []
for entry in MET:
    try: manifest.append(met(*entry))
    except Exception as error: print('FAIL', entry[0], error, file=sys.stderr)
for entry in AIC:
    try: manifest.append(aic(*entry))
    except Exception as error: print('FAIL', entry[0], error, file=sys.stderr)
json.dump([item for item in manifest if item], open(f'{OUT}/manifest.json', 'w'), indent=2, ensure_ascii=False)
