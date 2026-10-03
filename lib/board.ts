import { Board, collapse, Tile, WordList } from "@/lib/crossword";

export const MIN_BOARD_SIZE = 1;
export const MAX_BOARD_SIZE = 50;

export type Direction = "across" | "down";

export type Selection = {
    x: number;
    y: number;
    direction: Direction;
};

function emptyTile(): Tile {
    return { editible: true, value: "", possible_values: [] };
}

/**
 * Creates a new board where every tile is editible and empty. Tiles are
 * indexed as `tiles[x][y]` to match the solver.
 */
export function createBoard(width: number, height: number): Board {
    return {
        width,
        height,
        tiles: Array.from({ length: width }, () =>
            Array.from({ length: height }, emptyTile)
        ),
    };
}

/**
 * Deep copies a board so the (mutating) solver functions never touch React
 * state directly.
 */
export function cloneBoard(board: Board): Board {
    return {
        ...board,
        tiles: board.tiles.map(column =>
            column.map(tile => ({ ...tile, possible_values: [...tile.possible_values] }))
        ),
    };
}

/**
 * Returns a copy of the board with every tile's `possible_values` cleared.
 * Used whenever the board changes, since old solver results become stale.
 */
export function clearPossibleValues(board: Board): Board {
    const next = cloneBoard(board);
    for (const column of next.tiles)
        for (const tile of column)
            tile.possible_values = [];
    return next;
}

/**
 * Applies `update` to the tile at (x, y) on a copy of the board. Existing
 * solver results are kept so they can still be shown (as stale) until the
 * next solve.
 */
export function updateTile(board: Board, x: number, y: number, update: Partial<Tile>): Board {
    const next = cloneBoard(board);
    next.tiles[x][y] = { ...next.tiles[x][y], ...update };
    return next;
}

/**
 * Runs the solver against a copy of the board.
 */
export function solveBoard(word_list: WordList, board: Board): Board {
    return collapse(word_list, clearPossibleValues(board));
}

/**
 * Returns the coordinates of the word running through the selected tile in the
 * selected direction. Like the solver, a single tile is not treated as a word,
 * so this is empty unless the run of editible tiles is at least two long.
 */
export function getSelectedWord(board: Board, selection: Selection): [number, number][] {
    const { x, y, direction } = selection;
    if (!board.tiles[x][y].editible) return [];

    const [dx, dy] = direction === "across" ? [1, 0] : [0, 1];
    const isOpen = (cx: number, cy: number) =>
        cx >= 0 && cx < board.width && cy >= 0 && cy < board.height && board.tiles[cx][cy].editible;

    // walk back to the start of the word
    let sx = x;
    let sy = y;
    while (isOpen(sx - dx, sy - dy)) {
        sx -= dx;
        sy -= dy;
    }

    const word: [number, number][] = [];
    for (let cx = sx, cy = sy; isOpen(cx, cy); cx += dx, cy += dy)
        word.push([cx, cy]);

    return word.length > 1 ? word : [];
}

/**
 * Splits the raw word list file into lowercase, letter-only words.
 */
export function parseWordList(text: string): WordList {
    return text
        .split("\n")
        .map(word => word.trim().toLowerCase())
        .filter(word => /^[a-z]+$/.test(word));
}
