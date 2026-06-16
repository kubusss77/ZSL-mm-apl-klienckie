import { BoardWriter, Cell, CellVisitor, Position } from './BoardTypes';

export type { BoardReader, BoardWriter, Cell, CellKind, CellVisitor, Position } from './BoardTypes';

/**
 * Reprezentuje logiczną planszę gry i ukrywa szczegóły przechowywania komórek.
 */
export class Board implements BoardWriter {
  private readonly cells: Array<Array<Cell | null>>;

  constructor(
    public readonly rows: number,
    public readonly cols: number
  ) {
    this.cells = this.createEmptyMatrix(rows, cols);
  }

  /** @inheritdoc */
  isInside(row: number, col: number): boolean {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }

  /** @inheritdoc */
  isEmpty(row: number, col: number): boolean {
    return this.isInside(row, col) && this.cells[row][col] === null;
  }

  /** @inheritdoc */
  getCell(row: number, col: number): Cell | null {
    return this.isInside(row, col) ? this.cells[row][col] : null;
  }

  /** @inheritdoc */
  setCell(row: number, col: number, cell: Cell): void {
    if (!this.isInside(row, col)) return;
    this.cells[row][col] = { ...cell };
  }

  /** @inheritdoc */
  clearCell(row: number, col: number): void {
    if (!this.isInside(row, col)) return;
    this.cells[row][col] = null;
  }

  /** Czyści całą planszę bez zmiany jej rozmiaru. */
  reset(): void {
    this.forEachCell((row, col) => this.clearCell(row, col));
  }

  /**
   * Zwraca wszystkie połówki kapsułki z podanym identyfikatorem w kolejności wygodnej dla ruchu.
   *
   * @param pairId Identyfikator pary kapsułki.
   * @returns Pozycje znalezionych połówek kapsułki.
   */
  findPairPositions(pairId: number): Position[] {
    const positions: Position[] = [];

    this.forEachCell((row, col, cell) => {
      if (cell?.pairId === pairId) positions.push({ row, col });
    });

    return this.orderPairPositions(positions);
  }

  /**
   * Alias zachowany dla zgodności z wcześniejszą wersją kodu.
   *
   * @param pairId Identyfikator pary kapsułki.
   * @returns Pozycje komórek należących do tej pary.
   */
  getElementsById(pairId: number): Position[] {
    return this.findPairPositions(pairId);
  }

  /** @inheritdoc */
  forEachCell(visitor: CellVisitor): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        visitor(row, col, this.cells[row][col]);
      }
    }
  }

  private createEmptyMatrix(rows: number, cols: number): Array<Array<Cell | null>> {
    return Array.from({ length: rows }, () => Array<Cell | null>(cols).fill(null));
  }

  private orderPairPositions(positions: Position[]): Position[] {
    if (positions.length !== 2) return positions;

    const [first, second] = positions;
    if (first.col === second.col) {
      return [...positions].sort((left, right) => right.row - left.row);
    }

    if (first.row === second.row) {
      return [...positions].sort((left, right) => left.col - right.col);
    }

    return positions;
  }
}
