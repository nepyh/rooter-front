import { useEffect, useState } from "react";

/**
 * useNow
 * @param intervalMs 현재 시각을 갱신할 간격(ms)을 설정합니다.
 * @returns 갱신되는 현재 시각
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
