import { batch, Component, createMemo, createSignal, onMount } from 'solid-js'
import { genMap, Grid, reveal, toIdx } from './utils/map';
import { RECT_WIDTH, Renderer } from './utils/graphics';

const App: Component = () => {
  let c: HTMLCanvasElement | undefined;
  let b: HTMLDivElement | undefined;

  let mouseEvent: MouseEvent | Touch | undefined;
  let map: Grid | undefined;
  let gfx: Renderer | undefined;
  let newGameTime: number | undefined;
  let canvasTime: number | undefined;
  let mouseDown: [number, number] | undefined;
  
  let gameTimer: number | undefined;

  const [size, setSize] = createSignal<number>(20);
  const [mines, setMines] = createSignal<number>(400 * 0.15);
  const [mineDif, setMineDif] = createSignal<number>(0.15);
  const [startTime, setStartTime] = createSignal<number>();
  const [elapsed, setElapsed] = createSignal<number>();

  onMount(() => {
    if (c) {
      c.width = Math.min(window.innerWidth, 1024) * 0.95;
      c.height = window.innerHeight * 0.85;
      gfx = new Renderer(c);
      confirmNewGame();
      c.addEventListener("touchstart", (e) => { e.preventDefault(); onCanvasTouchStart(e); });
      c.addEventListener("touchmove", (e) => { e.preventDefault(); onCavasTouchMove(e); });
      c.addEventListener("touchend", (e) => { e.preventDefault(); onCanvasConfirm(); });
      c.addEventListener("mousedown", (e) => { e.preventDefault(); onCanvasMouseDown(e); });
      c.addEventListener("mousemove", (e) => { e.preventDefault(); onCanvasMouseMove(e); });
      c.addEventListener("mouseup", (e) => { e.preventDefault(); onCanvasConfirm(); });
      c.addEventListener("wheel", (e) => { e.preventDefault(); onZoom(e); });
    }
    if (b) {
      b.addEventListener("mousedown", (e) => { e.preventDefault(); onNewGame(); });
      b.addEventListener("mouseup", (e) => { e.preventDefault(); cancelNewGame(); });
    }
  });

  const onZoom = (e: WheelEvent) => {
    if (gfx) {
      const deltaNorm = - Math.max(-1, Math.min(1, e.deltaY));
      const deltaScale = 0.1 * deltaNorm;
      gfx.scale = Math.min(10, Math.max(1, gfx.scale + deltaScale));
      gfx.offset = [gfx.offset[0] - (RECT_WIDTH * deltaScale), gfx.offset[1] - (deltaScale * RECT_WIDTH)];
      gfx.drawMap();
    }
  };

  const onNewGame = () => {
    b?.querySelector("div")?.classList.add("w-full", "duration-1000", "transition-[width]");
    newGameTime = setTimeout(confirmNewGame, 1000);
  };
  const confirmNewGame = () => {
    cancelNewGame();
    if (c) {
      onGameEnd();
      gfx?.drawStart(size(), c);
    }
  };
  const cancelNewGame = () => {
    b?.querySelector("div")?.classList.remove("w-full", "duration-1000", "transition-[width]");
    clearTimeout(newGameTime);
  };

  const onGameEnd = () => {
    batch(() => {
      clearInterval(gameTimer);
      setStartTime(undefined);
      setMines(Math.floor((size() * size()) * mineDif()));
      map = undefined;
    })
  };

  const onCanvasMouseDown = (e: MouseEvent) => {
    mouseEvent = e;
    onInteractStart(e.clientX, e.clientY);
  }

  const onCanvasTouchStart = (e: TouchEvent) => {
    const item = e.touches.item(0);
    if (item) {
      mouseEvent = item;
      onInteractStart(item.clientX, item.clientY);
    }
  };

  const onInteractStart = (x: number, y: number) => {
    if (canvasTime) {
      clearTimeout(canvasTime);
      canvasTime = undefined;
    }
    mouseDown = [x, y];
    canvasTime = setTimeout(() => onCanvasConfirm(true), 500);
  };

  const onCavasTouchMove = (e: TouchEvent) => {
    const item = e.changedTouches.item(0);
    if (item) {
      onCanvasInteractMove(item.clientX, item.clientY);
    }
  };

  const onCanvasMouseMove = (e: MouseEvent) => {
    onCanvasInteractMove(e.clientX, e.clientY);
  };

  const onCanvasInteractMove = (x: number, y: number) => {
    if (!mouseDown || !gfx) {
      return;
    }
    const dX = x - mouseDown[0];
    const dY = y - mouseDown[1];
    if (canvasTime) {
      if (Math.abs(dX) > 20 || Math.abs(dY) > 20) {
        clearTimeout(canvasTime);
        canvasTime = undefined;
      } else {
        return;
      }
    }
    mouseDown = [x, y];
    mouseEvent = undefined;
    gfx.offset = [gfx.offset[0] + (dX / gfx.scale), gfx.offset[1] + (dY / gfx.scale)];
    gfx.drawMap();
  };

  const niceTime = createMemo(() => {
    let t = elapsed();
    if (!t) {
      return ["00", "00", "00"];
    }
    const hours = Math.floor(t / (1000 * 60 * 60));
    t -= (hours * (1000 * 60 * 60));
    const minutes = Math.floor(t / (1000 * 60));
    t -= (minutes * (1000 * 60));
    const seconds = Math.floor(t / 1000);
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0")
    ];
  });

  const onCanvasConfirm = (markAsMine?: boolean) => {
    mouseDown = undefined;
    if (canvasTime) {
      clearTimeout(canvasTime);
      canvasTime = undefined;
    }
    if (!mouseEvent || !c) {
      return;
    }
    const MAP_WIDTH = size();
    const [x, y] = [mouseEvent.clientX, mouseEvent.clientY];
    mouseEvent = undefined;
    const box = c.getBoundingClientRect();

    if (!gfx) {
      return;
    }

    const coord = gfx.toCellCoord(x - box.left, y - box.top);
    if (coord[0] < 0 || coord[1] < 0 || coord[0] >= MAP_WIDTH || coord[1] >= MAP_WIDTH) {
      return;
    }

    if (!map) {
      markAsMine = false;
      setStartTime(Date.now());
      setElapsed(0);
      gameTimer = setInterval(() => setElapsed(Date.now() - (startTime() ?? 0)), 1000)
      map = genMap(MAP_WIDTH, mines(), coord[0], coord[1]);
      gfx.setMap(map);
      gfx.drawMap();
    }

    if (c && map) {
      const idx = toIdx(map.width, ...coord);
      const cell = map.cells.at(idx);
      if (!cell || cell.isVisible) {
        return;
      }

      if (cell?.mark && !markAsMine) {
        // dont allow quick clicks on marked tiles
        return;
      }

      if (cell?.mark && markAsMine) {
        // unmark after long press
        cell.mark = undefined;
        setMines(mines() + 1);
        gfx.paintSingle(idx);
        return;
      }

      if (markAsMine) {
        // mark after long press
        cell.mark = "mine";
        gfx.paintSingle(idx);
        setMines(mines() - 1);
        return;
      }

      if (cell?.isMine) {
        // BOOM
        gfx.drawMap(true);
        onGameEnd();
        return;
      }

      // Normal tile, can reveal safely
      gfx.animateReveal(reveal(map, ...coord));
      const mineCount = map.cells.filter((c) => c.isMine).length;
      const revealed = map.cells.filter((c) => !c.isMine && c.isVisible).length;
      if ((mineCount+revealed) === map.cells.length) {
        gfx.winningMessage(map, c, "Winner!");
        onGameEnd();
      }
    }
  };

  return (
    <div class="h-[100vh] w-[100vw] flex flex-col gap-2 items-center overflow-hidden">
      <div class="flex flex-col justify-center items-center mt-2">
        <div class="flex flex-row gap-2">
          <select class="bg-gray-700 p-3" value={size().toString()} onChange={(e) => setSize(parseInt(e.target.value))}>
            <option value="10">Small 10x10</option>
            <option value="20">Medium 20x20</option>
            <option value="30">Large 30x30</option>
            <option value="50">HUGE 50x50</option>
          </select>
          <select class="bg-gray-700 p-3" value={mineDif().toString()} onChange={(e) => { console.log(e.target.value); setMineDif(parseFloat(e.target.value)) }}>
            <option value="0.1">Easy 10%</option>
            <option value="0.15">Medium 15%</option>
            <option value="0.2">Hard 20%</option>
            <option value="0.3">Extreme 30%</option>
          </select>
        </div>
        <div ref={b} class="p-2 m-5 border rounded w-1/2 text-center cursor-pointer relative w-full">
          New game
          <div class="h-full rounded absolute left-0 top-0 bg-blue-300 -z-10 transition-[width] w-0 duration-1000 ease-linear"></div>
        </div>
      </div>
      <div class="flex flex-row gap-10">
        <div>Mines: {mines()}</div>
        <div>Time: {niceTime().join(":")}</div>
      </div>
      <div class="overflow-none">
        <canvas ref={c} class="" />
      </div>
    </div>
  );
};

export default App;
