import { useEffect, useState } from "react";

interface PixabaySearchProps {
  handleSetImage: (img: string) => void; // your single square photo
  onClose?: () => void;
  isOpen?: boolean;
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


export const PixabaySearchGrid: React.FC<PixabaySearchProps> = ({
  handleSetImage,
  onClose,
  isOpen = false,
}) => {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<PixabayHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleImageSelect = (url: string) => {
    handleSetImage(url);
    onClose?.();
  };

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

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setImages([]);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden px-6 py-8 sm:px-10 sm:py-10 text-nickBlack">
      <div className="pointer-events-none absolute -top-16 -right-8 h-52 w-52 rounded-full bg-gradient-to-b from-nickTeal/40 to-nickCream/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-60 rounded-full bg-gradient-to-r from-nickBlush/60 via-nickRust/40 to-transparent blur-[120px]" />
      <div className="relative flex h-full flex-col gap-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-nickBrown/70">
              Search &amp; Snap
            </p>
            <h1 className="text-3xl font-semibold leading-tight">
              Pixabay Photo Search
            </h1>
            <p className="text-sm text-nickBrown/80">
              Pick a fresh image and it will update the puzzle instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-nickBrown/30 bg-white/90 px-4 py-2 text-sm font-semibold text-nickBlack shadow hover:bg-nickCream transition"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex gap-3 items-center bg-white/90 border border-nickCream/60 rounded-full px-4 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
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

        <div className="relative flex-1 overflow-y-auto pr-1">
          <div className="space-y-4 pb-6">
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

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className="relative aspect-square overflow-hidden rounded-2xl bg-nickCream shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition"
                    title={img.tags}
                    onClick={() => handleImageSelect(img.largeImageURL)}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
