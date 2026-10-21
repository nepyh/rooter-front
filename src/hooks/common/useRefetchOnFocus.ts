import { useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

// ================================
// Hooks
// ================================

/**
 * useRefetchOnFocus — 다른 화면에 갔다가 돌아오면 쿼리를 다시 불러옴
 * 처음 들어올 때는 useQuery 가 알아서 불러오므로 건너뜁니다. 캐시가 아직 신선하면 refetch 대신 캐시를 그대로 씁니다.
 * @param keys 다시 불러올 쿼리 키들
 */
export function useRefetchOnFocus(keys: QueryKey[]) {
  const queryClient = useQueryClient();
  const firstFocusRef = useRef(true);
  const keysHash = JSON.stringify(keys);

  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      (JSON.parse(keysHash) as QueryKey[]).forEach((queryKey) =>
        queryClient.refetchQueries({ queryKey, exact: true, stale: true }, { cancelRefetch: false }),
      );
    }, [queryClient, keysHash]),
  );
}
