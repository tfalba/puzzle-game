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
  imageUrl: string; // your single square photo
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ imageUrl }) => {
  const pieces = useMemo(() => createPieces(), []);

  const [board, setBoard] = useState<(number | null)[]>([]);
  const [outie, setOutie] = useState<number | null>(null);

  //   const [outie, setOutie] = useState<number>()

  //   // board: 9 cells with piece ids or null (empty slot)
  //   const [board, setBoard] = useState<(number | null)[]>(() => {
  //     const ids = shuffle(Array.from({ length: 9 }, (_, i) => i));
  //     // choose one to be the "outside" piece
  //     const outsideId = ids.pop() as number;
  //     // setOutsidePiece(pieces[outsideId])
  //     // remaining 8 go into the grid, plus one empty slot (null)
  //     const initialBoard = shuffle([...ids, null]);
  //     // you could store outsideId to display somewhere; for now we ignore it.
  //     console.log("Outside piece:", outsideId, "initial board", initialBoard);
  //     return initialBoard;
  //   });

  useEffect(() => {
    const ids = Array.from({ length: 9 }, (_, i) => i);
    const shuffled = shuffle(ids);
    const removed = shuffled.pop()!;
    setOutie(removed);

    const board8 = shuffle([...shuffled, null]);
    setBoard(board8);
  }, []);

  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const emptyIndex = board.findIndex((cell) => cell === null);

  const handleDragStart = (index: number) => {
    // only allow dragging tiles that can move into the empty slot
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

  // const outie: number = Array(9).find((_, i) => !board.includes(i));
  if (!outie) return;

  return (
    <div className="flex flex-col items-center md:items-start gap-8">
      {/* title + CTA */}
      <div className="text-center">
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
              const shuffled = shuffle(ids);
              return shuffle([...shuffled, ...Array(emptyCount).fill(null)]);
            })
          }
        >
          Shuffle
        </button>
      
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-center">

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
              className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-nickCream overflow-hidden rounded-lg ${
                isEmpty ? "opacity-40 border border-white" : ""
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
                    backgroundImage: `url(${imageUrl})`,
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
        {outie && (
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-nickCream overflow-hidden rounded-lg">
            <div
              draggable={false}
              //   onDragStart={() => handleDragStart(index)}
              className={`w-full h-full cursor-grab active:cursor-grabbing`}
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "300% 300%",
                backgroundPosition: `${(pieces[outie].col / 2) * 100}% ${
                  (pieces[outie].row / 2) * 100
                }%`,
              }}
            />
          </div>
        )}
        {/* image search section */}
        <div>Image search</div>
        </div>
    </div>
  );
};
