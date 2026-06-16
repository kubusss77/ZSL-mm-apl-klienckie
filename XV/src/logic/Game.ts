import { Board } from '../board/Board';
import { FallMask } from '../board/FallMask';
import { Gravity } from '../board/Gravity';
import { MatchCell, MatchSystem } from '../board/MatchSystem';
import { createCell, Position } from '../board/BoardTypes';
import { CLEAR_ANIM_MS, CellColor, DROP_INTERVAL_MS, FAST_DROP_INTERVAL_MS, GRAVITY_STEP_MS } from '../constants';
import { renderDigitCounter } from '../entities/Digits';
import { PillPair } from '../entities/PillPair';
import { Render } from '../rendering/Render';
import { Animations } from './Animations';
import { BrowserRandomSource, RandomSource } from './Random';
import { ScoreKeeper } from './ScoreKeeper';
import { VirusSeeder } from './VirusSeeder';

/** Obiekt aktualizowany przez główną pętlę gry. */
export interface Updatable {
  /**
   * Aktualizuje stan obiektu.
   *
   * @param dt Czas od poprzedniej klatki w milisekundach.
   */
  update(dt: number): void;
}

interface NextCapsuleColors {
  c1: CellColor;
  c2: CellColor;
}

interface ScreenElements {
  readonly gameOver: HTMLElement | null;
  readonly stageComplete: HTMLElement | null;
  readonly doctorPose: HTMLElement | null;
  readonly startHint: HTMLElement | null;
}

interface RotationOffsets {
  readonly first: Position;
  readonly second: Position;
}

type GamePhase = 'start' | 'playing' | 'gameover' | 'stagecomplete';

/**
 * Koordynuje reguły gry: wejście, opadanie kapsułek, czyszczenie serii i ekrany stanu.
 *
 * @remarks
 * `Game` spina systemy niższego poziomu: planszę, wykrywanie dopasowań, grawitację, wynik oraz animacje DOM.
 */
export class Game implements Updatable {
  private phase: GamePhase = 'start';
  private activePair: PillPair | null = null;
  private nextPairId = 1;

  private dropTimer = 0;
  private clearTimer = 0;
  private gravityTimer = 0;

  private isClearing = false;
  private isGravityRunning = false;
  private isThrowing = false;
  private isFastDropping = false;

  private readonly fallMask: FallMask;
  private readonly matches = new MatchSystem();
  private readonly gravity = new Gravity();
  private readonly animations = new Animations();
  private readonly scores = new ScoreKeeper();
  private readonly virusSeeder: VirusSeeder;
  private readonly screens: ScreenElements = {
    gameOver: document.getElementById('screen-gameover'),
    stageComplete: document.getElementById('screen-stagecomplete'),
    doctorPose: document.getElementById('doctor-tpose'),
    startHint: document.getElementById('start-hint'),
  };

  private pendingClear: MatchCell[] = [];
  private nextColors: NextCapsuleColors;

  /** Liczba wirusów pozostałych na aktualnej planszy. */
  virusesLeft = 0;

  constructor(
    private readonly board: Board,
    private readonly render: Render,
    private readonly random: RandomSource = new BrowserRandomSource()
  ) {
    this.virusSeeder = new VirusSeeder(random);
    this.fallMask = new FallMask(board);
    this.nextColors = this.pickNextColors();

    this.bindKeyboard();
    this.animations.updatePreview(this.nextColors.c1, this.nextColors.c2);
    this.seedViruses();
    this.refreshHud();
    this.syncScreens();
  }

  /** Aktualny wynik gracza. */
  get score(): number {
    return this.scores.score;
  }

  /** Najlepszy zapisany wynik. */
  get highScore(): number {
    return this.scores.highScore;
  }

  /**
   * Aktualizuje timery i wykonuje dokładnie jeden etap aktywnej fazy gry.
   *
   * @param dt Czas od poprzedniej klatki w milisekundach.
   */
  update(dt: number): void {
    this.animations.updateAnimations();

    if (this.phase !== 'playing') return;

    if (this.isClearing) {
      this.advanceClearAnimation(dt);
      return;
    }

    if (this.activePair) {
      this.advanceActivePair(dt);
      return;
    }

    this.advanceGravity(dt);
    this.spawnWhenBoardIsReady();
  }

  /** Rysuje aktualny stan gry przez przypisany renderer. */
  renderer(): void {
    this.render.draw(this.board, this.activePair);
  }

