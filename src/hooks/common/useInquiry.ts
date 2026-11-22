import { useState } from "react";
import { Linking } from "react-native";
import { INQUIRY_EMAIL } from "@/constants/inquiry";
import { buildInquiryMailUrl, type InquiryTopic } from "@/utils/common/inquiry";

// ================================
// Hooks
// ================================

/**
 * useInquiry — 문의 메일을 메일 앱으로 엶
 * 메일 앱이 없거나 열 수 없으면 주소를 알려주는 안내 문구를 errorMessage 로 돌려줌
 * @returns open(topic), errorMessage, clearError
 */
export function useInquiry() {
  const [errorMessage, setErrorMessage] = useState("");

  const open = async (topic: InquiryTopic) => {
    try {
      await Linking.openURL(buildInquiryMailUrl(topic));
    } catch {
      setErrorMessage(`메일 앱을 열 수 없어요. ${INQUIRY_EMAIL}으로 문의해주세요.`);
    }
  };

  return {
    open,
    errorMessage,
    clearError: () => setErrorMessage(""),
  };
}
