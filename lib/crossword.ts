
export type WordList = string[];

/**
 * Given a length of tiles and a word list, this function filters out all the
 * impossible words and returns the new tiles with updated `possible_values`
 */
export function filter_tile_word(word_list: WordList, tiles: Tile[]): Tile[] {

    let filtered_words = word_list.filter((x: string) => x.length == tiles.length);

    for (let i = 0; i < tiles.length; i++) {

        let tile = tiles[i];

        // this is a collapsed value and cannot change
        if (tile.value != "") {
            filtered_words = filtered_words.filter((x: string) => x.charAt(i) == tile.value);
            continue;
        }

        if (tile.possible_values.length != 0) {
            filtered_words = filtered_words.filter((x: string) => {
                return tile.possible_values.includes(x.charAt(i));
            });
        }

    }

    let output = tiles.map((tile, i) => {
        if (tile.value != "")
            return tile;

        tile.possible_values = [... new Set(filtered_words.map(x => x.charAt(i)))];
        return tile;
    })

    return output;

}

function collapse_rows(word_list: WordList, board: Board): Board {
    for (let i = 0; i < board.height; i++) {

        let word: Tile[] = [];
        let start = 0;

        // step one past the end so the last word is handled like it hit a
        // non-editible tile
        for (let j = 0; j <= board.width; j++) {

            if (j < board.width && board.tiles[j][i].editible) {
                if (word.length == 0)
                    start = j;

                word.push(board.tiles[j][i]);
                continue;
            }

            // a single tile is not a word, so it is left unconstrained
            if (word.length > 1) {
                // update word to include possible values
                let new_tiles = filter_tile_word(word_list, word);

                // replace the tiles
                for (let k = 0; k < new_tiles.length; k++) {
                    board.tiles[start + k][i] = new_tiles[k];
                }
            }

            word = [];

        }

    }

    return board;
}

function collapse_columns(word_list: WordList, board: Board): Board {
    for (let i = 0; i < board.width; i++) {

        let word: Tile[] = [];
        let start = 0;

        // step one past the end so the last word is handled like it hit a
        // non-editible tile
        for (let j = 0; j <= board.height; j++) {

            if (j < board.height && board.tiles[i][j].editible) {
                if (word.length == 0)
                    start = j;

                word.push(board.tiles[i][j]);
                continue;
            }

            // a single tile is not a word, so it is left unconstrained
            if (word.length > 1) {
                // update word to include possible values
                let new_tiles = filter_tile_word(word_list, word);

                // replace the tiles
                for (let k = 0; k < new_tiles.length; k++) {
                    board.tiles[i][start + k] = new_tiles[k];
                }
            }

            word = [];

        }

    }

    return board;
}

/**
 * Collapses the possible options for the free spaces in the board based on the
 * word list. The rows are collapsed first, and then the columns.
 */
export function collapse(word_list: WordList, board: Board): Board {

    let output = board;

    let refinement_passes = 5;
    for (let i = 0; i < refinement_passes; i++) {
        output = collapse_columns(word_list, output);
        output = collapse_rows(word_list, output);
    }

    return output;
}


export type Tile = {
    editible: boolean;

    value: string;
    possible_values: string[];
};

export type Board = {
    width: number;
    height: number;

    tiles: Tile[][];
};

/**
 * Takes a crossword and a selection of a value at a position, and return the
 * new collapsed board
 * 
 * Return an error if something goes wrong, not if the selection produces a
 * board with no solution
 */
export function select_and_collapse(word_list: WordList, board: Board, x: number, y: number, value: string): Board | Error {

    // check if selection position is valid
    let is_in_bounds = x >= 0 && x < board.width && y >= 0 && y < board.height;
    let is_editible_tile = board.tiles[x][y].editible;

    if (!is_in_bounds || !is_editible_tile) {
        return Error("invalid value position - (in bounds: " + is_in_bounds + ", editible: " + is_editible_tile + ") " + + x + ", " + y);
    }

    // check if value is valid
    if (value.length != 1) {
        return Error("invalid value: " + value);
    }

    // now we have a valid value in a valid position
    // we must now propagate this selection

    // clear the possible selections board part
    for (let i = 0; i < board.height; i++) {
        for (let j = 0; j < board.height; j++) {
            board.tiles[i][j].possible_values = [];
        }
    }

    // set the value
    board.tiles[x][y].value = value;

    return collapse(word_list, board);
}