  private bindKeyboard(): void {
    document.addEventListener('keydown', (event) => this.handleKeyboard(event));
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (event.code === 'Enter') {
      event.preventDefault();
      if (this.phase !== 'playing') this.startNewGame();
      return;
    }

    if (this.phase !== 'playing' || this.isThrowing) return;

    if (this.isFastDropKey(event)) {
      event.preventDefault();
      this.startFastDrop();
      return;
    }

    if (this.isFastDropping) return;

    if (!event.repeat) {
      if (event.code === 'ArrowUp' || event.code === 'KeyW') this.rotatePill(-1);
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') this.rotatePill(1);
    }

    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.movePill(0, -1);
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.movePill(0, 1);
  }

  private advanceActivePair(dt: number): void {
    this.dropTimer += dt;

    if (this.isFastDropping) {
      if (this.dropTimer < FAST_DROP_INTERVAL_MS) return;
      this.dropTimer = 0;
      this.dropOrLockActivePair();
      return;
    }

    const interval = this.isFastDropping ? FAST_DROP_INTERVAL_MS : DROP_INTERVAL_MS;

    while (this.dropTimer >= interval) {
      this.dropTimer -= interval;
      this.dropOrLockActivePair();
      if (!this.activePair) break;
    }
  }

  /**
   * Uruchamia szybki zjazd kapsułki i blokuje sterowanie do momentu lądowania.
   */
  private startFastDrop(): void {
    if (!this.activePair || this.isFastDropping) return;

    this.isFastDropping = true;
    this.dropTimer = Math.max(this.dropTimer, FAST_DROP_INTERVAL_MS);
  }

  private advanceGravity(dt: number): void {
    if (!this.isGravityRunning) return;

    this.gravityTimer += dt;
    while (this.gravityTimer >= GRAVITY_STEP_MS) {
      this.gravityTimer -= GRAVITY_STEP_MS;

      if (this.gravity.step(this.board, this.fallMask)) continue;

      this.isGravityRunning = false;
      this.gravityTimer = 0;
      this.fallMask.clear();
      this.tryStartClearCycle();
      break;
    }
  }

  private advanceClearAnimation(dt: number): void {
    this.clearTimer += dt;
    if (this.clearTimer >= CLEAR_ANIM_MS) this.finishClearCycle();
  }

  private spawnWhenBoardIsReady(): void {
    if (!this.canSpawnNext()) return;

    if (this.virusesLeft === 0) {
      this.phase = 'stagecomplete';
      this.animations.stopLens();
      this.syncScreens();
      return;
    }

    this.spawnPill();
  }

  private spawnPill(): void {
    if (!this.canSpawnNext()) return;

    if (!this.board.isEmpty(0, 3) || !this.board.isEmpty(0, 4)) {
      this.phase = 'gameover';
      this.animations.pauseLens();
      this.syncScreens();
      return;
    }

    this.isThrowing = true;
    this.animations.startThrowAnimation();
    this.animations.animateThrow(this.nextColors.c1, this.nextColors.c2, () => this.finishThrow());
  }

  private finishThrow(): void {
    this.dropTimer = 0;
    this.activePair = {
      r1: 0,
      c1: 3,
      color1: this.nextColors.c1,
      r2: 0,
      c2: 4,
      color2: this.nextColors.c2,
      pairId: this.nextPairId++,
      rotation: 0,
      horizontal: true,
    };

    this.nextColors = this.pickNextColors();
    this.animations.updatePreview(this.nextColors.c1, this.nextColors.c2);
    this.isThrowing = false;
  }

  private movePill(rowDelta: number, colDelta: number): void {
    if (!this.activePair) return;

    const nextPair = this.offsetPair(this.activePair, rowDelta, colDelta);
    if (this.canPlacePair(nextPair)) this.activePair = nextPair;
  }

  private rotatePill(direction: 1 | -1): void {
    if (!this.activePair) return;

    const nextRotation = (this.activePair.rotation + direction + 4) % 4;
    const rotatedPair = this.findRotatedPairWithKick(this.activePair, nextRotation);

    if (rotatedPair) this.activePair = rotatedPair;
  }

  private dropOrLockActivePair(): void {
    if (!this.activePair) return;

    const dropped = this.offsetPair(this.activePair, 1, 0);
    if (this.canPlacePair(dropped)) {
      this.activePair = dropped;
      return;
    }

    this.lockActivePair();
    this.tryStartClearCycle();
  }

