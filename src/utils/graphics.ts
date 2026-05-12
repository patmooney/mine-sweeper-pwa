import { Grid, NestedArray, toXY, Cell } from "./map";

export const drawMap = (map: Grid, c: HTMLCanvasElement, showMines?: boolean) => {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return;
    }

    map.cells.forEach((c, idx) => paintRect(ctx, map.width, idx, c, showMines));
};

export const paintSingle = (map: Grid, c: HTMLCanvasElement, idx: number) => {
    const ctx = c.getContext("2d");
    const cell = map.cells.at(idx);
    if (!ctx || !cell) {
        return;
    }
    paintRect(ctx, map.width, idx, cell);
}

export const paintRect = (ctx: CanvasRenderingContext2D, width: number, idx: number, c: Cell, showMines?: boolean) => {
    const [x, y] = toXY(width, idx);
    const RECT_WIDTH = ctx.canvas.width / width;
    const rect: [number, number, number, number] = [x * RECT_WIDTH, y * RECT_WIDTH, RECT_WIDTH, RECT_WIDTH];

    ctx.textAlign = "center";
    ctx.font = "16px sans";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#778877";

    let text = c.isVisible && c.adjacent ? c.adjacent.toString() : undefined;

    if (c.isVisible) {
        ctx.fillStyle = "green";
    } else if (showMines && c.isMine) {
        ctx.fillStyle = "red";
    } else if (c.mark === "mine") {
        text = "⚑";
        ctx.fillStyle = "#99aa99";
    } else {
        ctx.fillStyle = "#99aa99";
    }

    ctx.fillRect(...rect);
    ctx.strokeRect(...rect);

    if (text) {
        ctx.fillStyle = "black";
        ctx.fillText(text, (x * RECT_WIDTH) + RECT_WIDTH / 2, ((y * RECT_WIDTH) + RECT_WIDTH / 2) + 1);
    }
};

export const drawStart = (width: number, c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#778877";
    ctx.fillStyle = "#99aa99";
    const RECT_WIDTH = ctx.canvas.width / width;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < width; y++) {
            const rect: [number, number, number, number] = [x * RECT_WIDTH, y * RECT_WIDTH, RECT_WIDTH, RECT_WIDTH];
            ctx.fillRect(...rect);
            ctx.strokeRect(...rect);
        }
    }
};

export const animateReveal = (c: HTMLCanvasElement, map: Grid, toReveal: NestedArray, ctx?: CanvasRenderingContext2D | null) => {
    if (!toReveal.length) {
        return;
    }
    ctx = ctx ?? c.getContext("2d");
    if (!ctx) {
        return;
    }
    toReveal.filter((el) => !Array.isArray(el)).forEach((idx) => paintRect(ctx, map.width, idx as number, map.cells[idx as number]));
    requestAnimationFrame(() => {
        toReveal.filter((el) => Array.isArray(el)).forEach((el) => {
            animateReveal(c, map, el, ctx);
        });
    });
};

export const toCellCoord = (c: HTMLCanvasElement, width: number, x: number, y: number): [number, number] => {
    const RECT_WIDTH = c.width / width;
    return [Math.floor(x/RECT_WIDTH), Math.floor(y/RECT_WIDTH)];
};

export const winningMessage = (map: Grid, c: HTMLCanvasElement, text: string) => {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return;
    }

    const RECT_WIDTH = ctx.canvas.width / map.width;
    ctx.textAlign = "center";
    ctx.font = "48px sans";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, map.width * RECT_WIDTH, map.width * RECT_WIDTH);
    ctx.fillStyle = "yellow";
    ctx.fillText(text, (map.width * RECT_WIDTH) / 2, (map.width * RECT_WIDTH) / 2);
};
