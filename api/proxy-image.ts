// Vercel serverless function: proxies an external image through the server so the
// browser-side downloadAndStoreRecipeImage() fetch isn't blocked by CORS when the
// source site (e.g. a WordPress uploads folder) sends no Access-Control-Allow-Origin
// header. A server-side fetch has no CORS restriction, so it's always able to reach
// the image regardless of what the source site allows.
export default async function handler(req: any, res: any) {
  const url = req.query?.url;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid url' });
    return;
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    res.status(400).json({ error: 'Unsupported protocol' });
    return;
  }

  const hostname = target.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.endsWith('.local')) {
    res.status(400).json({ error: 'Unsupported host' });
    return;
  }

  try {
    const upstream = await fetch(target.toString());
    if (!upstream.ok || !upstream.body) {
      res.status(502).json({ error: `Upstream fetch failed: ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      res.status(415).json({ error: 'URL did not return an image' });
      return;
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buffer);
  } catch (error: any) {
    res.status(502).json({ error: error.message || 'Fetch failed' });
  }
}
