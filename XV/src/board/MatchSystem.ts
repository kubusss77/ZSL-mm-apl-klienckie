import { MATCH_MIN, CellColor } from '../constants';
import { BoardReader, Position } from './BoardTypes';

/** Komórka należąca do wykrytej serii tego samego koloru. */
export interface MatchCell extends Position {
  /** Kolor serii, do której należy komórka. */
  color: CellColor;
}

interface ScanLine {
  readonly start: Position;
  readonly next: (position: Position) => Position;
  readonly isInside: (position: Position) => boolean;
}

/**
 * Wyszukuje poziome i pionowe serie tego samego koloru.
 */
export class MatchSystem {
  constructor(private readonly minimumLength: number = MATCH_MIN) {}

  /**
   * Szuka wszystkich serii spełniających minimalną długość.
   *
   * @param board Plansza do przeskanowania.
   * @returns Lista komórek, które powinny zostać usunięte.
   */
  findMatches(board: BoardReader): MatchCell[] {
    const marked = this.createMarkMap(board);

    this.scanRows(board, marked);
    this.scanColumns(board, marked);

    return this.toMatchList(board, marked);
  }

  /**
   * Usuwa z planszy podane dopasowania.
   *
   * @param board Obiekt udostępniający czyszczenie komórek.
   * @param matches Komórki wykryte przez {@link findMatches}.
   */
  clearMatches(board: { clearCell(row: number, col: number): void }, matches: readonly MatchCell[]): void {
    for (const match of matches) {
      board.clearCell(match.row, match.col);
    }
  }

  private scanRows(board: BoardReader, marked: boolean[][]): void {
    for (let row = 0; row < board.rows; row++) {
      this.scanLine(board, marked, {
        start: { row, col: 0 },
        next: ({ row: currentRow, col }) => ({ row: currentRow, col: col + 1 }),
        isInside: ({ col }) => col < board.cols,
      });
    }
  }

  private scanColumns(board: BoardReader, marked: boolean[][]): void {
    for (let col = 0; col < board.cols; col++) {
      this.scanLine(board, marked, {
        start: { row: 0, col },
        next: ({ row, col: currentCol }) => ({ row: row + 1, col: currentCol }),
        isInside: ({ row }) => row < board.rows,
      });
    }
  }

  private scanLine(board: BoardReader, marked: boolean[][], line: ScanLine): void {
    let cursor = line.start;

    while (line.isInside(cursor)) {
      const origin = board.getCell(cursor.row, cursor.col);
      if (!origin) {
        cursor = line.next(cursor);
        continue;
      }

      const sequence = this.collectColorRun(board, line, cursor, origin.color);
      if (sequence.length >= this.minimumLength) {
        for (const position of sequence) marked[position.row][position.col] = true;
      }
      cursor = line.next(sequence[sequence.length - 1]);
    }
  }

  private collectColorRun(board: BoardReader, line: ScanLine, first: Position, color: CellColor): Position[] {
    const run: Position[] = [];
    let cursor = first;

    while (line.isInside(cursor)) {
      const cell = board.getCell(cursor.row, cursor.col);
      if (!cell || cell.color !== color) break;

      run.push(cursor);
      cursor = line.next(cursor);
    }

    return run;
  }

  private createMarkMap(board: BoardReader): boolean[][] {
    return Array.from({ length: board.rows }, () => Array<boolean>(board.cols).fill(false));
  }

  private toMatchList(board: BoardReader, marked: boolean[][]): MatchCell[] {
    const matches: MatchCell[] = [];

    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols; col++) {
        if (!marked[row][col]) continue;
        const cell = board.getCell(row, col);
        if (cell) matches.push({ row, col, color: cell.color });
      }
    }

    return matches;
  }
}
