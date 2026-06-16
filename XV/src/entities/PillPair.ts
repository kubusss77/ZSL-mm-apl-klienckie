import { CellColor } from '../constants';

/** Pojedyncza połówka aktywnie spadającej kapsułki. */
export interface CapsuleHalf {
  /** Wiersz połówki kapsułki. */
  row: number;
  /** Kolumna połówki kapsułki. */
  col: number;
  /** Kolor połówki kapsułki. */
  color: CellColor;
}

/**
 * Struktura aktywnej kapsułki używana przez renderer i logikę ruchu.
 *
 * @remarks
 * Nazwy `r1`, `c1`, `r2`, `c2` zostały utrzymane dla zgodności z wcześniejszym formatem gry.
 */
export interface PillPair {
  r1: number;
  c1: number;
  color1: CellColor;
  r2: number;
  c2: number;
  color2: CellColor;
  pairId: number;
  rotation: number;
  horizontal: boolean;
}

/** Bardziej opisowy model kapsułki, przydatny przy konwersji danych. */
export interface FallingCapsule {
  first: CapsuleHalf;
  second: CapsuleHalf;
  pairId: number;
  rotation: number;
}

/**
 * Konwertuje opisową kapsułkę na starszy format {@link PillPair}.
 *
 * @param capsule Kapsułka w modelu z polami `first` i `second`.
 * @returns Kapsułka w formacie używanym przez aktualny renderer.
 */
export function createLegacyPillPair(capsule: FallingCapsule): PillPair {
  return {
    r1: capsule.first.row,
    c1: capsule.first.col,
    color1: capsule.first.color,
    r2: capsule.second.row,
    c2: capsule.second.col,
    color2: capsule.second.color,
    pairId: capsule.pairId,
    rotation: capsule.rotation,
    horizontal: capsule.rotation === 0 || capsule.rotation === 2,
  };
}

/**
 * Zwraca kopię kapsułki przesuniętą o podany wektor.
 *
 * @param pair Kapsułka wejściowa.
 * @param rowDelta Przesunięcie w pionie.
 * @param colDelta Przesunięcie w poziomie.
 * @returns Nowy obiekt kapsułki po przesunięciu.
 */
export function movePillPair(pair: PillPair, rowDelta: number, colDelta: number): PillPair {
  return {
    ...pair,
    r1: pair.r1 + rowDelta,
    c1: pair.c1 + colDelta,
    r2: pair.r2 + rowDelta,
    c2: pair.c2 + colDelta,
  };
}
