<script lang="ts">
import { Board } from './models/Board';

let board: Board;
let cells = $state([]);
let choices = $state([]);
let chose = $state(false);

const nextLevel = () => {
  board = new Board();
  REDO: while (true) {
    const moves = 54 + Math.floor(Math.random() * 6);
    for (let i = 0; i < moves; i++) {
      const legalMoves = board.legalMoves();
      if (legalMoves.length == 0) {
        continue REDO;
      }
      const index = Math.floor(Math.random() * legalMoves.length);
      const move = legalMoves[index];
      board.makeMove(move);
    }
    break;
  }

  cells = board.cells();

  const correctBlack = cells.filter((cell: number) => cell === 1).length;
  const correctWhite = cells.filter((cell: number) => cell === 2).length;

  const newAnswersMap = new Map<string, [number, number, boolean]>();
  while (true) {
    const black = correctBlack + Math.floor(Math.random() * 3) - 2;
    const white = correctWhite + Math.floor(Math.random() * 3) - 2;
    if (black + white > 64) {
      continue;
    }
    newAnswersMap.set(`${black}-${white}`, [black, white, false]);
    if (newAnswersMap.size > 3) {
      break;
    }
  }
  const newChoices = Array.from(newAnswersMap.values());
  newChoices[Math.floor(Math.random() * newAnswersMap.size)] = [correctBlack, correctWhite, true];
  choices = newChoices;
  chose = false;
}

nextLevel();
</script>

<div class="max-w-lg">
  <div class="grid grid-cols-8">
    {#each cells as cell, i}
      <div class="bg-green-600 border aspect-square flex items-center justify-center">
        <svg width="80%" height="80%" viewBox="0 0 100 100">
          {#if cell === 1}
            <circle cx="50" cy="50" r="45" fill="black" />
          {:else if cell === 2}
            <circle cx="50" cy="50" r="45" fill="white" />
          {/if}
        </svg>
      </div>
    {/each}
  </div>
</div>

<div class="mt-2 grid grid-cols-2 gap-4">
  {#each choices as choice}
    <button
        class:!bg-gray-300={!chose}
        class:!bg-gray-500={chose && !choice[2]}
        class:!bg-yellow-300={chose && choice[2]}
        onclick={() => chose = true}
    >
      <svg viewBox="0 0 100 100" width="1em" height="1em" class="inline">
          <circle cx="50" cy="50" r="45" fill="black" />
      </svg>
      {choice[0]}
      :
      <svg viewBox="0 0 100 100" width="1em" height="1em" class="inline">
        <circle cx="50" cy="50" r="45" fill="white" />
      </svg>
      {choice[1]}
    </button>
  {/each}
</div>

<div class="mt-2">
  <button onclick={() => nextLevel()}>Next Level</button>
</div>
