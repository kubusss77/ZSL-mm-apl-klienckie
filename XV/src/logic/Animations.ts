import { CellColor } from '../constants';
import { ColorKey } from './AssetLoader';

interface SpritePart {
  readonly path: string | null;
  readonly x: number;
  readonly y: number;
}

interface HandFrame {
  readonly parts: readonly SpritePart[];
}

interface ThrowStep {
  readonly frameIndex: number;
  readonly ticks: number;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface LensVirus {
  color: CellColor;
  positionIndex: number;
  frame: number;
  frameCounter: number;
  awaitingMovement: boolean;
}

interface ThrowFrame {
  readonly x: number;
  readonly y: number;
}

/**
 * Obsługuje animacje elementów HTML poza canvasem.
 *
 * @remarks
 * Klasa zarządza podglądem następnej kapsułki, ruchem ręki doktora, rzutem kapsułki oraz animacją wirusów w lupie.
 */
export class Animations {
  private readonly basePath = 'assets/img';
  private readonly handFrames: readonly HandFrame[] = [
    {
      parts: [
        { path: '/hands/up_1.png', x: 38, y: -4 },
        { path: '/hands/up_2.png', x: 38, y: 14 },
        { path: '/hands/up_3.png', x: 39, y: 32.2 },
        { path: null, x: 0, y: 0 },
      ],
    },
    {
      parts: [
        { path: '/hands/middle11.png', x: 23, y: 14 },
        { path: '/hands/middle12.png', x: 41, y: 14 },
        { path: '/hands/middle21.png', x: 23, y: 32 },
        { path: '/hands/middle22.png', x: 41, y: 32.2 },
      ],
    },
    {
      parts: [
        { path: '/hands/down_1.png', x: 40, y: 32 },
        { path: '/hands/down_2.png', x: 41, y: 42 },
        { path: null, x: 0, y: 0 },
        { path: null, x: 0, y: 0 },
      ],
    },
  ];

  private readonly lensPositions: readonly Point[] = [
    { x: 68, y: 18 },
    { x: 80, y: 22 },
    { x: 98, y: 34 },
    { x: 108, y: 54 },
    { x: 104, y: 78 },
    { x: 90, y: 96 },
    { x: 66, y: 108 },
    { x: 40, y: 104 },
    { x: 20, y: 92 },
    { x: 12, y: 74 },
    { x: 16, y: 50 },
    { x: 30, y: 30 },
    { x: 48, y: 20 },
  ];

