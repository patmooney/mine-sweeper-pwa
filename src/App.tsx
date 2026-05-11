import { Component, onMount } from 'solid-js'
import { genMap, Grid, reveal, toIdx } from './utils/map';
import { animateReveal, drawMap, toCellCoord } from './utils/graphics';

const App: Component = () => {
  let c: HTMLCanvasElement | undefined;
  let b: HTMLDivElement | undefined;

  let map: Grid | undefined;
  let newGameTime: number | undefined;

  onMount(() => {
    if (c) {
      c.width = window.innerWidth;
      c.height = window.innerHeight * 0.85;
      confirmNewGame();
      c.addEventListener("mouseup", (e) => { e.preventDefault(); onCanvasConfirm(e); });
    }
    if (b) {
      b.addEventListener("click", () => confirmNewGame());
    }
  });

  const onNewGame = () => {
    b?.querySelector("div")?.classList.add("w-full", "duration-1000", "transition-[width]");
    newGameTime = setTimeout(confirmNewGame, 1000);
  };
  const confirmNewGame = () => {
    cancelNewGame();
    map = genMap(20, 100, 5, 5);
    if (c) {
      drawMap(map, c);
      animateReveal(c, map, reveal(map, 5, 5));
    }
  };
  const cancelNewGame = () => {
    b?.querySelector("div")?.classList.remove("w-full", "duration-1000", "transition-[width]");
    clearTimeout(newGameTime);
  };

  const onCanvasConfirm = (e: MouseEvent) => {
    const [x, y] = [e.clientX, e.clientY];
    if (c && map) {
      const coord = toCellCoord(x, y);
      const idx = toIdx(map.width, ...coord);
      if (map.cells.at(idx)?.isMine) {
        drawMap(map, c, true);
        return;
      }
      animateReveal(c, map, reveal(map, ...coord));
    }
  };

  return (
    <div class="h-[100vh] w-[100vw] flex flex-col gap-5 items-center justify-between overflow-hidden">
      <canvas ref={c} class="border border-red-100" />
      <div ref={b} class="p-2 m-5 border rounded w-1/2 text-center cursor-pointer relative">
        New game
        <div class="h-full rounded absolute left-0 top-0 bg-blue-300 -z-10 transition-[width] w-0 duration-1000 ease-linear"></div>
      </div>
    </div>
  );
};

export default App
