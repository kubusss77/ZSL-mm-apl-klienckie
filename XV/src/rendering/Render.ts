import { Board, Cell } from '../board/Board';
import { BOARD_OFFSET_X, BOARD_OFFSET_Y, CELL_SIZE, CellColor, SPRITE_SIZE } from '../constants';
import { PillPair } from '../entities/PillPair';
import { Assets, ColorKey } from '../logic/AssetLoader';

/** Publiczny kontrakt renderera planszy. */
export interface Renderer {
  /**
   * Rysuje pełny stan planszy.
   *
   * @param board Plansza z osadzonymi komórkami.
   * @param active Aktualnie spadająca kapsułka lub `null`.
   */
  draw(board: Board, active: PillPair | null): void;
}

type VisiblePillSprite = 'single' | 'left' | 'right' | 'up' | 'down';

interface DrawPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Renderuje planszę i aktywną kapsułkę na canvasie.
 */
export class Render implements Renderer {
  private readonly spriteOffset: number;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly cellSize: number,
    private readonly assets: Assets,
    private readonly boardOffsetX: number = BOARD_OFFSET_X,
    private readonly boardOffsetY: number = BOARD_OFFSET_Y
  ) {
    this.spriteOffset = Math.floor((cellSize - SPRITE_SIZE) / 2);
  }

  /** @inheritdoc */
  draw(board: Board, active: PillPair | null): void {
    this.clearCanvas();
    this.clipToBoard(board, () => {
      this.drawSettledCells(board);
      if (active) this.drawActiveCapsule(active);
    });
  }

  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  private clipToBoard(board: Board, paint: () => void): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.boardOffsetX, this.boardOffsetY, board.cols * this.cellSize, board.rows * this.cellSize);
    this.ctx.clip();
    paint();
    this.ctx.restore();
  }

  private drawSettledCells(board: Board): void {
    board.forEachCell((row, col, cell) => {
      if (cell) this.drawBoardCell(board, row, col, cell);
    });
  }

  private drawBoardCell(board: Board, row: number, col: number, cell: Cell): void {
    const point = this.toCanvasPoint(row, col);

    if (cell.state === 'clearing') {
      this.paintImage(this.assets.pills[this.toColorKey(cell.color)].single, point);
      return;
    }

    if (cell.type === 'virus') {
      this.paintImage(this.assets.viruses[this.toColorKey(cell.color)], point);
      return;
    }

    const sprite = this.resolveSettledPillSprite(board, row, col, cell);
    const image =
      sprite === 'single'
        ? this.assets.pills[this.toColorKey(cell.color)].dot
        : this.assets.pills[this.toColorKey(cell.color)][sprite];

    this.paintImage(image, point);
  }

  private drawActiveCapsule(active: PillPair): void {
    this.drawActiveHalf(active, true);
    this.drawActiveHalf(active, false);
  }

  private drawActiveHalf(active: PillPair, isFirstHalf: boolean): void {
    const row = isFirstHalf ? active.r1 : active.r2;
    const col = isFirstHalf ? active.c1 : active.c2;
    const color = isFirstHalf ? active.color1 : active.color2;
    const sprite = this.resolveActivePillSprite(active, isFirstHalf);

    this.paintImage(this.assets.pills[this.toColorKey(color)][sprite], this.toCanvasPoint(row, col));
  }

  private resolveSettledPillSprite(board: Board, row: number, col: number, cell: Cell): VisiblePillSprite {
    if (cell.pairId === null) return 'single';

    if (board.getCell(row, col - 1)?.pairId === cell.pairId) return 'right';
    if (board.getCell(row, col + 1)?.pairId === cell.pairId) return 'left';
    if (board.getCell(row - 1, col)?.pairId === cell.pairId) return 'down';
    if (board.getCell(row + 1, col)?.pairId === cell.pairId) return 'up';

    return 'single';
  }

  private resolveActivePillSprite(active: PillPair, isFirstHalf: boolean): VisiblePillSprite {
    if (active.r1 === active.r2) {
      const firstIsLeft = active.c1 < active.c2;
      return firstIsLeft === isFirstHalf ? 'left' : 'right';
    }

    const firstIsTop = active.r1 < active.r2;
    return firstIsTop === isFirstHalf ? 'up' : 'down';
  }

  private toCanvasPoint(row: number, col: number): DrawPoint {
    return {
      x: this.boardOffsetX + col * this.cellSize + this.spriteOffset,
      y: this.boardOffsetY + row * this.cellSize + this.spriteOffset,
    };
  }

  private paintImage(image: CanvasImageSource, point: DrawPoint): void {
    this.ctx.drawImage(image, point.x, point.y, SPRITE_SIZE, SPRITE_SIZE);
  }

  private toColorKey(color: CellColor): ColorKey {
    const keys: Record<CellColor, ColorKey> = { blue: 'bl', yellow: 'yl', red: 'br' };
    return keys[color];
  }
}
