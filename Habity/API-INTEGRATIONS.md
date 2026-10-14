# Live API integrations

This version connects these public endpoints from the browser:

- **Open Library**: book search (`openlibrary.org/search.json`) and cover thumbnails.
- **Open Food Facts**: packaged food search and available nutrition fields (`world.openfoodfacts.org`). Values depend on the submitted product data and may be incomplete.
- **wger**: exercise search (`wger.de/api/v2/exerciseinfo`). Provider availability and CORS policies may change.
- **Openverse**: search for openly licensed images. The UI displays the provider's title, creator and license when supplied. Verify the exact license and attribution on the original source before reuse.
- **AlAdhan**: city-based prayer time lookup. The UI currently uses calculation method 3 (Muslim World League); this may not match the user's local mosque.
- **AlQuran.cloud**: Quran Arabic text and Sahih International English translation for a random verse. This is a public alternative integration; it is not the authenticated Quran Foundation API.

## Still requires credentials / backend

- **USDA FoodData Central**: requires an API key. Do not put it in `app.js`. Add a server-side endpoint (Cloudflare Pages Function or another backend) that reads the key from an environment secret and proxies a narrow set of requests.
- **Quran Foundation**: content API uses OAuth client credentials. Create an app in the Quran Foundation developer console and keep the client secret on a backend only. Do not embed it in this static site.

The static GitHub Pages deployment cannot securely store secrets. This repo includes no private API keys. A working API request also requires an internet connection and may be blocked by provider CORS policies, rate limits or temporary outages.
