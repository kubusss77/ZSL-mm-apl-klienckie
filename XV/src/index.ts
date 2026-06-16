import { Board } from './board/Board';
import { BOARD_SIZE, CANVAS_SIZE, CELL_SIZE, BOARD_PLACEMENT } from './constants';
import { Game } from './logic/Game';
import { AssetLoader } from './logic/AssetLoader';
import { GameLoop } from './logic/Loop';
import { Render } from './rendering/Render';

interface BootstrapContext {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
}

bootstrap().catch((error) => console.error(error));

/**
 * Uruchamia grę dopiero po pobraniu canvasu i wszystkich grafik.
 */
async function bootstrap(): Promise<void> {
  const { canvas, context } = readCanvasContext();
  const assets = await new AssetLoader().loadAll();

  canvas.width = CANVAS_SIZE.width;
  canvas.height = CANVAS_SIZE.height;
  context.imageSmoothingEnabled = false;

  const board = new Board(BOARD_SIZE.rows, BOARD_SIZE.columns);
  const renderer = new Render(context, CELL_SIZE, assets, BOARD_PLACEMENT.x, BOARD_PLACEMENT.y);
  const game = new Game(board, renderer);
  const loop = new GameLoop(
    (deltaMs) => game.update(deltaMs),
    () => game.renderer()
  );

  loop.start();
}

function readCanvasContext(): BootstrapContext {
  const canvas = document.getElementById('board');
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("Nie znaleziono elementu canvas o id 'board'.");
  }

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Nie udało się pobrać kontekstu 2D canvasu.');
  }

  return { canvas, context };
}
