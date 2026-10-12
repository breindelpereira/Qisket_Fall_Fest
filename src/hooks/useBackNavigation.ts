import { useEffect, useRef } from 'react';
import { BackStack } from '../core/nav/backStack';

/**
 * Makes the phone's back button (and the browser's) walk back through the screens the learner has been on, instead of
 * closing the app: each new screen is pushed onto the browser history, and when the history goes back the earlier screen is
 * handed to `apply`. On the first screen there is nothing to go back to, so the back button leaves the app as usual.
 *
 * `snapshot` must describe the whole screen (which tab, which game, which lesson, whether a sheet is open) and be plain
 * JSON. Android's WebView, which the app runs in, goes back through the history by itself; nothing native is needed.
 */
export function useBackNavigation<T>(snapshot: T, apply: (screen: T) => void): void {
  const key = JSON.stringify(snapshot);
  const stack = useRef<BackStack<T> | null>(null);
  if (stack.current === null) stack.current = new BackStack(JSON.parse(key) as T);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    try {
      window.history.replaceState({ q: 0 }, '');
    } catch {
      // a webview that blocks the history API simply keeps the old behaviour
    }
    const onPop = (e: PopStateEvent) => {
      const q = typeof (e.state as { q?: unknown } | null)?.q === 'number' ? (e.state as { q: number }).q : 0;
      const screen = stack.current?.restore(q);
      if (screen !== undefined) applyRef.current(screen);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const s = stack.current;
    if (!s) return;
    const decision = s.moveTo(JSON.parse(key) as T);
    try {
      if (decision === 'push') window.history.pushState({ q: s.depth }, '');
      else if (decision === 'back') window.history.back();
    } catch {
      // see above
    }
  }, [key]);
}
