export function getDate(offset = 0) {
    const now = new Date();
    now.setDate(now.getDate() + offset)
    const date = new Date(now.toLocaleDateString("en-US", { timeZone: "America/Belize" }));
    return date.toISOString().split("T")[0];
}

export function seed(offset = 0) {
    const str = getDate(offset)

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i);
    }
    return hash >>> 0;
}

export function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function arrayEqualsUnordered(a: string[], b: string[]) {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((val, i) => val === sortedB[i]);
}

export function compare(att: any, ans: any, type: number) {
    switch (type) {
        case 0:
            return att == ans ? 1 : 0;
        case 1:
            if (att == ans[0]) return 1;
            if (att == ans[1]) return 2;
            return 0;
        case 2:
            if (arrayEqualsUnordered(att, ans)) return 1;
            if (att.some?.((v: string) => ans.includes?.(v)))
                return 2;
            return 0;
        case 3:
            if (att > ans) return 4;
            if (att < ans) return 3;
            return 1;
        default:
            return 0;
    }
}

export function getRandomEdgePoint(img: HTMLImageElement, rng: () => number) {
    if (img.naturalHeight === 0 || img.naturalWidth === 0) return [50, 50]
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return [50, 50];
    ctx.drawImage(img, 0, 0);

    const { data, width, height } = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const edges: { x: number; y: number }[] = [];
    const stride = width * 4;
    for (let y = 0; y < height; y += 3) {
        const row = y * width;

        for (let x = 0; x < width; x += 3) {
            const pixelIndex = row + x;
            const alphaIndex = pixelIndex * 4 + 3;
            if (data[alphaIndex] < 10) continue;

            const left = x === 0 || data[alphaIndex - 4] < 10;
            const right = x === width - 1 || data[alphaIndex + 4] < 10;
            const top = y === 0 || data[alphaIndex - stride] < 10;
            const bottom = y === height - 1 || data[alphaIndex + stride] < 10;

            if (left || right || top || bottom) {
                edges.push({ x, y });
            }
        }
    }

    if (edges.length === 0) return [50, 50]

    const chosen = edges[Math.floor(rng() * edges.length)]
    return [(chosen.x / width) * 100, (chosen.y / height) * 100]
}

export class LocalManager {
    fullPath: string;

    constructor(game: string, gamemode: string, type: string) {
        this.fullPath = `${game}-${gamemode}-${type}`;
    }

    get = () => {
        return localStorage.getItem(this.fullPath);
    };

    set = (value: string) => {
        localStorage.setItem(this.fullPath, value);
    };
}