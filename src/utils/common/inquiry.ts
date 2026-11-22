import { Platform } from "react-native";
import Constants from "expo-constants";
import { INQUIRY_EMAIL } from "@/constants/inquiry";

// ================================
// Types
// ================================

/**
 * 문의 종류
 * - general: 마이페이지의 일반 문의
 * - school: 학교 검색에 다니는 학교가 없을 때
 */
export type InquiryTopic = "general" | "school";

interface InquiryTemplate {
  subject: string;
  body: string;
}

// ================================
// Constants
// ================================

const INQUIRY_TEMPLATES: Record<InquiryTopic, InquiryTemplate> = {
  "general": {
    subject: "[루터] 문의",
    body: "문의 내용을 적어주세요.\n",
  },
  "school": {
    subject: "[루터] 학교 추가 문의",
    body: "검색되지 않는 학교를 알려주세요.\n\n학교 이름:\n지역(시·군·구):\n",
  },
};

// ================================
// Functions
// ================================

/**
 * 문제 확인에 쓰는 앱·기기 정보. 메일 본문 끝에 붙임
 */
const getDeviceInfo = () =>
  [
    "",
    "----",
    "아래 정보는 문제를 확인하는 데 쓰여요. 지우지 말아주세요.",
    `앱 버전: ${Constants.expoConfig?.version ?? "알 수 없음"}`,
    `기기: ${Platform.OS} ${Platform.Version}`,
  ].join("\n");

/**
 * 문의 메일을 여는 mailto 주소
 * @param topic 문의 종류, 제목과 본문 양식이 달라짐
 */
export const buildInquiryMailUrl = (topic: InquiryTopic) => {
  const { subject, body } = INQUIRY_TEMPLATES[topic];
  return `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + getDeviceInfo())}`;
};
