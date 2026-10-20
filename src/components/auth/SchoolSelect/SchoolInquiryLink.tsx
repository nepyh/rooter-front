import { Row } from "../../layout";
import { Text } from "../../ui/Text";
import { color } from "@/constants/token/color";

// ================================
// Components
// ================================

/**
 * 검색해도 학교가 없을 때 보여주는 "재학 중인 학교가 없나요? 문의하기" 문구
 */
export function SchoolInquiryLink() {
  return (
    <Row gap="s" width="full" className="justify-center items-end">
      <Text color="disabled"> 재학 중인 학교가 없나요? </Text>
      <Text weight="medium" className="underline" style={{ color: color.primary["500"] }}> 문의하기 </Text>
    </Row>
  );
}
