"use client"

import { useEffect, useState } from "react"

import { BoardSizeForm } from "@/components/crossword/board-size-form"
import { CrosswordGrid } from "@/components/crossword/crossword-grid"
import { Button } from "@/components/ui/button"
import {
  createBoard,
  Direction,
  getSelectedWord,
  parseWordList,
  Selection,
  solveBoard,
  updateTile,
} from "@/lib/board"
import { Board, WordList } from "@/lib/crossword"

// ---------------------------------------------------------------------------
// TEMPORARY: word hints on hover.
// To remove: delete this block, the `hover` state, and the lines marked
// "TEMPORARY" in Page below.
// ---------------------------------------------------------------------------

const MAX_HINTS = 8

type Hover = { x: number; y: number; rect: DOMRect }

/**
 * Words that fit the given run of tiles, using each tile's value if set,
 * otherwise its possible values (an empty list means any letter).
 */
function fittingWords(
  wordList: WordList,
  board: Board,
  tiles: [number, number][]
): string[] {
  const allowed = tiles.map(([x, y]) => {
    const tile = board.tiles[x][y]
    return tile.value !== "" ? [tile.value] : tile.possible_values
  })

  return wordList.filter(
    (word) =>
      word.length === tiles.length &&
      allowed.every(
        (letters, i) => letters.length === 0 || letters.includes(word[i])
      )
  )
}

function WordHints({
  board,
  wordList,
  hover,
}: {
  board: Board
  wordList: WordList
  hover: Hover
}) {
  const tile = board.tiles[hover.x][hover.y]
  if (!tile.editible || tile.value !== "" || tile.possible_values.length === 0)
    return null

  const directions: Direction[] = ["across", "down"]
  const sections = directions.flatMap((direction) => {
    const tiles = getSelectedWord(board, { x: hover.x, y: hover.y, direction })
    if (tiles.length === 0) return []
    return [{ direction, words: fittingWords(wordList, board, tiles) }]
  })
  if (sections.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed z-50 flex flex-col gap-2 rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-md"
      style={{ left: hover.rect.right + 8, top: hover.rect.top }}
    >
      {sections.map(({ direction, words }) => (
        <div key={direction} className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground capitalize">
            {direction} · {words.length} words
          </span>
          <span className="font-mono">
            {words.slice(0, MAX_HINTS).join(", ")}
            {words.length > MAX_HINTS && ", …"}
          </span>
        </div>
      ))}
    </div>
  )
}

// --------------------------- end TEMPORARY ---------------------------------

export default function Page() {
  const [wordList, setWordList] = useState<WordList>([])
  const [board, setBoard] = useState<Board | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [solveTime, setSolveTime] = useState<number | null>(null)
  // true when the board has been edited since the last solve
  const [isStale, setIsStale] = useState(false)
  const [hover, setHover] = useState<Hover | null>(null) // TEMPORARY: word hints

  useEffect(() => {
    fetch("/words.txt")
      .then((resp) => resp.text())
      .then((text) => setWordList(parseWordList(text)))
  }, [])

  const createNewBoard = (width: number, height: number) => {
    setBoard(createBoard(width, height))
    setSelection(null)
    setSolveTime(null)
    setIsStale(false)
    setHover(null) // TEMPORARY: word hints
  }

  const toggleEditible = (x: number, y: number) => {
    if (!board) return
    const tile = board.tiles[x][y]
    // blocking a tile also clears any letter in it
    setBoard(updateTile(board, x, y, { editible: !tile.editible, value: "" }))
    setSolveTime(null)
    setIsStale(true)
  }

  const setValue = (x: number, y: number, value: string) => {
    if (!board) return
    setBoard(updateTile(board, x, y, { value }))
    setSolveTime(null)
    setIsStale(true)
  }

  const solve = () => {
    if (!board || wordList.length === 0) return
    const start = performance.now()
    setBoard(solveBoard(wordList, board))
    setSolveTime(performance.now() - start)
    setIsStale(false)
  }

  const wordListLoaded = wordList.length > 0

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Crossword builder</h1>
        <p className="text-sm text-muted-foreground">
          Choose a board size, then right-click tiles to block them out. Click a
          tile or use the arrow keys to select it, and type a letter to fill it
          in (Backspace clears it). Press Space or click the selected tile again
          to switch between across and down. Press Enter to solve.
        </p>
      </div>

      <BoardSizeForm onCreate={createNewBoard} />

      {board && (
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <Button onClick={solve} disabled={!wordListLoaded}>
              {wordListLoaded ? "Solve" : "Loading words…"}
            </Button>
            {isStale && (
              <span className="text-sm text-orange-600 dark:text-orange-400">
                Board changed since last solve
              </span>
            )}
            {solveTime !== null && (
              <span className="text-sm text-muted-foreground">
                Solved in {solveTime.toFixed(1)}ms
              </span>
            )}
          </div>

          <div
            className="max-w-full overflow-auto"
            // TEMPORARY: word hints
            onMouseOver={(event) => {
              const el = (event.target as HTMLElement).closest<HTMLElement>(
                "[data-x]"
              )
              if (!el) return setHover(null)
              setHover({
                x: Number(el.dataset.x),
                y: Number(el.dataset.y),
                rect: el.getBoundingClientRect(),
              })
            }}
            onMouseLeave={() => setHover(null)}
          >
            <CrosswordGrid
              board={board}
              selection={selection}
              isStale={isStale}
              onSelect={setSelection}
              onToggleEditible={toggleEditible}
              onSetValue={setValue}
              onSolve={solve}
            />
          </div>

          {/* TEMPORARY: word hints */}
          {hover && (
            <WordHints board={board} wordList={wordList} hover={hover} />
          )}
        </div>
      )}
    </div>
  )
}
