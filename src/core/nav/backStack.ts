/**
 * The back button. The app has no router, so the screen the learner is on is a handful of pieces of state in App.tsx. To
 * make the phone's back button (and a browser's) retrace the learner's steps instead of closing the app, every new screen
 * is pushed onto the browser history, and going back asks the history to go back. This class is only the bookkeeping
 * for that: what the history stack holds, and what to do when the screen changes. It touches no browser API, so it is
 * tested on its own.
 *
 * The rules:
 *  - a new screen is pushed (the browser history gets one more entry);
 *  - a change that lands on the screen the learner came from (an in-app "back" button, the X on a sheet) is a real
 *    "back" in the history, so pressing the phone's back button afterwards does not bounce between the two;
 *  - on the first screen there is nothing to go back to, and the phone's back button leaves the app as usual.
 */
export type Decision = 'same' | 'push' | 'back';

export class BackStack<T> {
  private entries: T[];
  private at = 0;
  private readonly equals: (a: T, b: T) => boolean;

  constructor(initial: T, equals: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b)) {
    this.entries = [initial];
    this.equals = equals;
  }

  /** The screen the history currently points at. */
  get current(): T {
    return this.entries[this.at];
  }

  /** How many screens there are to go back through (0 on the first screen). */
  get depth(): number {
    return this.at;
  }

  /**
   * The learner is now on `next`. `same` when nothing changed, `back` when it is the screen before this one (the caller
   * must ask the history to go back, and `restore` follows when it does), otherwise `push` (the caller adds a history
   * entry; the stack has already moved on).
   */
  moveTo(next: T): Decision {
    if (this.equals(next, this.current)) return 'same';
    if (this.at > 0 && this.equals(next, this.entries[this.at - 1])) return 'back';
    this.entries = this.entries.slice(0, this.at + 1);
    this.entries.push(next);
    this.at += 1;
    return 'push';
  }

  /** The history moved to entry `index` (the browser said so). Returns the screen to show. */
  restore(index: number): T {
    this.at = Math.min(Math.max(0, Math.round(index)), this.entries.length - 1);
    return this.entries[this.at];
  }
}
