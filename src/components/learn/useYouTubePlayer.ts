import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import {
  EMBED_ORIGIN, LOAD_TIMEOUT_MS, PLAYER_HANDSHAKE, SLOW_START_MS,
  isPlayerOrigin, isPlayingState, nextStatus, parsePlayerMessage, playerCommand,
} from '../../core/learn/video';
import type { PlayerFunc } from '../../core/learn/video';
import type { PlayerStatus } from '../../core/learn/video';

export interface YouTubePlayer {
  status: PlayerStatus;
  /** YouTube's error code, or null when the player simply never answered. */
  errorCode: number | null;
  /** Ready but still not playing after a while: the learner may be stuck on a sign-in prompt. */
  slow: boolean;
  /** Last reported position in seconds, null until the player reports one. */
  time: number | null;
  /** Last reported player state (-1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued). */
  state: number | null;
  playing: boolean;
  /** Bumps on every retry; use it as the iframe key so the player loads from scratch. */
  attempt: number;
  send: (func: PlayerFunc, ...args: unknown[]) => void;
  /** Pretend the position is `seconds` right away, until the player reports the real one. */
  setTime: (seconds: number) => void;
  retry: () => void;
}

/**
 * Talks to an embedded YouTube player over postMessage: starts the conversation, tracks what it reports and sends it
 * commands. Needs the embed url to include enablejsapi=1.
 */
export function useYouTubePlayer(frameRef: RefObject<HTMLIFrameElement | null>, active: boolean): YouTubePlayer {
  const [status, setStatus] = useState<PlayerStatus>('loading');
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [slow, setSlow] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [state, setState] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Hear what the player says about itself
  useEffect(() => {
    if (!active) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frameRef.current?.contentWindow || !isPlayerOrigin(e.origin)) return;
      const event = parsePlayerMessage(e.data);
      if (!event) return;
      if (event.type === 'error') setErrorCode(event.code);
      if (event.type === 'time') setTime(event.seconds);
      if (event.type === 'state') setState(event.state);
      setStatus((current) => nextStatus(current, event));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [active, attempt, frameRef]);

  // The player only reports events once the page says it is listening, and it may not be ready at the first try
  useEffect(() => {
    if (!active || status !== 'loading') return;
    const post = () => {
      const win = frameRef.current?.contentWindow;
      if (win) for (const message of PLAYER_HANDSHAKE) win.postMessage(JSON.stringify(message), EMBED_ORIGIN);
    };
    post();
    const timer = window.setInterval(post, 500);
    return () => window.clearInterval(timer);
  }, [active, status, attempt, frameRef]);

  // Never answered: offline, or YouTube is blocked here
  useEffect(() => {
    if (!active || status !== 'loading') return;
    const timer = window.setTimeout(() => {
      setErrorCode(null);
      setStatus('error');
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [active, status, attempt]);

  // Ready but not started: point to the YouTube button
  useEffect(() => {
    if (!active || status !== 'ready') return;
    const timer = window.setTimeout(() => setSlow(true), SLOW_START_MS);
    return () => window.clearTimeout(timer);
  }, [active, status, attempt]);

  const send = useCallback(
    (func: PlayerFunc, ...args: unknown[]) => {
      frameRef.current?.contentWindow?.postMessage(JSON.stringify(playerCommand(func, ...args)), EMBED_ORIGIN);
    },
    [frameRef],
  );

  const retry = useCallback(() => {
    setStatus('loading');
    setErrorCode(null);
    setSlow(false);
    setTime(null);
    setState(null);
    setAttempt((n) => n + 1);
  }, []);

  return { status, errorCode, slow, time, state, playing: state !== null && isPlayingState(state), attempt, send, setTime, retry };
}
