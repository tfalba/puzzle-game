type PixabayHit = {
  id: number;
  webformatURL: string;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  tags: string;
  user: string;
};

type PixabayResponse = {
  hits: PixabayHit[];
  total: number;
  totalHits: number;
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Missing PIXABAY_API_KEY" });
    }

    const qRaw = (req.query?.q ?? "").toString().trim();
    if (!qRaw) {
      return res.status(400).json({ message: 'Missing query param "q"' });
    }

    const perPageRaw = (req.query?.per_page ?? "50").toString();
    const perPage = Math.max(3, Math.min(200, Number(perPageRaw) || 50));

    const url =
      `https://pixabay.com/api/?` +
      new URLSearchParams({
        key: apiKey,
        q: qRaw,
        image_type: "photo",
        per_page: String(perPage),
        safesearch: "true",
      }).toString();

    const pixRes = await fetch(url);
    if (!pixRes.ok) {
      const text = await pixRes.text().catch(() => "");
      return res.status(pixRes.status).json({
        message: `Pixabay request failed (${pixRes.status})`,
        details: text.slice(0, 300),
      });
    }

    const data = (await pixRes.json()) as PixabayResponse;

    // Optional caching at Vercel edge
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ message: err?.message ?? "Server error" });
  }
}
