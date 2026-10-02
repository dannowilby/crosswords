"use client"

import { Button } from "@/components/ui/button"
import { Board, collapse } from "@/lib/crossword";
import { useEffect, useState } from "react"

export default function Page() {

  const [wordList, setWordList] = useState<string[]>([]);

  useEffect(() => {
    fetch('/words.txt').then(resp => resp.text()).then((text) => {
      let words = text.split("\n");
      setWordList(words);
    })
  }, [setWordList]);

  const work = () => {

    let board: Board = {
      width: 5,
      height: 1,
      tiles: [
        [{ editible: true, value: "s", possible_values: [] }],
        [{ editible: true, value: "", possible_values: [] }],
        [{ editible: true, value: "", possible_values: [] }],
        [{ editible: true, value: "", possible_values: [] }],
        [{ editible: true, value: "t", possible_values: [] }],
      ]
    };

    let start = performance.now();
    let new_board = collapse(wordList, board);
    console.log(`Elapsed: ${performance.now() - start}ms`);

    console.log(JSON.stringify(new_board, null, 2));

  };

  return (
    <div className="p-8">
      <p className="text-xl pb-4">{wordList[250003]}</p>
      <Button onClick={work}>Collapse</Button>
    </div>
  )
}
