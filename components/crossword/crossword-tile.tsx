"use client"

import { cn } from "@/lib/utils"
import { Tile } from "@/lib/crossword"

type CrosswordTileProps = {
  tile: Tile
  x: number
  y: number
  isSelected: boolean
  isInSelectedWord: boolean
  isTabStop: boolean
  isStale: boolean
  ref: React.Ref<HTMLButtonElement>
  onSelect: () => void
  onToggleEditible: () => void
}

/**
 * A single square of the crossword.
 *
 * - Blocked (non-editible) squares are black.
 * - The selected tile and the word running through it are highlighted.
 * - When no value is set, the solver's `possible_values` are shown in small text,
 *   in a warning color if the board has changed since they were calculated.
 *
 * Keyboard input is handled by the grid, since it needs to move between tiles.
 */
export function CrosswordTile({
  tile,
  x,
  y,
  isSelected,
  isInSelectedWord,
  isTabStop,
  isStale,
  ref,
  onSelect,
  onToggleEditible,
}: CrosswordTileProps) {
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    onToggleEditible()
  }

  const label = !tile.editible
    ? `Blocked tile ${x + 1}, ${y + 1}`
    : `Tile ${x + 1}, ${y + 1}${tile.value ? `: ${tile.value}` : ""}`

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={isSelected}
      data-x={x}
      data-y={y}
      // only one tile is in the tab order; arrow keys move between tiles
      tabIndex={isTabStop ? 0 : -1}
      onClick={onSelect}
      onContextMenu={handleContextMenu}
      className={cn(
        "relative flex size-14 items-center justify-center border border-foreground/40 outline-none select-none",
        !tile.editible && "bg-foreground",
        tile.editible && "bg-background",
        tile.editible && isInSelectedWord && "bg-sky-100 dark:bg-sky-950",
        tile.editible && isSelected && "bg-amber-200 dark:bg-amber-800",
        // a blocked tile has no background to change, so outline it instead
        !tile.editible && isSelected && "z-10 ring-3 ring-amber-400 ring-inset"
      )}
    >
      {tile.editible && tile.value !== "" && (
        <span className="text-2xl font-semibold uppercase">{tile.value}</span>
      )}
      {tile.editible &&
        tile.value === "" &&
        tile.possible_values.length > 0 && (
          <span
            className={cn(
              "line-clamp-4 px-0.5 text-center font-mono text-[9px] leading-tight break-all uppercase",
              isStale
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground"
            )}
          >
            {[...tile.possible_values].sort().join("")}
          </span>
        )}
    </button>
  )
}
