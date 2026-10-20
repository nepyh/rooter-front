import { useRef, useState } from "react";
import type { TextInput } from "react-native";

/**
 * useFormField — 입력칸 하나의 값, 에러 문구, ref 를 함께 관리
 * @param initialValue 처음 값을 설정합니다.
 * @returns value, error, ref, setError, focus, 그리고 Input 에 그대로 펼쳐 넘길 inputProps
 */
export function useFormField(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const ref = useRef<TextInput>(null);

  const onChangeText = (text: string) => {
    setValue(text);
    setError("");
  };

  const focus = (moveCursorToEnd = false) => {
    ref.current?.focus();
    if (moveCursorToEnd) {
      ref.current?.setNativeProps({ selection: { start: value.length, end: value.length } });
    }
  };

  return {
    value,
    error,
    ref,
    setError,
    focus,
    inputProps: { ref, value, onChangeText, errorMessage: error },
  };
}
