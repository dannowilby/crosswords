import '@testing-library/jest-dom';

import { Board, collapse, filter_tile_word, select_and_collapse, Tile, WordList } from './crossword';

describe('collapse', () => {
    it('sets the value with selection', () => {

        let word_list: WordList = [
            "sun",
            "son",
            "so",
            "sir",
            "simon",
            "arthur",
            "man",
            "uv",
            "no",
            "ovo"
        ];

        let board: Board = {
            width: 3,
            height: 2,
            tiles: [
                [
                    { editible: true, value: "", possible_values: [] },
                    { editible: true, value: "", possible_values: [] }
                ],
                [
                    { editible: true, value: "", possible_values: [] },
                    { editible: true, value: "", possible_values: [] }
                ],
                [
                    { editible: true, value: "", possible_values: [] },
                    { editible: true, value: "", possible_values: [] }
                ],
            ],
        };

        let value = "s";
        let board_result = select_and_collapse(word_list, board, 0, 0, value);

        let valid_selection = !(board_result instanceof Error);
        let updated_value = valid_selection ? (board_result as Board).tiles[0][0].value == value : false;

        expect(updated_value).toBe(true);
    })

    it('returns error out of bounds', () => {

    })

    it('returns error when bad value', () => {

    })

    it('filters constrains', () => {

        const word_list: WordList = [
            "dog",
            "doggy",
            "chad",
            "chud",
            "chide"
        ];

        const tiles: Tile[] = [
            {
                editible: true,
                value: "c",
                possible_values: []
            },
            {
                editible: true,
                value: "",
                possible_values: []
            },
            {
                editible: true,
                value: "",
                possible_values: []
            },
            {
                editible: true,
                value: "d",
                possible_values: []
            },
        ];

        let filtered = filter_tile_word(word_list, tiles);

        expect(tiles[0].possible_values).toStrictEqual([]);
        expect(tiles[1].possible_values).toEqual(expect.arrayContaining(["h"]));
        expect(tiles[2].possible_values).toEqual(expect.arrayContaining(["u", "a"]))
        expect(tiles[3].possible_values).toStrictEqual([]);
    });
})