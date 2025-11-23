import React, { useState } from "react";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { PixabaySearchGrid } from "./components/PixabaySearchGrid";

function App() {
  const [imageUrl, setImageUrl] = useState("/src/assets/square-rose.jpg");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSetImage = (url: string) => {
    setImageUrl(url);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col gap-6 md:gap-8 items-center justify-start bg-gradient-to-br from-nickTeal/70 via-nickCream/50 to-white/90 py-10 md:py-12 px-4 overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-36 h-96 w-96 rounded-full bg-gradient-to-bl from-nickRust/60 via-nickBrown/40 to-nickTeal/40 blur-3xl opacity-70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-nickBlush/60 via-nickCream/60 to-white blur-[140px] opacity-80"
      />

      <button
        type="button"
        aria-expanded={isSearchOpen}
        aria-label={isSearchOpen ? "Close Pixabay search" : "Open Pixabay search"}
        onClick={() => setIsSearchOpen((prev) => !prev)}
        className="fixed top-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-nickBlack shadow-[0_15px_35px_rgba(0,0,0,0.25)] border border-white/60 text-3xl font-semibold transition hover:rotate-6"
      >
        {isSearchOpen ? "×" : "+"}
      </button>

      <header className="relative z-10 w-full">
        <div className="max-w-5xl mx-auto rounded-[40px] bg-gradient-to-r from-nickBrown via-nickRust to-nickTeal text-white p-8 sm:px-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] space-y-4 border border-white/20">
          <p className="text-sm uppercase tracking-[0.4em] text-white/80">
            Welcome to
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg">
            PuzzleQuest Studio
          </h1>
          <p className="text-lg text-white/90">
            Snap the perfect Pixabay image, then turn it into a sliding puzzle adventure—right in your browser.
          </p>
        </div>
      </header>

      <PuzzleBoard imageUrl={`${imageUrl || ""}`} />

      {/* Slide-out search modal */}
      <div
        className={`fixed inset-0 z-40 bg-nickBlack/40 backdrop-blur-sm transition-opacity duration-300 ${
          isSearchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSearchOpen(false)}
      />
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-full md:w-full lg:w-2/3 xl:w-2/3 2xl:w-2/3 max-w-6xl bg-gradient-to-b from-white/95 via-nickCream/70 to-white/90 border-l border-white/40 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-500 ${
          isSearchOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <PixabaySearchGrid
          handleSetImage={handleSetImage}
          onClose={() => setIsSearchOpen(false)}
          isOpen={isSearchOpen}
        />
      </div>
    </div>
  );
}

export default App;
