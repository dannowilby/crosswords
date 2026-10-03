"use client"

import { useEffect, useRef } from "react"

import { CrosswordTile } from "@/components/crossword/crossword-tile"
import { Direction, getSelectedWord, Selection } from "@/lib/board"
import { Board } from "@/lib/crossword"

type CrosswordGridProps = {
  board: Board
  selection: Selection | null
  isStale: boolean
  onSelect: (selection: Selection) => void
  onToggleEditible: (x: number, y: number) => void
  onSetValue: (x: number, y: number, value: string) => void
  onSolve: () => void
}

const ARROW_MOVES: Record<
  string,
  { dx: number; dy: number; direction: Direction }
> = {
  ArrowLeft: { dx: -1, dy: 0, direction: "across" },
  ArrowRight: { dx: 1, dy: 0, direction: "across" },
  ArrowUp: { dx: 0, dy: -1, direction: "down" },
  ArrowDown: { dx: 0, dy: 1, direction: "down" },
}

export function CrosswordGrid({
  board,
  selection,
  isStale,
  onSelect,
  onToggleEditible,
  onSetValue,
  onSolve,
}: CrosswordGridProps) {
  const tileRefs = useRef(new Map<string, HTMLButtonElement>())

  // keep keyboard focus on the selected tile so key presses land on the grid
  useEffect(() => {
    if (!selection) return
    tileRefs.current.get(`${selection.x}-${selection.y}`)?.focus()
  }, [selection])

  const selectedWord = selection ? getSelectedWord(board, selection) : []
  const isInSelectedWord = (x: number, y: number) =>
    selectedWord.some(([wx, wy]) => wx === x && wy === y)

  const toggleDirection = (current: Selection) => {
    onSelect({
      ...current,
      direction: current.direction === "across" ? "down" : "across",
    })
  }

  const handleTileClick = (x: number, y: number) => {
    // clicking the selected tile again switches between across and down
    if (selection && selection.x === x && selection.y === y) {
      toggleDirection(selection)
    } else {
      onSelect({ x, y, direction: selection?.direction ?? "across" })
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // leave browser shortcuts (e.g. Ctrl+C) alone
    if (event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === "Enter") {
      // also stops the focused tile's button from being "clicked"
      event.preventDefault()
      onSolve()
      return
    }

    const move = ARROW_MOVES[event.key]
    const isToggle = event.key === " "
    const isEdit =
      event.key === "Backspace" ||
      event.key === "Delete" ||
      /^[a-zA-Z]$/.test(event.key)
    if (!move && !isToggle && !isEdit) return

    // nothing selected yet means the default tab stop (top-left) has focus
    const current: Selection = selection ?? {
      x: 0,
      y: 0,
      direction: "across",
    }
    if (!selection) onSelect(current)
    const { x, y } = current

    if (isToggle) {
      // also stops the page scrolling and the focused tile being "clicked"
      event.preventDefault()
      toggleDirection(current)
      return
    }

    if (move) {
      event.preventDefault()
      onSelect({
        x: Math.min(board.width - 1, Math.max(0, x + move.dx)),
        y: Math.min(board.height - 1, Math.max(0, y + move.dy)),
        direction: move.direction,
      })
      return
    }

    if (!board.tiles[x][y].editible) return

    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault()
      onSetValue(x, y, "")
    } else if (/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault()
      onSetValue(x, y, event.key.toLowerCase())

      // advance along the word, staying put at its end
      const nx = current.direction === "across" ? x + 1 : x
      const ny = current.direction === "down" ? y + 1 : y
      if (
        nx < board.width &&
        ny < board.height &&
        board.tiles[nx][ny].editible
      ) {
        onSelect({ ...current, x: nx, y: ny })
      }
    }
  }

  // tiles are stored column-major (tiles[x][y]) so render row by row
  const rows = Array.from({ length: board.height }, (_, y) => y)
  const columns = Array.from({ length: board.width }, (_, x) => x)

  return (
    <div
      role="grid"
      onKeyDown={handleKeyDown}
      className="inline-grid w-fit border border-foreground/40"
      style={{ gridTemplateColumns: `repeat(${board.width}, auto)` }}
    >
      {rows.map((y) =>
        columns.map((x) => {
          const key = `${x}-${y}`
          return (
            <CrosswordTile
              key={key}
              ref={(el) => {
                if (el) tileRefs.current.set(key, el)
                else tileRefs.current.delete(key)
              }}
              tile={board.tiles[x][y]}
              x={x}
              y={y}
              isSelected={selection?.x === x && selection?.y === y}
              isTabStop={
                selection
                  ? selection.x === x && selection.y === y
                  : x === 0 && y === 0
              }
              isInSelectedWord={isInSelectedWord(x, y)}
              isStale={isStale}
              onSelect={() => handleTileClick(x, y)}
              onToggleEditible={() => onToggleEditible(x, y)}
            />
          )
        })
      )}
    </div>
  )
}
