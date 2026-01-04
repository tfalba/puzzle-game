import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Piece = {
  id: number;
  row: number;
  col: number;
};

const createPieces = (size: number): Piece[] =>
  Array.from({ length: size * size }, (_, id) => ({
    id,
    row: Math.floor(id / size),
    col: id % size,
  }));

const isAdjacent = (a: number, b: number, size: number) => {
  const rowA = Math.floor(a / size);
  const colA = a % size;
  const rowB = Math.floor(b / size);
  const colB = b % size;

  const rowDiff = Math.abs(rowA - rowB);
  const colDiff = Math.abs(colA - colB);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

const getAdjacentIndices = (index: number, size: number) => {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (col > 0) neighbors.push(index - 1);
  if (col < size - 1) neighbors.push(index + 1);

  return neighbors;
};

const shuffleSolvable = (
  board: (number | null)[],
  size: number,
  moves: number
) => {
  const next = [...board];
  let emptyIndex = next.findIndex((cell) => cell === null);
  let previousIndex: number | null = null;

  for (let i = 0; i < moves; i++) {
    let candidates = getAdjacentIndices(emptyIndex, size);
    if (previousIndex !== null && candidates.length > 1) {
      candidates = candidates.filter((idx) => idx !== previousIndex);
    }
    const swapIndex = candidates[Math.floor(Math.random() * candidates.length)];
    [next[emptyIndex], next[swapIndex]] = [next[swapIndex], next[emptyIndex]];
    previousIndex = emptyIndex;
    emptyIndex = swapIndex;
  }

  return next;
};

interface PuzzleBoardProps {
  imageUrl: string; // can be any aspect ratio now
}

const formatClock = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const padded = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`
    : `${padded(minutes)}:${padded(seconds)}`;
};

const formatTypedTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }
  parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);

  return parts.join(" ");
};

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ imageUrl }) => {
  const [gridSize, setGridSize] = useState(3);
  const pieces = useMemo(() => createPieces(gridSize), [gridSize]);

  const [board, setBoard] = useState<(number | null)[]>([]);
  const [outie, setOutie] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showMissingPiece, setShowMissingPiece] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [moves, setMoves] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(true);
  const lastDragAtRef = useRef(0);

  // cropped square version of the image
  const [squareImageUrl, setSquareImageUrl] = useState<string | null>(null);

  const resetGameStats = useCallback(() => {
    setMoves(0);
    setElapsedSeconds(0);
    setStartTime(Date.now());
    setTimerRunning(true);
  }, []);

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

  useEffect(() => {
    if (!imageUrl) return;
    resetGameStats();
  }, [imageUrl, resetGameStats]);

  // board: N cells with piece ids or null (empty slot)
  useEffect(() => {
    const total = gridSize * gridSize;
    const nextOutie = Math.floor(Math.random() * total);
    const solved = Array.from({ length: total }, (_, idx) =>
      idx === nextOutie ? null : idx
    );
    const shuffledBoard = shuffleSolvable(solved, gridSize, total * 25);
    setOutie(nextOutie);
    setBoard(shuffledBoard);
    setShowMissingPiece(false);
    setShowFullImage(false);
    resetGameStats();
  }, [gridSize, resetGameStats]);

  const emptyIndex = board.findIndex((cell) => cell === null);

  const isSolved = useMemo(() => {
    if (
      outie === null ||
      board.length !== gridSize * gridSize ||
      emptyIndex === -1
    )
      return false;
    return board.every((value, index) =>
      index === emptyIndex ? value === null : value === index
    );
  }, [board, emptyIndex, gridSize, outie]);

  useEffect(() => {
    let fullImageTimer: ReturnType<typeof setTimeout> | null = null;
    if (isSolved) {
      setShowMissingPiece(true);
      fullImageTimer = setTimeout(() => {
        setShowFullImage(true);
      }, 1500);
      setTimerRunning(false);
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

  useEffect(() => {
    if (!timerRunning || startTime === null) return;

    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timerRunning, startTime]);

  const swapWithEmpty = (sourceIndex: number) => {
    setBoard((prev) => {
      const targetIndex = prev.findIndex((cell) => cell === null);
      if (targetIndex === -1 || !isAdjacent(sourceIndex, targetIndex, gridSize)) {
        return prev;
      }
      const next = [...prev];
      [next[sourceIndex], next[targetIndex]] = [
        next[targetIndex],
        next[sourceIndex],
      ];
      setMoves(moves + 1);
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    if (emptyIndex !== -1 && isAdjacent(index, emptyIndex, gridSize)) {
      setDragIndex(index);
      lastDragAtRef.current = Date.now();
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null) return;
    if (targetIndex !== emptyIndex) return; // only drop into empty cell
    console.log("handle drop");

    swapWithEmpty(dragIndex);
    setDragIndex(null);
    lastDragAtRef.current = Date.now();
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); // allow drop
  };

  const handleTileClick = (index: number) => {
    if (Date.now() - lastDragAtRef.current < 250) return;
    console.log("handle tile click");
    swapWithEmpty(index);
  };

  const handleSolve = () => {
    if (outie === null) return;
    const solved = Array.from({ length: gridSize * gridSize }, (_, idx) =>
      idx === outie ? null : idx
    );
    setBoard(solved);
  };

  const handleShuffle = () => {
    if (outie === null) return;
    const total = gridSize * gridSize;
    const solved = Array.from({ length: total }, (_, idx) =>
      idx === outie ? null : idx
    );
    const shuffledBoard = shuffleSolvable(solved, gridSize, total * 25);
    setBoard(shuffledBoard);
    setShowMissingPiece(false);
    setShowFullImage(false);
    resetGameStats();
  };

  const handleGridSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextSize = Number(event.target.value);
    setOutie(null);
    setBoard([]);
    setShowMissingPiece(false);
    setShowFullImage(false);
    setGridSize(nextSize);
  };

  // wait until we know the outie and have the cropped image
  if (outie === null || !squareImageUrl) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-nickBrown">
        Loading puzzle…
      </div>
    );
  }

  const tileSize =
    gridSize === 2
      ? "clamp(5.5rem, 22vw, 8.5rem)"
      : gridSize === 4
        ? "clamp(4rem, 15vw, 5.25rem)"
        : "clamp(4.5rem, 18vw, 6.5rem)";
  const backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
  const positionScale = gridSize - 1;

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
              <label className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 border border-nickCream text-nickBrown font-medium">
                Size
                <select
                  value={gridSize}
                  onChange={handleGridSizeChange}
                  aria-label="Select puzzle size"
                  className="bg-white border border-nickCream rounded-full px-3 py-1 text-nickBrown focus:outline-none focus:ring-2 focus:ring-nickRust/50"
                >
                  <option value={2}>2 x 2</option>
                  <option value={3}>3 x 3</option>
                  <option value={4}>4 x 4</option>
                </select>
              </label>
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

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-center w-full justify-between">
          {/* puzzle grid */}
          <div className="relative inline-block">
            <div
              className={`grid p-4 gap-1 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.3)] bg-transparent transition-all duration-700 ${
                showFullImage
                  ? "opacity-0 scale-95 pointer-events-none"
                  : "opacity-100"
              }`}
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
              }}
            >
              {board.map((pieceId, index) => {
                const isEmpty = pieceId === null;
                const piece = isEmpty ? null : pieces[pieceId];
                const canMove =
                  !isEmpty &&
                  emptyIndex !== -1 &&
                  isAdjacent(index, emptyIndex, gridSize);

                return (
                  <div
                    key={index}
                    className={`relative overflow-hidden ${
                      isEmpty
                        ? "bg-nickTeal/30 opacity-80 "
                        : "bg-nickCream shadow-inner"
                    }`}
                    style={{ width: tileSize, height: tileSize }}
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
                          backgroundSize,
                          backgroundPosition: `${
                            (piece.col / positionScale) * 100
                          }% ${(piece.row / positionScale) * 100}%`,
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
                          backgroundSize,
                          backgroundPosition: `${
                            (pieces[outie].col / positionScale) * 100
                          }% ${(pieces[outie].row / positionScale) * 100}%`,
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
          <div className="mx-auto w-full max-w-xs rounded-3xl border border-white/60 bg-white/80 px-6 py-6 text-nickBrown shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm">
            <div className="text-sm uppercase tracking-[0.2em] text-nickRust/80">
              Timer
            </div>
            <div className="mt-3 text-3xl font-semibold text-nickBlack">
              {formatClock(elapsedSeconds)}
            </div>
            <div className="mt-2 text-sm text-nickBrown/80">
              {formatTypedTime(elapsedSeconds)}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-nickCream/80 bg-white px-4 py-3 text-nickBrown">
              <span className="text-sm uppercase tracking-[0.2em] text-nickRust/70">
                Moves
              </span>
              <span className="text-2xl font-semibold text-nickBlack">
                {moves}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
