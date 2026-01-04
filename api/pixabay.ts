import type { VercelRequest, VercelResponse } from "@vercel/node";

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

type ErrorPayload = { message: string; details?: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" } satisfies ErrorPayload);
    }

    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Missing PIXABAY_API_KEY" } satisfies ErrorPayload);
    }

    const qRaw = (req.query.q ?? "").toString().trim();
    if (!qRaw) {
      return res.status(400).json({ message: 'Missing query param "q"' } satisfies ErrorPayload);
    }

    const perPageRaw = (req.query.per_page ?? "50").toString();
    const perPage = Math.max(3, Math.min(200, Number(perPageRaw) || 50));

    const url =
      "https://pixabay.com/api/?" +
      new URLSearchParams({
        key: apiKey,
        q: qRaw,
        image_type: "photo",
        per_page: String(perPage),
        safesearch: "true",
      }).toString();

    // Ensure TS knows this is a Response
    const pixRes = (await fetch(url)) as Response;

    if (!pixRes.ok) {
      const text = await pixRes.text().catch(() => "");
      return res.status(pixRes.status).json({
        message: `Pixabay request failed (${pixRes.status})`,
        details: text.slice(0, 300),
      } satisfies ErrorPayload);
    }

    const data = (await pixRes.json()) as PixabayResponse;

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message } satisfies ErrorPayload);
  }
}
