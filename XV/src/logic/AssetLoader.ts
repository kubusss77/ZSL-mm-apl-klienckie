/** Skrócony identyfikator koloru używany w nazwach plików graficznych. */
export type ColorKey = "bl" | "yl" | "br";

/** Nazwa wariantu sprite'a kapsułki. */
export type PillSpriteKey = "single" | "left" | "right" | "up" | "down" | "dot";

/** Zestaw grafik potrzebnych do narysowania kapsułki w jednym kolorze. */
export interface PillSprites {
    single: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
    up: HTMLImageElement;
    down: HTMLImageElement;
    dot: HTMLImageElement;
}

/** Wszystkie assety wymagane do uruchomienia gry. */
export interface Assets {
    pills: Record<ColorKey, PillSprites>;
    viruses: Record<ColorKey, HTMLImageElement>;
    gameOver: HTMLImageElement;
    stageComplete: HTMLImageElement;
}

interface ImageRequest {
    readonly key: string;
    readonly src: string;
}

/**
 * Ładuje wszystkie grafiki przed startem pętli gry.
 */
export class AssetLoader {
    constructor(private readonly basePath: string = "assets/img") {}

    /**
     * Ładuje zestawy kapsułek, wirusy i grafiki ekranów końcowych.
     *
     * @returns Promise z kompletnym zbiorem assetów gry.
     */
    async loadAll(): Promise<Assets> {
        const [bluePills, yellowPills, brownPills, viruses, gameOver, stageComplete] = await Promise.all([
            this.loadPillSet("bl"),
            this.loadPillSet("yl"),
            this.loadPillSet("br"),
            this.loadViruses(),
            this.loadImage(`${this.basePath}/go.png`),
            this.loadImage(`${this.basePath}/sc.png`)
        ]);

        return {
            pills: { bl: bluePills, yl: yellowPills, br: brownPills },
            viruses,
            gameOver,
            stageComplete
        };
    }

    private async loadPillSet(color: ColorKey): Promise<PillSprites> {
        const requests: ImageRequest[] = [
            { key: "single", src: `${this.basePath}/${color}_o.png` },
            { key: "left", src: `${this.basePath}/${color}_left.png` },
            { key: "right", src: `${this.basePath}/${color}_right.png` },
            { key: "up", src: `${this.basePath}/${color}_up.png` },
            { key: "down", src: `${this.basePath}/${color}_down.png` },
            { key: "dot", src: `${this.basePath}/${color}_dot.png` }
        ];

        const loaded = await this.loadNamedImages(requests);
        return loaded as unknown as PillSprites;
    }

    private async loadViruses(): Promise<Record<ColorKey, HTMLImageElement>> {
        const loaded = await this.loadNamedImages([
            { key: "bl", src: `${this.basePath}/covid_blue.png` },
            { key: "yl", src: `${this.basePath}/covid_yellow.png` },
            { key: "br", src: `${this.basePath}/covid_brown.png` }
        ]);

        return loaded as Record<ColorKey, HTMLImageElement>;
    }

    private async loadNamedImages(requests: readonly ImageRequest[]): Promise<Record<string, HTMLImageElement>> {
        const pairs = await Promise.all(requests.map(async (request) => [request.key, await this.loadImage(request.src)] as const));
        return Object.fromEntries(pairs);
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Nie udało się załadować pliku: ${src}`));
            image.src = src;
        });
    }
}
