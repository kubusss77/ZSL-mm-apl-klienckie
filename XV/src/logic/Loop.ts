/** Funkcja aktualizująca stan gry dla bieżącej klatki. */
export interface FrameUpdate {
    /**
     * @param deltaMs Czas od poprzedniej klatki w milisekundach.
     */
    (deltaMs: number): void;
}

/** Funkcja renderująca aktualny stan gry. */
export interface FrameRender {
    (): void;
}

/**
 * Opakowuje requestAnimationFrame i przekazuje czas od poprzedniej klatki.
 */
export class GameLoop {
    private isRunning = false;
    private previousFrameTime = 0;

    constructor(private readonly update: FrameUpdate, private readonly render: FrameRender) {}

    /** Uruchamia pętlę, jeśli nie jest już aktywna. */
    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        requestAnimationFrame((time) => this.step(time));
    }

    /** Zatrzymuje pętlę i resetuje czas poprzedniej klatki. */
    stop(): void {
        this.isRunning = false;
        this.previousFrameTime = 0;
    }

    private step(timeMs: number): void {
        if (!this.isRunning) return;

        const deltaMs = this.previousFrameTime === 0 ? 0 : timeMs - this.previousFrameTime;
        this.previousFrameTime = timeMs;

        this.update(deltaMs);
        this.render();

        requestAnimationFrame((time) => this.step(time));
    }
}
