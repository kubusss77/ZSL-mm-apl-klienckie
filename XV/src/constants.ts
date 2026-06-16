/** Liczba wierszy logicznej planszy. */
export const ROWS = 16;
/** Liczba kolumn logicznej planszy. */
export const COLS = 8;

/** Rozmiar pojedynczej komórki planszy w pikselach canvasu. */
export const CELL_SIZE = 16;
/** Rozmiar sprite'ów kapsułek i wirusów. */
export const SPRITE_SIZE = 16;
/** Szerokość wewnętrznego canvasu gry. */
export const CANVAS_WIDTH = 512;
/** Wysokość wewnętrznego canvasu gry. */
export const CANVAS_HEIGHT = 448;

/** Pozycja planszy na tle gry w osi X. */
export const BOARD_OFFSET_X = 272;
/** Pozycja planszy na tle gry w osi Y. */
export const BOARD_OFFSET_Y = 94;

/** Standardowy czas między automatycznymi krokami opadania aktywnej kapsułki. */
export const DROP_INTERVAL_MS = 500;
/** Czas między krokami szybkiego opadania uruchamianego przez gracza. */
export const FAST_DROP_INTERVAL_MS = 45;
/** Czas między krokami grawitacji po usunięciu dopasowań. */
export const GRAVITY_STEP_MS = 60;
/** Czas trwania animacji znikania dopasowanych komórek. */
export const CLEAR_ANIM_MS = 220;

/** Minimalna długość serii koloru wymagana do usunięcia komórek. */
export const MATCH_MIN = 4;
/** Początkowa liczba wirusów na planszy. */
export const VIRUS_COUNT = 4;
/** Pierwszy wiersz, w którym mogą pojawić się wirusy. */
export const VIRUS_START_ROW = Math.floor(ROWS / 2);

/** Punkty za usunięcie połówki kapsułki. */
export const SCORE_PILL = 10;
/** Punkty za usunięcie wirusa. */
export const SCORE_VIRUS = 100;

/** Kolory obsługiwane przez logikę dopasowań i sprite'y. */
export type CellColor = "red" | "blue" | "yellow";

/** Rozmiar planszy wyrażony liczbą komórek. */
export interface BoardSize {
    readonly rows: number;
    readonly columns: number;
}

/** Pozycja planszy na canvasie. */
export interface BoardPlacement {
    readonly x: number;
    readonly y: number;
}

/** Rozmiar canvasu gry. */
export interface CanvasSize {
    readonly width: number;
    readonly height: number;
}

/** Stan wyników prezentowany w HUD. */
export interface ScoreState {
    score: number;
    highScore: number;
    virusesLeft: number;
}

/** Wartości punktowe elementów usuwanych z planszy. */
export interface ScoreValues {
    readonly pill: number;
    readonly virus: number;
}

/** Timingi używane przez główne systemy gry. */
export interface GameTiming {
    readonly dropMs: number;
    readonly fastDropMs: number;
    readonly gravityMs: number;
    readonly clearMs: number;
}

/** Lista kolorów, z której losowane są kapsułki i wirusy. */
export const AVAILABLE_COLORS: readonly CellColor[] = ["red", "blue", "yellow"];
/** Alias zachowany dla starszych importów. */
export const COLORS = AVAILABLE_COLORS;

/** Domyślny rozmiar planszy gry. */
export const BOARD_SIZE: BoardSize = Object.freeze({
    rows: ROWS,
    columns: COLS
});

/** Domyślny rozmiar canvasu gry. */
export const CANVAS_SIZE: CanvasSize = Object.freeze({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
});

/** Domyślne położenie planszy na tle. */
export const BOARD_PLACEMENT: BoardPlacement = Object.freeze({
    x: BOARD_OFFSET_X,
    y: BOARD_OFFSET_Y
});

/** Zgrupowane wartości czasowe używane przez pętlę gry. */
export const TIMING: GameTiming = Object.freeze({
    dropMs: DROP_INTERVAL_MS,
    fastDropMs: FAST_DROP_INTERVAL_MS,
    gravityMs: GRAVITY_STEP_MS,
    clearMs: CLEAR_ANIM_MS
});

/** Zgrupowane wartości punktowe. */
export const SCORE_VALUES: ScoreValues = Object.freeze({
    pill: SCORE_PILL,
    virus: SCORE_VIRUS
});
