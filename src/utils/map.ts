export type Cell = {
    isMine: boolean;
    adjacent?: number;
    isVisible?: boolean;
    mark?: "mine" | "1" | "2";
    xy?: [number, number];
};

export type Grid = {
    width: number;
    nMines: number;
    cells: Cell[];
};

export const toXY = (width: number, idx: number): [number, number] => [idx % width, Math.floor(idx / width)];
export const toIdx = (width: number, x: number, y: number): number => (y*width) + x;

export const getOffsets = (width: number, x: number, y: number) => [
    ...(x > 0 ? [-1] : []), // left
    ...(x < (width-1) ? [1] : []), // right
    ...(y > 0 ? [-width] : []), // top
    ...(y < (width-1) ? [width] : []), // bottom
    ...(x > 0 && y > 0 ? [(-width)-1] : []), // top-left
    ...(x < (width-1) && y > 0 ? [(-width)+1] : []), // top-right
    ...(x > 0 && y < (width-1) ? [width-1] : []), // bottom-left
    ...(x < (width-1) && y < (width-1) ? [width+1] : []), // bottom-right
];

export const genMap = (width: number, nMines: number, startX: number, startY: number) => {
    const max = width*width;
    nMines = Math.min(nMines, max / 2);
    let mineCount = nMines;

    let cells: Cell[] = new Array(max).fill(null).map(() => ({ isMine: false }));
    const density = nMines / max;

    while (mineCount) {
        cells.forEach((c, idx) => {
            if (!c.xy) {
                c.xy = toXY(width, idx);
            }
            if (Math.abs(c.xy[0] - startX) <= 1 && Math.abs(c.xy[1] - startY) <= 1) {
                return;
            }
            if (c.isMine || c.isVisible) {
                return;
            }
            else if (mineCount && Math.random() <= density) {
                c.isMine = true;
                mineCount--;
            }
        });
    }

    cells.forEach((c, idx) => {
        if (c.isMine) {
            return;
        }

        const [x, y] = c.xy!;
        const offsets = getOffsets(width, x, y);
        c.adjacent = offsets.reduce<number>((acc, off) => {
            acc += cells[idx+off].isMine ? 1 : 0;
            if (!c.isVisible) {
                c.isVisible = cells[idx+off].isVisible;
            }
            return acc;
        }, 0);
    });

    const map = { width, nMines, cells };
    return map;
};

export type NestedArray = Array<NestedArray | number>;
export const reveal = (map: Grid, x: number, y: number): NestedArray => {
    const idx = toIdx(map.width, x, y);
    if (!map.cells[idx].isMine) {
        map.cells[idx].isVisible = true;
        if (!map.cells[idx].adjacent) {
            return [idx, ...getOffsets(map.width, map.cells[idx].xy![0], map.cells[idx].xy![1]).map((v) => {
                const [x, y] = toXY(map.width, idx+v);
                if (!map.cells[idx+v].isMine && !map.cells[idx+v].isVisible) {
                    return reveal(map, x, y);
                }
                return [];
            })];
        }
        return [idx];
    }
    return [];
};

export const flatArray = (arr: NestedArray): NestedArray => arr.map((el) => Array.isArray(el) ? flatArray(el) : el).flat()
