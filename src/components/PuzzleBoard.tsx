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
  const [showMissingPiece, setShowMissingPiece] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

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

  const isSolved = useMemo(() => {
    if (outie === null || board.length !== 9 || emptyIndex === -1) return false;
    return board.every((value, index) =>
      index === emptyIndex ? value === null : value === index
    );
  }, [board, emptyIndex, outie]);

  useEffect(() => {
    let fullImageTimer: ReturnType<typeof setTimeout> | null = null;
    if (isSolved) {
      setShowMissingPiece(true);
      fullImageTimer = setTimeout(() => {
        setShowFullImage(true);
      }, 1500);
    } else {
      setShowMissingPiece(false);
      setShowFullImage(false);
    }
    return () => {
      if (fullImageTimer) {
        clearTimeout(fullImageTimer);
      }
    };
  }, [isSolved]);

  const swapWithEmpty = (sourceIndex: number) => {
    setBoard((prev) => {
      const targetIndex = prev.findIndex((cell) => cell === null);
      if (targetIndex === -1 || !isAdjacent(sourceIndex, targetIndex)) {
        return prev;
      }
      const next = [...prev];
      [next[sourceIndex], next[targetIndex]] = [
        next[targetIndex],
        next[sourceIndex],
      ];
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    if (emptyIndex !== -1 && isAdjacent(index, emptyIndex)) {
      setDragIndex(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null) return;
    if (targetIndex !== emptyIndex) return; // only drop into empty cell

    swapWithEmpty(dragIndex);
    setDragIndex(null);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleTileClick = (index: number) => {
    swapWithEmpty(index);
  };

  const handleSolve = () => {
    if (outie === null) return;
    const solved = Array.from({ length: 9 }, (_, idx) =>
      idx === outie ? null : idx
    );
    setBoard(solved);
  };

  const handleShuffle = () => {
    setBoard((prev) => {
      const ids = prev.filter((x): x is number => x !== null);
      const emptyCount = prev.length - ids.length;
      const shuffledIds = shuffle(ids);
      return shuffle([...shuffledIds, ...Array(emptyCount).fill(null)]);
    });
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
    <section className="relative z-10 w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="relative flex flex-col items-center md:items-start w-full rounded-[36px] border border-white/50 bg-white/95 px-6 py-6 sm:py-10 sm:px-12 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl overflow-hidden">
        <div className="pointer-events-none absolute -top-10 right-0 h-48 w-48 rounded-full bg-gradient-to-b from-nickRust/40 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gradient-to-tr from-nickTeal/40 via-nickCream/35 to-transparent blur-[120px]" />
        {/* title + CTA */}
        <div className="flex justify-center md:justify-between w-full flex-wrap gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:flex-wrap">
              <h1 className="text-3xl font-semibold text-nickBlack">
                Photo Puzzle
              </h1>
              <button
                className="px-6 py-3 rounded-full bg-nickRust text-white font-medium hover:bg-nickBrown transition"
                onClick={() => handleShuffle()}
              >
                Shuffle
              </button>
              <button
                className="px-6 py-3 rounded-full border border-nickBrown text-nickBrown font-medium bg-white hover:bg-nickCream transition"
                onClick={() => handleSolve()}
              >
                Solve
              </button>
            </div>
            <p className="text-nickBrown mb-4">
              Drag a tile into the empty space to reassemble your picture.
            </p>
          </div>
          <div className="hidden md:block relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-nickCream overflow-hidden rounded-2xl border border-white/40 shadow-[0_15px_35px_rgba(0,0,0,0.2)]">
            <div
              className="w-full h-full cursor-default object-cover"
              style={{
                backgroundImage: `url(${squareImageUrl})`,
                backgroundSize: "100%",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end w-full justify-between">
          {/* puzzle grid */}
          <div className="relative inline-block">
            <div
              className={`grid grid-cols-3 grid-rows-3 p-4 gap-1 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.3)] bg-transparent transition-all duration-700 ${
                showFullImage
                  ? "opacity-0 scale-95 pointer-events-none"
                  : "opacity-100"
              }`}
            >
              {board.map((pieceId, index) => {
                const isEmpty = pieceId === null;
                const piece = isEmpty ? null : pieces[pieceId];
                const canMove =
                  !isEmpty &&
                  emptyIndex !== -1 &&
                  isAdjacent(index, emptyIndex);

                return (
                  <div
                    key={index}
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 overflow-hidden ${
                      isEmpty
                        ? "bg-nickTeal/30 opacity-80 "
                        : "bg-nickCream shadow-inner"
                    }`}
                    onDrop={() => handleDrop(index)}
                    onDragOver={handleDragOver}
                  >
                    {piece && (
                      <div
                        draggable={canMove}
                        onDragStart={() => handleDragStart(index)}
                        className={`w-full h-full cursor-grab active:cursor-grabbing transition-transform ${
                          canMove
                            ? "shadow-[0_12px_25px_rgba(0,0,0,0.25)] hover:-translate-y-0.5"
                            : "opacity-90"
                        }`}
                        style={{
                          backgroundImage: `url(${squareImageUrl})`,
                          backgroundSize: "300% 300%",
                          backgroundPosition: `${(piece.col / 2) * 100}% ${
                            (piece.row / 2) * 100
                          }%`,
                        }}
                        onClick={() => handleTileClick(index)}
                      />
                    )}
                    {isEmpty && outie !== null && (
                      <div
                        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
                          showMissingPiece ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          backgroundImage: `url(${squareImageUrl})`,
                          backgroundSize: "300% 300%",
                          backgroundPosition: `${
                            (pieces[outie].col / 2) * 100
                          }% ${(pieces[outie].row / 2) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                showFullImage ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="w-full h-full rounded-[32px] overflow-hidden border border-white/60 shadow-[0_25px_60px_rgba(0,0,0,0.3)] bg-white">
                <img
                  src={squareImageUrl}
                  alt="Completed puzzle"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
