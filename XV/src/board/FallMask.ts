import { BoardReader, Position } from './BoardTypes';

/** Odczytowy kontrakt maski pól, które mogą dalej spadać. */
export interface FallMaskReader {
  /** Sprawdza, czy co najmniej jedna komórka jest oznaczona jako aktywna. */
  hasAnyActiveCell(): boolean;

  /** Sprawdza, czy podana komórka jest oznaczona jako aktywna. */
  isActive(row: number, col: number): boolean;
}

/**
 * Przechowuje informację, które fragmenty kapsułek mają dalej podlegać grawitacji.
 */
export class FallMask implements FallMaskReader {
  private readonly flags: boolean[][];

  constructor(private readonly board: BoardReader) {
    this.flags = this.createFlags();
  }

  /** @inheritdoc */
  hasAnyActiveCell(): boolean {
    return this.flags.some((row) => row.some(Boolean));
  }

  /** @inheritdoc */
  isActive(row: number, col: number): boolean {
    return row >= 0 && row < this.flags.length && col >= 0 && col < this.flags[row].length && this.flags[row][col];
  }

  /** Oznacza pojedynczą komórkę jako aktywną dla grawitacji. */
  activate(row: number, col: number): void {
    if (!this.board.isInside(row, col)) return;
    this.flags[row][col] = true;
  }

  /** Oznacza wszystkie nieusuwane połówki kapsułek jako kandydatów do spadania. */
  activatePillsThatMayFall(): void {
    this.clear();
    this.board.forEachCell((row, col, cell) => {
      if (cell?.type === 'pill' && cell.state !== 'clearing') {
        this.activate(row, col);
      }
    });
  }

  /** Przenosi oznaczenie aktywności razem z przesuniętą komórką. */
  move(from: Position, to: Position): void {
    if (!this.isActive(from.row, from.col)) return;
    this.flags[from.row][from.col] = false;
    if (this.board.isInside(to.row, to.col)) this.flags[to.row][to.col] = true;
  }

  /** Usuwa wszystkie oznaczenia aktywnych pól. */
  clear(): void {
    for (const row of this.flags) row.fill(false);
  }

  private createFlags(): boolean[][] {
    return Array.from({ length: this.board.rows }, () => Array<boolean>(this.board.cols).fill(false));
  }
}