  private lockActivePair(): void {
    if (!this.activePair) return;

    const pair = this.activePair;
    this.board.setCell(pair.r1, pair.c1, createCell({ type: 'pill', color: pair.color1, pairId: pair.pairId }));
    this.board.setCell(pair.r2, pair.c2, createCell({ type: 'pill', color: pair.color2, pairId: pair.pairId }));

    this.activePair = null;
    this.dropTimer = 0;
    this.isFastDropping = false;
  }

  private tryStartClearCycle(): void {
    const foundMatches = this.matches.findMatches(this.board);
    if (foundMatches.length === 0) return;

    const cleared = this.countClearedCells(foundMatches);
    this.virusesLeft = Math.max(0, this.virusesLeft - cleared.viruses);
    this.scores.addClearedCells(cleared.pills, cleared.viruses);
    this.refreshHud();

    this.startClearCycle(foundMatches);
  }

  private startClearCycle(matches: MatchCell[]): void {
    this.pendingClear = matches;
    this.fallMask.activatePillsThatMayFall();

    for (const match of matches) {
      const cell = this.board.getCell(match.row, match.col);
      if (!cell) continue;
      this.board.setCell(match.row, match.col, { ...cell, state: 'clearing' });
    }

    this.isClearing = true;
    this.clearTimer = 0;
  }

  private finishClearCycle(): void {
    this.matches.clearMatches(this.board, this.pendingClear);
    this.pendingClear = [];
    this.isClearing = false;
    this.clearTimer = 0;
    this.isGravityRunning = true;
    this.gravityTimer = 0;
  }

  private countClearedCells(matches: readonly MatchCell[]): { pills: number; viruses: number } {
    let pills = 0;
    let viruses = 0;

    for (const match of matches) {
      const cell = this.board.getCell(match.row, match.col);
      if (cell?.type === 'virus') viruses++;
      if (cell?.type === 'pill') pills++;
    }

    return { pills, viruses };
  }

  private seedViruses(): void {
    this.virusesLeft = this.virusSeeder.seed(this.board).placed;
  }

  private startNewGame(): void {
    const firstStart = this.phase === 'start';

    if (!firstStart) {
      this.board.reset();
      this.seedViruses();
    }

    this.scores.resetCurrentScore();
    this.activePair = null;
    this.nextPairId = 1;
    this.dropTimer = 0;
    this.clearTimer = 0;
    this.gravityTimer = 0;
    this.isThrowing = false;
    this.isFastDropping = false;
    this.isClearing = false;
    this.isGravityRunning = false;
    this.pendingClear = [];
    this.fallMask.clear();

    this.nextColors = this.pickNextColors();
    this.animations.updatePreview(this.nextColors.c1, this.nextColors.c2);
    this.phase = 'playing';
    this.animations.resumeLens();
    this.refreshHud();
    this.syncScreens();
  }

  private canSpawnNext(): boolean {
    return (
      this.phase === 'playing' && !this.activePair && !this.isThrowing && !this.isClearing && !this.isGravityRunning
    );
  }

  private canPlacePair(pair: PillPair): boolean {
    return this.board.isEmpty(pair.r1, pair.c1) && this.board.isEmpty(pair.r2, pair.c2);
  }

  private offsetPair(pair: PillPair, rowDelta: number, colDelta: number): PillPair {
    return {
      ...pair,
      r1: pair.r1 + rowDelta,
      c1: pair.c1 + colDelta,
      r2: pair.r2 + rowDelta,
      c2: pair.c2 + colDelta,
    };
  }

  private buildRotatedPair(pair: PillPair, nextRotation: number): PillPair | null {
    const current = this.rotationOffsets(pair.rotation);
    const pivot = { row: pair.r1 - current.first.row, col: pair.c1 - current.first.col };
    const next = this.rotationOffsets(nextRotation);

    const rotated: PillPair = {
      ...pair,
      r1: pivot.row + next.first.row,
      c1: pivot.col + next.first.col,
      r2: pivot.row + next.second.row,
      c2: pivot.col + next.second.col,
      rotation: nextRotation,
      horizontal: nextRotation === 0 || nextRotation === 2,
    };

    return Math.min(rotated.r1, rotated.r2) < 0 ? null : rotated;
  }

