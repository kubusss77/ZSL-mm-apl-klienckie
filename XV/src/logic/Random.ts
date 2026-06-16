import { AVAILABLE_COLORS, CellColor } from '../constants';

/** Źródło losowości używane przez logikę gry. */
export interface RandomSource {
  /** Losuje jeden z kolorów dostępnych dla kapsułek i wirusów. */
  nextColor(): CellColor;

  /** Losuje liczbę całkowitą z domkniętego przedziału. */
  nextInteger(min: number, max: number): number;
}

/** Implementacja losowości oparta o `Math.random`. */
export class BrowserRandomSource implements RandomSource {
  /** @inheritdoc */
  nextColor(): CellColor {
    return AVAILABLE_COLORS[this.nextInteger(0, AVAILABLE_COLORS.length - 1)];
  }

  /** @inheritdoc */
  nextInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
