import { useEffect, useRef } from "react";

export default function useTimeout(
  trigger: boolean,
  timeout: number,
  callback: Function,
) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (trigger) {
      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        callback();
      }, timeout);
    }

    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, [callback, timeout, trigger]);
}
