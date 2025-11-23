import React, { useState } from "react";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { PixabaySearchGrid } from "./components/PixabaySearchGrid";

function App() {
  const [imageUrl, setImageUrl] = useState("/src/assets/square-rose.jpg");
  const handleSetImage = (url: string) => {
    setImageUrl(url);
  };
  return (
    <div className="relative min-h-screen w-full flex flex-col gap-10 items-center justify-start bg-gradient-to-br from-nickTeal/70 via-nickCream/50 to-white/90 py-14 px-4 overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-36 h-96 w-96 rounded-full bg-gradient-to-bl from-nickRust/60 via-nickBrown/40 to-nickTeal/40 blur-3xl opacity-70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-nickBlush/60 via-nickCream/60 to-white blur-[140px] opacity-80"
      />

      <header className="relative z-10 w-full">
        <div className="max-w-5xl mx-auto rounded-[40px] bg-gradient-to-r from-nickBrown via-nickRust to-nickTeal text-white p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] space-y-4 border border-white/20">
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

      <PixabaySearchGrid handleSetImage={handleSetImage} />

      <PuzzleBoard imageUrl={`${imageUrl || ""}`} />
    </div>
  );
}

export default App;
