import { Grid, NestedArray, toXY, Cell } from "./map";

export const RECT_WIDTH = 20;

export class Renderer {
    scale: number = 1;
    offset: [number, number] = [0, 0];
    map?: Grid;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get render context");
        }
        this.ctx = ctx;
    }

    setMap(map: Grid) {
        this.map = map;
    }

    drawMap(showMines?: boolean) {
        this.ctx.reset();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offset[0], this.offset[1]);
        this.map?.cells.forEach((c, idx) => this.paintRect(idx, c, showMines));
    }

    paintSingle(idx: number) {
        const cell = this.map?.cells.at(idx);
        if (!cell) {
            return;
        }
        this.paintRect(idx, cell);
    }

    paintRect(idx: number, c: Cell, showMines?: boolean) {
        if (!this.map) {
            return;
        }
        const ctx = this.ctx;
        const [x, y] = toXY(this.map.width, idx);
        const rW = RECT_WIDTH;
        const rect: [number, number, number, number] = [x * rW, y * rW, rW, rW];

        ctx.textAlign = "center";
        ctx.font = "16px sans";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#778877";

        let text = c.isVisible && c.adjacent ? c.adjacent.toString() : undefined;

        ctx.fillStyle = c.isVisible ? "green" : "#99aa99";

        if (showMines && c.isMine) {
            ctx.fillStyle = "red";
        }

        if (c.mark === "mine") {
            text = "⚑";
        }

        ctx.fillRect(...rect);
        ctx.strokeRect(...rect);

        if (text) {
            ctx.fillStyle = "black";
            ctx.fillText(text, (x * rW) + rW / 2, ((y * rW) + rW / 2) + 1);
        }
    };

    drawStart(width: number, c: HTMLCanvasElement) {
        const ctx = c.getContext("2d");
        if (!ctx) {
            return;
        }
        const rW = RECT_WIDTH;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.strokeStyle = "#778877";
        ctx.fillStyle = "#99aa99";
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < width; y++) {
                const rect: [number, number, number, number] = [x * rW, y * rW, rW, rW];
                ctx.fillRect(...rect);
                ctx.strokeRect(...rect);
            }
        }
    };

    animateReveal(toReveal: NestedArray) {
        const map = this.map;
        if (!map || !toReveal.length) {
            return;
        }
        toReveal.filter((el) => !Array.isArray(el)).forEach((idx) => this.paintRect(idx as number, map.cells[idx as number]));
        requestAnimationFrame(() => {
            toReveal.filter((el) => Array.isArray(el)).forEach((el) => {
                this.animateReveal(el);
            });
        });
    };

    winningMessage(map: Grid, c: HTMLCanvasElement, text: string) {
        const ctx = c.getContext("2d");
        if (!ctx) {
            return;
        }
        const rW = RECT_WIDTH;

        ctx.textAlign = "center";
        ctx.font = "48px sans";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, map.width * rW, map.width * rW);
        ctx.fillStyle = "yellow";
        ctx.fillText(text, (map.width * rW) / 2, (map.width * rW) / 2);
    }

    toCellCoord(x: number, y: number): [number, number] {
        const rW = RECT_WIDTH * this.scale;
        console.log(this.offset, [x, y], [Math.floor((x - this.offset[0])/rW), Math.floor((y - this.offset[1])/rW)]);
        return [Math.floor((x - this.offset[0])/rW), Math.floor((y - this.offset[1])/rW)];
    };
}


