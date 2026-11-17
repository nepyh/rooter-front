import { fontSize } from "@/constants/token/font-size";
import { radius } from "@/constants/token/radius";
import { spacing } from "@/constants/token/spacing";

export const getSpacing = (key: keyof typeof spacing) => parseFloat(spacing[key]);
export const getRadius = (key: keyof typeof radius) => parseFloat(radius[key]);

/**
 * 글자 크기 토큰에서 lineHeight 만 뺀 스타일 (fontSize, letterSpacing)
 * iOS 한 줄 TextInput 에 lineHeight 를 주면 포커스가 없을 때 칸보다 긴 글자가 단어 단위로 줄바꿈되어 첫 단어만 보이므로, 한 줄 입력칸에는 이것을 씀
 * @param key 글자 크기 토큰 이름 (예: "lg")
 */
export const getFontStyleWithoutLineHeight = (key: keyof typeof fontSize) => ({
  fontSize: parseFloat(fontSize[key][0]),
  letterSpacing: parseFloat(fontSize[key][1].letterSpacing),
});
