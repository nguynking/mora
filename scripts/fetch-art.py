# Temporary: downloads public-domain (CC0) paintings from The Met and the Art
# Institute of Chicago into art-staging/ with a manifest, for review. Runs in
# GitHub Actions because the museum hosts are not reachable from the dev box.
import io, json, os, re, sys, time, urllib.parse, urllib.request
from PIL import Image

OUT = 'art-staging'
UA = {'User-Agent': 'mora-art-fetch/1.0 (github.com/nguynking/mora)', 'AIC-User-Agent': 'mora-art-fetch (github.com/nguynking/mora)'}
MET = [
    ('courbet-calm-sea', 'Courbet The Calm Sea', r'Courbet', r'Calm Sea'),
    ('courbet-source-loue', 'Courbet Source of the Loue', r'Courbet', r'Loue'),
    ('monet-bridge', 'Monet Bridge over a Pond of Water Lilies', r'Monet', r'Bridge over a Pond'),
    ('monet-poplars', 'Monet Poplars', r'Monet', r'Poplars'),
    ('monet-manneporte', 'Monet Manneporte', r'Monet', r'Manneporte'),
    ('monet-water-lilies', 'Monet Water Lilies', r'Monet', r'^Water Lilies$'),
    ('monet-ice-floes', 'Monet Ice Floes', r'Monet', r'Ice Floes'),
    ('vangogh-roses', 'Van Gogh Roses', r'Gogh', r'^Roses$'),
    ('vangogh-irises', 'Van Gogh Irises', r'Gogh', r'^Irises$'),
    ('vangogh-cypresses-tall', 'Van Gogh Cypresses', r'Gogh', r'^Cypresses$'),
    ('vangogh-oleanders', 'Van Gogh Oleanders', r'Gogh', r'Oleanders'),
    ('cezanne-primroses', 'Cezanne Still Life with Apples and a Pot of Primroses', r'zanne', r'Primroses'),
    ('cezanne-sainte-victoire', 'Cezanne Mont Sainte-Victoire', r'zanne', r'Sainte-Victoire'),
    ('fantin-latour-flowers', 'Fantin-Latour Still Life with Flowers and Fruit', r'Fantin', r'Flowers and Fruit'),
    ('manet-peonies', 'Manet Peonies', r'Manet', r'Peonies'),
    ('heda-oysters', 'Heda Still Life with Oysters Silver Tazza', r'Heda', r'Oysters'),
    ('vanhuysum-flowers', 'van Huysum Vase of Flowers', r'Huysum', r'Flowers'),
    ('homer-cannon-rock', 'Winslow Homer Cannon Rock', r'Homer', r'Cannon Rock'),
    ('ryder-moonlight-marine', 'Ryder Moonlight Marine', r'Ryder', r'Moonlight'),
    ('redon-bouquet', 'Redon Bouquet of Flowers', r'Redon', r'Bouquet|Flowers'),
    ('kensett-lake-george', 'Kensett Lake George', r'Kensett', r'Lake George'),
    ('chardin-still-life', 'Chardin Still Life', r'Chardin', r'Still Life|Kitchen'),
]
AIC = [
    ('vangogh-bedroom', 'The Bedroom', r'Gogh'),
    ('monet-water-lilies-aic', 'Water Lilies', r'Monet'),
    ('monet-stack-snow', 'Stack of Wheat (Snow Effect, Overcast Day)', r'Monet'),
    ('cezanne-basket-apples', 'The Basket of Apples', r'zanne'),
    ('whistler-nocturne', 'Nocturne: Blue and Gold—Southampton Water', r'Whistler'),
    ('monet-bordighera', 'Bordighera', r'Monet'),
    ('monet-etretat', 'The Beach at Etretat', r'Monet'),
    ('corot-landscape-aic', 'Ville d\'Avray', r'Corot'),
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
    for object_id in ids[:40]:
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
