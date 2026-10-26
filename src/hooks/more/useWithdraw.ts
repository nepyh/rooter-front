import { useState } from "react";
import { router } from "expo-router";
import { withdraw } from "@/api/more/common";
import { useUserStore } from "@/store";

export function useWithdraw() {
  const userId = useUserStore((state) => state.userId);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const close = () => setVisible(false);

  const handleConfirm = async () => {
    if (pending || userId === null) return;
    setPending(true);
    try {
      await withdraw(userId);
      setVisible(false);
      router.replace("/Auth/Onboarding");
    } catch {
      setVisible(false);
      setErrorMessage("탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
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
      title: "정말 탈퇴할까요?",
      description: "탈퇴하면 모든 데이터가 삭제되고 되돌릴 수 없습니다.",
      confirmText: "탈퇴",
      onCancel: close,
      onConfirm: handleConfirm,
    },
  };
}
