import { useState } from "react";

interface PixabaySearchProps {
  handleSetImage: (img: string) => void; // your single square photo
}

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


const PIXABAY_API_KEY = import.meta.env.VITE_PIXABAY_API_KEY as string | undefined;
const SQUARE_TOLERANCE = 0.6; // how close width/height must be to be “square”


export const PixabaySearchGrid: React.FC<PixabaySearchProps> = ({ handleSetImage}) => {
 const [query, setQuery] = useState("");
  const [images, setImages] = useState<PixabayHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!PIXABAY_API_KEY) {
      setError("Missing Pixabay API key. Set VITE_PIXABAY_API_KEY in your .env.local.");
      return;
    }
    if (!query.trim()) return;

    setLoading(true);
    try {
      const encoded = encodeURIComponent(query.trim());
      const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encoded}&image_type=photo&per_page=50&safesearch=true`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as PixabayResponse;

      // Keep only square-ish images
      const squareHits = data.hits.filter((hit) => {
        const ratio = hit.imageWidth / hit.imageHeight;
        return ratio > 1 - SQUARE_TOLERANCE && ratio < 1 + SQUARE_TOLERANCE;
      });

      setImages(squareHits);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 p-4 bg-white/70 rounded-xl">
       <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold mb-3 text-nickBlack">
          Pixabay Photo Search
        </h1>
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-white text-nickBlack border border-nickBrown/30 hover:bg-nickCream transition text-2xl leading-none"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse search" : "Expand search"}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "-" : "+"}
        </button>
      </div>
      {isExpanded && (
        <>
          <form
            onSubmit={handleSearch}
            className="flex gap-3 items-center bg-white/80 rounded-full px-4 py-2 shadow"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Pixabay (e.g. cats, sunset, puzzle)…"
              className="flex-1 bg-transparent outline-none text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-nickRust text-white text-sm font-medium hover:bg-nickBrown transition"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-sm text-nickBrown">Loading images…</div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="text-sm text-nickBrown/80">
              No images yet. Try searching for a keyword above.
            </div>
          )}

          {/* Results grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                type="button"
                className="relative aspect-square overflow-hidden rounded-xl bg-nickCream shadow hover:shadow-md transition"
                title={img.tags}
                onClick={() => handleSetImage(img.largeImageURL)}
              >
                <img
                  src={img.webformatURL}
                  alt={img.tags}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/40 text-[10px] text-white px-2 py-1 truncate">
                  {img.user}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