  private readonly lensRoute: readonly number[] = [12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  private readonly throwSteps: readonly ThrowStep[] = [
    { frameIndex: 0, ticks: 10 },
    { frameIndex: 1, ticks: 10 },
    { frameIndex: 2, ticks: 10 },
    { frameIndex: 3, ticks: 20 },
  ];

  private readonly lensViruses: LensVirus[] = [
    { color: 'yellow', positionIndex: 0, frame: 2, frameCounter: 0, awaitingMovement: false },
    { color: 'blue', positionIndex: 4, frame: 2, frameCounter: 0, awaitingMovement: false },
    { color: 'red', positionIndex: 8, frame: 2, frameCounter: 0, awaitingMovement: false },
  ];

  private lensInterval: ReturnType<typeof setInterval> | null = null;
  private isLensPlaying = true;
  private throwTick = 0;
  private activeThrowStep = 0;

  public isThrowing = false;

  constructor() {
    this.restoreDoctorGraphics();
    this.startLensAnimation();
  }

  /**
   * Aktualizuje podgląd następnej kapsułki.
   *
   * @param color1 Kolor lewej połówki podglądu.
   * @param color2 Kolor prawej połówki podglądu.
   */
  updatePreview(color1: CellColor, color2: CellColor): void {
    const preview = document.getElementById('previewBox');
    if (!preview) return;

    preview.replaceChildren(
      this.createImage(this.pillSprite(color1, 'left')),
      this.createImage(this.pillSprite(color2, 'right'))
    );
    preview.style.visibility = 'visible';
  }

  /** Ukrywa podgląd następnej kapsułki na czas animacji rzutu. */
  hidePreview(): void {
    const preview = document.getElementById('previewBox');
    if (preview) preview.style.visibility = 'hidden';
  }

  /** Przywraca domyślną grafikę ręki doktora. */
  restoreDoctorGraphics(): void {
    this.drawHandFrame(0);
  }

  /** Rozpoczyna licznik animacji ręki wykonywanej przy rzucie. */
  startThrowAnimation(): void {
    this.isThrowing = true;
    this.throwTick = 0;
    this.activeThrowStep = 0;
    this.updateThrowStepVisibility();
  }

  /**
   * Aktualizuje krótką animację ręki wykonywaną razem z rzutem kapsułki.
   */
  updateAnimations(): void {
    if (!this.isThrowing) return;

    this.throwTick++;
    const currentStep = this.throwSteps[this.activeThrowStep];

    if (this.throwTick < currentStep.ticks) return;

    this.throwTick = 0;
    this.activeThrowStep++;

    if (this.activeThrowStep >= this.throwSteps.length) {
      this.isThrowing = false;
      this.activeThrowStep = 0;
    }

    this.updateThrowStepVisibility();
  }

  /**
   * Odtwarza animację lotu kapsułki od doktora do planszy.
   *
   * @param color1 Kolor pierwszej połówki kapsułki.
   * @param color2 Kolor drugiej połówki kapsułki.
   * @param onComplete Funkcja wywoływana po zakończeniu animacji.
   */
  animateThrow(color1: CellColor, color2: CellColor, onComplete: () => void): void {
    this.hidePreview();

    const container = document.getElementById('game-animation-container');
    if (!container) {
      onComplete();
      return;
    }

    const firstHalf = this.createMovingThrowImage(color1, 'left');
    const secondHalf = this.createMovingThrowImage(color2, 'right');
    container.append(firstHalf, secondHalf);

    this.playThrowPath(firstHalf, secondHalf, color1, color2, () => {
      firstHalf.remove();
      secondHalf.remove();
      this.restoreDoctorGraphics();
      onComplete();
    });
  }

  /** Wstrzymuje animację wirusów w lupie. */
  pauseLens(): void {
    this.isLensPlaying = false;
  }

  /** Wznawia animację wirusów w lupie. */
  resumeLens(): void {
    this.isLensPlaying = true;
  }

  /** Zatrzymuje timer animacji wirusów w lupie. */
  stopLens(): void {
    if (this.lensInterval) clearInterval(this.lensInterval);
    this.lensInterval = null;
  }

  private playThrowPath(
    firstHalf: HTMLImageElement,
    secondHalf: HTMLImageElement,
    color1: CellColor,
    color2: CellColor,
    onComplete: () => void
  ): void {
    const frames = this.createThrowFrames();
    let index = 0;

    const showFrame = () => {
      this.applyThrowFrame(firstHalf, secondHalf, frames[index], index, color1, color2);
      index++;

      if (index < frames.length) {
        window.setTimeout(showFrame, 20);
      } else {
        onComplete();
      }
    };

    showFrame();
  }

  private applyThrowFrame(
    firstHalf: HTMLImageElement,
    secondHalf: HTMLImageElement,
    frame: ThrowFrame,
    index: number,
    color1: CellColor,
    color2: CellColor
  ): void {
    const cycle = index % 4;
    const vertical = cycle === 1 || cycle === 3;
    const swapped = cycle === 1 || cycle === 2;

    const firstColor = swapped ? color2 : color1;
    const secondColor = swapped ? color1 : color2;

    firstHalf.src = this.pillSprite(firstColor, vertical ? 'up' : 'left');
    secondHalf.src = this.pillSprite(secondColor, vertical ? 'down' : 'right');

    this.positionImage(firstHalf, frame.x, frame.y + (vertical ? -14 : 0));
    this.positionImage(secondHalf, frame.x + (vertical ? 0 : 16), frame.y);
    this.drawHandFrame(index <= 3 ? 0 : index <= 6 ? 1 : 2);
  }

  private createThrowFrames(): ThrowFrame[] {
    const start: Point = { x: 483, y: 61 };
    const control: Point = { x: 392, y: -26 };
    const end: Point = { x: 318, y: 28 };

    return Array.from({ length: 24 }, (_, index) => {
      const progress = index / 23;
      const inverse = 1 - progress;
      return {
        x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
        y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y,
      };
    });
  }

  private startLensAnimation(): void {
    this.lensInterval = setInterval(() => {
      this.advanceLensViruses();
      this.drawLensViruses();
    }, 200);
  }

  private advanceLensViruses(): void {
    if (!this.isLensPlaying) return;

    for (const virus of this.lensViruses) {
      this.advanceLensVirus(virus);
    }
  }

  private advanceLensVirus(virus: LensVirus): void {
    if (virus.awaitingMovement) {
      virus.positionIndex = this.lensRoute[virus.positionIndex];
      virus.frame = 2;
      virus.awaitingMovement = false;
      return;
    }

    if (virus.frame === 2 && virus.frameCounter === 0) {
      virus.frame = 1;
      virus.frameCounter = 1;
      return;
    }

    if (virus.frame === 1) {
      virus.frame = 2;
      return;
    }

    if (virus.frame === 2 && virus.frameCounter === 1) {
      virus.frame = 3;
      virus.frameCounter = 0;
      return;
    }

    if (virus.frame === 3) {
      virus.frame = 2;
      virus.awaitingMovement = true;
    }
  }

  private drawLensViruses(): void {
    const lens = document.getElementById('lupaBox');
    if (!lens) return;

    const images = this.lensViruses.map((virus) => {
      const position = this.lensPositions[virus.positionIndex];
      const image = this.createImage(`${this.basePath}/lupa/${this.colorKey(virus.color)}/${virus.frame}.png`);
      this.positionImage(image, position.x, position.y);
      return image;
    });

    lens.replaceChildren(...images);
  }

  private drawHandFrame(index: number): void {
    const frame = this.handFrames[index];
    frame.parts.forEach((part, partIndex) => this.paintHandPart(partIndex + 1, part));
  }

  private paintHandPart(partNumber: number, part: SpritePart): void {
    const element = document.getElementById(`rekaCzesc${partNumber}`) as HTMLImageElement | null;
    if (!element) return;

    if (!part.path) {
      element.style.display = 'none';
      return;
    }

    element.src = this.basePath + part.path;
    this.positionImage(element, part.x, part.y);
    element.style.display = 'block';
  }

  private updateThrowStepVisibility(): void {
    for (let partNumber = 1; partNumber <= 4; partNumber++) {
      const image = document.getElementById(`rekaCzesc${partNumber}`);
      if (image) image.style.display = partNumber - 1 === this.activeThrowStep ? 'block' : 'none';
    }
  }

  private createMovingThrowImage(color: CellColor, side: 'left' | 'right'): HTMLImageElement {
    const image = this.createImage(this.pillSprite(color, side));
    image.style.position = 'absolute';
    return image;
  }

  private createImage(src: string): HTMLImageElement {
    const image = document.createElement('img');
    image.src = src;
    return image;
  }

  private positionImage(image: HTMLElement, x: number, y: number): void {
    image.style.position = 'absolute';
    image.style.left = `${x}px`;
    image.style.top = `${y}px`;
  }

  private pillSprite(color: CellColor, direction: 'left' | 'right' | 'up' | 'down'): string {
    return `${this.basePath}/${this.colorKey(color)}_${direction}.png`;
  }

  private colorKey(color: CellColor): ColorKey {
    const keys: Record<CellColor, ColorKey> = { red: 'br', blue: 'bl', yellow: 'yl' };
    return keys[color];
  }
}
