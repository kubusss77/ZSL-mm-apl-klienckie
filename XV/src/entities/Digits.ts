/** Konfiguracja renderowania liczbowego licznika HUD-u. */
export interface DigitCounterOptions {
    /** Id elementu HTML, do którego trafią obrazki cyfr. */
    readonly elementId: string;
    /** Wartość liczbowa do pokazania. */
    readonly value: number;
    /** Minimalna liczba cyfr, uzupełniana zerami z lewej strony. */
    readonly minDigits: number;
    /** Opcjonalna ścieżka do katalogu z grafikami cyfr. */
    readonly assetPath?: string;
}

/**
 * Aktualizuje licznik HUD-u, używając obrazków cyfr zamiast zwykłego tekstu.
 *
 * @param elementId Id elementu HTML licznika.
 * @param value Wartość do wyświetlenia.
 * @param minDigits Minimalna liczba cyfr widocznych w liczniku.
 */
export function updateHtmlCounter(elementId: string, value: number, minDigits: number): void {
    renderDigitCounter({ elementId, value, minDigits });
}

/**
 * Renderuje licznik na podstawie obiektu konfiguracyjnego.
 *
 * @param options Konfiguracja licznika i źródła grafik.
 */
export function renderDigitCounter(options: DigitCounterOptions): void {
    const container = document.getElementById(options.elementId);
    if (!container) return;

    container.replaceChildren(...createDigitImages(formatCounterValue(options.value, options.minDigits), options.assetPath ?? "assets/img/cyfry"));
}

/**
 * Formatuje liczbę do postaci używanej w licznikach gry.
 *
 * @param value Wartość wejściowa; wartości ujemne są sprowadzane do zera.
 * @param minDigits Minimalna liczba znaków.
 * @returns Tekst z zerami dodanymi z lewej strony.
 */
export function formatCounterValue(value: number, minDigits: number): string {
    const safeValue = Math.max(0, Math.floor(value));
    return safeValue.toString().padStart(minDigits, "0");
}

function createDigitImages(text: string, assetPath: string): HTMLImageElement[] {
    return Array.from(text, (digit) => {
        const image = document.createElement("img");
        image.src = `${assetPath}/${digit}.png`;
        image.alt = digit;
        return image;
    });
}
