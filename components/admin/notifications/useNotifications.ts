'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import type {NotificationFeed} from '@/lib/notifications/types';

const changed = 'bivi:notifications-changed';

export function useNotifications(query: string) {
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const generation = useRef(0);
  const pending = useRef(false);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    if (!mounted.current) return;

    const current = ++generation.current;

    try {
      const response = await fetch(`/api/admin/notifications?${query}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Notifications could not load.');
      }

      if (mounted.current && current === generation.current) {
        setFeed(data);
        setError('');
      }
    } catch (e) {
      if (mounted.current && current === generation.current) {
        setError(
          e instanceof Error ? e.message : 'Notifications could not load.'
        );
      }
    }
  }, [query]);

  useEffect(() => {
    mounted.current = true;
    setFeed(null);
    setError('');
    void refresh();

    const update = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    const timer = window.setInterval(update, 60000);

    window.addEventListener(changed, update);
    document.addEventListener('visibilitychange', update);

    return () => {
      mounted.current = false;
      generation.current += 1;

      window.clearInterval(timer);
      window.removeEventListener(changed, update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [refresh]);

  const mutate = async (body: Record<string, unknown>) => {
    if (!mounted.current || pending.current) return false;

    pending.current = true;
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Notifications could not be saved.');
      }

      window.dispatchEvent(new Event(changed));
      return true;
    } catch (e) {
      if (mounted.current) {
        setError(
          e instanceof Error ? e.message : 'Notifications could not be saved.'
        );
      }

      return false;
    } finally {
      pending.current = false;

      if (mounted.current) {
        setBusy(false);
      }
    }
  };

  return {feed, error, busy, refresh, mutate};
}