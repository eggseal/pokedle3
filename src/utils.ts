export function getDate() {
    const now = new Date();
    const date = new Date(now.toLocaleDateString("en-US", { timeZone: "America/Belize" }));
    return date.toISOString().split("T")[0];
}

export function seed() {
    const str = getDate();

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