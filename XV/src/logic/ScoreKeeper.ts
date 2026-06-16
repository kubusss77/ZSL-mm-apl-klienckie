import { SCORE_VALUES } from '../constants';

/** Migawka aktualnego i najlepszego wyniku. */
export interface ScoreKeeperSnapshot {
  /** Aktualny wynik bieżącej gry. */
  readonly score: number;
  /** Najlepszy wynik odczytany lub zapisany w localStorage. */
  readonly highScore: number;
}

/**
 * Zarządza punktami oraz zapisem najlepszego wyniku w localStorage.
 */
export class ScoreKeeper {
  private currentScore = 0;
  private bestScore = 0;

  constructor(private readonly storageKey = 'drmario_highscore') {
    this.bestScore = this.readBestScore();
  }

  /** Aktualny wynik bieżącej rozgrywki. */
  get score(): number {
    return this.currentScore;
  }

  /** Najlepszy zapisany wynik. */
  get highScore(): number {
    return this.bestScore;
  }

  /** Zeruje wynik bieżącej gry bez kasowania rekordu. */
  resetCurrentScore(): void {
    this.currentScore = 0;
  }

  /**
   * Dodaje punkty za usunięte elementy planszy.
   *
   * @param pillCount Liczba usuniętych połówek kapsułek.
   * @param virusCount Liczba usuniętych wirusów.
   */
  addClearedCells(pillCount: number, virusCount: number): void {
    this.addPoints(pillCount * SCORE_VALUES.pill + virusCount * SCORE_VALUES.virus);
  }

  /** Zwraca niemutowalny opis bieżącego stanu wyniku. */
  snapshot(): ScoreKeeperSnapshot {
    return { score: this.currentScore, highScore: this.bestScore };
  }

  private addPoints(points: number): void {
    if (points <= 0) return;

    this.currentScore += points;
    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
      localStorage.setItem(this.storageKey, String(this.bestScore));
    }
  }

  private readBestScore(): number {
    const stored = localStorage.getItem(this.storageKey);
    const parsed = stored ? Number.parseInt(stored, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
