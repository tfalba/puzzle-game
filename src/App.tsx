import React, { useState } from "react";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { PixabaySearchGrid } from "./components/PixabaySearchGrid";

function App() {
  const [imageUrl, setImageUrl] = useState("/src/assets/square-rose.jpg");
  const handleSetImage = (url: string) => {
    setImageUrl(url);
  };
  return (
    <div className="min-h-screen flex flex-col gap-4 m-auto items-center justify-center bg-nickTeal/60 py-8">
      <PuzzleBoard imageUrl={`${imageUrl || ""}`} />

      <PixabaySearchGrid handleSetImage={handleSetImage} />
    </div>
  );
}

export default App;
