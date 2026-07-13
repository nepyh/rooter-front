import { useEffect, useState } from "react";

/**
 * useNow
 * @description 지정한 간격마다 갱신되는 현재 시각을 반환합니다.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
