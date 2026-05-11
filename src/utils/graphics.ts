import { Grid, NestedArray, toXY, Cell } from "./map";

const RECT_WIDTH = 20;

export const drawMap = (map: Grid, c: HTMLCanvasElement, showMines?: boolean) => {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return;
    }

    ctx.strokeStyle = "#778877";
    ctx.textAlign = "center";
    ctx.font = "16px sans";
    ctx.textBaseline = "middle";

    map.cells.forEach((c, idx) => paintRect(ctx, map.width, idx, c, showMines));
};

export const paintRect = (ctx: CanvasRenderingContext2D, width: number, idx: number, c: Cell, showMines?: boolean) => {
    const [x, y] = toXY(width, idx);
    const rect: [number, number, number, number] = [x * RECT_WIDTH, y * RECT_WIDTH, RECT_WIDTH, RECT_WIDTH];

    if (c.isVisible) {
        ctx.fillStyle = "green";
    } else if (showMines && c.isMine) {
        ctx.fillStyle = "red";
    } else {
        ctx.fillStyle = "#99aa99";
    }

    ctx.fillRect(...rect);
    ctx.strokeRect(...rect);

    if (c.isVisible && c.adjacent) {
        ctx.fillStyle = "black";
        ctx.fillText(c.adjacent.toString(), (x * RECT_WIDTH) + RECT_WIDTH / 2, ((y * RECT_WIDTH) + RECT_WIDTH / 2) + 1);
    }
};


export const drawStart = (width: number, c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d");
    if (!ctx) {
        return;
    }
    ctx.strokeStyle = "#778877";
    ctx.fillStyle = "#99aa99";
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
    setTimeout(() => {
        toReveal.filter((el) => Array.isArray(el)).forEach((el) => {
            animateReveal(c, map, el, ctx);
        });
    }, 20);
};

export const toCellCoord = (x: number, y: number): [number, number] => {
    return [Math.floor(x/RECT_WIDTH), Math.floor(y/RECT_WIDTH)];
};
