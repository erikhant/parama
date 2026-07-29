import { useCallback, useState } from 'react';

export interface ApiProbeState {
  result: unknown;
  error: Error | null;
  loading: boolean;
}

export interface ApiProbe extends ApiProbeState {
  /** Issues a GET and stores the parsed body, or the failure. */
  send: (url: string, headers: Record<string, string> | undefined) => Promise<void>;
  /** Discards any previous result and error. */
  reset: () => void;
}

const IDLE: ApiProbeState = { result: null, error: null, loading: false };

/**
 * Sends a trial request to a candidate endpoint and holds the outcome.
 *
 * The author needs to see a real response before they can map it, so the dialog
 * probes the endpoint rather than waiting for the form to run. Failures are
 * captured as state rather than thrown — a bad URL is an expected outcome here,
 * not an exception.
 */
export function useApiProbe(): ApiProbe {
  const [state, setState] = useState<ApiProbeState>(IDLE);

  const send = useCallback(async (url: string, headers: Record<string, string> | undefined) => {
    setState({ result: null, error: null, loading: true });

    try {
      const response = await fetch(url, { method: 'GET', headers: { ...headers } });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setState({ result: await response.json(), error: null, loading: false });
    } catch (error) {
      setState({
        result: null,
        error: error instanceof Error ? error : new Error('Request failed'),
        loading: false
      });
    }
  }, []);

  const reset = useCallback(() => setState(IDLE), []);

  return { ...state, send, reset };
}
