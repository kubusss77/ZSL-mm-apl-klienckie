import { CellColor, VIRUS_COUNT, VIRUS_START_ROW } from '../constants';
import { Board } from '../board/Board';
import { createCell } from '../board/BoardTypes';
import { RandomSource } from './Random';

/** Wynik próby rozmieszczenia wirusów na planszy. */
export interface VirusSeedResult {
  /** Faktyczna liczba wirusów dodanych na planszę. */
  readonly placed: number;
}

/**
 * Losowo wypełnia dolną część planszy wirusami.
 */
export class VirusSeeder {
  constructor(private readonly random: RandomSource) {}

  /**
   * Umieszcza wirusy w dolnej części planszy.
   *
   * @param board Plansza do wypełnienia.
   * @param amount Docelowa liczba wirusów.
   * @returns Liczba faktycznie dodanych wirusów.
   */
  seed(board: Board, amount: number = VIRUS_COUNT): VirusSeedResult {
    let placed = 0;
    let attempts = 0;
    const maxAttempts = amount * 30;

    while (placed < amount && attempts < maxAttempts) {
      const row = this.random.nextInteger(VIRUS_START_ROW, board.rows - 1);
      const col = this.random.nextInteger(0, board.cols - 1);

      if (board.isEmpty(row, col)) {
        board.setCell(row, col, this.createVirus(this.random.nextColor()));
        placed++;
      }

      attempts++;
    }

    return { placed };
  }

  private createVirus(color: CellColor) {
    return createCell({ type: 'virus', color });
  }
}
