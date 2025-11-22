import React, { useEffect, useMemo, useState } from "react";

type Piece = {
  id: number;
  row: number;
  col: number;
};

const createPieces = (): Piece[] =>
  Array.from({ length: 9 }, (_, id) => ({
    id,
    row: Math.floor(id / 3),
    col: id % 3,
  }));

// simple shuffle helper
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const isAdjacent = (a: number, b: number) => {
  const rowA = Math.floor(a / 3);
  const colA = a % 3;
  const rowB = Math.floor(b / 3);
  const colB = b % 3;

  const rowDiff = Math.abs(rowA - rowB);
  const colDiff = Math.abs(colA - colB);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

interface PuzzleBoardProps {
  imageUrl: string; // can be any aspect ratio now
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ imageUrl }) => {
  const pieces = useMemo(() => createPieces(), []);

  const [board, setBoard] = useState<(number | null)[]>([]);
  const [outie, setOutie] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // cropped square version of the image
  const [squareImageUrl, setSquareImageUrl] = useState<string | null>(null);

  // Crop incoming image to a centered square using an offscreen canvas
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; // helps if the image is hosted elsewhere

    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setSquareImageUrl(dataUrl);
    };

    img.onerror = () => {
      // fallback: just use original if cropping fails
      setSquareImageUrl(imageUrl);
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // board: 9 cells with piece ids or null (empty slot)
  useEffect(() => {
    const ids = Array.from({ length: 9 }, (_, i) => i);
    const shuffled = shuffle(ids);
    const removed = shuffled.pop()!;
    setOutie(removed);

    const board8 = shuffle([...shuffled, null]);
    setBoard(board8);
  }, []);

  const emptyIndex = board.findIndex((cell) => cell === null);

  const handleDragStart = (index: number) => {
    if (emptyIndex !== -1 && isAdjacent(index, emptyIndex)) {
      setDragIndex(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null) return;
    if (targetIndex !== emptyIndex) return; // only drop into empty cell

    setBoard((prev) => {
      const next = [...prev];
      [next[dragIndex], next[targetIndex]] = [
        next[targetIndex],
        next[dragIndex],
      ];
      return next;
    });

    setDragIndex(null);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); // allow drop
  };

  // wait until we know the outie and have the cropped image
  if (outie === null || !squareImageUrl) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-nickBrown">
        Loading puzzle…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center md:items-start gap-8 w-full max-w-3xl ">
      {/* title + CTA */}
      <div className="flex justify-center md:justify-between w-full flex-wrap px-8 md:px-0 gap-8">
        <div className="">
        <h1 className="text-3xl font-semibold mb-3 text-nickBlack">
          Photo Puzzle
        </h1>
        <p className="text-nickBrown mb-4">
          Drag a tile into the empty space to reassemble your picture.
        </p>
        <button
          className="px-6 py-3 rounded-full bg-nickRust text-white font-medium hover:bg-nickBrown transition"
          onClick={() =>
            setBoard((prev) => {
              const ids = prev.filter((x): x is number => x !== null);
              const emptyCount = prev.length - ids.length;
              const shuffledIds = shuffle(ids);
              return shuffle([
                ...shuffledIds,
                ...Array(emptyCount).fill(null),
              ]);
            })
          }
        >
          Shuffle
        </button>
        </div>
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-nickCream overflow-hidden rounded-lg">
          <div
            className="w-full h-full cursor-default object-cover"
            style={{
              backgroundImage: `url(${squareImageUrl})`,
              backgroundSize: "100%",
              // backgroundPosition: `${(pieces[outie].col / 2) * 100}% ${
              //   (pieces[outie].row / 2) * 100
              // }%`,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-end w-full justify-between">
        {/* puzzle grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 bg-nickBlack p-1 rounded-xl">
          {board.map((pieceId, index) => {
            const isEmpty = pieceId === null;
            const piece = isEmpty ? null : pieces[pieceId];
            const canMove =
              !isEmpty && emptyIndex !== -1 && isAdjacent(index, emptyIndex);

            return (
              <div
                key={index}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 overflow-hidden rounded-lg ${
                  isEmpty ? "bg-nickTeal/100 opacity-60 " : "bg-nickCream"
                }`}
                onDrop={() => handleDrop(index)}
                onDragOver={handleDragOver}
              >
                {piece && (
                  <div
                    draggable={canMove}
                    onDragStart={() => handleDragStart(index)}
                    className={`w-full h-full cursor-grab active:cursor-grabbing ${
                      canMove ? "shadow-lg" : "opacity-90"
                    }`}
                    style={{
                      backgroundImage: `url(${squareImageUrl})`,
                      backgroundSize: "300% 300%",
                      backgroundPosition: `${(piece.col / 2) * 100}% ${
                        (piece.row / 2) * 100
                      }%`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* extra piece on side */}
        {/* <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-nickCream overflow-hidden rounded-lg">
          <div
            className="w-full h-full cursor-default"
            style={{
              backgroundImage: `url(${squareImageUrl})`,
              backgroundSize: "300% 300%",
              backgroundPosition: `${(pieces[outie].col / 2) * 100}% ${
                (pieces[outie].row / 2) * 100
              }%`,
            }}
          />
        </div> */}
      </div>
    </div>
  );
};