  /**
   * Próbuje obrócić kapsułkę
   */
  private findRotatedPairWithKick(pair: PillPair, nextRotation: number): PillPair | null {
    const rawRotation = this.buildRotatedPair(pair, nextRotation);
    if (!rawRotation) return null;

    const wallAdjusted = this.keepPairInsideHorizontalBounds(rawRotation);
    const usedWallKick = !this.hasSamePlacement(rawRotation, wallAdjusted);

    if (this.canPlacePair(wallAdjusted)) return wallAdjusted;
    if (usedWallKick) return null;

    for (const colDelta of this.rotationKickOffsets(wallAdjusted)) {
      const candidate = this.offsetPair(wallAdjusted, 0, colDelta);
      if (!this.isPairInsideHorizontalBounds(candidate)) continue;
      if (this.canPlacePair(candidate)) return candidate;
    }

    return null;
  }

  private rotationKickOffsets(pair: PillPair): number[] {
    const blockedSides = this.findBlockedHorizontalSides(pair);

    if (blockedSides.right && !blockedSides.left) return [-1];
    if (blockedSides.left && !blockedSides.right) return [1];

    return [];
  }

  private findBlockedHorizontalSides(pair: PillPair): { left: boolean; right: boolean } {
    const minCol = Math.min(pair.c1, pair.c2);
    const maxCol = Math.max(pair.c1, pair.c2);
    const positions = [
      { row: pair.r1, col: pair.c1 },
      { row: pair.r2, col: pair.c2 },
    ];
    const blocked = { left: false, right: false };

    for (const position of positions) {
      if (this.board.isEmpty(position.row, position.col)) continue;

      blocked.left = blocked.left || position.col === minCol;
      blocked.right = blocked.right || position.col === maxCol;
    }

    return blocked;
  }

  private rotationOffsets(rotation: number): RotationOffsets {
    const states: RotationOffsets[] = [
      { first: { row: 0, col: 0 }, second: { row: 0, col: 1 } },
      { first: { row: -1, col: 0 }, second: { row: 0, col: 0 } },
      { first: { row: 0, col: 1 }, second: { row: 0, col: 0 } },
      { first: { row: 0, col: 0 }, second: { row: -1, col: 0 } },
    ];

    return states[rotation];
  }

  private keepPairInsideHorizontalBounds(pair: PillPair): PillPair {
    const minCol = Math.min(pair.c1, pair.c2);
    const maxCol = Math.max(pair.c1, pair.c2);

    if (minCol < 0) return this.offsetPair(pair, 0, -minCol);
    if (maxCol >= this.board.cols) return this.offsetPair(pair, 0, this.board.cols - maxCol - 1);

    return pair;
  }

  private isPairInsideHorizontalBounds(pair: PillPair): boolean {
    return pair.c1 >= 0 && pair.c1 < this.board.cols && pair.c2 >= 0 && pair.c2 < this.board.cols;
  }

  private hasSamePlacement(left: PillPair, right: PillPair): boolean {
    return left.r1 === right.r1 && left.c1 === right.c1 && left.r2 === right.r2 && left.c2 === right.c2;
  }

  private isFastDropKey(event: KeyboardEvent): boolean {
    return event.code === 'ArrowDown' || event.code === 'KeyS';
  }

  private pickNextColors(): NextCapsuleColors {
    return { c1: this.random.nextColor(), c2: this.random.nextColor() };
  }

  private refreshHud(): void {
    renderDigitCounter({ elementId: 'hud-top', value: this.highScore, minDigits: 7 });
    renderDigitCounter({ elementId: 'hud-score', value: this.score, minDigits: 7 });
    renderDigitCounter({ elementId: 'hud-virus', value: this.virusesLeft, minDigits: 2 });
  }

  private syncScreens(): void {
    this.screens.startHint?.classList.toggle('is-hidden', this.phase !== 'start');
    this.screens.gameOver?.classList.toggle('is-hidden', this.phase !== 'gameover');
    this.screens.stageComplete?.classList.toggle('is-hidden', this.phase !== 'stagecomplete');
    this.screens.doctorPose?.classList.toggle('is-hidden', this.phase !== 'gameover');

    if (this.phase === 'gameover' || this.phase === 'stagecomplete') {
      this.animations.pauseLens();
    } else {
      this.animations.resumeLens();
    }
  }
}
