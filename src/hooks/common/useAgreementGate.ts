import { useState } from "react";
import { useUserStore } from "@/store";
import { updateAgreements } from "@/api/common/agreement";
import type { AgreementDecision } from "@/api/common/agreement";
import { queryClient, queryKeys } from "@/api/queryClient";
import { useAgreements } from "@/hooks/common/useAgreements";

// ================================
// Hooks
// ================================

/**
 * useAgreementGate — 로그인했지만 필수 약관 동의가 없으면(철회·개정) 동의 시트를 띄워 앱 사용을 막음
 * 시트는 닫을 수 없고, 동의를 저장해야만 사라집니다.
 * @returns visible, errorMessage, clearError, sheetProps
 */
export function useAgreementGate() {
  const userId = useUserStore((state) => state.userId);
  const { catalog, pendingAgreements } = useAgreements();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAgree = async (decisions: AgreementDecision[]) => {
    if (pending || userId === null) return;
    setPending(true);
    try {
      await updateAgreements(userId, decisions);
      await queryClient.invalidateQueries({ queryKey: queryKeys.agreements.user(userId) });
    } catch {
      setErrorMessage("약관 동의에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  };

  return {
    visible: pendingAgreements.length > 0,
    errorMessage,
    clearError: () => setErrorMessage(""),
    sheetProps: {
      visible: true,
      agreements: catalog ?? [],
      onClose: () => {},
      onNext: handleAgree,
    },
  };
}
