import { useState } from "react";
import { Linking } from "react-native";
import { useUserStore } from "@/store";
import { getAgreementCatalog, getUserAgreements } from "@/api/common/agreement";
import type { AgreementDocument, UserAgreement } from "@/api/common/agreement";
import { queryClient, queryKeys } from "@/api/queryClient";

// ================================
// Functions
// ================================

const formatDate = (iso: string) => iso.slice(0, 10).replaceAll("-", ".");

/**
 * 약관별 동의 상태를 한 줄씩 적은 안내 문구
 * @param catalog 현재 약관 목록
 * @param userAgreements 내 동의 내역
 */
const describeAgreements = (catalog: AgreementDocument[], userAgreements: UserAgreement[]) =>
  catalog
    .map((doc) => {
      const record = userAgreements.find((item) => item.code === doc.code);
      if (!record) return `${doc.title} · 미동의`;
      return `${doc.title} · ${formatDate(record.createdAt)} ${record.agreed ? "동의" : "철회"}`;
    })
    .join("\n");

// ================================
// Hooks
// ================================

/**
 * useAgreementCheck — 내 약관 동의 내역을 서버에서 받아 모달로 보여줌
 * 모달의 "약관 보기" 는 이용약관 문서를 브라우저로 엽니다.
 * @returns open, errorMessage, clearError, modalProps
 */
export function useAgreementCheck() {
  const userId = useUserStore((state) => state.userId);
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [description, setDescription] = useState("");
  const [termsUrl, setTermsUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const close = () => setVisible(false);

  const open = async () => {
    if (pending || userId === null) return;
    setPending(true);
    try {
      const [catalog, userAgreements] = await Promise.all([
        queryClient.fetchQuery({ queryKey: queryKeys.agreements.catalog, queryFn: getAgreementCatalog }),
        queryClient.fetchQuery({ queryKey: queryKeys.agreements.user(userId), queryFn: () => getUserAgreements(userId), staleTime: 0 }),
      ]);
      setDescription(describeAgreements(catalog, userAgreements));
      setTermsUrl(catalog.find((doc) => doc.code === "TERMS")?.url ?? catalog[0]?.url ?? null);
      setVisible(true);
    } catch {
      setErrorMessage("약관 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  };

  const handleConfirm = () => {
    close();
    if (termsUrl) Linking.openURL(termsUrl);
  };

  return {
    open,
    errorMessage,
    clearError: () => setErrorMessage(""),
    modalProps: {
      visible,
      title: "약관 동의 내역",
      description,
      cancelText: "닫기",
      confirmText: "약관 보기",
      onCancel: close,
      onConfirm: handleConfirm,
    },
  };
}
