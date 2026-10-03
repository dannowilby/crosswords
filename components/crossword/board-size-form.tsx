"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MAX_BOARD_SIZE, MIN_BOARD_SIZE } from "@/lib/board"

type BoardSizeFormProps = {
  onCreate: (width: number, height: number) => void
}

function clampSize(value: string): number {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return MIN_BOARD_SIZE
  return Math.min(MAX_BOARD_SIZE, Math.max(MIN_BOARD_SIZE, parsed))
}

export function BoardSizeForm({ onCreate }: BoardSizeFormProps) {
  const [width, setWidth] = useState("5")
  const [height, setHeight] = useState("5")

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreate(clampSize(width), clampSize(height))
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="board-width">Width</Label>
        <Input
          id="board-width"
          type="number"
          min={MIN_BOARD_SIZE}
          max={MAX_BOARD_SIZE}
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className="w-20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="board-height">Height</Label>
        <Input
          id="board-height"
          type="number"
          min={MIN_BOARD_SIZE}
          max={MAX_BOARD_SIZE}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-20"
        />
      </div>
      <Button type="submit">Create board</Button>
    </form>
  )
}
