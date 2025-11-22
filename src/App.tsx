import React from "react";
import { PuzzleBoard } from "./components/PuzzleBoard";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nickTeal/30">
      <PuzzleBoard imageUrl="/src/assets/teddy-bear.jpg" />
    </div>
  );
}

export default App;
