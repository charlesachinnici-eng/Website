/**
 * Cloudflare Worker: USCF Events Proxy
 * For: Reno Chess Club (renochessclub.org)
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://dash.cloudflare.com and create a free account
 * 2. Click "Workers & Pages" in the left sidebar
 * 3. Click "Create Application" → "Create Worker"
 * 4. Name it something like "uscf-proxy"
 * 5. Replace the default code with this entire file
 * 6. Click "Deploy"
 * 7. Copy the Worker URL (looks like: https://uscf-proxy.YOUR-NAME.workers.dev)
 * 8. Paste that URL into Results_at_USCF.html where indicated (WORKER_URL constant)
 *
 * That's it. Free tier allows 100,000 requests/day — more than enough.
 * When you migrate to Omnis.com, you can optionally set up a custom domain
 * for the Worker (e.g. proxy.renochessclub.org) through Cloudflare's dashboard,
 * no code changes needed.
 */

// The USCF affiliate search URL for Reno Chess Club (affil=A5012490)
const USCF_URL = 'https://www.uschess.org/datapage/event-search.php' +
    '?name=&state=ANY&city=&date_from=&date_to=&order=D' +
    '&minsize=&affil=A5012490&timectl=&rsys=ANY&mode=Find';

// Allowed origins — add your domain here when you move to Omnis
const ALLOWED_ORIGINS = [
    'https://renochessclub.github.io',   // GitHub Pages
    'http://localhost',                   // Local development
    'http://127.0.0.1',                  // Local development
    'https://www.renochessclub.org',      // Future Omnis domain (add when ready)
    'https://renochessclub.org',          // Future Omnis domain (add when ready)
];

export default {
    async fetch(request) {
        const origin = request.headers.get('Origin') || '';

        // Handle preflight CORS requests (browser sends these before the real request)
        if (request.method === 'OPTIONS') {
            return handleCORS(origin);
        }

        // Only allow GET requests
        if (request.method !== 'GET') {
            return new Response('Method not allowed', { status: 405 });
        }

        try {
            // Fetch from USCF, impersonating a regular browser
            const uscfResponse = await fetch(USCF_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; RenoChessClub/1.0)',
                    'Accept': 'text/html,application/xhtml+xml',
                },
            });

            if (!uscfResponse.ok) {
                return new Response(
                    JSON.stringify({ error: `USCF returned status ${uscfResponse.status}` }),
                    {
                        status: 502,
                        headers: corsHeaders(origin, 'application/json'),
                    }
                );
            }

            const html = await uscfResponse.text();

            // Return the HTML to the browser, with CORS headers attached
            return new Response(html, {
                status: 200,
                headers: corsHeaders(origin, 'text/html; charset=utf-8'),
            });

        } catch (error) {
            return new Response(
                JSON.stringify({ error: 'Failed to fetch from USCF', detail: error.message }),
                {
                    status: 500,
                    headers: corsHeaders(origin, 'application/json'),
                }
            );
        }
    },
};

// Returns CORS headers for a given origin and content type
function corsHeaders(origin, contentType) {
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    };
}

// Handles the OPTIONS preflight request
function handleCORS(origin) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, 'text/plain'),
    });
}
