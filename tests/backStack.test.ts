import { describe, it, expect } from 'vitest';
import { BackStack } from '../src/core/nav/backStack';

const screen = (tab: string, extra = '') => ({ tab, extra });

describe('The back button', () => {
  it('starts on the first screen with nothing to go back to', () => {
    const s = new BackStack(screen('home'));
    expect(s.depth).toBe(0);
    expect(s.current).toEqual(screen('home'));
    expect(s.moveTo(screen('home'))).toBe('same');
  });

  it('a new screen is a push, and going back through them retraces the steps in order', () => {
    const s = new BackStack(screen('home'));
    expect(s.moveTo(screen('games'))).toBe('push');
    expect(s.moveTo(screen('games', 'quantum_heist'))).toBe('push');
    expect(s.depth).toBe(2);
    expect(s.restore(1)).toEqual(screen('games'));
    expect(s.restore(0)).toEqual(screen('home'));
    expect(s.depth).toBe(0);
  });

  it('an in-app back button (landing on the screen before) is a real back, so the phone button does not bounce', () => {
    const s = new BackStack(screen('home'));
    s.moveTo(screen('games'));
    s.moveTo(screen('games', 'cool_down'));
    expect(s.moveTo(screen('games'))).toBe('back'); // the "All Games" chip
    // the history then reports entry 1, and we are there
    expect(s.restore(1)).toEqual(screen('games'));
    expect(s.depth).toBe(1);
  });

  it('closing a sheet that was opened as a screen is also a back', () => {
    const s = new BackStack({ tab: 'learn', tutor: false });
    expect(s.moveTo({ tab: 'learn', tutor: true })).toBe('push');
    expect(s.moveTo({ tab: 'learn', tutor: false })).toBe('back');
  });

  it('after going back, a different screen replaces the old forward history', () => {
    const s = new BackStack(screen('home'));
    s.moveTo(screen('learn'));
    s.moveTo(screen('learn', 'lesson'));
    s.restore(0);
    expect(s.moveTo(screen('games'))).toBe('push');
    expect(s.depth).toBe(1);
    expect(s.restore(1)).toEqual(screen('games'));
    // entry 2 of the old history no longer exists
    expect(s.restore(2)).toEqual(screen('games'));
  });

  it('an index the history makes up is kept inside the stack', () => {
    const s = new BackStack(screen('home'));
    s.moveTo(screen('games'));
    expect(s.restore(-4)).toEqual(screen('home'));
    expect(s.restore(99)).toEqual(screen('games'));
    expect(s.restore(0.4)).toEqual(screen('home'));
  });

  it('two screens that only differ deep inside count as different', () => {
    const s = new BackStack({ tab: 'learn', view: { kind: 'lesson', lessonId: 'module_1' } });
    expect(s.moveTo({ tab: 'learn', view: { kind: 'lesson', lessonId: 'module_2' } })).toBe('push');
    expect(s.moveTo({ tab: 'learn', view: { kind: 'lesson', lessonId: 'module_1' } })).toBe('back');
  });
});
