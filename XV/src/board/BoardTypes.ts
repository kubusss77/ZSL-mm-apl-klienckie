import { CellColor } from '../constants';

/** Rodzaj obiektu przechowywanego w pojedynczej komórce planszy. */
export type CellKind = 'pill' | 'virus';

/** Dodatkowy stan wizualny komórki używany przez renderer. */
export type CellVisualState = 'idle' | 'clearing';

/** Współrzędne komórki na planszy liczone od lewego górnego rogu. */
export interface Position {
  /** Indeks wiersza planszy. */
  row: number;
  /** Indeks kolumny planszy. */
  col: number;
}

/** Pojedyncza zajęta komórka planszy. */
export interface Cell {
  /** Informuje, czy komórka jest fragmentem kapsułki czy wirusem. */
  type: CellKind;
  /** Kolor używany do dopasowań oraz wyboru sprite'a. */
  color: CellColor;
  /** Identyfikator pary kapsułki; `null` oznacza wirusa albo samotną połówkę. */
  pairId: number | null;
  /** Opcjonalny stan animacji usuwania. */
  state?: CellVisualState;
}

/** Tylko do odczytu: minimalny kontrakt planszy używany przez systemy gry. */
export interface BoardReader {
  /** Liczba wierszy planszy. */
  readonly rows: number;
  /** Liczba kolumn planszy. */
  readonly cols: number;

  /** Sprawdza, czy współrzędne mieszczą się w planszy. */
  isInside(row: number, col: number): boolean;

  /** Zwraca `true`, jeśli pole istnieje i nie zawiera komórki. */
  isEmpty(row: number, col: number): boolean;

  /** Pobiera komórkę albo `null`, gdy pole jest puste lub poza planszą. */
  getCell(row: number, col: number): Cell | null;

  /** Odwiedza wszystkie pola planszy w kolejności wierszami. */
  forEachCell(visitor: CellVisitor): void;
}

/** Rozszerza odczyt planszy o operacje modyfikujące komórki. */
export interface BoardWriter extends BoardReader {
  /** Wstawia komórkę na wskazane pole, jeśli pole istnieje. */
  setCell(row: number, col: number, cell: Cell): void;

  /** Czyści wskazane pole, jeśli pole istnieje. */
  clearCell(row: number, col: number): void;
}

/** Funkcja wywoływana dla każdej komórki planszy. */
export interface CellVisitor {
  (row: number, col: number, value: Cell | null): void;
}

/** Parametry fabryki komórek planszy. */
export interface CellFactoryOptions {
  type: CellKind;
  color: CellColor;
  pairId?: number | null;
  state?: CellVisualState;
}

/**
 * Tworzy nową komórkę planszy z bezpieczną wartością domyślną `pairId`.
 *
 * @param options Parametry opisujące typ, kolor i stan komórki.
 * @returns Nowy obiekt komórki gotowy do zapisania na planszy.
 */
export function createCell(options: CellFactoryOptions): Cell {
  return {
    type: options.type,
    color: options.color,
    pairId: options.pairId ?? null,
    state: options.state,
  };
}

/**
 * Porównuje dwie pozycje na planszy.
 *
 * @returns `true`, jeśli obie pozycje wskazują tę samą komórkę.
 */
export function samePosition(left: Position, right: Position): boolean {
  return left.row === right.row && left.col === right.col;
}
