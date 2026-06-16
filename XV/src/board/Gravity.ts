import { Board } from './Board';
import { Cell, Position } from './BoardTypes';
import { FallMask } from './FallMask';

interface PairMovePlan {
  readonly positions: Position[];
  readonly cells: Cell[];
  readonly targets: Position[];
}

/**
 * Przesuwa kapsułki w dół po usunięciu dopasowań, z zachowaniem połączeń połówek.
 */
export class Gravity {
  /**
   * Wykonuje jeden krok grawitacji dla oznaczonych komórek.
   *
   * @param board Plansza, na której znajdują się kapsułki i wirusy.
   * @param fallMask Maska wskazująca kapsułki, które mogą spaść.
   * @returns `true`, jeśli w tym kroku przesunęła się co najmniej jedna komórka.
   */
  step(board: Board, fallMask: FallMask): boolean {
    if (!fallMask.hasAnyActiveCell()) return false;

    let hasMoved = false;
    const resolvedPairs = new Set<number>();

    for (let row = board.rows - 2; row >= 0; row--) {
      for (let col = 0; col < board.cols; col++) {
        const cell = board.getCell(row, col);
        if (!this.canCellFall(cell)) continue;

        if (cell.pairId === null) {
          hasMoved = this.tryMoveSingle(board, fallMask, { row, col }) || hasMoved;
          continue;
        }

        if (resolvedPairs.has(cell.pairId)) continue;
        resolvedPairs.add(cell.pairId);

        hasMoved = this.tryMovePair(board, fallMask, cell.pairId) || hasMoved;
      }
    }

    return hasMoved;
  }

  private canCellFall(cell: Cell | null): cell is Cell {
    return Boolean(cell && cell.type === 'pill');
  }

  private tryMovePair(board: Board, fallMask: FallMask, pairId: number): boolean {
    const positions = board.findPairPositions(pairId);
    if (!this.isAnyPositionActive(fallMask, positions)) return false;

    if (positions.length === 1) {
      return this.tryMoveSingle(board, fallMask, positions[0]);
    }

    if (positions.length !== 2) return false;

    const plan = this.createPairMovePlan(board, positions);
    if (!plan || !this.areTargetsAvailable(board, plan)) return false;

    this.applyMovePlan(board, fallMask, plan);
    return true;
  }

  private tryMoveSingle(board: Board, fallMask: FallMask, position: Position): boolean {
    if (!fallMask.isActive(position.row, position.col)) return false;

    const cell = board.getCell(position.row, position.col);
    const target = this.below(position);

    if (!cell || !board.isEmpty(target.row, target.col)) return false;

    this.moveCell(board, fallMask, position, target, cell);
    return true;
  }

  private createPairMovePlan(board: Board, positions: Position[]): PairMovePlan | null {
    const cells = positions.map((position) => board.getCell(position.row, position.col));
    if (!cells[0] || !cells[1]) return null;

    return {
      positions,
      cells: cells as Cell[],
      targets: positions.map((position) => this.below(position)),
    };
  }

  private areTargetsAvailable(board: Board, plan: PairMovePlan): boolean {
    return plan.targets.every((target) => {
      const isOccupiedByMovingPair = plan.positions.some(
        (position) => position.row === target.row && position.col === target.col
      );
      return isOccupiedByMovingPair || board.isEmpty(target.row, target.col);
    });
  }

  private applyMovePlan(board: Board, fallMask: FallMask, plan: PairMovePlan): void {
    for (const position of plan.positions) {
      board.clearCell(position.row, position.col);
    }

    for (let index = 0; index < plan.positions.length; index++) {
      const from = plan.positions[index];
      const to = plan.targets[index];
      board.setCell(to.row, to.col, plan.cells[index]);
      fallMask.move(from, to);
    }
  }

  private moveCell(board: Board, fallMask: FallMask, from: Position, to: Position, cell: Cell): void {
    board.clearCell(from.row, from.col);
    board.setCell(to.row, to.col, cell);
    fallMask.move(from, to);
  }

  private below(position: Position): Position {
    return { row: position.row + 1, col: position.col };
  }

  private isAnyPositionActive(fallMask: FallMask, positions: readonly Position[]): boolean {
    return positions.some((position) => fallMask.isActive(position.row, position.col));
  }
}
