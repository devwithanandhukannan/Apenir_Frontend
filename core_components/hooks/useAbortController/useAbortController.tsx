import { useCallback, useEffect, useMemo, useRef } from 'react';

// Structure exposed for each controller instance
export interface ControllerInstance {
  key: string;
  controller: AbortController;
  signal: AbortSignal;
  abort(): void;
  reset(): void;
  isAborted: boolean;
}

// Return type mapping pre-registered keys under a controllers namespace and core manager methods
export type UseAbortControllerReturn<TKeys extends readonly string[]> = {
  controllers: {
    [K in TKeys[number]]: ControllerInstance;
  };
  getController(key: string): ControllerInstance;
  abortAll(): void;
  removeController(key: string): void;
};

export function useAbortController<TKeys extends readonly string[] = readonly string[]>(
  config?: TKeys
): UseAbortControllerReturn<TKeys> {
  // Core registry containing raw AbortControllers
  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  // Retrieve or create a raw AbortController instance
  const getRawController = useCallback((key: string): AbortController => {
    let controller = controllersRef.current.get(key);
    if (!controller) {
      controller = new AbortController();
      controllersRef.current.set(key, controller);
    }
    return controller;
  }, []);

  const abortController = useCallback((key: string) => {
    const current = controllersRef.current.get(key);
    if (current && !current.signal.aborted) {
      current.abort();
    }
  }, []);

  const resetController = useCallback((key: string) => {
    const current = controllersRef.current.get(key);
    if (current && !current.signal.aborted) {
      current.abort();
    }
    const fresh = new AbortController();
    controllersRef.current.set(key, fresh);
  }, []);

  // Creates the ControllerInstance wrapper utilizing JS getters for reactive signal values
  const createControllerInstance = useCallback(
    (key: string): ControllerInstance => {
      return {
        key,
        get controller() {
          return getRawController(key);
        },
        get signal() {
          return getRawController(key).signal;
        },
        get isAborted() {
          return getRawController(key).signal.aborted;
        },
        abort: () => abortController(key),
        reset: () => resetController(key),
      };
    },
    [getRawController, abortController, resetController]
  );

  // Pre-register and cache names provided in the initial configuration
  useEffect(() => {
    if (config) {
      config.forEach((keyName) => {
        getRawController(keyName);
      });
    }
  }, [config, getRawController]);

  const abortAll = useCallback(() => {
    controllersRef.current.forEach((controller) => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
  }, []);

  const removeController = useCallback((key: string) => {
    const current = controllersRef.current.get(key);
    if (current && !current.signal.aborted) {
      current.abort();
    }
    controllersRef.current.delete(key);
  }, []);

  // Auto-abort all requests on component unmount
  useEffect(() => {
    return () => {
      abortAll();
    };
  }, [abortAll]);

  const getController = useCallback(
    (key: string): ControllerInstance => {
      return createControllerInstance(key);
    },
    [createControllerInstance]
  );

  // Memoize return object to prevent triggering unnecessary child component renders
  const result = useMemo(() => {
    const controllersObj: Record<string, ControllerInstance> = {};

    if (config) {
      config.forEach((keyName) => {
        controllersObj[keyName] = createControllerInstance(keyName);
      });
    }

    return {
      controllers: controllersObj as { [K in TKeys[number]]: ControllerInstance },
      getController,
      abortAll,
      removeController,
    };
  }, [config, getController, abortAll, removeController, createControllerInstance]);

  return result;
}
