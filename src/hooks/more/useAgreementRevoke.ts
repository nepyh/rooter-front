import { useState } from "react";
import { useUserStore } from "@/store";
import { getAgreementCatalog, toDecisions, updateAgreements } from "@/api/common/agreement";
import { getRevokeErrorMessage } from "@/api/more/AccountSetting";
import { queryClient, queryKeys } from "@/api/queryClient";

// ================================
// Hooks
// ================================

/**
 * useAgreementRevoke — 약관 철회 확인 모달과 철회 요청
 * 철회에 성공하면 내 동의 내역을 다시 불러오고, 루트의 useAgreementGate 가 동의 시트를 띄웁니다.
 * @returns open, errorMessage, clearError, modalProps
 */
export function useAgreementRevoke() {
  const userId = useUserStore((state) => state.userId);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const close = () => setVisible(false);

  const handleConfirm = async () => {
    if (pending || userId === null) return;
    setPending(true);
    try {
      const catalog = await queryClient.fetchQuery({ queryKey: queryKeys.agreements.catalog, queryFn: getAgreementCatalog });
      await updateAgreements(userId, toDecisions(catalog, false));
      setVisible(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.agreements.user(userId) });
    } catch (error) {
      setVisible(false);
      setErrorMessage(getRevokeErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return {
    open: () => setVisible(true),
    errorMessage,
    clearError: () => setErrorMessage(""),
    modalProps: {
      visible,
      title: "약관 동의를 철회할까요?",
      description: "철회하면 다시 동의하기 전까지 서비스를 이용할 수 없습니다.",
      confirmText: "철회하기",
      onCancel: close,
      onConfirm: handleConfirm,
    },
  };
}
